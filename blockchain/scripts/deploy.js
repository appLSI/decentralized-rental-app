require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const RPC_URL = process.env.SEPOLIA_RPC_URL;
  const OWNER_KEY = process.env.PRIVATE_KEY;
  const TENANT_KEY = process.env.PRIVATE_KEY_TENANT;
  const PLATFORM_OWNER_KEY = process.env.PLATFORM_OWNER;

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const ownerWallet = new ethers.Wallet(OWNER_KEY, provider);
  const tenantWallet = new ethers.Wallet(TENANT_KEY, provider);
  const platformOwnerWallet = new ethers.Wallet(PLATFORM_OWNER_KEY, provider);

  console.log("Déploiement avec le compte propriétaire :", ownerWallet.address);
  console.log("Locataire :", tenantWallet.address);
  console.log("Propriétaire de la plateforme :", platformOwnerWallet.address);

  const rentAmount = ethers.parseEther("0.0001"); // loyer pour test
  const currentTime = Math.floor(Date.now() / 1000);
  const leaseStart = currentTime ;
  const leaseEnd = currentTime + 60 * 60 * 24 * 7; // 7 jours

  // Déploiement
  const RentalEscrow = await ethers.getContractFactory("RentalEscrow");
  const contract = await RentalEscrow.deploy(
    ownerWallet.address,
    tenantWallet.address,
    platformOwnerWallet.address,
    rentAmount,
    leaseStart,
    leaseEnd
  );
  await contract.waitForDeployment();

  console.log("✅ Contrat déployé :", contract.target); // parfois contract.address selon version

  console.log("💰 Loyer :", ethers.formatEther(rentAmount), "ETH");

  // Paiement par le locataire
  console.log("💰 Locataire envoie le loyer + commission...");
  const txFund = await contract.connect(tenantWallet).fund({ value: rentAmount });
  await txFund.wait();
  console.log("✅ Paiement effectué !");

  // Démarrage par le propriétaire
  console.log("🛫 Propriétaire démarre la location...");
  const txStart = await contract.connect(ownerWallet).startLease();
  await txStart.wait();
  console.log("✅ Location commencée !");
}

main().catch((error) => {
  console.error("❌ Erreur :", error);
  process.exitCode = 1;
});
