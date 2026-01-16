// components/guards/RoleGuard.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Spinner } from "../ui/spinner";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: ("ADMIN" | "AGENT")[];
}

/**
 * RoleGuard - Requires specific user roles (ADMIN or AGENT)
 * Redirects to dashboard if user doesn't have required role
 */
const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
    const { user, isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
                <Spinner className="size-8 text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!user?.roles || !allowedRoles.includes(user.roles[0] as "ADMIN" | "AGENT")) {
        console.log(" hello ", user.roles)
        return <Navigate to="/admin/dashboard" replace />;
    }

    return <>{children}</>;
};

export default RoleGuard;
