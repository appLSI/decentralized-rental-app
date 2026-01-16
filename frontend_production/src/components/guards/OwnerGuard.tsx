// components/guards/OwnerGuard.tsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useProfileStore } from "@/features/settings/store/profile.store";
import { Spinner } from "../ui/spinner";

interface OwnerGuardProps {
    children: React.ReactNode;
}

const OwnerGuard = ({ children }: OwnerGuardProps) => {
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const { fetchUserProfile } = useProfileStore();

    const [checkingProfile, setCheckingProfile] = useState(true);

    // 🔁 Re-fetch profile if HOST role missing
    useEffect(() => {
        const verifyHost = async () => {
            if (!user?.types?.includes("HOST")) {
                try {
                    await fetchUserProfile(user?.userId);
                } finally {
                    setCheckingProfile(false);
                }
            } else {
                setCheckingProfile(false);
            }
        };

        verifyHost();
    }, []);

    // ⏳ Global auth loading or profile verification
    if (isLoading || checkingProfile) {
        return (
            <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
                <Spinner className="size-10 text-primary animate-pulse" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    Vérification des autorisations...
                </p>
            </div>
        );
    }

    // ❌ Not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/signin" replace />;
    }

    // ❌ Still not HOST → signup
    if (!user?.types?.includes("HOST")) {
        return <Navigate to="/signup" replace />;
    }

    // ✅ Authorized
    return <>{children}</>;
};

export default OwnerGuard;
