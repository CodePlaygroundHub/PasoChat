import { Link } from "react-router-dom";
import { ArrowRight, Menu, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";

const GITHUB_URL = "https://github.com/CodePlaygroundHub/paso-chat-app";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Product", href: "#showcase" },
  { label: "About", href: "#about" },
];

const LandingNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out ${
        scrolled
          ? "px-4 pt-3 sm:px-6"
          : "border-b border-zinc-900/12 bg-[#FAFAFA]/85 backdrop-blur-xl dark:border-white/12 dark:bg-[#100F0F]/85"
      }`}
    >
      <nav
        aria-label="Primary navigation"
        className={`mx-auto flex items-center justify-between transition-all duration-300 ease-out ${
          scrolled
            ? "h-13 max-w-3xl rounded-full border border-zinc-900/12 bg-[#FAFAFA]/90 px-3.5 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:px-4 dark:border-white/12 dark:bg-[#161515]/90 dark:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.65)]"
            : "h-16 max-w-6xl border-x border-zinc-900/14 px-4 sm:px-6 lg:px-8 dark:border-white/14"
        }`}
      >
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          className="group inline-flex items-center gap-2.5 rounded-lg py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/25"
        >
          <span
            className={`flex items-center justify-center border border-zinc-900/12 bg-white text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.05)] transition-all duration-200 ease-out group-hover:border-zinc-900/25 dark:border-white/12 dark:bg-[#1A1919] dark:text-zinc-50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.4)] dark:group-hover:border-white/25 ${
              scrolled ? "h-7 w-7 rounded-full" : "h-8 w-8 rounded-lg"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 stroke-[1.75]" />
          </span>

          <span className="font-sans text-[15px] font-semibold tracking-[-0.03em] text-zinc-950 dark:text-zinc-50">
            PASO
          </span>
        </Link>

        {/* Desktop Nav + Actions */}
        <div
          className={`hidden items-center md:flex ${
            scrolled ? "gap-3" : "gap-6"
          }`}
        >
          <ul className="flex items-center gap-0.5">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex h-8 items-center rounded-full px-3 text-[13px] font-medium text-zinc-600 transition-colors duration-150 hover:bg-zinc-900/[0.05] hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-50 dark:focus-visible:ring-white/25"
                >
                  {item.label}
                </a>
              </li>
            ))}

            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group/gh inline-flex h-8 items-center gap-1 rounded-full px-3 text-[13px] font-medium text-zinc-600 transition-colors duration-150 hover:bg-zinc-900/[0.05] hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-50 dark:focus-visible:ring-white/25"
              >
                <span>GitHub</span>
                <span className="font-mono text-[11px] text-zinc-400 transition-transform duration-150 group-hover/gh:translate-x-0.5 group-hover/gh:-translate-y-0.5 group-hover/gh:text-zinc-700 dark:text-zinc-500 dark:group-hover/gh:text-zinc-300">
                  ↗
                </span>
              </a>
            </li>
          </ul>

          <span
            aria-hidden="true"
            className="h-4 w-px bg-zinc-900/12 dark:bg-white/12"
          />

          <div className="flex items-center gap-1.5">
            <Link
              to="/login"
              className="inline-flex h-8 items-center justify-center rounded-full px-3 text-[13px] font-medium text-zinc-600 transition-colors duration-150 hover:bg-zinc-900/[0.05] hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-50 dark:focus-visible:ring-white/25"
            >
              Log in
            </Link>

            <Link
              to="/signup"
              className={`group/cta inline-flex h-8 items-center justify-center gap-1.5 bg-zinc-950 px-3.5 text-[13px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_1px_2px_rgba(0,0,0,0.16)] transition-all duration-200 hover:bg-zinc-800 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(0,0,0,0.35)] dark:hover:bg-white dark:focus-visible:ring-white/30 ${
                scrolled ? "rounded-full" : "rounded-lg"
              }`}
            >
              <span>Get started</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2] transition-transform duration-150 group-hover/cta:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center border border-zinc-900/12 bg-white/80 text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 md:hidden dark:border-white/12 dark:bg-white/[0.04] dark:text-zinc-300 dark:hover:bg-white/[0.08] dark:hover:text-white dark:focus-visible:ring-white/25 ${
            scrolled ? "rounded-full" : "rounded-lg"
          }`}
        >
          {menuOpen ? (
            <X className="h-4 w-4 stroke-[1.75]" />
          ) : (
            <Menu className="h-4 w-4 stroke-[1.75]" />
          )}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          id="mobile-nav-drawer"
          className={`mx-auto mt-2 border border-zinc-900/12 bg-[#FAFAFA]/95 backdrop-blur-xl md:hidden dark:border-white/12 dark:bg-[#161515]/95 ${
            scrolled
              ? "max-w-3xl rounded-2xl shadow-lg"
              : "max-w-6xl border-x-0 border-b"
          }`}
        >
          <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="flex h-10 items-center rounded-lg px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-900/[0.04] hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
              >
                {item.label}
              </a>
            ))}

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex h-10 items-center justify-between rounded-lg px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-900/[0.04] hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/[0.05] dark:hover:text-white"
            >
              <span>GitHub</span>
              <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                ↗
              </span>
            </a>

            <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-zinc-900/[0.08] pt-4 dark:border-white/[0.08]">
              <Link
                to="/login"
                onClick={closeMenu}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-900/12 bg-white text-[13px] font-medium text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-white/12 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.08]"
              >
                Log in
              </Link>

              <Link
                to="/signup"
                onClick={closeMenu}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-zinc-950 text-[13px] font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
              >
                <span>Get started</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2]" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;