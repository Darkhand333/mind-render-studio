import { useState } from "react";
import { motion } from "framer-motion";
import { User, Palette, Camera, Sun, Moon, Monitor, Check, Bell, Shield, Keyboard, Save, Lock, Mail, Eye, EyeOff } from "lucide-react";

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

const shortcuts = [
  { keys: ["⌘", "K"], label: "Command palette" },
  { keys: ["⌘", "S"], label: "Save project" },
  { keys: ["⌘", "Z"], label: "Undo" },
  { keys: ["⌘", "⇧", "Z"], label: "Redo" },
  { keys: ["V"], label: "Select tool" },
  { keys: ["R"], label: "Rectangle tool" },
  { keys: ["T"], label: "Text tool" },
];

const SettingsPage = () => {
  const [name, setName] = useState("Designer");
  const [email, setEmail] = useState("designer@protocraft.ai");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [appearance, setAppearance] = useState<"dark" | "light" | "system">("dark");
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Notification settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);

  // Privacy
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true);
  const [localVoiceProcessing, setLocalVoiceProcessing] = useState(true);

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCustomAvatar(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentAvatar = customAvatar || defaultAvatars[selectedAvatar];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-secondary"
      }`}
    >
      <motion.div
        animate={{ x: checked ? 20 : 2 }}
        transition={{ duration: 0.2 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-foreground"
      />
    </button>
  );

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
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Display Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
                  />
                </div>
              </div>
            </div>

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

          {/* Password Change */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">Password & Security</h2>
              </div>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-xs text-primary hover:underline"
              >
                {showPasswordChange ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordChange && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50 pr-10"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </motion.div>
            )}
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

          {/* Notifications */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-foreground">Email notifications</p><p className="text-xs text-muted-foreground">Receive project updates via email</p></div>
                <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-foreground">Push notifications</p><p className="text-xs text-muted-foreground">Browser push alerts for collaboration</p></div>
                <Toggle checked={pushNotifs} onChange={setPushNotifs} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-foreground">Sound effects</p><p className="text-xs text-muted-foreground">Play sounds for actions and AI responses</p></div>
                <Toggle checked={soundEffects} onChange={setSoundEffects} />
              </div>
            </div>
          </motion.div>

          {/* Privacy */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Privacy & Data</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-foreground">Usage analytics</p><p className="text-xs text-muted-foreground">Help improve ProtoCraft with anonymous data</p></div>
                <Toggle checked={analyticsOptIn} onChange={setAnalyticsOptIn} />
              </div>
              <div className="flex items-center justify-between">
                <div><p className="text-sm text-foreground">Local voice processing</p><p className="text-xs text-muted-foreground">Process voice commands locally (more private)</p></div>
                <Toggle checked={localVoiceProcessing} onChange={setLocalVoiceProcessing} />
              </div>
            </div>
          </motion.div>

          {/* Default Project Themes */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6">
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
                    selectedTheme === i ? "border-primary/50 neon-glow-sm" : "border-border/30 hover:border-primary/20"
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

          {/* Keyboard Shortcuts */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Keyboard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h2>
            </div>
            <div className="space-y-3">
              {shortcuts.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <div className="flex gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} className="px-2 py-1 rounded-md bg-secondary text-xs font-mono text-foreground border border-border/50">{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Apply Button */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex justify-end">
            <button
              onClick={handleApply}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl gradient-purple text-primary-foreground font-semibold hover:scale-[1.02] transition-transform neon-glow-sm"
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved!" : "Apply Changes"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
