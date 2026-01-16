const hre = require("hardhat");
const { ethers } = hre;
require("dotenv").config();

async function main() {
  // ================= ENV =================
  const RPC_URL = process.env.SEPOLIA_RPC_URL;

  // Comptes à utiliser
  const OWNER_KEY = process.env.PRIVATE_KEY;         // propriétaire
  const TENANT_KEY = process.env.PRIVATE_KEY_TENANT; // locataire
  const PLATFORM_KEY = process.env.PLATFORM_OWNER;   // plateforme

  // ================= PROVIDER =================
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // ================= WALLETS =================
  const ownerWallet = new ethers.Wallet(OWNER_KEY, provider);
  const tenantWallet = new ethers.Wallet(TENANT_KEY, provider);
  const platformWallet = new ethers.Wallet(PLATFORM_KEY, provider);

  console.log("Déploiement avec le compte propriétaire :", ownerWallet.address);
  console.log("Locataire :", tenantWallet.address);
  console.log("Propriétaire de la plateforme :", platformWallet.address);

  // ================= PARAMÈTRES DU CONTRAT =================
  const rentAmount = ethers.parseEther("0.001"); // 0.01 ETH
  const currentTime = Math.floor(Date.now() / 1000);
  const leaseStart = currentTime;
const leaseEnd = currentTime + 10; // 10 secondes


  // ================= DEPLOY =================
  const RentalEscrow = await ethers.getContractFactory("RentalEscrow", ownerWallet);
  console.log("Déploiement du contrat sur Sepolia...");

  const contract = await RentalEscrow.deploy(
    ownerWallet.address,
    tenantWallet.address,
    platformWallet.address,
    rentAmount,
    leaseStart,
    leaseEnd
  );

  await contract.waitForDeployment();
  console.log("📜 Contrat déployé à :", contract.target);

  // ================= FUND =================
console.log("💰 Locataire envoie le loyer + commission...");
const platformFeePercent = await contract.platformFeePercent();

// conversion en BigInt
const platformFee = (rentAmount * BigInt(platformFeePercent)) / 100n;
const totalPayment = rentAmount + platformFee;

const fundTx = await contract.connect(tenantWallet).fund({ value: totalPayment });
await fundTx.wait();
console.log("✅ Paiement effectué :", ethers.formatEther(totalPayment), "ETH");


  // ================= START LEASE =================
  console.log("🛫 Propriétaire démarre la location...");
  const startTx = await contract.connect(ownerWallet).startLease();
  await startTx.wait();
  console.log("✅ Location commencée à :", Math.floor(Date.now() / 1000));

  // ================= WAIT SIMULÉ =================
console.log("⏳ Attente de la fin de location...");
await new Promise(resolve => setTimeout(resolve, 11000)); // 11 secondes


  // ================= COMPLETE =================
  console.log("🏁 Propriétaire complète la location...");
  const completeTx = await contract.connect(ownerWallet).complete();
  await completeTx.wait();

  const balanceAfter = await contract.getBalance();
  console.log(`✅ Location terminée. Solde restant dans le contrat : ${ethers.formatEther(balanceAfter)} ETH`);
  console.log(`Commission plateforme : ${platformFeePercent.toString()}%`);

  // ================= CHECK SOLDE WALLETS =================
  const ownerBalance = await provider.getBalance(ownerWallet.address);
  const tenantBalance = await provider.getBalance(tenantWallet.address);
  const platformBalance = await provider.getBalance(platformWallet.address);

  console.log("💼 Solde propriétaire :", ethers.formatEther(ownerBalance), "ETH");
  console.log("👤 Solde locataire :", ethers.formatEther(tenantBalance), "ETH");
  console.log("🏢 Solde plateforme :", ethers.formatEther(platformBalance), "ETH");
}

main().catch((error) => {
  console.error("❌ Erreur :", error);
  process.exitCode = 1;
});
