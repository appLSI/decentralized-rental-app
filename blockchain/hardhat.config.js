require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY_OWNER = process.env.PRIVATE_KEY_OWNER;  // clé du propriétaire
const PRIVATE_KEY_TENANT = process.env.PRIVATE_KEY_TENANT; // clé du locataire

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20", // garder la version utilisée dans ton contrat RentalEscrow
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY_OWNER, PRIVATE_KEY_TENANT],
    },
  },
};
