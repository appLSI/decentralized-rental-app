package ma.fstt.paymentservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.Web3ClientVersion;
import org.web3j.protocol.http.HttpService;

/**
 * Configuration Web3j pour la connexion au nœud Ethereum/Polygon
 *
 * Provider recommandé: Alchemy
 * - Polygon Amoy (testnet): https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY
 * - Polygon Mainnet: https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
 */
@Configuration
@Slf4j
public class Web3Config {

    @Value("${web3.rpc.url}")
    private String rpcUrl;

    /**
     * Créer le client Web3j pour interagir avec la blockchain
     *
     * @return Instance Web3j connectée au RPC provider
     */
    @Bean
    public Web3j web3j() {

        log.info("🔗 Connecting to Ethereum node: {}", maskUrl(rpcUrl));

        Web3j web3j = Web3j.build(new HttpService(rpcUrl));

        try {
            // Vérifier la connexion au nœud
            Web3ClientVersion version = web3j.web3ClientVersion().send();

            log.info("✅ Connected to Ethereum node successfully");
            log.info("   Client version: {}", version.getWeb3ClientVersion());

            // Récupérer le network ID pour vérification
            String networkId = web3j.netVersion().send().getNetVersion();
            log.info("   Network ID: {} ({})", networkId, getNetworkName(networkId));

        } catch (Exception e) {
            log.error("❌ Failed to connect to Ethereum node: {}", e.getMessage(), e);
            log.error("   RPC URL: {}", maskUrl(rpcUrl));
            log.error("   Please check:");
            log.error("   1. RPC URL is correct");
            log.error("   2. API key is valid");
            log.error("   3. Network connectivity");
        }

        return web3j;
    }

    /**
     * Masque l'URL RPC pour les logs (cache l'API key)
     */
    private String maskUrl(String url) {
        if (url == null) return "null";
        int lastSlashIndex = url.lastIndexOf("/");
        if (lastSlashIndex > 0) {
            return url.substring(0, lastSlashIndex) + "/***";
        }
        return url;
    }

    /**
     * Retourne le nom du réseau à partir de son ID
     */
    private String getNetworkName(String networkId) {
        return switch (networkId) {
            case "1" -> "Ethereum Mainnet";
            case "137" -> "Polygon Mainnet";
            case "80002" -> "Polygon Amoy Testnet";
            case "11155111" -> "Sepolia Testnet";
            default -> "Unknown Network";
        };
    }
}