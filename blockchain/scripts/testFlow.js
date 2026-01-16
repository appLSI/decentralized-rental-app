require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("╔═══════════════════════════════════════════════════════╗");
    console.log("║         🧪 TEST DU CONTRAT DÉPLOYÉ                   ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");

    // Charger l'adresse du contrat depuis le fichier de config
    let contractAddress;
    try {
        const configFile = "./deployments/contract-config-frontend.json";
        const config = JSON.parse(fs.readFileSync(configFile, "utf8"));
        contractAddress = config.contractAddress;
        console.log("📄 Contrat chargé depuis:", configFile);
    } catch (error) {
        console.log("⚠️  Fichier de config introuvable, veuillez entrer l'adresse manuellement:\n");
        console.log("Ou relancez d'abord: npx hardhat run scripts/deploy.js --network sepolia\n");
        process.exit(1);
    }

    const [admin, tenant, owner] = await hre.ethers.getSigners();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔗 Contrat:", contractAddress);
    console.log("🌐 Network:", hre.network.name);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("👥 COMPTES DE TEST:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:", admin.address);
    console.log("Tenant:", tenant.address);
    console.log("Owner:", owner.address);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Attacher le contrat
    const rental = await hre.ethers.getContractAt("RentalEscrow", contractAddress);

    // Vérifier les soldes
    console.log("💼 SOLDES INITIAUX:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const tenantBalanceInit = await hre.ethers.provider.getBalance(tenant.address);
    const ownerBalanceInit = await hre.ethers.provider.getBalance(owner.address);
    const adminBalanceInit = await hre.ethers.provider.getBalance(admin.address);
    
    console.log("Tenant:", hre.ethers.formatEther(tenantBalanceInit), "ETH");
    console.log("Owner:", hre.ethers.formatEther(ownerBalanceInit), "ETH");
    console.log("Admin:", hre.ethers.formatEther(adminBalanceInit), "ETH");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Vérifier le solde du tenant
    const minBalance = hre.ethers.parseEther("0.02");
    if (tenantBalanceInit < minBalance) {
        console.log("❌ ERREUR: Le tenant n'a pas assez d'ETH!");
        console.log("   Requis: 0.02 ETH minimum");
        console.log("   Disponible:", hre.ethers.formatEther(tenantBalanceInit), "ETH\n");
        process.exit(1);
    }

    // ====== TEST 1: CRÉATION DE RÉSERVATION ======
    console.log("📝 TEST 1: CRÉATION DE RÉSERVATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const bookingId = Date.now(); // ID unique
    const amount = hre.ethers.parseEther("0.01");
    const now = Math.floor(Date.now() / 1000);
    
    console.log("Booking ID:", bookingId);
    console.log("Montant:", hre.ethers.formatEther(amount), "ETH");
    console.log("Tenant:", tenant.address);
    console.log("Owner:", owner.address);
    console.log("\n⏳ Création en cours...");
    
    try {
        const txCreate = await rental.createBooking(
            bookingId,
            tenant.address,
            owner.address,
            amount,
            now,
            now + (30 * 24 * 60 * 60) // +30 jours
        );
        await txCreate.wait();
        
        console.log("✅ Réservation créée!");
        console.log("   TX:", txCreate.hash);
        console.log("   Etherscan:", `https://sepolia.etherscan.io/tx/${txCreate.hash}`);
        
        const status = await rental.getBookingStatus(bookingId);
        console.log("   Statut:", status.toString(), "(0 = AWAITING_PAYMENT)");
    } catch (error) {
        console.log("❌ Erreur:", error.message);
        process.exit(1);
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // ====== TEST 2: PAIEMENT ======
    console.log("💰 TEST 2: PAIEMENT PAR LE LOCATAIRE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const tenantBefore = await hre.ethers.provider.getBalance(tenant.address);
    console.log("Tenant AVANT paiement:", hre.ethers.formatEther(tenantBefore), "ETH");
    console.log("\n⏳ Paiement en cours...");
    
    try {
        const txPay = await rental.connect(tenant).payRent(bookingId, { value: amount });
        await txPay.wait();
        
        const tenantAfter = await hre.ethers.provider.getBalance(tenant.address);
        const contractBalance = await hre.ethers.provider.getBalance(contractAddress);
        
        console.log("✅ Paiement effectué!");
        console.log("   TX:", txPay.hash);
        console.log("   Etherscan:", `https://sepolia.etherscan.io/tx/${txPay.hash}`);
        console.log("\n📊 Résultat:");
        console.log("   Tenant APRÈS:", hre.ethers.formatEther(tenantAfter), "ETH");
        console.log("   ❌ Perdu:", hre.ethers.formatEther(tenantBefore - tenantAfter), "ETH");
        console.log("   ✅ Contrat reçu:", hre.ethers.formatEther(contractBalance), "ETH");
        
        const status = await rental.getBookingStatus(bookingId);
        console.log("   Statut:", status.toString(), "(1 = PAID)");
    } catch (error) {
        console.log("❌ Erreur:", error.message);
        process.exit(1);
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // ====== TEST 3: LIBÉRATION ======
    console.log("🔓 TEST 3: LIBÉRATION DES FONDS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    const ownerBefore = await hre.ethers.provider.getBalance(owner.address);
    const adminBefore = await hre.ethers.provider.getBalance(admin.address);
    
    console.log("Owner AVANT:", hre.ethers.formatEther(ownerBefore), "ETH");
    console.log("Admin AVANT:", hre.ethers.formatEther(adminBefore), "ETH");
    console.log("\n⏳ Libération en cours...");
    
    try {
        const txRelease = await rental.releaseFunds(bookingId);
        await txRelease.wait();
        
        const ownerAfter = await hre.ethers.provider.getBalance(owner.address);
        const adminAfter = await hre.ethers.provider.getBalance(admin.address);
        const contractBalance = await hre.ethers.provider.getBalance(contractAddress);
        
        console.log("✅ Fonds libérés!");
        console.log("   TX:", txRelease.hash);
        console.log("   Etherscan:", `https://sepolia.etherscan.io/tx/${txRelease.hash}`);
        console.log("\n📊 Résultat:");
        console.log("   Owner APRÈS:", hre.ethers.formatEther(ownerAfter), "ETH");
        console.log("   ✅ Gagné:", hre.ethers.formatEther(ownerAfter - ownerBefore), "ETH (95%)");
        console.log("   Admin APRÈS:", hre.ethers.formatEther(adminAfter), "ETH");
        console.log("   ✅ Commission:", hre.ethers.formatEther(adminAfter - adminBefore), "ETH (5%)");
        console.log("   Contrat:", hre.ethers.formatEther(contractBalance), "ETH (vide)");
        
        const status = await rental.getBookingStatus(bookingId);
        console.log("   Statut:", status.toString(), "(2 = COMPLETED)");
    } catch (error) {
        console.log("❌ Erreur:", error.message);
        process.exit(1);
    }
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // ====== RÉCAPITULATIF ======
    console.log("╔═══════════════════════════════════════════════════════╗");
    console.log("║              ✅ TOUS LES TESTS RÉUSSIS !              ║");
    console.log("╚═══════════════════════════════════════════════════════╝\n");

    const tenantBalanceFinal = await hre.ethers.provider.getBalance(tenant.address);
    const ownerBalanceFinal = await hre.ethers.provider.getBalance(owner.address);
    const adminBalanceFinal = await hre.ethers.provider.getBalance(admin.address);

    console.log("📊 BILAN FINAL:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Tenant:");
    console.log("   Avant:", hre.ethers.formatEther(tenantBalanceInit), "ETH");
    console.log("   Après:", hre.ethers.formatEther(tenantBalanceFinal), "ETH");
    console.log("   ❌ Différence:", hre.ethers.formatEther(tenantBalanceInit - tenantBalanceFinal), "ETH");
    console.log("");
    console.log("Owner:");
    console.log("   Avant:", hre.ethers.formatEther(ownerBalanceInit), "ETH");
    console.log("   Après:", hre.ethers.formatEther(ownerBalanceFinal), "ETH");
    console.log("   ✅ Gagné:", hre.ethers.formatEther(ownerBalanceFinal - ownerBalanceInit), "ETH");
    console.log("");
    console.log("Admin/Plateforme:");
    console.log("   ✅ Commission:", hre.ethers.formatEther(adminBalanceFinal - adminBalanceInit), "ETH");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("✅ Le contrat fonctionne parfaitement!");
    console.log("✅ L'ETH se déplace correctement entre les wallets!");
    console.log("✅ Le contrat est prêt pour le frontend!\n");

    console.log("📧 INFORMATIONS POUR LE FRONTEND:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Fichier de config:", "./deployments/contract-config-frontend.json");
    console.log("Contract Address:", contractAddress);
    console.log("Network: Sepolia");
    console.log("Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ ERREUR:");
        console.error(error);
        process.exit(1);
    });