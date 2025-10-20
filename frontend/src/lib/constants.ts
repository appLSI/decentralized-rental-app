export const SUPPORTED_NETWORKS = {
  1: {
    name: "Ethereum Mainnet",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/demo",
    explorerUrl: "https://etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  11155111: {
    name: "Sepolia Testnet",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/demo",
    explorerUrl: "https://sepolia.etherscan.io",
    nativeCurrency: { name: "Sepolia Ether", symbol: "SEP", decimals: 18 },
  },
  137: {
    name: "Polygon",
    rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/demo",
    explorerUrl: "https://polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  },
};

// Real Estate Smart Contract ABI
export const RENTAL_CONTRACT_ABI = [
  "function createProperty(string memory _title, string memory _description, uint256 _rentPrice, string memory _imageUrl) external",
  "function rentProperty(uint256 _propertyId) external payable",
  "function payRent(uint256 _propertyId) external payable",
  "function getProperty(uint256 _propertyId) external view returns (tuple(uint256 id, address owner, address tenant, string title, string description, uint256 rentPrice, string imageUrl, bool isRented, uint256 rentDueDate))",
  "function getPropertiesByOwner(address _owner) external view returns (uint256[])",
  "function getPropertiesByTenant(address _tenant) external view returns (uint256[])",
  "function getAllProperties() external view returns (uint256[])",
  "function withdrawFunds() external",
  "event PropertyCreated(uint256 indexed propertyId, address indexed owner, string title, uint256 rentPrice)",
  "event PropertyRented(uint256 indexed propertyId, address indexed tenant, uint256 rentPrice)",
  "event RentPaid(uint256 indexed propertyId, address indexed tenant, uint256 amount)",
];

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// Mock contract address (replace with actual deployed contract)
export const RENTAL_CONTRACT_ADDRESS =
  "0x1234567890123456789012345678901234567890";

export const PROPERTY_CATEGORIES = [
  "Apartment",
  "House",
  "Condo",
  "Studio",
  "Villa",
  "Townhouse",
];

export const AMENITIES = [
  "WiFi",
  "Parking",
  "Pool",
  "Gym",
  "Balcony",
  "Garden",
  "Air Conditioning",
  "Heating",
  "Dishwasher",
  "Washing Machine",
];
