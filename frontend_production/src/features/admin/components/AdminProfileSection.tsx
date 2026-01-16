import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProfileStore } from "@/features/settings/store/profile.store";
import { ProfileServices } from "@/features/settings/services/profile.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Phone, Shield, Loader2, Save } from "lucide-react";

const AdminProfileSection: React.FC = () => {
    const { user: authUser } = useAuthStore();
    const { user: profileUser, fetchUserProfile, setUser } = useProfileStore();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (authUser?.userId) {
            fetchUserProfile(authUser.userId);
        }
    }, [authUser?.userId, fetchUserProfile]);

    useEffect(() => {
        if (profileUser) {
            setFormData({
                firstname: profileUser.firstname || "",
                lastname: profileUser.lastname || "",
                email: profileUser.email || "",
                phone: profileUser.phone || "",
            });
        }
    }, [profileUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authUser?.userId) return;

        try {
            setIsSaving(true);
            const updatedUser = await ProfileServices.updateUserProfile(authUser.userId, formData);
            setUser(updatedUser);
            toast({
                title: "Profil mis à jour",
                description: "Vos informations ont été enregistrées avec succès.",
            });
        } catch (error: any) {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de mettre à jour le profil.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (!profileUser) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <User className="h-6 w-6 text-primary" />
                            Informations Personnelles
                        </CardTitle>
                        <CardDescription>
                            Gérez vos informations de profil administrateur
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {profileUser.role || "ADMIN"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="firstname" className="text-sm font-medium">Prénom</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="firstname"
                                    placeholder="Votre prénom"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    className="pl-10 h-10 bg-white/50 dark:bg-slate-800/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastname" className="text-sm font-medium">Nom</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="lastname"
                                    placeholder="Votre nom"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    className="pl-10 h-10 bg-white/50 dark:bg-slate-800/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email Professionnel</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="pl-10 h-10 bg-white/50 dark:bg-slate-800/50"
                                    disabled // Email non modifiable pour plus de sécurité admin?
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">Téléphone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    placeholder="+33 6 12 34 56 78"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="pl-10 h-10 bg-white/50 dark:bg-slate-800/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                        <Button type="submit" disabled={isSaving} className="gap-2 px-6">
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Enregistrer les modifications
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default AdminProfileSection;
