import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Image, 
  Award, 
  Calendar, 
  Bell, 
  ImageIcon,
  LogOut,
  Menu,
  ClipboardList
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function AdminLayout() {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const menuItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/gallery", label: "Gallery", icon: Image },
    { path: "/admin/hero", label: "Hero Images", icon: ImageIcon },
    { path: "/admin/badges", label: "Badges", icon: Award },
    { path: "/admin/rides", label: "Rides", icon: Calendar },
    { path: "/admin/registrations", label: "Registrations", icon: ClipboardList },
    { path: "/admin/announcements", label: "Announcements", icon: Bell },
  ];

  const NavLinks = () => (
    <>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex flex-col gap-2 p-6">
                  <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold">The Taj Royals</h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden lg:block w-64 border-r min-h-[calc(100vh-4rem)] sticky top-16">
          <div className="flex flex-col gap-2 p-6">
            <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
            <NavLinks />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="container max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
