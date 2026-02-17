import { useState } from "react";
import { motion } from "framer-motion";
import { User, Palette, Camera, Sun, Moon, Monitor, Check } from "lucide-react";

const defaultAvatars = [
  "https://api.dicebear.com/9.x/glass/svg?seed=Felix",
  "https://api.dicebear.com/9.x/glass/svg?seed=Luna",
  "https://api.dicebear.com/9.x/glass/svg?seed=Nova",
  "https://api.dicebear.com/9.x/glass/svg?seed=Orion",
  "https://api.dicebear.com/9.x/glass/svg?seed=Aria",
  "https://api.dicebear.com/9.x/glass/svg?seed=Zephyr",
];

const defaultThemes = [
  { name: "Cyber Neon", primary: "263 70% 58%", accent: "330 80% 60%", bg: "240 15% 5%" },
  { name: "Ocean Depth", primary: "200 80% 50%", accent: "180 70% 45%", bg: "210 20% 6%" },
  { name: "Ember Glow", primary: "20 90% 55%", accent: "0 80% 55%", bg: "15 15% 5%" },
  { name: "Mint Fresh", primary: "160 60% 50%", accent: "140 50% 45%", bg: "160 15% 5%" },
  { name: "Golden Luxe", primary: "45 90% 55%", accent: "30 80% 50%", bg: "40 15% 5%" },
  { name: "Pastel Calm", primary: "280 40% 65%", accent: "320 40% 60%", bg: "270 10% 8%" },
];

const SettingsPage = () => {
  const [name, setName] = useState("Designer");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [appearance, setAppearance] = useState<"dark" | "light" | "system">("dark");
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCustomAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const currentAvatar = customAvatar || defaultAvatars[selectedAvatar];

  return (
    <div className="min-h-screen pt-20 px-6 pb-12">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold mb-2">
            <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-muted-foreground mb-8">Personalize your ProtoCraft experience</p>
        </motion.div>

        <div className="space-y-8">
          {/* Profile Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Profile</h2>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="relative group">
                <img src={currentAvatar} alt="Avatar" className="w-20 h-20 rounded-full border-2 border-primary/30 object-cover" />
                <label className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 text-foreground" />
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
                />
              </div>
            </div>

            {/* Default Avatars */}
            <p className="text-xs text-muted-foreground mb-3">Or choose a default avatar</p>
            <div className="flex gap-3 flex-wrap">
              {defaultAvatars.map((avatar, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedAvatar(i); setCustomAvatar(null); }}
                  className={`w-12 h-12 rounded-full border-2 transition-all duration-200 overflow-hidden ${
                    !customAvatar && selectedAvatar === i ? "border-primary neon-glow-sm scale-110" : "border-border/50 hover:border-primary/30"
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sun className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
            </div>

            <div className="flex gap-3">
              {([
                { key: "dark", icon: Moon, label: "Dark" },
                { key: "light", icon: Sun, label: "Light" },
                { key: "system", icon: Monitor, label: "System" },
              ] as const).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setAppearance(opt.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-200 ${
                    appearance === opt.key
                      ? "gradient-purple text-primary-foreground neon-glow-sm"
                      : "bg-secondary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <opt.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Default Project Themes */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Default Project Themes</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Choose a default theme for new generated projects</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {defaultThemes.map((theme, i) => (
                <button
                  key={theme.name}
                  onClick={() => setSelectedTheme(i)}
                  className={`relative p-4 rounded-xl border transition-all duration-200 text-left ${
                    selectedTheme === i
                      ? "border-primary/50 neon-glow-sm"
                      : "border-border/30 hover:border-primary/20"
                  }`}
                  style={{ background: `hsl(${theme.bg})` }}
                >
                  {selectedTheme === i && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full gradient-purple flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-3">
                    <div className="w-5 h-5 rounded-full" style={{ background: `hsl(${theme.primary})` }} />
                    <div className="w-5 h-5 rounded-full" style={{ background: `hsl(${theme.accent})` }} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{theme.name}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
