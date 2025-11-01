const hre = require("hardhat");
const { ethers } = hre;
require("dotenv").config();

async function main() {
  const RPC_URL = process.env.SEPOLIA_RPC_URL;
  const OWNER_KEY = process.env.PRIVATE_KEY;
  const TENANT_KEY = process.env.PRIVATE_KEY_TENANT;

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // Wallets owner et tenant
  const ownerWallet = new ethers.Wallet(OWNER_KEY, provider);
  const tenantWallet = new ethers.Wallet(TENANT_KEY, provider);

  console.log("Déploiement avec le compte propriétaire :", ownerWallet.address);
  console.log("Locataire :", tenantWallet.address);

  // Montant du loyer
  const rentAmount = ethers.parseEther("0.01");

  // Timestamps
  const currentTime = Math.floor(Date.now() / 1000);
  const leaseStart = currentTime + 60;           // 1 minute après
  const leaseEnd = currentTime + 60 * 60 * 24 * 7; // 7 jours après

  // Déploiement
  const RentalEscrow = await ethers.getContractFactory("RentalEscrow", ownerWallet);
  console.log("Déploiement du contrat sur Sepolia...");

  const contract = await RentalEscrow.deploy(
    ownerWallet.address,
    tenantWallet.address,
    rentAmount,
    leaseStart,
    leaseEnd
  );

  await contract.waitForDeployment();

  console.log("✅ Contrat déployé avec succès !");
  console.log("📜 Adresse du contrat :", contract.target);
  console.log("💰 Loyer :", ethers.formatEther(rentAmount), "ETH");
  console.log("🕒 Début :", leaseStart, "| Fin :", leaseEnd);
}

main().catch((error) => {
  console.error("❌ Erreur lors du déploiement :", error);
  process.exitCode = 1;
});
