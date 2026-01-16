import React, { useState, useEffect } from "react";
import { Settings, LogOut, User, Mail, Phone, MapPin, Calendar, Edit2, Save, Loader2 } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProfileStore } from "@/features/settings/store/profile.store";
import { toast } from "@/shared/hooks/use-toast";

const AdminSettings = () => {
    const { user: authUser, logout } = useAuthStore();
    const {
        user: fetchedUser,
        fetchUserProfile,
        updateUserProfile,
        loading: isUpdating,
        error: fetchError
    } = useProfileStore();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        address: "",
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
                email: fetchedUser.email || "",
                phone: fetchedUser.phone || "",
                address: fetchedUser.address || "",
            });
        }
    }, [fetchedUser]);

    useEffect(() => {
        if (fetchError) {
            toast({
                title: "Erreur",
                description: fetchError,
                variant: "destructive"
            });
        }
    }, [fetchError]);

    const handleLogout = () => {
        logout();
        window.location.href = "/";
    };

    const handleSave = async () => {
        if (!authUser?.userId) return;

        try {
            await updateUserProfile(authUser.userId, {
                firstname: formData.firstname,
                lastname: formData.lastname,
                phone: formData.phone,
                address: formData.address,
            });
            toast({ title: "Profil mis à jour avec succès" });
            setIsEditing(false);
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Erreur lors de la mise à jour du profil",
                variant: "destructive"
            });
        }
    };

    const handleCancel = () => {
        if (fetchedUser) {
            setFormData({
                firstname: fetchedUser.firstname || "",
                lastname: fetchedUser.lastname || "",
                email: fetchedUser.email || "",
                phone: fetchedUser.phone || "",
                address: fetchedUser.address || "",
            });
        }
        setIsEditing(false);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (!authUser || (isUpdating && !fetchedUser)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-black tracking-tight flex items-center gap-3">
                            <Settings className="h-10 w-10 text-black" />
                            Paramètres Administrateur
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Gérez votre profil et vos informations personnelles.
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-xl overflow-hidden">

                    {/* Card Header */}
                    <div className="p-8 border-b border-gray-200/50 bg-black">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center uppercase">
                                    <span className="text-3xl font-bold text-black">
                                        {formData.firstname?.[0] || '?'}{formData.lastname?.[0] || '?'}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {formData.firstname} {formData.lastname}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                                            {fetchedUser?.roles[0] || authUser.roles[0]}
                                        </span>

                                    </div>
                                </div>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Modifier
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-8">
                        <div className="space-y-6">

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-black uppercase tracking-wide">
                                        Prénom
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.firstname}
                                            onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-black focus:outline-none focus:border-black transition-colors"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <span className="text-black font-medium">{formData.firstname || "Non renseigné"}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-black uppercase tracking-wide">
                                        Nom
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.lastname}
                                            onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-black focus:outline-none focus:border-black transition-colors"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                                            <User className="h-5 w-5 text-gray-400" />
                                            <span className="text-black font-medium">{formData.lastname || "Non renseigné"}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-black uppercase tracking-wide">
                                    Email
                                </label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-2xl text-gray-500 cursor-not-allowed outline-none"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <span className="text-black font-medium">{formData.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-black uppercase tracking-wide">
                                    Téléphone
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-black focus:outline-none focus:border-black transition-colors"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span className="text-black font-medium">{formData.phone || "Non renseigné"}</span>
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-black uppercase tracking-wide">
                                    Adresse
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-black focus:outline-none focus:border-black transition-colors"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
                                        <MapPin className="h-5 w-5 text-gray-400" />
                                        <span className="text-black font-medium">{formData.address || "Non renseignée"}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={handleCancel}
                                        disabled={isUpdating}
                                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isUpdating}
                                        className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Enregistrer
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-xl p-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-100 rounded-2xl">
                            <Settings className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-black mb-1">
                                Besoin d'aide ?
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Si vous rencontrez des problèmes avec votre compte ou si vous avez besoin d'assistance supplémentaire,
                                contactez le support technique.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
