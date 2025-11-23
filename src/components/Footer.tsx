import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              The Taj Royals
            </h3>
            <p className="text-sm text-muted-foreground">
              Since 2005 – Agra's First Riders Club
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Ride Together. Live Free.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/membership" className="text-muted-foreground hover:text-primary transition-colors">
                  Membership
                </Link>
              </li>
              <li>
                <Link to="/rides" className="text-muted-foreground hover:text-primary transition-colors">
                  Ride Calendar
                </Link>
              </li>
              <li>
                <Link to="/supervisor/login" className="text-muted-foreground hover:text-primary transition-colors">
                  Supervisor Panel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Phone: +91 93193 31420</li>
              <li>Agra, Uttar Pradesh</li>
              <li>India</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/tajroyals.bikergroup/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://www.instagram.com/tajroyals.bikergroup/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://www.youtube.com/@tajroyals7501" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} The Taj Royals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
