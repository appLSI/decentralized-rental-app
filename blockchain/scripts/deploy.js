const hre = require("hardhat");

async function main() {
  const AuthContract = await hre.ethers.getContractFactory("AuthContract");
  const authContract = await AuthContract.deploy();

  await authContract.waitForDeployment();

  console.log("✅ AuthContract deployed to:", await authContract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

