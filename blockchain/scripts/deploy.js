require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("╔═══════════════════════════════════════════════════════╗");
    console.log("║     🚀 DÉPLOIEMENT PRODUCTION - RENTALESCROW         ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");

    const [deployer] = await hre.ethers.getSigners();
    
    console.log("📋 INFORMATIONS DE DÉPLOIEMENT:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Network:", hre.network.name);
    console.log("Deployer:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Vérification du solde
    if (balance < hre.ethers.parseEther("0.01")) {
        console.log("⚠️  ATTENTION: Solde insuffisant pour le déploiement!");
        console.log("   Minimum recommandé: 0.01 ETH");
        console.log("   Obtenez des ETH de test sur:");
        console.log("   • https://sepoliafaucet.com/");
        console.log("   • https://www.infura.io/faucet/sepolia\n");
        process.exit(1);
    }

    console.log("📦 Déploiement du contrat en cours...\n");

    // Déploiement
    const RentalEscrow = await hre.ethers.getContractFactory("RentalEscrow");
    const rental = await RentalEscrow.deploy();
    
    console.log("⏳ Attente de confirmation...");
    await rental.waitForDeployment();

    const contractAddress = rental.target;
    const deploymentTx = rental.deploymentTransaction();

    console.log("\n╔═══════════════════════════════════════════════════════╗");
    console.log("║            ✅ DÉPLOIEMENT RÉUSSI !                    ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");

    console.log("📍 ADRESSE DU CONTRAT:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(contractAddress);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🔗 LIENS IMPORTANTS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("Transaction:", `https://sepolia.etherscan.io/tx/${deploymentTx.hash}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("⚙️  CONFIGURATION DU CONTRAT:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:", deployer.address);
    console.log("Platform Wallet:", deployer.address);
    console.log("Commission par défaut: 5%");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Sauvegarder les informations de déploiement
    const deploymentInfo = {
        network: hre.network.name,
        contractAddress: contractAddress,
        deployer: deployer.address,
        deploymentTx: deploymentTx.hash,
        timestamp: new Date().toISOString(),
        blockNumber: deploymentTx.blockNumber,
        etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
        abi: "Voir artifacts/contracts/RentalEscrow.sol/RentalEscrow.json"
    };

    // Créer le fichier de configuration pour le frontend
    const frontendConfig = {
        contractAddress: contractAddress,
        network: hre.network.name,
        chainId: hre.network.config.chainId || 11155111,
        rpcUrl: process.env.SEPOLIA_RPC_URL,
        etherscanUrl: `https://sepolia.etherscan.io/address/${contractAddress}`,
        abi: [
            "function createBooking(uint256 _bookingId, address payable _tenant, address payable _owner, uint256 _amount, uint256 _leaseStart, uint256 _leaseEnd) external",
            "function payRent(uint256 _bookingId) external payable",
            "function releaseFunds(uint256 _bookingId) external",
            "function cancelBooking(uint256 _bookingId) external",
            "function getBookingStatus(uint256 _bookingId) external view returns (uint8)",
            "function getBookingDetails(uint256 _bookingId) external view returns (address tenant, address owner, uint256 amount, uint256 platformFee, uint256 leaseStart, uint256 leaseEnd, uint8 status)",
            "event BookingCreated(uint256 indexed bookingId, address indexed tenant, address indexed owner, uint256 amount, uint256 platformFee)",
            "event PaymentReceived(uint256 indexed bookingId, address from, uint256 amount)",
            "event FundsReleased(uint256 indexed bookingId, address indexed owner, uint256 ownerAmount, uint256 platformFee)"
        ]
    };

    // Sauvegarder dans un fichier JSON
    const deploymentsDir = "./deployments";
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir);
    }

    const filename = `${deploymentsDir}/deployment-${hre.network.name}-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
    
    const frontendFilename = `${deploymentsDir}/contract-config-frontend.json`;
    fs.writeFileSync(frontendFilename, JSON.stringify(frontendConfig, null, 2));

    console.log("💾 FICHIERS GÉNÉRÉS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("• Déploiement:", filename);
    console.log("• Config Frontend:", frontendFilename);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📧 INFORMATIONS POUR LE FRONTEND:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Envoyez ce fichier à votre collègue:");
    console.log(`   ${frontendFilename}`);
    console.log("\nOu partagez directement:");
    console.log(`   Contract Address: ${contractAddress}`);
    console.log(`   Network: Sepolia Testnet`);
    console.log(`   Chain ID: 11155111`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📚 ABI COMPLET:");
    console.log("Le fichier ABI complet se trouve dans:");
    console.log("   artifacts/contracts/RentalEscrow.sol/RentalEscrow.json\n");

    console.log("✅ PROCHAINES ÉTAPES:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1. Vérifier le contrat sur Etherscan (optionnel):");
    console.log("   npx hardhat verify --network sepolia", contractAddress);
    console.log("\n2. Tester le contrat:");
    console.log("   npx hardhat run scripts/testDeployment.js --network sepolia");
    console.log("\n3. Envoyer le fichier de config au frontend:");
    console.log("   deployments/contract-config-frontend.json");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("🎉 DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ ERREUR DE DÉPLOIEMENT:");
        console.error(error);
        process.exit(1);
    });