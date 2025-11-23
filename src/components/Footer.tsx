import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-br from-card via-card to-primary/5 border-t-2 border-primary/20 mt-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-2xl font-black bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              THE TAJ ROYALS
            </h3>
            <p className="text-sm font-semibold text-muted-foreground">
              Since 2005 – Agra's First Riders Club
            </p>
            <p className="text-sm font-bold text-electric">
              Ride Together. Live Free.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  to="/" 
                  className="group text-muted-foreground hover:text-primary transition-all duration-300 inline-flex items-center"
                >
                  <span className="relative">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="group text-muted-foreground hover:text-primary transition-all duration-300 inline-flex items-center"
                >
                  <span className="relative">
                    About
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/membership" 
                  className="group text-muted-foreground hover:text-primary transition-all duration-300 inline-flex items-center"
                >
                  <span className="relative">
                    Membership
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/rides" 
                  className="group text-muted-foreground hover:text-primary transition-all duration-300 inline-flex items-center"
                >
                  <span className="relative">
                    Ride Calendar
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/supervisor/login" 
                  className="group text-muted-foreground hover:text-primary transition-all duration-300 inline-flex items-center"
                >
                  <span className="relative">
                    Supervisor Panel
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors">Phone: +91 93193 31420</li>
              <li>Agra, Uttar Pradesh</li>
              <li>India</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-lg">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/tajroyals.bikergroup/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-3 rounded-full bg-primary/10 hover:bg-primary transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
                aria-label="Facebook"
              >
                <Facebook size={20} className="text-primary group-hover:text-primary-foreground transition-colors" />
              </a>
              <a 
                href="https://www.instagram.com/tajroyals.bikergroup/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-3 rounded-full bg-accent/10 hover:bg-accent transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_hsl(var(--accent)/0.5)]"
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-accent group-hover:text-accent-foreground transition-colors" />
              </a>
              <a 
                href="https://www.youtube.com/@tajroyals7501" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group relative p-3 rounded-full bg-secondary/10 hover:bg-secondary transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_hsl(var(--secondary)/0.5)]"
                aria-label="YouTube"
              >
                <Youtube size={20} className="text-secondary group-hover:text-secondary-foreground transition-colors" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} <span className="font-bold text-primary">The Taj Royals</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
