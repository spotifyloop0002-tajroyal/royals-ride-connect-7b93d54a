import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LayoutDashboard, 
  Image, 
  Award, 
  Calendar, 
  Megaphone, 
  CreditCard, 
  Users, 
  Bell, 
  Menu, 
  LogOut,
  Layers,
  ClipboardList
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SupervisorLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/supervisor/login");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/supervisor" },
    { icon: Image, label: "Gallery", path: "/supervisor/gallery" },
    { icon: Layers, label: "Hero Slider", path: "/supervisor/hero" },
    { icon: Award, label: "Badges", path: "/supervisor/badges" },
    { icon: Calendar, label: "Rides", path: "/supervisor/rides" },
    { icon: ClipboardList, label: "Registrations", path: "/supervisor/registrations" },
    { icon: Megaphone, label: "Announcements", path: "/supervisor/announcements" },
    { icon: CreditCard, label: "Payments", path: "/supervisor/payments" },
    { icon: Users, label: "Users", path: "/supervisor/users" },
    { icon: Bell, label: "Notifications", path: "/supervisor/notifications" },
    { icon: Users, label: "Core Team", path: "/supervisor/team" },
  ];

  const NavLinks = () => (
    <>
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/supervisor"}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          activeClassName="bg-accent text-foreground font-medium"
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold">Supervisor Panel</h2>
                </div>
                <nav className="flex flex-col gap-1 p-4">
                  <NavLinks />
                </nav>
              </SheetContent>
            </Sheet>

            <h1 className="text-xl font-bold">Supervisor Panel</h1>
          </div>

          <Button onClick={handleSignOut} variant="ghost" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] border-r sticky top-16">
          <nav className="flex flex-col gap-1 p-4">
            <NavLinks />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
