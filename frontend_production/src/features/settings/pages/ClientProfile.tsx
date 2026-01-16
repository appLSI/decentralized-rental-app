import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useWalletStore } from "@/shared/stores/wallet.store";
import { useProfileStore } from "@/features/settings/store/profile.store";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Camera,
  Wallet,
  Copy,
  CheckCircle2,
  Loader2,
  Save,
  Edit2,
  ArrowLeft,
  Calendar,
  FileText,
  LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useUpdateProfile from "../hooks/useUpdateProfile";

export const ClientProfile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuthStore();
  const { walletAddress } = useWalletStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const {
    user: fetchedUser,
    loading: fetchLoading,
    error: fetchError,
    fetchUserProfile,
    setUser,
    clearError: clearFetchError
  } = useProfileStore();

  const {
    loading: updateLoading,
    error: updateError,
    success,
    updateUserProfile,
    clearError: clearUpdateError,
    clearSuccess
  } = useUpdateProfile();

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
    bio: "",
  });

  useEffect(() => {
    if (authUser?.userId && !fetchedUser) {
      fetchUserProfile(authUser.userId);
    }
  }, [authUser?.userId, fetchedUser, fetchUserProfile]);

  useEffect(() => {
    if (fetchedUser) {
      setFormData({
        firstname: fetchedUser.firstname || "",
        lastname: fetchedUser.lastname || "",
        phone: fetchedUser.phone || "",
        country: fetchedUser.country || "",
        city: fetchedUser.city || "",
        state: fetchedUser.state || "",
        address: fetchedUser.address || "",
        date_of_birth: fetchedUser.date_of_birth || "",
        profile_image: fetchedUser.profile_image || "",
        bio: (fetchedUser as any).bio || "",
      });
    }
  }, [fetchedUser]);

  useEffect(() => {
    if (success && fetchedUser) {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      clearSuccess();
    }
    if (updateError) {
      toast.error(updateError);
      clearUpdateError();
    }
    if (fetchError) {
      toast.error(fetchError);
      clearFetchError();
    }
  }, [success, updateError, fetchError, clearSuccess, clearUpdateError, clearFetchError, fetchedUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast.success("Wallet address copied");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.userId) return;
    try {
      const updatedUser = await updateUserProfile(authUser.userId, formData);
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  if (fetchLoading && !fetchedUser) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-black/5 animate-ping"></div>
          <Loader2 className="h-12 w-12 text-black animate-spin relative" />
        </div>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="hover:bg-gray-200 rounded-full px-4 text-gray-600 font-medium transition-all flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-full px-6 flex items-center gap-2 font-bold transition-all border-gray-200 text-gray-600 shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-black tracking-tighter">My Profile</h1>
            <p className="text-gray-500 font-medium text-lg max-w-xl">
              Manage your personal information and identity on the platform.
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl overflow-hidden mb-12">
          <CardContent className="p-8 md:p-12">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-12">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-gray-100 to-gray-300 rounded-full opacity-50 group-hover:opacity-100 blur transition duration-500"></div>
                <Avatar className="relative h-40 w-40 border-8 border-white shadow-2xl">
                  <AvatarImage src={formData.profile_image} className="object-cover" />
                  <AvatarFallback className="bg-black text-white text-4xl font-black">
                    {formData.firstname?.[0]}{formData.lastname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  className="absolute bottom-1 right-1 h-12 w-12 rounded-full shadow-2xl border-4 border-white bg-black hover:bg-gray-800 text-white transition-transform hover:scale-110 active:scale-95"
                  onClick={() => setIsEditing(true)}
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 text-center md:text-left space-y-6">
                <div>
                  <h2 className="text-4xl font-black text-black tracking-tight mb-2">
                    {formData.firstname} {formData.lastname}
                  </h2>
                  <p className="text-gray-500 text-xl font-medium">{fetchedUser?.email}</p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                    Identity Verified
                  </Badge>
                  <Badge className="bg-black text-white border-none rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {fetchedUser?.roles?.[0] || "CLIENT"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Wallet Section - Ultra Premium Dark Card */}
            <Card className="rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] mb-12 overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors duration-1000"></div>
              <CardContent className="p-10 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner">
                    <Wallet className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-black uppercase tracking-[0.2em] text-xs text-gray-400">Connected Wallet</h3>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Input
                      readOnly
                      className="h-14 bg-white/5 backdrop-blur-md border border-white/10 font-mono text-sm pr-14 rounded-2xl text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:border-white/20"
                      value={walletAddress || "Not connected"}
                    />
                    <div className={`absolute right-5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${walletAddress
                      ? "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                      : "bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]"
                      }`} />
                  </div>
                  <Button
                    onClick={copyToClipboard}
                    className="h-14 px-8 gap-3 rounded-2xl bg-white hover:bg-gray-100 text-black font-black uppercase tracking-widest text-[10px] shrink-0 shadow-2xl transition-all active:scale-95"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Address
                  </Button>
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-6">
                  Linked to your booking history <span className="mx-2 opacity-30">|</span> Read-only access
                </p>
              </CardContent>
            </Card>

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label htmlFor="firstname" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">First Name</Label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-black transition-colors" />
                    <Input
                      id="firstname"
                      placeholder="John"
                      className="h-14 pl-14 rounded-2xl bg-gray-50/50 border-2 border-gray-200 text-black font-semibold placeholder:text-gray-500 focus-visible:border-black focus-visible:ring-0 transition-all disabled:opacity-50"
                      value={formData.firstname}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="lastname" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">Last Name</Label>
                  <div className="relative group">
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-black transition-colors" />
                    <Input
                      id="lastname"
                      placeholder="Doe"
                      className="h-14 pl-14 rounded-2xl bg-gray-50/50 border-2 border-gray-200 text-black font-semibold placeholder:text-gray-500 focus-visible:border-black focus-visible:ring-0 transition-all disabled:opacity-50"
                      value={formData.lastname}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    disabled
                    className="h-14 pl-14 rounded-2xl bg-gray-100/50 border-2 border-gray-200 text-gray-500 font-semibold opacity-70"
                    value={fetchedUser?.email || ""}
                  />
                  <div className="absolute right-5 top-1/2 -translate-y-1/2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">Phone Number</Label>
                  <div className="relative group">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-black transition-colors" />
                    <Input
                      id="phone"
                      placeholder="+33 6 00 00 00 00"
                      className="h-14 pl-14 rounded-2xl bg-gray-50/50 border-2 border-gray-200 text-black font-semibold placeholder:text-gray-500 focus-visible:border-black focus-visible:ring-0 transition-all disabled:opacity-50"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="date_of_birth" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">Date of Birth</Label>
                  <div className="relative group">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-black transition-colors" />
                    <Input
                      id="date_of_birth"
                      type="date"
                      className="h-14 pl-14 rounded-2xl bg-gray-50/50 border-2 border-gray-200 text-black font-semibold focus-visible:border-black focus-visible:ring-0 transition-all disabled:opacity-50"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <Label htmlFor="country" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">Country</Label>
                  <div className="relative group">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-black transition-colors" />
                    <Input
                      id="country"
                      placeholder="United States"
                      className="h-14 pl-14 rounded-2xl bg-gray-50/50 border-2 border-gray-200 text-black font-semibold placeholder:text-gray-500 focus-visible:border-black focus-visible:ring-0 transition-all disabled:opacity-50"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">City</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-black transition-colors" />
                    <Input
                      id="city"
                      placeholder="New York"
                      className="h-14 pl-14 rounded-2xl bg-gray-50/50 border-2 border-gray-200 text-black font-semibold placeholder:text-gray-500 focus-visible:border-black focus-visible:ring-0 transition-all disabled:opacity-50"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ml-1">About You</Label>
                <div className="relative group">
                  <FileText className="absolute left-5 top-5 h-5 w-5 text-gray-500 group-focus-within:text-black transition-colors" />
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    className="min-h-[160px] pl-14 pt-5 rounded-[2rem] bg-gray-50/50 border-2 border-gray-200 text-black font-semibold placeholder:text-gray-500 focus-visible:border-black focus-visible:ring-0 transition-all resize-none disabled:opacity-50"
                    value={formData.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-6 pt-10 border-t border-gray-100">
                {isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                      className="rounded-full px-10 h-14 font-bold text-gray-500 hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateLoading}
                      className="rounded-full px-12 h-14 gap-3 bg-black hover:bg-gray-800 text-white font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95"
                    >
                      {updateLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                      Save Profile
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-full px-12 h-14 bg-black hover:bg-gray-800 text-white font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95 gap-3"
                  >
                    <Edit2 className="h-5 w-5" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientProfile;
