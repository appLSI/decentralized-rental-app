import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/contexts/WalletContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/Login";
import Dashboard from "./pages/Statistique";
import BrowseProperties from "./pages/BrowseProperties";
import MyProperties from "./pages/MyProperties";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AddProperty from "./pages/addPropertyPage";
import PropertyDetails from "./pages/PropertyDetails";
import VerifyOtp from "./pages/VerifyOtp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <WalletProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route
                path="/browse"
                element={
                  <ProtectedRoute>
                    <BrowseProperties />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-properties"
                element={
                  <ProtectedRoute>
                    <MyProperties />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-property"
                element={
                  <ProtectedRoute>
                    <AddProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              {/* Add PropertyDetails route */}
              <Route
                path="/property/:id"
                element={
                  <ProtectedRoute>
                    <PropertyDetails />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </WalletProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
