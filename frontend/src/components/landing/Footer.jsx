import { MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  const GITHUB_URL = "https://github.com/Akash504-ai/Chat-app.git";

  return (
    <footer className="bg-base-100 py-16 border-t border-base-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          
          {/* Brand & Intro */}
          <div className="md:w-1/3">
            <Link to="/" className="flex items-center gap-3 text-xl font-bold mb-5 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-200 border border-primary/20">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <span className="font-display tracking-tight text-base-content">PASO</span>
            </Link>
            <p className="text-xs text-base-content/50 leading-relaxed max-w-xs mb-6">
              Enterprise-grade real-time communication platform. Built for scale, security, and seamless collaboration across distributed teams.
            </p>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-base-content/50 hover:text-primary transition-colors">
              <FaGithub className="w-4 h-4" /> View Source
            </a>
          </div>

          {/* Links Grid */}
          <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-[10px] font-bold text-base-content uppercase tracking-[0.2em] mb-5">Platform</h3>
              <ul className="space-y-3 text-xs text-base-content/60 font-medium">
                <li><button onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-primary transition-colors">Features</button></li>
                <li><button onClick={() => document.getElementById('architecture')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-primary transition-colors">Architecture</button></li>
                <li><button onClick={() => document.getElementById('why-paso')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-primary transition-colors">Why PASO</button></li>
                <li><a href="#comparison" className="hover:text-primary transition-colors">Deployment</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-base-content uppercase tracking-[0.2em] mb-5">Resources</h3>
              <ul className="space-y-3 text-xs text-base-content/60 font-medium">
                <li><a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">API Reference</a></li>
                <li><Link to="/contribute" className="hover:text-primary transition-colors">Contributing</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-base-content uppercase tracking-[0.2em] mb-5">Legal</h3>
              <ul className="space-y-3 text-xs text-base-content/60 font-medium">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">License</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-medium text-base-content/40 uppercase tracking-wider">
            © {new Date().getFullYear()} PASO. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
            <p className="text-[10px] font-medium text-base-content/40 uppercase tracking-wider">
              All Systems Operational
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
