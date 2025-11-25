import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Membership from "./pages/Membership";
import Rides from "./pages/Rides";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ProfileEditor from "./pages/ProfileEditor";
import RideHistory from "./pages/RideHistory";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminSignup from './pages/admin/AdminSignup';
import AdminDashboard from './pages/admin/AdminDashboard';
import GalleryManagement from './pages/admin/GalleryManagement';
import HeroEditor from './pages/admin/HeroEditor';
import BadgeManagement from './pages/admin/BadgeManagement';
import RideManagement from './pages/admin/RideManagement';
import RideRegistrations from './pages/admin/RideRegistrations';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';
import SupervisorLogin from './pages/supervisor/SupervisorLogin';
import SupervisorLayout from './pages/supervisor/SupervisorLayout';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import PaymentOverview from './pages/supervisor/PaymentOverview';
import UserManagement from './pages/supervisor/UserManagement';
import NotificationBroadcast from './pages/supervisor/NotificationBroadcast';
import { SupervisorRoute } from './components/SupervisorRoute';
import CursorTrail from './components/CursorTrail';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CursorTrail />
        <BrowserRouter>
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
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
