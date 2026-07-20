import { Link } from "react-router-dom";
import { MessageSquare, Menu, X, LogIn, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { FaGithub } from "react-icons/fa";

const LandingNavbar = () => {
  const { authUser } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const GITHUB_URL = "https://github.com/Akash504-ai/Chat-app.git";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-base-100/80 backdrop-blur-md shadow-sm border-b border-base-200"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-bold hover:opacity-80 transition-opacity"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <span className="tracking-tighter">PASO</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-base-content/80 hover:text-primary transition-colors text-sm font-medium"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("architecture")}
              className="text-base-content/80 hover:text-primary transition-colors text-sm font-medium"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollToSection("why-paso")}
              className="text-base-content/80 hover:text-primary transition-colors text-sm font-medium"
            >
              Why PASO
            </button>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost btn-circle btn-sm"
              title="GitHub"
            >
              <FaGithub className="h-5 w-5" />
            </a>
            {authUser ? (
              <Link to="/chat" className="btn btn-primary btn-sm gap-2 rounded-full px-6">
                Open App <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm rounded-full px-6">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn btn-ghost btn-sm btn-circle"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-base-100 border-b border-base-200 animate-in slide-in-from-top-2">
          <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
            <button
              onClick={() => scrollToSection("features")}
              className="text-left px-3 py-2 rounded-md text-base font-medium text-base-content/80 hover:text-primary hover:bg-base-200 w-full"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("architecture")}
              className="text-left px-3 py-2 rounded-md text-base font-medium text-base-content/80 hover:text-primary hover:bg-base-200 w-full"
            >
              Architecture
            </button>
            <button
              onClick={() => scrollToSection("why-paso")}
              className="text-left px-3 py-2 rounded-md text-base font-medium text-base-content/80 hover:text-primary hover:bg-base-200 w-full"
            >
              Why PASO
            </button>
            
            <div className="divider my-1"></div>
            
            {authUser ? (
              <Link to="/chat" className="btn btn-primary btn-sm w-full rounded-full">
                Open App
              </Link>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Link to="/login" className="btn btn-ghost btn-sm w-full">
                  <LogIn className="w-4 h-4 mr-2" /> Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm w-full rounded-full">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
