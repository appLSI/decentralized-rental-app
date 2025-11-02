const hre = require("hardhat");
const { ethers } = hre;
require("dotenv").config();

async function main() {
    // ⚡ Adresse du contrat déployé
    const contractAddress = "0x5Da78f4Cc22dEEC77Afb3714D9365d961630bba6";

    // 🔑 Récupération des clés privées depuis .env
    const OWNER_KEY = process.env.PRIVATE_KEY;
    const TENANT_KEY = process.env.PRIVATE_KEY_TENANT;
    const RPC_URL = process.env.SEPOLIA_RPC_URL;

    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // Wallets
    const ownerWallet = new ethers.Wallet(OWNER_KEY, provider);
    const tenantWallet = new ethers.Wallet(TENANT_KEY, provider);

    console.log("Compte propriétaire :", ownerWallet.address);
    console.log("Compte locataire :", tenantWallet.address);

    // 🔗 Récupération du contrat
    const contract = await ethers.getContractAt("RentalEscrow", contractAddress, ownerWallet);
    console.log("Contrat attaché à :", contract.target);

    // 📝 Lecture de l'état actuel
    let state = await contract.state();
    console.log("État actuel :", state.toString()); // 0=Created, 1=Approved, ...

    // 🔹 Étape 1 : le propriétaire approuve la réservation
    if (state.toString() === "0") { // Created
        const txApprove = await contract.approve();
        await txApprove.wait();
        console.log("✅ Réservation approuvée !");
    }

    // 🔹 Étape 2 : le locataire paie le loyer
    state = await contract.state();
    if (state.toString() === "1") { // Approved
        const rentAmount = await contract.rentAmount();
        const txFund = await contract.connect(tenantWallet).fund({ value: rentAmount });
        await txFund.wait();
        console.log("💰 Loyer payé :", ethers.formatEther(rentAmount), "ETH");
    }

    // 🔹 Lire le solde du contrat
    const balance = await contract.getBalance();
    console.log("💼 Solde du contrat :", ethers.formatEther(balance), "ETH");

    // 🔹 Étape 3 : démarrer la location
    state = await contract.state();
    if (state.toString() === "2") { // Funded
        try {
            const txStart = await contract.startLease();
            await txStart.wait();
            console.log("🏠 Location démarrée !");
        } catch (err) {
            console.log("⚠️ Impossible de démarrer la location :", err.message);
        }
    }

    // 🔹 Étape 4 : terminer la location
    state = await contract.state();
    if (state.toString() === "3") { // Active
        try {
            const txComplete = await contract.complete();
            await txComplete.wait();
            console.log("🎉 Location terminée, fonds transférés au propriétaire !");
        } catch (err) {
            console.log("⚠️ Impossible de terminer la location :", err.message);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
