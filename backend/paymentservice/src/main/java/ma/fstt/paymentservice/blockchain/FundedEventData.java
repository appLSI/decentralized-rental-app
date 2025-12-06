package ma.fstt.paymentservice.blockchain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.math.BigInteger;

/**
 * Données extraites de l'événement Funded du Smart Contract
 *
 * event Funded(address indexed tenant, uint256 amount);
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FundedEventData {

    /**
     * Adresse wallet du tenant (payeur)
     * Extrait du topic[1] de l'événement
     */
    private String tenantAddress;

    /**
     * Montant payé (converti de Wei vers Ether)
     * Extrait du data de l'événement
     */
    private BigDecimal amount;

    /**
     * Numéro du block où la transaction a été minée
     */
    private BigInteger blockNumber;
}