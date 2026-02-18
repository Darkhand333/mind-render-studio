import { useState } from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, Eye, Palette, Layout, Type, AlertTriangle, CheckCircle, Sparkles, Upload, Link2, Image } from "lucide-react";

const mockProjects = [
  {
    name: "Finance Dashboard",
    score: 92,
    breakdown: { contrast: 95, spacing: 88, hierarchy: 94, consistency: 91 },
    feedback: "Excellent contrast and visual hierarchy. Spacing could be slightly more generous in card sections.",
    badge: "Best Pick",
  },
  {
    name: "E-Commerce Storefront",
    score: 78,
    breakdown: { contrast: 72, spacing: 82, hierarchy: 76, consistency: 80 },
    feedback: "Good layout structure but contrast on secondary buttons needs improvement. Consider larger touch targets.",
    badge: null,
  },
  {
    name: "Social Media App",
    score: 85,
    breakdown: { contrast: 88, spacing: 80, hierarchy: 86, consistency: 84 },
    feedback: "Strong visual identity. Font sizing hierarchy is well-defined. Improve spacing in comment threads.",
    badge: "Runner Up",
  },
];

const categories = [
  { icon: Eye, label: "Contrast", key: "contrast" },
  { icon: Layout, label: "Spacing", key: "spacing" },
  { icon: Type, label: "Hierarchy", key: "hierarchy" },
  { icon: Palette, label: "Consistency", key: "consistency" },
];

const UIScorePage = () => {
  const [selected, setSelected] = useState(0);
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadPrompt, setUploadPrompt] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const project = mockProjects[selected];

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  const handleEvaluateUrl = () => {
    if (!uploadUrl.trim() && !uploadedFileName) return;
    console.log("Evaluating:", { url: uploadUrl, file: uploadedFileName, prompt: uploadPrompt });
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-12">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-3xl font-bold mb-2">
            UI Score <span className="gradient-text">Evaluation</span>
          </h1>
          <p className="text-muted-foreground mb-6">AI-powered analysis of your prototypes' design quality</p>
        </motion.div>

        {/* Always-visible Evaluate External UI Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Evaluate External UI</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" /> Paste a website URL
              </label>
              <input
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Image className="w-3.5 h-3.5" /> Or upload a screenshot
              </label>
              <label className="flex items-center justify-center gap-2 w-full h-[42px] bg-secondary/50 rounded-xl border border-dashed border-border/50 cursor-pointer hover:border-primary/30 transition-colors">
                {uploadedFileName ? (
                  <span className="text-sm text-foreground truncate px-2">{uploadedFileName}</span>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Choose file</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
              </label>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <label className="text-xs text-muted-foreground">Evaluation prompt (optional)</label>
            <textarea
              value={uploadPrompt}
              onChange={(e) => setUploadPrompt(e.target.value)}
              placeholder="e.g. Focus on mobile usability, color accessibility, button sizing..."
              rows={2}
              className="w-full bg-secondary/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 transition-shadow resize-none"
            />
          </div>

          <button
            onClick={handleEvaluateUrl}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-purple text-primary-foreground text-sm font-semibold hover:scale-[1.02] transition-transform neon-glow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Evaluate Now
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Project list */}
          <div className="space-y-3">
            {mockProjects.map((p, i) => (
              <motion.button
                key={p.name}
                onClick={() => setSelected(i)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
                  selected === i ? "glass neon-glow-sm border-primary/30" : "glass hover:border-primary/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground text-sm">{p.name}</p>
                  {p.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full gradient-purple text-primary-foreground">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-secondary">
                    <motion.div
                      className="h-full rounded-full gradient-purple"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.score}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                    />
                  </div>
                  <span className="text-sm font-bold text-primary">{p.score}</span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Score detail */}
          <div className="lg:col-span-2">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="url(#scoreGradient)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - project.score / 100) }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <defs>
                      <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--neon-purple))" />
                        <stop offset="100%" stopColor="hsl(var(--neon-pink))" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-foreground">{project.score}</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{project.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {project.score >= 90 ? (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-accent" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {project.score >= 90 ? "Production ready" : "Needs improvement"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {categories.map((cat, i) => {
                  const val = project.breakdown[cat.key as keyof typeof project.breakdown];
                  return (
                    <motion.div
                      key={cat.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="p-4 rounded-xl bg-secondary/50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <cat.icon className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">{cat.label}</span>
                        <span className="ml-auto text-sm font-bold text-foreground">{val}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary">
                        <motion.div
                          className="h-full rounded-full gradient-purple"
                          initial={{ width: 0 }}
                          animate={{ width: `${val}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">AI Feedback</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.feedback}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIScorePage;
