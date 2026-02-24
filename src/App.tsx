import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Eagerly loaded (public pages)
import Home from "./pages/Home";

// Lazy loaded pages
const About = lazy(() => import("./pages/About"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Membership = lazy(() => import("./pages/Membership"));
const Rides = lazy(() => import("./pages/Rides"));
const Contact = lazy(() => import("./pages/Contact"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ProfileEditor = lazy(() => import("./pages/ProfileEditor"));
const RideHistory = lazy(() => import("./pages/RideHistory"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages - lazy loaded (heavy, rarely visited)
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminSignup = lazy(() => import("./pages/admin/AdminSignup"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const GalleryManagement = lazy(() => import("./pages/admin/GalleryManagement"));
const HeroEditor = lazy(() => import("./pages/admin/HeroEditor"));
const BadgeManagement = lazy(() => import("./pages/admin/BadgeManagement"));
const RideManagement = lazy(() => import("./pages/admin/RideManagement"));
const RideRegistrations = lazy(() => import("./pages/admin/RideRegistrations"));
const AnnouncementManagement = lazy(() => import("./pages/admin/AnnouncementManagement"));

// Supervisor pages - lazy loaded
const SupervisorLogin = lazy(() => import("./pages/supervisor/SupervisorLogin"));
const SupervisorLayout = lazy(() => import("./pages/supervisor/SupervisorLayout"));
const SupervisorDashboard = lazy(() => import("./pages/supervisor/SupervisorDashboard"));
const PaymentOverview = lazy(() => import("./pages/supervisor/PaymentOverview"));
const UserManagement = lazy(() => import("./pages/supervisor/UserManagement"));
const NotificationBroadcast = lazy(() => import("./pages/supervisor/NotificationBroadcast"));
const TeamManagement = lazy(() => import("./pages/supervisor/TeamManagement"));

// Lazy load SupervisorRoute since it's only needed for supervisor pages
const SupervisorRoute = lazy(() => import("./components/SupervisorRoute").then(m => ({ default: m.SupervisorRoute })));
const CursorTrail = lazy(() => import("./components/CursorTrail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes  
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Suspense fallback={null}>
          <CursorTrail />
        </Suspense>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/rides" element={<Rides />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <ProfileEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ride-history"
                element={
                  <ProtectedRoute>
                    <RideHistory />
                  </ProtectedRoute>
                }
              />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="gallery" element={<GalleryManagement />} />
                <Route path="hero" element={<HeroEditor />} />
                <Route path="badges" element={<BadgeManagement />} />
                <Route path="rides" element={<RideManagement />} />
                <Route path="registrations" element={<RideRegistrations />} />
                <Route path="announcements" element={<AnnouncementManagement />} />
              </Route>
              
              {/* Supervisor Routes */}
              <Route path="/supervisor/login" element={<SupervisorLogin />} />
              <Route path="/supervisor" element={<SupervisorRoute><SupervisorLayout /></SupervisorRoute>}>
                <Route index element={<SupervisorDashboard />} />
                <Route path="gallery" element={<GalleryManagement />} />
                <Route path="hero" element={<HeroEditor />} />
                <Route path="badges" element={<BadgeManagement />} />
                <Route path="rides" element={<RideManagement />} />
                <Route path="registrations" element={<RideRegistrations />} />
                <Route path="announcements" element={<AnnouncementManagement />} />
                <Route path="payments" element={<PaymentOverview />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="notifications" element={<NotificationBroadcast />} />
                <Route path="team" element={<TeamManagement />} />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
