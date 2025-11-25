import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Gallery", path: "/gallery" },
    { name: "Membership", path: "/membership" },
    { name: "Ride Calendar", path: "/rides" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={cn(
      "navbar sticky top-0 z-50 transition-all duration-300",
      isScrolled 
        ? "glass-effect shadow-lg shadow-primary/10" 
        : "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-b border-border"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-black bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              THE TAJ ROYALS
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <ThemeToggle />
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "relative px-4 py-2 rounded-md text-sm font-bold transition-all duration-300",
                  "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary before:to-accent before:opacity-0 before:rounded-md",
                  "before:transition-opacity hover:before:opacity-20",
                  "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary",
                  "after:transition-all after:duration-300 hover:after:w-full",
                  isActive(link.path)
                    ? "text-primary after:w-full shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                    : "text-foreground hover:text-primary hover:scale-105"
                )}
              >
                <span className="relative z-10">{link.name}</span>
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-2 ml-4">
                <NotificationBell />
                <Link to="/dashboard">
                  <Button 
                    variant="default" 
                    className="shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] transition-all"
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="default" 
                  className="ml-4 shadow-[0_0_20px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)] transition-all"
                >
                  Login / Join
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-primary/10 rounded-md transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 animate-slide-in">
            <div className="px-4 mb-3">
              <ThemeToggle />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-md text-sm font-medium transition-all",
                  isActive(link.path)
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md"
                    : "text-foreground hover:bg-muted hover:translate-x-2"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                <Button variant="default" className="w-full mt-4">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <Button variant="default" className="w-full mt-4">
                  Login / Join
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
