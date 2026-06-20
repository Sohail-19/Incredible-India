import { Link } from 'react-router-dom';
import { MapPin, Mail, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="hidden md:block bg-secondary text-white/70">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-white">
              Incredible<span className="text-primary">India</span>
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              Discover India's hidden gems — lesser-known destinations
              that will take your breath away.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">Explore</h4>
            <div className="flex flex-col gap-2">
              <Link to="/places" className="text-sm hover:text-white transition-colors">All Places</Link>
              <Link to="/map" className="text-sm hover:text-white transition-colors">Map View</Link>
              <Link to="/planner" className="text-sm hover:text-white transition-colors">Trip Planner</Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-white">About</h4>
            <div className="flex flex-col gap-2 text-sm">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Made in India</span>
              <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@incredibleindia.dev</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} IncredibleIndia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
