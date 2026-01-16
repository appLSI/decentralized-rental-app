package ma.fstt.paymentservice.blockchain;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.fstt.paymentservice.exception.*;
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
import org.web3j.protocol.core.methods.response.*;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RentalEscrowContract {

    private final Web3j web3j;

    // Topic hash de l'événement Funded(address indexed tenant, uint256 amount)
    private static final String FUNDED_EVENT_TOPIC =
            "0x2da466a7b24304f47e87fa2e1e5a81b9831ce54fec19055ce277ca2f39ba42c4";

    public FundedEventData validateFundTransaction(
            String contractAddress,
            String transactionHash
    ) throws Exception {

        log.info("🔍 Fetching transaction receipt from blockchain...");

        EthGetTransactionReceipt receiptResponse = web3j
                .ethGetTransactionReceipt(transactionHash)
                .send();

        if (receiptResponse.getTransactionReceipt().isEmpty()) {
            throw new TransactionNotFoundException(
                    "Transaction not found or not yet mined. Please wait 30 seconds and retry."
            );
        }

        TransactionReceipt receipt = receiptResponse.getTransactionReceipt().get();

        if (!"0x1".equals(receipt.getStatus())) {
            throw new TransactionFailedException(
                    "Transaction failed on-chain."
            );
        }

        String destination = receipt.getTo();
        if (!destination.equalsIgnoreCase(contractAddress)) {
            throw new InvalidContractException(
                    "Payment sent to wrong contract address."
            );
        }

        // Parser l'événement Funded
        List<Log> logs = receipt.getLogs();
        Log fundedLog = logs.stream()
                .filter(log -> !log.getTopics().isEmpty()
                        && log.getTopics().get(0).equals(FUNDED_EVENT_TOPIC))
                .findFirst()
                .orElseThrow(() -> new EventNotFoundException(
                        "Funded event not found."
                ));

        String tenantAddressRaw = fundedLog.getTopics().get(1);
        String tenantAddress = "0x" + tenantAddressRaw.substring(26);

        String dataHex = fundedLog.getData().substring(2);
        BigInteger amountWei = new BigInteger(dataHex, 16);
        BigDecimal amountEth = Convert.fromWei(amountWei.toString(), Convert.Unit.ETHER);

        log.info("💯 Funded event detected: {} MATIC from {}", amountEth, tenantAddress);

        return new FundedEventData(
                tenantAddress,
                amountEth,
                receipt.getBlockNumber()
        );
    }

    public ContractState getContractState(String contractAddress) throws Exception {
        Function function = new Function(
                "state",
                Collections.emptyList(),
                Collections.singletonList(new TypeReference<Uint8>() {})
        );

        String encodedFunction = FunctionEncoder.encode(function);

        EthCall response = web3j.ethCall(
                Transaction.createEthCallTransaction(null, contractAddress, encodedFunction),
                DefaultBlockParameterName.LATEST
        ).send();

        if (response.hasError()) {
            throw new RuntimeException("Failed to query contract state: " + response.getError().getMessage());
        }

        List<Type> results = FunctionReturnDecoder.decode(
                response.getValue(),
                function.getOutputParameters()
        );

        int stateValue = ((Uint8) results.get(0)).getValue().intValue();
        return ContractState.fromIndex(stateValue);
    }
}