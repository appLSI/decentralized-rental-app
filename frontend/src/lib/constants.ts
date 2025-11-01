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

export const mockProperties = [
  {
    id: 1,
    title: "Luxury Downtown Apartment",
    description:
      "Beautiful modern apartment in the heart of the city with stunning skyline views.",
    location: "Manhattan, New York",
    rentPrice: "2.5",
    category: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: "1200 sq ft",
    amenities: ["wifi", "parking", "gym", "concierge"],
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 24,
  },
  {
    id: 2,
    title: "Modern Studio with Garden",
    description:
      "Charming studio apartment featuring a private garden terrace and open floor plan.",
    location: "Brooklyn, New York",
    rentPrice: "1.8",
    category: "studio",
    bedrooms: 1,
    bathrooms: 1,
    area: "650 sq ft",
    amenities: ["wifi", "garden", "laundry", "pet-friendly"],
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    rating: 4.6,
    reviews: 18,
  },
  {
    id: 3,
    title: "Waterfront Penthouse",
    description:
      "Stunning penthouse with panoramic waterfront views and luxury finishes throughout.",
    location: "Jersey City, New Jersey",
    rentPrice: "4.2",
    category: "penthouse",
    bedrooms: 3,
    bathrooms: 3,
    area: "2200 sq ft",
    amenities: ["wifi", "parking", "pool", "concierge", "gym", "rooftop"],
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 31,
  },
  {
    id: 4,
    title: "Artist Loft in SoHo",
    description:
      "Spacious industrial loft with high ceilings and abundant natural light for creative work.",
    location: "SoHo, New York",
    rentPrice: "3.1",
    category: "loft",
    bedrooms: 1,
    bathrooms: 2,
    area: "1800 sq ft",
    amenities: ["wifi", "high-ceilings", "studio-space", "exposed-brick"],
    imageUrl:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 22,
  },
  {
    id: 5,
    title: "Cozy Family House",
    description:
      "Warm and inviting family home with backyard and modern kitchen in quiet neighborhood.",
    location: "Queens, New York",
    rentPrice: "2.8",
    category: "house",
    bedrooms: 4,
    bathrooms: 2,
    area: "1600 sq ft",
    amenities: ["wifi", "parking", "garden", "laundry", "pet-friendly"],
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop",
    rating: 4.5,
    reviews: 16,
  },
  {
    id: 6,
    title: "City View Condo",
    description:
      "Elegant condo with breathtaking city views and premium building amenities.",
    location: "Manhattan, New York",
    rentPrice: "3.5",
    category: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: "1400 sq ft",
    amenities: ["wifi", "parking", "gym", "concierge", "pool", "balcony"],
    imageUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 42,
  },
  {
    id: 7,
    title: "Chic Uptown Duplex",
    description:
      "Stylish two-level duplex with private entrance and modern designer finishes.",
    location: "Upper East Side, New York",
    rentPrice: "3.8",
    category: "duplex",
    bedrooms: 2,
    bathrooms: 2,
    area: "1500 sq ft",
    amenities: ["wifi", "private-entrance", "laundry", "balcony"],
    imageUrl:
      "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=400&h=300&fit=crop",
    rating: 4.7,
    reviews: 29,
  },
  {
    id: 8,
    title: "Lakeside Cottage Retreat",
    description:
      "Peaceful cottage with lake access, perfect for weekend getaways and nature lovers.",
    location: "Upstate New York",
    rentPrice: "1.2",
    category: "cottage",
    bedrooms: 2,
    bathrooms: 1,
    area: "900 sq ft",
    amenities: ["wifi", "lake-access", "fireplace", "pet-friendly", "garden"],
    imageUrl:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
    rating: 4.9,
    reviews: 37,
  },
  {
    id: 9,
    title: "Modern High-Rise Condo",
    description:
      "Sleek high-rise condo with floor-to-ceiling windows and smart home features.",
    location: "Financial District, New York",
    rentPrice: "4.5",
    category: "apartment",
    bedrooms: 3,
    bathrooms: 2,
    area: "1800 sq ft",
    amenities: ["wifi", "parking", "gym", "concierge", "smart-home", "pool"],
    imageUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
    rating: 4.8,
    reviews: 51,
  },
  {
    id: 10,
    title: "Bohemian Brownstone Flat",
    description:
      "Character-filled brownstone apartment with original details and artistic flair.",
    location: "Harlem, New York",
    rentPrice: "2.1",
    category: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    area: "800 sq ft",
    amenities: ["wifi", "hardwood-floors", "fireplace", "pet-friendly"],
    imageUrl:
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=300&fit=crop",
    rating: 4.4,
    reviews: 19,
  },
];
