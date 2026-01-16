import { Routes, Route } from "react-router-dom";

import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import ResetPassword from "@/features/auth/pages/ResetPassword";
import SignUp from "@/features/auth/pages/SignUp";
import SignIn from "@/features/auth/pages/SignIn";
import VerifyOtp from "@/features/auth/pages/VerifyOtp";

import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import OwnerGuard from "@/components/guards/OwnerGuard";

// import ClientProfile from "@/features/settings/pages/ClientProfile";
// import HostProfile from "@/features/settings/pages/HostProfile";
// import AdminProfile from "@/features/settings/pages/AdminProfile";


import NotFound from "@/pages/NotFound";

import AdminDashboard from "@/features/admin/pages/AdminDashboard";
import Agents from "@/features/admin/pages/Agents";
import AdminProperties from "@/features/admin/pages/AdminProperties";
import AdminSettings from "@/features/settings/pages/AdminSettings";
import AdminLayout from "@/features/admin/components/AdminLayout";
import HostDashboard from "@/features/host/pages/HostDashboard";
import MyProperties from "@/features/host/pages/MyProperties";
import CreateProperty from "@/features/host/pages/CreateProperty";
import EditProperty from "@/features/host/pages/EditProperty";
import MainLayout from "@/components/Layout/MainLayout";
import HostLayout from "@/features/host/components/HostLayout";
import PropertyDetailsPage from "@/features/properties/pages/PropertyDetailsPage";
import MyBookingsPage from "@/features/booking/pages/MyBookingsPage";
import PaymentPage from "@/features/payment/pages/PaymentPage";
import MinimalPropertyDetailsPage from "@/features/properties/pages/MinimalPropertyDetailsPage";
import HostProfile from "@/features/settings/pages/HostProfile";
import ClientProfile from "@/features/settings/pages/ClientProfile";
import PropertySearchPage from "@/features/properties/pages/PropertySearchPage";


export const AppRoutes = () => {
    return (
        <Routes>

            <Route path="/" element={<PropertySearchPage />} />
            <Route path="/properties" element={<PropertySearchPage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/payment/:id" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
            <Route
                path="/become-host/properties/create"
                element={
                    <ProtectedRoute>
                        <CreateProperty />
                    </ProtectedRoute>
                }
            />
            {/* ================= PUBLIC ROUTES ================= */}





            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />

            {/* ================= ADMIN / AGENT ROUTES ================= */}
            <Route element={<AdminLayout />}>
                <Route
                    path="/admin/dashboard"
                    element={
                        <RoleGuard allowedRoles={["ADMIN", "AGENT"]}>
                            <AdminDashboard />
                        </RoleGuard>
                    }
                />

                <Route
                    path="/admin/properties"
                    element={
                        <RoleGuard allowedRoles={["ADMIN", "AGENT"]}>
                            <AdminProperties />
                        </RoleGuard>
                    }
                />
                <Route
                    path="/admin/properties/:id/view"
                    element={
                        <RoleGuard allowedRoles={["ADMIN", "AGENT"]}>
                            <MinimalPropertyDetailsPage />
                        </RoleGuard>
                    }
                />

                <Route
                    path="/admin/agents"
                    element={
                        <RoleGuard allowedRoles={["ADMIN", "AGENT"]}>
                            <Agents />
                        </RoleGuard>
                    }
                />
                <Route
                    path="/admin/settings"
                    element={
                        <RoleGuard allowedRoles={["ADMIN", "AGENT"]}>
                            <AdminSettings />
                        </RoleGuard>
                    }
                />
            </Route>

            {/* ================= HOST ROUTES ================= */}
            <Route element={<HostLayout />}>
                <Route
                    path="/host/dashboard"
                    element={
                        <OwnerGuard>
                            <HostDashboard />
                        </OwnerGuard>
                    }
                />
                <Route
                    path="/host/properties"
                    element={
                        <OwnerGuard>
                            <MyProperties />
                        </OwnerGuard>
                    }
                />
                <Route
                    path="/host/properties/create"
                    element={
                        <ProtectedRoute>
                            <CreateProperty />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/host/properties/:id"
                    element={
                        <OwnerGuard>
                            <EditProperty />
                        </OwnerGuard>
                    }
                />
                <Route
                    path="/host/properties/:id/preview"
                    element={
                        <OwnerGuard>
                            <MinimalPropertyDetailsPage />
                        </OwnerGuard>
                    }
                />
            </Route>

            {/* ================= USER SETTINGS ================= */}
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <ClientProfile />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings/profile"
                element={
                    <ProtectedRoute>
                        <ClientProfile />
                    </ProtectedRoute>
                }
            />

            {/* ================= ADMIN SETTINGS ================= */}
            <Route
                path="/admin/settings"
                element={
                    <RoleGuard allowedRoles={["ADMIN", "AGENT"]}>
                        <AdminSettings />
                    </RoleGuard>
                }
            />

            {/* ================= HOST SETTINGS ================= */}
            <Route
                path="/host/settings"
                element={
                    <OwnerGuard>
                        <HostProfile />
                    </OwnerGuard>
                }
            />

            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};
