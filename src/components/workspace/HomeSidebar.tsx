import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock, Globe, FileText, FolderOpen, Trash, Package, UsersRound,
  Share2, Plus, Sparkles, Settings, ChevronRight, User, LogOut,
  Puzzle, LayoutTemplate, Monitor, Smartphone, Tablet, Watch,
  Presentation, FileType, Maximize2, Search, Star, BookOpen,
  Crown, Palette, Layers, Grid3X3, ArrowRight, ChevronDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { DraftProject, ProjectTemplate, DeviceFrame, projectTemplates, deviceFrames } from "./types";

type HomeSidebarProps = {
  onBackToCanvas: () => void;
  onNewProject: (width: number, height: number, name: string) => void;
};

const sampleDrafts: DraftProject[] = [
  { id: "1", name: "Landing Page v2", type: "design", updatedAt: "2 hours ago" },
  { id: "2", name: "Q1 Pitch Deck", type: "presentation", updatedAt: "Yesterday" },
  { id: "3", name: "Mobile App Mockup", type: "design", updatedAt: "3 days ago" },
  { id: "4", name: "Brand Guidelines", type: "doc", updatedAt: "1 week ago" },
];

const sampleTeamProjects = [
  { id: "t1", name: "Design System", members: 4, updatedAt: "1 hour ago" },
  { id: "t2", name: "Marketing Site", members: 3, updatedAt: "Today" },
  { id: "t3", name: "Product Redesign", members: 6, updatedAt: "2 days ago" },
];

const plugins = [
  { id: "p1", name: "Iconify", desc: "100k+ icons", icon: "🎯" },
  { id: "p2", name: "Unsplash", desc: "Free photos", icon: "📷" },
  { id: "p3", name: "Lorem Ipsum", desc: "Text generator", icon: "📝" },
  { id: "p4", name: "Color Palettes", desc: "Curated colors", icon: "🎨" },
  { id: "p5", name: "Charts", desc: "Data visualization", icon: "📊" },
  { id: "p6", name: "Wireframe Kit", desc: "Quick wireframes", icon: "🔲" },
];

type SidebarSection = "recents" | "community" | "drafts" | "projects" | "trash" | "resources" | "team" | "plugins" | "templates" | "frames" | "newProject" | null;

const HomeSidebar = ({ onBackToCanvas, onNewProject }: HomeSidebarProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SidebarSection>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [templateCategory, setTemplateCategory] = useState("All");
  const [frameCategory, setFrameCategory] = useState<"mobile" | "tablet" | "desktop" | "watch">("mobile");
  const [customW, setCustomW] = useState(1440);
  const [customH, setCustomH] = useState(900);
  const [searchTemplates, setSearchTemplates] = useState("");

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";

  const categories = ["All", ...Array.from(new Set(projectTemplates.map(t => t.category)))];
  const filteredTemplates = projectTemplates.filter(t => {
    const matchCat = templateCategory === "All" || t.category === templateCategory;
    const matchSearch = !searchTemplates || t.name.toLowerCase().includes(searchTemplates.toLowerCase());
    return matchCat && matchSearch;
  });
  const filteredFrames = deviceFrames.filter(f => f.category === frameCategory);

  const navItems = [
    { id: "recents" as SidebarSection, icon: Clock, label: "Recents" },
    { id: "drafts" as SidebarSection, icon: FileText, label: "Drafts" },
    { id: "projects" as SidebarSection, icon: FolderOpen, label: "All Projects" },
    { id: "team" as SidebarSection, icon: UsersRound, label: "Team Projects" },
    { id: "templates" as SidebarSection, icon: LayoutTemplate, label: "Templates" },
    { id: "frames" as SidebarSection, icon: Monitor, label: "Device Frames" },
    { id: "plugins" as SidebarSection, icon: Puzzle, label: "Plugins" },
    { id: "resources" as SidebarSection, icon: Package, label: "Resources" },
    { id: "community" as SidebarSection, icon: Globe, label: "Community" },
    { id: "trash" as SidebarSection, icon: Trash, label: "Trash" },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "recents":
        return (
          <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold text-foreground mb-3">Recent Files</h3>
            {sampleDrafts.map(d => (
              <button key={d.id} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
                <div className="w-8 h-6 rounded bg-secondary/60 flex items-center justify-center text-[10px]">
                  {d.type === "presentation" ? "🎞️" : d.type === "doc" ? "📄" : "🎨"}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium text-foreground">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.updatedAt}</p>
                </div>
              </button>
            ))}
          </div>
        );

      case "drafts":
        return (
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-foreground">Drafts</h3>
              <span className="text-[10px] text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded">{sampleDrafts.length}</span>
            </div>
            {sampleDrafts.map(d => (
              <div key={d.id} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors group cursor-pointer">
                <div className="w-10 h-8 rounded bg-secondary/80 flex items-center justify-center text-sm">
                  {d.type === "presentation" ? "🎞️" : d.type === "doc" ? "📄" : "🎨"}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.updatedAt}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        );

      case "projects":
        return (
          <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold text-foreground mb-3">All Projects</h3>
            {[...sampleDrafts, ...sampleDrafts.map(d => ({ ...d, id: d.id + "x", name: d.name + " (Copy)" }))].map(d => (
              <div key={d.id} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors cursor-pointer">
                <div className="w-8 h-6 rounded bg-secondary/60 flex items-center justify-center text-[10px]">🎨</div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.updatedAt}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case "team":
        return (
          <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold text-foreground mb-3">Team Projects</h3>
            {sampleTeamProjects.map(t => (
              <div key={t.id} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg gradient-purple flex items-center justify-center">
                  <UsersRound className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{t.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{t.members} members</span>
                    <span className="text-[10px] text-muted-foreground">· {t.updatedAt}</span>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-border/50 text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors mt-2">
              <Plus className="w-3 h-3" /> Create Team
            </button>
          </div>
        );

      case "templates":
        return (
          <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold text-foreground mb-2">Templates</h3>
            <input placeholder="Search templates..." value={searchTemplates} onChange={(e) => setSearchTemplates(e.target.value)}
              className="w-full bg-secondary/50 rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 mb-2" />
            <div className="flex flex-wrap gap-1 mb-3">
              {categories.map(c => (
                <button key={c} onClick={() => setTemplateCategory(c)}
                  className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${templateCategory === c ? "bg-primary/20 text-primary" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
              {filteredTemplates.map(t => (
                <button key={t.id} onClick={() => onNewProject(t.width, t.height, t.name)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/30 hover:border-primary/30 transition-all text-center group">
                  <div className="w-full aspect-video rounded-lg bg-secondary/60 flex items-center justify-center text-2xl">
                    {t.thumbnail}
                  </div>
                  <p className="text-[10px] font-medium text-foreground group-hover:text-primary transition-colors truncate w-full">{t.name}</p>
                  <p className="text-[8px] text-muted-foreground">{t.width}×{t.height}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case "frames":
        return (
          <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold text-foreground mb-2">Device Frames</h3>
            <div className="flex gap-1 mb-3">
              {([
                { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
                { id: "tablet" as const, icon: Tablet, label: "Tablet" },
                { id: "desktop" as const, icon: Monitor, label: "Desktop" },
                { id: "watch" as const, icon: Watch, label: "Watch" },
              ]).map(c => (
                <button key={c.id} onClick={() => setFrameCategory(c.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[9px] font-medium transition-colors ${frameCategory === c.id ? "bg-primary/20 text-primary" : "bg-secondary/50 text-muted-foreground hover:text-foreground"}`}>
                  <c.icon className="w-3.5 h-3.5" />
                  {c.label}
                </button>
              ))}
            </div>
            <div className="space-y-1">
              {filteredFrames.map(f => (
                <button key={f.id} onClick={() => onNewProject(f.width, f.height, f.name)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors group text-left">
                  <span className="text-sm">{f.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground">{f.width} × {f.height}</p>
                  </div>
                </button>
              ))}
            </div>
            {/* Custom size */}
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Custom Size</p>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1.5">
                  <span className="text-[9px] text-muted-foreground">W</span>
                  <input type="number" value={customW} onChange={(e) => setCustomW(Number(e.target.value))}
                    className="flex-1 bg-transparent text-xs text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1.5">
                  <span className="text-[9px] text-muted-foreground">H</span>
                  <input type="number" value={customH} onChange={(e) => setCustomH(Number(e.target.value))}
                    className="flex-1 bg-transparent text-xs text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>
              <button onClick={() => onNewProject(customW, customH, `Custom ${customW}×${customH}`)}
                className="w-full py-2 rounded-lg text-xs font-medium gradient-purple text-primary-foreground hover:scale-[1.01] transition-transform">
                Create Custom Board
              </button>
            </div>
          </div>
        );

      case "plugins":
        return (
          <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold text-foreground mb-3">Plugins</h3>
            {plugins.map(p => (
              <div key={p.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors cursor-pointer group">
                <span className="text-lg">{p.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                </div>
                <button className="text-[9px] text-primary opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 px-2 py-0.5 rounded">
                  Install
                </button>
              </div>
            ))}
          </div>
        );

      case "resources":
        return (
          <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold text-foreground mb-3">Resources</h3>
            {[
              { icon: "📖", label: "Getting Started Guide", desc: "Learn the basics" },
              { icon: "🎓", label: "Tutorial Videos", desc: "Step-by-step walkthroughs" },
              { icon: "🔧", label: "Keyboard Shortcuts", desc: "Speed up your workflow" },
              { icon: "💡", label: "Tips & Tricks", desc: "Power user features" },
              { icon: "📚", label: "Documentation", desc: "Full reference docs" },
              { icon: "🎨", label: "Design Principles", desc: "Best practices" },
              { icon: "🧩", label: "Component Library", desc: "Pre-built components" },
              { icon: "🖼️", label: "Icon Packs", desc: "Free icon collections" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-secondary/60 transition-colors cursor-pointer">
                <span className="text-sm">{r.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-medium text-foreground">{r.label}</p>
                  <p className="text-[10px] text-muted-foreground">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        );

      case "community":
        return (
          <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold text-foreground mb-3">Community</h3>
            <div className="text-center py-6">
              <Globe className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Community files coming soon</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Browse and remix community designs</p>
            </div>
          </div>
        );

      case "trash":
        return (
          <div className="p-3 space-y-2">
            <h3 className="text-xs font-semibold text-foreground mb-3">Trash</h3>
            <div className="text-center py-6">
              <Trash className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Trash is empty</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">Deleted items will appear here</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with logo */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-purple flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-foreground">ProtoCraft</span>
        </div>
        <button onClick={onBackToCanvas} className="text-[10px] text-primary hover:underline font-medium">
          Back to Canvas
        </button>
      </div>

      {/* New project button */}
      <div className="px-3 py-2 border-b border-border/30">
        <button onClick={() => setActiveSection("templates")}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium gradient-purple text-primary-foreground hover:scale-[1.01] transition-transform">
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      {/* Navigation + detail panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Nav icons */}
        <div className="w-full flex flex-col overflow-y-auto">
          <div className="p-1.5 space-y-0.5">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setActiveSection(activeSection === item.id ? null : item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                  activeSection === item.id ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${activeSection === item.id ? "rotate-90" : ""}`} />
              </button>
            ))}
          </div>

          {/* Expanded section content */}
          {activeSection && (
            <div className="border-t border-border/30">
              {renderSection()}
            </div>
          )}
        </div>
      </div>

      {/* Account section */}
      <div className="border-t border-border/30 p-2">
        <div className="relative">
          <button onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-secondary/60 transition-colors">
            <div className="w-7 h-7 rounded-full gradient-purple flex items-center justify-center text-primary-foreground text-[10px] font-bold shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
              <p className="text-[9px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${accountMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {accountMenuOpen && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border/50 rounded-xl overflow-hidden z-50 shadow-xl">
              <button onClick={() => navigate("/settings")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
                <Settings className="w-3.5 h-3.5" /> Account Settings
              </button>
              <button onClick={() => navigate("/settings")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
                <User className="w-3.5 h-3.5" /> Switch Account
              </button>
              <button onClick={() => navigate("/settings")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
                <Crown className="w-3.5 h-3.5" /> Upgrade Plan
              </button>
              <div className="border-t border-border/30">
                <button onClick={async () => { await signOut(); navigate("/login"); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Share button */}
        <button className="w-full flex items-center justify-center gap-1.5 mt-1.5 py-2 rounded-lg text-xs font-medium border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
          <Share2 className="w-3.5 h-3.5" /> Share Project
        </button>
      </div>
    </div>
  );
};

export default HomeSidebar;
