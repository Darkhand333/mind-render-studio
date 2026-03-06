import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Globe, Presentation, FileText, Share2, Sparkles, Search,
  Layout, Smartphone, Monitor, MessageSquare, Palette, Layers,
  Grid3X3, Zap, PenTool, Image, Columns
} from "lucide-react";

type TemplatePickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (template: { name: string; width: number; height: number; type: string; elements?: any[] }) => void;
};

const categories = [
  { id: "all", label: "All", icon: Grid3X3 },
  { id: "website", label: "Website", icon: Globe },
  { id: "whiteboard", label: "Whiteboard", icon: PenTool },
  { id: "slides", label: "Slides", icon: Presentation },
  { id: "social", label: "Social", icon: Share2 },
  { id: "mobile", label: "Mobile", icon: Smartphone },
  { id: "print", label: "Print", icon: FileText },
];

const templates = [
  // Website
  { id: "web-landing", name: "Landing Page", category: "website", emoji: "🌐", width: 1440, height: 900, desc: "Modern landing page layout", elements: [
    { type: "Frame", label: "Hero Section", x: 0, y: 0, w: 1440, h: 600, fillColor: "hsl(263, 70%, 58%)", cornerRadius: 0 },
    { type: "Text", label: "Heading", x: 100, y: 200, w: 600, h: 60, text: "Build Something Amazing", fontSize: 48, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Text", label: "Subheading", x: 100, y: 280, w: 500, h: 40, text: "Create beautiful designs with ease", fontSize: 20, fontWeight: "400", fillColor: "#ffffffcc" },
    { type: "Rectangle", label: "CTA Button", x: 100, y: 350, w: 200, h: 50, fillColor: "#ffffff", cornerRadius: 12 },
    { type: "Rectangle", label: "Nav Bar", x: 0, y: 0, w: 1440, h: 70, fillColor: "#00000033", cornerRadius: 0 },
  ]},
  { id: "web-portfolio", name: "Portfolio", category: "website", emoji: "💼", width: 1440, height: 900, desc: "Personal portfolio layout" },
  { id: "web-ecommerce", name: "E-Commerce", category: "website", emoji: "🛒", width: 1440, height: 900, desc: "Online store layout" },
  { id: "web-blog", name: "Blog", category: "website", emoji: "📝", width: 1440, height: 900, desc: "Blog/article layout" },
  { id: "web-dashboard", name: "Dashboard", category: "website", emoji: "📊", width: 1440, height: 900, desc: "Admin dashboard UI" },
  { id: "web-saas", name: "SaaS App", category: "website", emoji: "🚀", width: 1440, height: 900, desc: "SaaS product page" },

  // Whiteboard (FigJam style)
  { id: "wb-brainstorm", name: "Brainstorm", category: "whiteboard", emoji: "💡", width: 3000, height: 2000, desc: "Open brainstorming board", elements: [
    { type: "Rectangle", label: "Sticky Note 1", x: 200, y: 200, w: 200, h: 200, fillColor: "hsl(45, 90%, 55%)", cornerRadius: 8 },
    { type: "Rectangle", label: "Sticky Note 2", x: 500, y: 200, w: 200, h: 200, fillColor: "hsl(330, 80%, 60%)", cornerRadius: 8 },
    { type: "Rectangle", label: "Sticky Note 3", x: 800, y: 200, w: 200, h: 200, fillColor: "hsl(160, 70%, 50%)", cornerRadius: 8 },
    { type: "Rectangle", label: "Sticky Note 4", x: 350, y: 500, w: 200, h: 200, fillColor: "hsl(217, 91%, 60%)", cornerRadius: 8 },
    { type: "Rectangle", label: "Sticky Note 5", x: 650, y: 500, w: 200, h: 200, fillColor: "hsl(263, 70%, 58%)", cornerRadius: 8 },
  ]},
  { id: "wb-flowchart", name: "Flowchart", category: "whiteboard", emoji: "🔀", width: 3000, height: 2000, desc: "Process flow diagram" },
  { id: "wb-mindmap", name: "Mind Map", category: "whiteboard", emoji: "🧠", width: 3000, height: 2000, desc: "Mind mapping board" },
  { id: "wb-kanban", name: "Kanban Board", category: "whiteboard", emoji: "📋", width: 3000, height: 2000, desc: "Task management board" },
  { id: "wb-retro", name: "Retrospective", category: "whiteboard", emoji: "🔄", width: 3000, height: 2000, desc: "Sprint retrospective board" },

  // Slides
  { id: "sl-pitch", name: "Pitch Deck", category: "slides", emoji: "📊", width: 1920, height: 1080, desc: "Startup pitch deck", elements: [
    { type: "Frame", label: "Slide 1", x: 0, y: 0, w: 1920, h: 1080, fillColor: "#1a1a2e", cornerRadius: 0 },
    { type: "Text", label: "Title", x: 200, y: 400, w: 800, h: 80, text: "Your Pitch Deck", fontSize: 64, fontWeight: "700", fillColor: "#ffffff" },
    { type: "Text", label: "Subtitle", x: 200, y: 500, w: 600, h: 40, text: "Company Name • 2026", fontSize: 24, fontWeight: "400", fillColor: "#ffffffaa" },
  ]},
  { id: "sl-edu", name: "Education", category: "slides", emoji: "🎓", width: 1920, height: 1080, desc: "Educational presentation" },
  { id: "sl-report", name: "Report", category: "slides", emoji: "📈", width: 1920, height: 1080, desc: "Business report slides" },
  { id: "sl-keynote", name: "Keynote", category: "slides", emoji: "🎤", width: 1920, height: 1080, desc: "Conference keynote" },

  // Social Media
  { id: "sm-ig-post", name: "Instagram Post", category: "social", emoji: "📸", width: 1080, height: 1080, desc: "Square social post" },
  { id: "sm-ig-story", name: "Instagram Story", category: "social", emoji: "📱", width: 1080, height: 1920, desc: "Vertical story format" },
  { id: "sm-yt-thumb", name: "YouTube Thumbnail", category: "social", emoji: "▶️", width: 1280, height: 720, desc: "Video thumbnail" },
  { id: "sm-twitter", name: "Twitter/X Post", category: "social", emoji: "🐦", width: 1200, height: 675, desc: "Social media post" },
  { id: "sm-linkedin", name: "LinkedIn Banner", category: "social", emoji: "💼", width: 1584, height: 396, desc: "Profile banner" },
  { id: "sm-fb-cover", name: "Facebook Cover", category: "social", emoji: "📘", width: 820, height: 312, desc: "Facebook cover photo" },

  // Mobile
  { id: "mob-ios", name: "iPhone 15 Pro", category: "mobile", emoji: "📱", width: 393, height: 852, desc: "iOS app screen" },
  { id: "mob-android", name: "Android (Pixel)", category: "mobile", emoji: "🤖", width: 412, height: 915, desc: "Android app screen" },
  { id: "mob-ipad", name: "iPad Pro", category: "mobile", emoji: "📲", width: 1024, height: 1366, desc: "Tablet app screen" },

  // Print
  { id: "pr-bizcard", name: "Business Card", category: "print", emoji: "💳", width: 1050, height: 600, desc: "Standard business card" },
  { id: "pr-poster", name: "Poster A3", category: "print", emoji: "🖼️", width: 1123, height: 1587, desc: "Large format poster" },
  { id: "pr-flyer", name: "Flyer", category: "print", emoji: "📰", width: 612, height: 792, desc: "Standard flyer" },
  { id: "pr-resume", name: "Resume", category: "print", emoji: "📝", width: 816, height: 1056, desc: "Professional resume" },
];

const TemplatePickerModal = ({ open, onClose, onSelect }: TemplatePickerProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const filtered = templates.filter(t => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCustomCreate = () => {
    if (!customPrompt.trim()) return;
    // Generate a reasonable template based on keywords
    const lower = customPrompt.toLowerCase();
    let width = 1440, height = 900, type = "design";
    if (lower.includes("mobile") || lower.includes("app")) { width = 393; height = 852; }
    else if (lower.includes("slide") || lower.includes("presentation")) { width = 1920; height = 1080; type = "presentation"; }
    else if (lower.includes("poster")) { width = 1123; height = 1587; }
    else if (lower.includes("story") || lower.includes("reel")) { width = 1080; height = 1920; }
    else if (lower.includes("square") || lower.includes("instagram")) { width = 1080; height = 1080; }
    onSelect({ name: customPrompt.trim(), width, height, type });
    setCustomPrompt("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-md flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gradient-purple flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Choose a Template</h2>
                  <p className="text-xs text-muted-foreground">Start with a template or create something custom</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search + "What do you want to make?" */}
            <div className="px-6 py-3 border-b border-border/20 space-y-2 shrink-0">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-secondary/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  placeholder="What do you want to make? e.g. 'A mobile fitness app'..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCustomCreate(); }}
                  className="flex-1 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  onClick={handleCustomCreate}
                  disabled={!customPrompt.trim()}
                  className="px-4 py-2 rounded-xl gradient-purple text-primary-foreground text-sm font-medium disabled:opacity-50 hover:scale-[1.02] transition-transform flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Create
                </button>
              </div>
            </div>

            {/* Categories */}
            <div className="px-6 py-2 border-b border-border/20 flex gap-1 overflow-x-auto shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Template grid */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-3">
                {/* Blank canvas option */}
                <button
                  onClick={() => { onSelect({ name: "Untitled", width: 1440, height: 900, type: "design" }); onClose(); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-center group"
                >
                  <div className="w-full aspect-video rounded-lg bg-secondary/30 flex items-center justify-center">
                    <Layout className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary/50 transition-colors" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Blank Canvas</p>
                  <p className="text-[9px] text-muted-foreground/60">1440 × 900</p>
                </button>

                {filtered.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { onSelect({ name: t.name, width: t.width, height: t.height, type: t.category, elements: t.elements }); onClose(); }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/20 hover:bg-secondary/40 border border-border/20 hover:border-primary/30 transition-all text-center group"
                  >
                    <div className="w-full aspect-video rounded-lg bg-secondary/40 flex items-center justify-center text-3xl">
                      {t.emoji}
                    </div>
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate w-full">{t.name}</p>
                    <p className="text-[9px] text-muted-foreground">{t.desc} • {t.width}×{t.height}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplatePickerModal;
