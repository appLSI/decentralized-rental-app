export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  walletAddress?: string;
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  imageUrl: string;
  status: 'available' | 'rented' | 'owned';
  ownerId?: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
}

export interface RentalHistory {
  id: string;
  propertyId: string;
  propertyTitle: string;
  tenant: string;
  startDate: string;
  endDate: string;
  amount: string;
  status: 'active' | 'completed';
}

export const fakeUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    walletAddress: '0xcc43f8e7d9c5b1a2e3f4a5b6c7d8e9f0a1b2c3d4'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    walletAddress: '0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0'
  }
];

export const fakeProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    location: 'New York, NY',
    price: '2.5 ETH/month',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
    status: 'available',
    description: 'Luxurious 2-bedroom apartment in the heart of Manhattan',
    bedrooms: 2,
    bathrooms: 2
  },
  {
    id: '2',
    title: 'Beach House Paradise',
    location: 'Miami, FL',
    price: '4.0 ETH/month',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
    status: 'rented',
    description: 'Stunning oceanfront property with private beach access',
    bedrooms: 4,
    bathrooms: 3
  },
  {
    id: '3',
    title: 'Cozy Studio Loft',
    location: 'San Francisco, CA',
    price: '1.8 ETH/month',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop',
    status: 'available',
    description: 'Charming studio in historic building with modern amenities',
    bedrooms: 1,
    bathrooms: 1
  },
  {
    id: '4',
    title: 'Luxury Penthouse Suite',
    location: 'Los Angeles, CA',
    price: '6.5 ETH/month',
    imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&auto=format&fit=crop',
    status: 'owned',
    ownerId: '1',
    description: 'Exclusive penthouse with panoramic city views',
    bedrooms: 3,
    bathrooms: 3
  },
  {
    id: '5',
    title: 'Mountain Retreat Cabin',
    location: 'Denver, CO',
    price: '2.0 ETH/month',
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&auto=format&fit=crop',
    status: 'available',
    description: 'Peaceful mountain getaway with stunning views',
    bedrooms: 3,
    bathrooms: 2
  },
  {
    id: '6',
    title: 'Urban Industrial Loft',
    location: 'Chicago, IL',
    price: '2.2 ETH/month',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
    status: 'rented',
    description: 'Converted warehouse with exposed brick and high ceilings',
    bedrooms: 2,
    bathrooms: 2
  }
];

export const fakeRentalHistory: RentalHistory[] = [
  {
    id: '1',
    propertyId: '2',
    propertyTitle: 'Beach House Paradise',
    tenant: 'Alice Johnson',
    startDate: '2024-01-15',
    endDate: '2024-07-15',
    amount: '24.0 ETH',
    status: 'active'
  },
  {
    id: '2',
    propertyId: '6',
    propertyTitle: 'Urban Industrial Loft',
    tenant: 'Bob Williams',
    startDate: '2023-06-01',
    endDate: '2024-06-01',
    amount: '26.4 ETH',
    status: 'completed'
  },
  {
    id: '3',
    propertyId: '4',
    propertyTitle: 'Luxury Penthouse Suite',
    tenant: 'Carol Martinez',
    startDate: '2024-03-01',
    endDate: '2024-09-01',
    amount: '39.0 ETH',
    status: 'active'
  }
];
