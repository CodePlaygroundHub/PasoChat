import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  const GITHUB_URL = "https://github.com/Akash504-ai/Chat-app.git";

  return (
    <footer className="bg-base-200 py-12 border-t border-base-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 text-xl font-bold mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <span className="tracking-tighter">PASO</span>
            </Link>
            <p className="text-sm text-base-content/70 mb-6">
              Enterprise-grade real-time communication platform built for scale.
            </p>
            <div className="flex gap-4">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="text-base-content/60 hover:text-primary transition-colors">
                <FaGithub className="w-6 h-6" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>

          {/* Project Column */}
          <div>
            <h3 className="font-bold text-base-content mb-4 uppercase tracking-wider text-sm">Project</h3>
            <ul className="space-y-3 text-sm text-base-content/70">
              <li><button onClick={() => document.getElementById('features').scrollIntoView({behavior: 'smooth'})} className="hover:text-primary transition-colors">Features</button></li>
              <li><button onClick={() => document.getElementById('architecture').scrollIntoView({behavior: 'smooth'})} className="hover:text-primary transition-colors">Architecture</button></li>
              <li><button onClick={() => document.getElementById('why-paso').scrollIntoView({behavior: 'smooth'})} className="hover:text-primary transition-colors">Why PASO</button></li>
            </ul>
          </div>

          {/* Developers Column */}
          <div>
            <h3 className="font-bold text-base-content mb-4 uppercase tracking-wider text-sm">Developers</h3>
            <ul className="space-y-3 text-sm text-base-content/70">
              <li><a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">API Reference</a></li>
              <li><Link to="/contribute" className="hover:text-primary transition-colors">Contributing</Link></li>
              <li><a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">License</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="font-bold text-base-content mb-4 uppercase tracking-wider text-sm">Legal</h3>
            <ul className="space-y-3 text-sm text-base-content/70">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-base-300 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-base-content/60">
            © {new Date().getFullYear()} PASO. All rights reserved.
          </p>
          <p className="text-sm text-base-content/60 flex items-center gap-1">
            Made with <span className="text-error">❤️</span> by CodePlaygroundHub
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
