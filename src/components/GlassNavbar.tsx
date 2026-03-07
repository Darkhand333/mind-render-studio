import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mic, Search, Sparkles, MessageSquare } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import CommandPalette from "./CommandPalette";
import NavChatbot from "./NavChatbot";
import VoiceCommandModal from "./VoiceCommandModal";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "UI Score", path: "/ui-score" },
  { label: "Memory Graph", path: "/memory-graph" },
  { label: "Workspace", path: "/workspace" },
];

const GlassNavbar = () => {
  const location = useLocation();
  const [commandOpen, setCommandOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Listen for custom event from home page voice button
  useEffect(() => {
    const handler = () => setVoiceOpen(true);
    window.addEventListener("open-voice-command", handler);
    return () => window.removeEventListener("open-voice-command", handler);
  }, []);

  const handleVoiceCommand = (transcript: string) => {
    console.log("Voice command:", transcript);
  };

  return (
    <>
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
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary transition-colors text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-background/50 text-[10px] font-mono">⌘K</kbd>
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="AI Assistant"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVoiceOpen(true)}
              className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Voice Commands"
            >
              <Mic className="w-4 h-4" />
            </button>
            <ProfileDropdown />
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </motion.header>
      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
      <NavChatbot open={chatOpen} onClose={() => setChatOpen(false)} />
      <VoiceCommandModal open={voiceOpen} onClose={() => setVoiceOpen(false)} onCommand={handleVoiceCommand} />
    </>
  );
};

export default GlassNavbar;
