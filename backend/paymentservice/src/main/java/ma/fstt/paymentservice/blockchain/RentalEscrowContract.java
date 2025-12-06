package ma.fstt.paymentservice.blockchain;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.fstt.paymentservice.exception.EventNotFoundException;
import ma.fstt.paymentservice.exception.InvalidContractException;
import ma.fstt.paymentservice.exception.TransactionFailedException;
import ma.fstt.paymentservice.exception.TransactionNotFoundException;
import org.springframework.stereotype.Component;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.FunctionReturnDecoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.generated.Uint8;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.Transaction;
import org.web3j.protocol.core.methods.response.EthCall;
import org.web3j.protocol.core.methods.response.EthGetTransactionReceipt;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Wrapper Web3j pour interagir avec le Smart Contract RentalEscrow
 *
 * Responsabilités:
 * 1. Valider qu'une transaction a bien appelé fund()
 * 2. Parser l'événement Funded depuis les logs
 * 3. Vérifier l'état actuel du contrat
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RentalEscrowContract {

    private final Web3j web3j;

    /**
     * CRITICAL: Topic hash de l'événement Funded(address indexed tenant, uint256 amount)
     *
     * Calculé avec: Keccak-256("Funded(address,uint256)")
     * Résultat: 0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4
     *
     * Voir README.md pour la méthode de calcul
     */
    private static final String FUNDED_EVENT_TOPIC =
            "0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4";

    /**
     * Valide qu'une transaction a bien appelé fund() et émis l'événement Funded
     *
     * @param contractAddress Adresse du RentalEscrow déployé
     * @param transactionHash Hash de la transaction à valider
     * @return Données de l'événement Funded (tenant, amount, blockNumber)
     * @throws TransactionNotFoundException Si la transaction n'existe pas ou n'est pas minée
     * @throws TransactionFailedException Si la transaction a échoué on-chain
     * @throws InvalidContractException Si la transaction n'a pas été envoyée au bon contrat
     * @throws EventNotFoundException Si l'événement Funded n'a pas été émis
     */
    public FundedEventData validateFundTransaction(
            String contractAddress,
            String transactionHash
    ) throws Exception {

        log.info("📡 Fetching transaction receipt from blockchain...");
        log.debug("Contract: {}, Tx: {}", contractAddress, transactionHash);

        // 1. Récupérer le receipt de la transaction
        EthGetTransactionReceipt receiptResponse = web3j
                .ethGetTransactionReceipt(transactionHash)
                .send();

        if (receiptResponse.getTransactionReceipt().isEmpty()) {
            log.error("❌ Transaction not found: {}", transactionHash);
            throw new TransactionNotFoundException(
                    "Transaction not found or not yet mined. Please wait 30 seconds and retry."
            );
        }

        TransactionReceipt receipt = receiptResponse.getTransactionReceipt().get();

        log.info("✅ Transaction confirmed in block {}", receipt.getBlockNumber());

        // 2. Vérifier que la transaction est réussie (status = 0x1)
        if (!"0x1".equals(receipt.getStatus())) {
            log.error("❌ Transaction failed on-chain. Status: {}", receipt.getStatus());
            throw new TransactionFailedException(
                    "Transaction failed on-chain. Check the transaction on block explorer."
            );
        }

        // 3. Vérifier que la destination est le bon contrat
        String destination = receipt.getTo();
        if (destination == null || !destination.equalsIgnoreCase(contractAddress)) {
            log.error("❌ Wrong contract. Expected: {}, Got: {}", contractAddress, destination);
            throw new InvalidContractException(
                    String.format("Payment sent to wrong contract address. Expected: %s, Got: %s",
                            contractAddress, destination)
            );
        }

        // 4. Parser les logs pour trouver l'événement Funded
        List<Log> logs = receipt.getLogs();
        Log fundedLog = logs.stream()
                .filter(log -> !log.getTopics().isEmpty()
                        && log.getTopics().get(0).equals(FUNDED_EVENT_TOPIC))
                .findFirst()
                .orElseThrow(() -> {
                    log.error("❌ Funded event not found in transaction logs");
                    return new EventNotFoundException(
                            "Funded event not found. Did you call fund() with correct amount?"
                    );
                });

        // 5. Décoder l'événement
        // event Funded(address indexed tenant, uint256 amount)
        // - topics[0] = event signature
        // - topics[1] = tenant address (indexed)
        // - data = amount (non-indexed)

        String tenantAddressRaw = fundedLog.getTopics().get(1);
        // Remove "0x" prefix and padding (address is last 40 chars)
        String tenantAddress = "0x" + tenantAddressRaw.substring(26);

        // Decode amount from data field
        String dataHex = fundedLog.getData().substring(2); // Remove "0x"
        BigInteger amountWei = new BigInteger(dataHex, 16);
        BigDecimal amountEth = Convert.fromWei(amountWei.toString(), Convert.Unit.ETHER);

        log.info("🎯 Funded event detected:");
        log.info("   Tenant: {}", tenantAddress);
        log.info("   Amount: {} MATIC", amountEth);
        log.info("   Block: {}", receipt.getBlockNumber());

        return new FundedEventData(
                tenantAddress,
                amountEth,
                receipt.getBlockNumber()
        );
    }

    /**
     * Récupère l'état actuel du contrat en appelant state()
     *
     * @param contractAddress Adresse du RentalEscrow
     * @return État actuel du contrat (Created, Funded, Active, etc.)
     * @throws Exception Si l'appel échoue
     */
    public ContractState getContractState(String contractAddress) throws Exception {

        log.debug("🔍 Querying contract state: {}", contractAddress);

        // Créer la fonction state() : function state() public view returns (uint8)
        Function function = new Function(
                "state",
                Collections.emptyList(), // Pas de paramètres
                Collections.singletonList(new TypeReference<Uint8>() {})
        );

        String encodedFunction = FunctionEncoder.encode(function);

        // Appel read-only via eth_call
        EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction(
                        null, // from (not needed for view functions)
                        contractAddress, // to
                        encodedFunction // data
                ),
                DefaultBlockParameterName.LATEST
        ).send();

        if (response.hasError()) {
            log.error("❌ eth_call error: {}", response.getError().getMessage());
            throw new RuntimeException("Failed to query contract state: " + response.getError().getMessage());
        }

        // Décoder le résultat
        List<Type> results = FunctionReturnDecoder.decode(
                response.getValue(),
                function.getOutputParameters()
        );

        if (results.isEmpty()) {
            throw new RuntimeException("No value returned from contract state() call");
        }

        int stateValue = ((Uint8) results.get(0)).getValue().intValue();
        ContractState state = ContractState.fromIndex(stateValue);

        log.info("✅ Contract state verified: {}", state);

        return state;
    }
}