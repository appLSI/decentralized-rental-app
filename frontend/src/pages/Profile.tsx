import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/authStore";
import { useWallet } from "@/contexts/WalletContext";
import {
  User,
  Mail,
  Wallet,
  MapPin,
  Phone,
  Building,
  Star,
  Copy,
  Check,
  Calendar,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface User {
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
}

const Profile = () => {
  const { user, setUser, token } = useAuthStore();
  const { walletAddress, isConnected } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    address: "",
    date_of_birth: "",
    profile_image: "",
  });

  // Real person profile images
  const defaultProfileImages = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  ];

  // Get a random profile image if none exists
  const getProfileImage = () => {
    if (user?.profile_image) return user.profile_image;
    const randomIndex = Math.floor(Math.random() * defaultProfileImages.length);
    return defaultProfileImages[randomIndex];
  };

  // ✅ Fetch full profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.userId || !token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/users/${user.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status}`);
        }

        const data = await res.json();
        const profile = data.data || data;

        setUser(profile);
        setFormData({
          firstname: profile.firstname || "",
          lastname: profile.lastname || "",
          phone: profile.phone || "",
          country: profile.country || "",
          city: profile.city || "",
          state: profile.state || "",
          address: profile.address || "",
          date_of_birth: profile.date_of_birth || "",
          profile_image: profile.profile_image || getProfileImage(),
        });
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.userId, token, setUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId || !token) return;

    try {
      const response = await fetch(
        `http://localhost:8080/users/${user.userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to update profile");
      const updated = await response.json();

      const updatedProfile = updated.data || updated;
      setUser(updatedProfile);
      setFormData({
        firstname: updatedProfile.firstname || "",
        lastname: updatedProfile.lastname || "",
        phone: updatedProfile.phone || "",
        country: updatedProfile.country || "",
        city: updatedProfile.city || "",
        state: updatedProfile.state || "",
        address: updatedProfile.address || "",
        date_of_birth: updatedProfile.date_of_birth || "",
        profile_image: updatedProfile.profile_image || getProfileImage(),
      });

      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    }
  };

  const copyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        phone: user.phone || "",
        country: user.country || "",
        city: user.city || "",
        state: user.state || "",
        address: user.address || "",
        date_of_birth: user.date_of_birth || "",
        profile_image: user.profile_image || getProfileImage(),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const fullName =
    `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || "User";

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Profile</h1>
            <p className="text-muted-foreground">
              Manage your profile information and view your activity
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Profile Information</span>
                    </CardTitle>
                    <CardDescription>Your account details</CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      style={{
                        backgroundColor: "#182a3a",
                        borderColor: "#182a3a",
                        color: "white",
                      }}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSubmit}
                        style={{
                          backgroundColor: "#182a3a",
                          borderColor: "#182a3a",
                          color: "white",
                        }}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    <img
                      src={getProfileImage()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={formData.firstname}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              firstname: e.target.value,
                            }))
                          }
                          placeholder="First Name"
                        />
                        <Input
                          value={formData.lastname}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              lastname: e.target.value,
                            }))
                          }
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      <h3 className="text-lg font-semibold">{fullName}</h3>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <span>Member since 2024</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Verified
                      </Badge>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      id="email"
                      label="Email"
                      icon={Mail}
                      value={user?.email}
                      readOnly
                    />

                    <InputField
                      id="phone"
                      label="Phone"
                      icon={Phone}
                      value={isEditing ? formData.phone : user?.phone}
                      onChange={(v) =>
                        setFormData((prev) => ({ ...prev, phone: v }))
                      }
                      readOnly={!isEditing}
                    />

                    <InputField
                      id="date_of_birth"
                      label="Date of Birth"
                      icon={Calendar}
                      type="date"
                      value={
                        isEditing ? formData.date_of_birth : user?.date_of_birth
                      }
                      onChange={(v) =>
                        setFormData((prev) => ({ ...prev, date_of_birth: v }))
                      }
                      readOnly={!isEditing}
                    />

                    <InputField
                      id="country"
                      label="Country"
                      icon={MapPin}
                      value={isEditing ? formData.country : user?.country}
                      onChange={(v) =>
                        setFormData((prev) => ({ ...prev, country: v }))
                      }
                      readOnly={!isEditing}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      id="city"
                      label="City"
                      value={isEditing ? formData.city : user?.city}
                      onChange={(v) =>
                        setFormData((prev) => ({ ...prev, city: v }))
                      }
                      readOnly={!isEditing}
                    />
                    <InputField
                      id="state"
                      label="State"
                      value={isEditing ? formData.state : user?.state}
                      onChange={(v) =>
                        setFormData((prev) => ({ ...prev, state: v }))
                      }
                      readOnly={!isEditing}
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Address</span>
                    </Label>
                    {isEditing ? (
                      <Textarea
                        value={formData.address}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-md">
                        {user?.address || "No address provided"}
                      </p>
                    )}
                  </div>

                  {/* Wallet Address */}
                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4" />
                      <span>Wallet Address</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 text-sm bg-muted rounded font-mono">
                        {isConnected && walletAddress
                          ? formatAddress(walletAddress)
                          : "Not connected"}
                      </code>
                      {isConnected && walletAddress && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyAddress}
                          className={copied ? "text-green-600" : ""}
                          style={{
                            backgroundColor: copied ? "#182a3a" : "",
                            borderColor: "#182a3a",
                            color: copied ? "white" : "",
                          }}
                        >
                          {copied ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Activity Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Properties Owned
                    </span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Properties Rented
                    </span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Transactions
                    </span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Success Rate
                    </span>
                    <span className="font-medium">0%</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Portfolio Value
                      </span>
                      <span className="font-medium">0.00 ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Monthly Income
                      </span>
                      <span className="font-medium">0.00 ETH</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-muted-foreground">
                      Reputation Score
                    </span>
                    <span className="font-medium ml-auto">4.8/5.0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Your latest property and rental activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

// Updated helper component
function InputField({
  id,
  label,
  value = "",
  onChange,
  readOnly,
  icon: Icon,
  type = "text",
}: any) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center space-x-2">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </Label>
      <Input
        id={id}
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        className={readOnly ? "bg-muted" : ""}
      />
    </div>
  );
}

export default Profile;
