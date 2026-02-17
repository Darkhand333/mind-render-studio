import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Search, Sparkles, Settings } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "UI Score", path: "/ui-score" },
  { label: "Memory Graph", path: "/memory-graph" },
  { label: "Workspace", path: "/workspace" },
];

const GlassNavbar = () => {
  const location = useLocation();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="flex items-center justify-between px-6 h-14">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center neon-glow-sm">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Proto<span className="gradient-text">Craft</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg gradient-purple neon-glow-sm"
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
          <Link to="/settings" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Settings className="w-4 h-4" />
          </Link>
          <div className="w-8 h-8 rounded-full gradient-purple neon-glow-sm" />
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </motion.header>
  );
};

export default GlassNavbar;
