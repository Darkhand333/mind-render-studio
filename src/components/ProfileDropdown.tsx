import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, UserPlus, Settings, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ProfileDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 group"
      >
        <img
          src="https://api.dicebear.com/9.x/glass/svg?seed=Felix"
          alt="Avatar"
          className="w-8 h-8 rounded-full border-2 border-primary/30 object-cover group-hover:border-primary/60 transition-colors"
        />
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-12 w-56 glass-strong rounded-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-border/50">
              <p className="text-sm font-semibold text-foreground">Designer</p>
              <p className="text-xs text-muted-foreground">designer@protocraft.ai</p>
            </div>
            <div className="p-1.5">
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
              >
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                <UserPlus className="w-4 h-4" /> Add Account
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                <User className="w-4 h-4" /> Switch Account
              </button>
            </div>
            <div className="p-1.5 border-t border-border/50">
              <button
                onClick={() => { setOpen(false); navigate("/login"); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
