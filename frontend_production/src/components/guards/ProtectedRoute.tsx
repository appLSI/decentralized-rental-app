// components/guards/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { Spinner } from "../ui/spinner";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * ProtectedRoute - Requires user authentication
 * Redirects to home page if not authenticated
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { isAuthenticated, user, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-4">
                <Spinner className="size-8 text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log("not authenticated");
        return <Navigate to="/" replace />;
    }
    if (user?.roles.includes("HOST")) {
        console.log("host");
        return <Navigate to="/host/dashboard" replace />;
    }
    else if (user?.roles.includes("AGENT") || user?.roles.includes("ADMIN")) {
        console.log("agent");
        return <Navigate to="/agent/dashboard" replace />;
    }


    return <>{children}</>;
};

export default ProtectedRoute;
