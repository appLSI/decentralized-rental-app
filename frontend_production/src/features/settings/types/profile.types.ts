export interface UserData {
  userId: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  country?: string;
  city?: string;
  state?: string;
  date_of_birth?: string;
  address?: string;
  profile_image?: string;
  walletAddress?: string;
  createdAt?: string;

  // Use strict role types
  roles?: string[];   // ["USER" | "AGENT" | "ADMIN"]

  // Can have multiple types (ex: CLIENT + HOST)
  types?: string[];  // ["CLIENT" | "HOST"]

  // Host specific fields
  business_name?: string;
  description?: string;
}


export interface UserRole {
  id: string;
  role: "USER" | "AGENT" | "ADMIN";
}


export interface UserTypes {
  iduser: string;
  types: "CLIENT" | "HOST";
}


export interface ProfileState {
  user: UserData | null;
  loading: boolean;
  error: string | null;

  fetchUserProfile: (userId: string) => Promise<UserData>;
  setUser: (userData: UserData) => void;
  clearError: () => void;

  // ⭐ NEW
  updateUserWallet: (address: string | null) => void;
  updateUserProfile: (userId: string, data: Partial<UserData>) => Promise<UserData>;
}
