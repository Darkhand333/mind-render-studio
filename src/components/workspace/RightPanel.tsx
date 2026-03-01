import { useEffect, useState } from "react";
import {
  Square, RotateCcw, CornerUpRight, FlipHorizontal, FlipVertical,
  AlignLeft, AlignCenter, AlignRight, AlignStartVertical, AlignCenterVertical,
  AlignEndVertical, LayoutGrid, Droplet, Blend, SunDim, Ruler, Maximize2,
  Lock, Unlock, Eye, EyeOff, Copy, Trash2, MousePointer, ChevronRight,
  ChevronDown, Bold, Italic, Underline, AlignJustify, Palette
} from "lucide-react";
import { CanvasElement, presetColors, fontFamilies, blendModes, strokeDashOptions } from "./types";

type RightPanelProps = {
  activeEl: CanvasElement | null;
  selectedId: number | null;
  collapsedSections: Record<string, boolean>;
  toggleSection: (label: string) => void;
  updateSelected: (updates: Partial<CanvasElement>) => void;
  handleAlign: (type: string) => void;
  handleFlip: (dir: "h" | "v") => void;
  handleDuplicate: () => void;
  handleDelete: () => void;
};

const SectionHeader = ({ label, collapsed, onToggle }: { label: string; collapsed: boolean; onToggle: () => void }) => (
  <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
    <span>{label}</span>
    {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
  </button>
);

const NumberInput = ({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) => (
  <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
    <span className="text-[9px] text-muted-foreground font-medium w-3">{label}</span>
    <input type="number" value={Math.round(value)} onChange={(e) => onChange(Number(e.target.value))}
      className="flex-1 bg-transparent text-[11px] text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
    {suffix && <span className="text-[8px] text-muted-foreground">{suffix}</span>}
  </div>
);

const RightPanel = ({ activeEl, selectedId, collapsedSections, toggleSection, updateSelected, handleAlign, handleFlip, handleDuplicate, handleDelete }: RightPanelProps) => {
  if (!activeEl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center mb-3">
          <MousePointer className="w-5 h-5 text-muted-foreground/40" />
        </div>
        <p className="text-xs text-muted-foreground mb-1">No element selected</p>
        <p className="text-[10px] text-muted-foreground/60">Click on an element or draw a shape to see its properties here</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/30">
        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: activeEl.fillColor + "33" }}>
          <Square className="w-3 h-3" style={{ color: activeEl.fillColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <input value={activeEl.label} onChange={(e) => updateSelected({ label: e.target.value })}
            className="text-xs font-semibold text-foreground bg-transparent outline-none w-full" />
          <p className="text-[9px] text-muted-foreground">{activeEl.type}</p>
        </div>
        {selectedId !== activeEl.id && <span className="text-[8px] text-muted-foreground/50 bg-secondary/50 px-1.5 py-0.5 rounded">Last</span>}
      </div>

      {/* Position */}
      <SectionHeader label="Position" collapsed={!!collapsedSections["Position"]} onToggle={() => toggleSection("Position")} />
      {!collapsedSections["Position"] && (
        <div className="grid grid-cols-2 gap-1 px-1">
          <NumberInput label="X" value={activeEl.x} onChange={(v) => updateSelected({ x: v })} />
          <NumberInput label="Y" value={activeEl.y} onChange={(v) => updateSelected({ y: v })} />
          <NumberInput label="W" value={activeEl.w} onChange={(v) => updateSelected({ w: v })} />
          <NumberInput label="H" value={activeEl.h} onChange={(v) => updateSelected({ h: v })} />
        </div>
      )}

      {/* Transform */}
      <SectionHeader label="Transform" collapsed={!!collapsedSections["Transform"]} onToggle={() => toggleSection("Transform")} />
      {!collapsedSections["Transform"] && (
        <div className="px-1 space-y-1.5">
          <div className="grid grid-cols-2 gap-1">
            <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
              <RotateCcw className="w-3 h-3 text-muted-foreground shrink-0" />
              <input type="number" value={activeEl.rotation} onChange={(e) => updateSelected({ rotation: Number(e.target.value) })}
                className="flex-1 bg-transparent text-[11px] text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              <span className="text-[8px] text-muted-foreground">°</span>
            </div>
            <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
              <CornerUpRight className="w-3 h-3 text-muted-foreground shrink-0" />
              <input type="number" value={activeEl.cornerRadius} onChange={(e) => updateSelected({ cornerRadius: Number(e.target.value) })}
                className="flex-1 bg-transparent text-[11px] text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              <span className="text-[8px] text-muted-foreground">px</span>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => handleFlip("h")} className={`flex-1 p-1 rounded text-[10px] flex items-center justify-center gap-1 transition-colors ${activeEl.flipH ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground"}`}>
              <FlipHorizontal className="w-3 h-3" /> Flip H
            </button>
            <button onClick={() => handleFlip("v")} className={`flex-1 p-1 rounded text-[10px] flex items-center justify-center gap-1 transition-colors ${activeEl.flipV ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground"}`}>
              <FlipVertical className="w-3 h-3" /> Flip V
            </button>
          </div>
        </div>
      )}

      {/* Layout */}
      <SectionHeader label="Layout" collapsed={!!collapsedSections["Layout"]} onToggle={() => toggleSection("Layout")} />
      {!collapsedSections["Layout"] && (
        <div className="px-1 space-y-1.5">
          <div className="grid grid-cols-2 gap-1">
            <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
              <span className="text-[9px] text-muted-foreground">H</span>
              <select value={activeEl.constraintH || "left"} onChange={(e) => updateSelected({ constraintH: e.target.value })}
                className="flex-1 bg-transparent text-[10px] text-foreground outline-none">
                <option value="left">Left</option><option value="right">Right</option><option value="center">Center</option><option value="scale">Scale</option>
              </select>
            </div>
            <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
              <span className="text-[9px] text-muted-foreground">V</span>
              <select value={activeEl.constraintV || "top"} onChange={(e) => updateSelected({ constraintV: e.target.value })}
                className="flex-1 bg-transparent text-[10px] text-foreground outline-none">
                <option value="top">Top</option><option value="bottom">Bottom</option><option value="center">Center</option><option value="scale">Scale</option>
              </select>
            </div>
          </div>
          <div className="flex gap-0.5">
            {[
              { icon: AlignLeft, action: "left" }, { icon: AlignCenter, action: "center-h" }, { icon: AlignRight, action: "right" },
              { icon: AlignStartVertical, action: "top" }, { icon: AlignCenterVertical, action: "center-v" }, { icon: AlignEndVertical, action: "bottom" },
            ].map((a) => (
              <button key={a.action} onClick={() => handleAlign(a.action)} className="flex-1 p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                <a.icon className="w-3 h-3 mx-auto" />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1.5">
            <LayoutGrid className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground flex-1">Auto Layout</span>
            <button onClick={() => updateSelected({ autoLayout: !activeEl.autoLayout })}
              className={`w-8 h-4 rounded-full transition-colors ${activeEl.autoLayout ? "bg-primary" : "bg-secondary"}`}>
              <div className={`w-3 h-3 rounded-full bg-foreground transition-transform ${activeEl.autoLayout ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
          {activeEl.autoLayout && (
            <div className="grid grid-cols-2 gap-1">
              <NumberInput label="Gap" value={activeEl.layoutGap || 0} onChange={(v) => updateSelected({ layoutGap: v })} />
              <NumberInput label="Pad" value={activeEl.layoutPadding || 0} onChange={(v) => updateSelected({ layoutPadding: v })} />
            </div>
          )}
        </div>
      )}

      {/* UI Theme */}
      <SectionHeader label="UI Theme" collapsed={!!collapsedSections["UI Theme"]} onToggle={() => toggleSection("UI Theme")} />
      {!collapsedSections["UI Theme"] && (
        <div className="px-1 space-y-1.5">
          <p className="text-[9px] text-muted-foreground px-1">Changes the workspace UI appearance</p>
          <div className="grid grid-cols-2 gap-1">
            {[
              { id: "default", label: "Purple Neon", primary: "263 70% 58%", bg: "240 15% 5%", accent: "330 80% 60%" },
              { id: "ocean", label: "Ocean Blue", primary: "210 90% 55%", bg: "220 20% 6%", accent: "180 70% 50%" },
              { id: "emerald", label: "Emerald", primary: "155 70% 45%", bg: "160 15% 5%", accent: "120 60% 50%" },
              { id: "sunset", label: "Sunset", primary: "25 90% 55%", bg: "15 20% 6%", accent: "350 80% 55%" },
              { id: "rose", label: "Rose Gold", primary: "340 75% 60%", bg: "340 10% 6%", accent: "20 70% 60%" },
              { id: "mono", label: "Monochrome", primary: "0 0% 70%", bg: "0 0% 5%", accent: "0 0% 50%" },
            ].map(theme => (
              <button key={theme.id} onClick={() => {
                document.documentElement.style.setProperty("--primary", theme.primary);
                document.documentElement.style.setProperty("--background", theme.bg);
                document.documentElement.style.setProperty("--accent", theme.accent);
                document.documentElement.style.setProperty("--neon-purple", theme.primary);
                document.documentElement.style.setProperty("--ring", theme.primary);
                document.documentElement.style.setProperty("--sidebar-primary", theme.primary);
                document.documentElement.style.setProperty("--sidebar-ring", theme.primary);
                document.documentElement.style.setProperty("--border", theme.primary.split(" ")[0] + " 30% 20%");
                document.documentElement.style.setProperty("--surface-glow", theme.primary);
              }}
                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-secondary/30 hover:bg-secondary/60 border border-border/30 hover:border-primary/30 transition-all text-left">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ background: `linear-gradient(135deg, hsl(${theme.primary}), hsl(${theme.accent}))` }} />
                <span className="text-[10px] text-foreground">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Appearance (Element) */}
      <SectionHeader label="Fill & Opacity" collapsed={!!collapsedSections["Appearance"]} onToggle={() => toggleSection("Appearance")} />
      {!collapsedSections["Appearance"] && (
        <div className="px-1 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <input type="color" value={activeEl.fillColor.startsWith("#") ? activeEl.fillColor : "#8b5cf6"} onChange={(e) => updateSelected({ fillColor: e.target.value })}
              className="w-6 h-6 rounded border border-border/50 cursor-pointer bg-transparent shrink-0" />
            <input type="text" value={activeEl.fillColor} onChange={(e) => updateSelected({ fillColor: e.target.value })}
              className="flex-1 bg-secondary/50 rounded px-2 py-1 text-[10px] text-foreground outline-none" />
          </div>
          <div className="flex flex-wrap gap-1">
            {presetColors.map((c) => (
              <button key={c} onClick={() => updateSelected({ fillColor: c })} className="w-4 h-4 rounded border border-border/30 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Droplet className="w-3 h-3 text-muted-foreground shrink-0" />
            <input type="range" min={0} max={100} value={activeEl.opacity} onChange={(e) => updateSelected({ opacity: Number(e.target.value) })} className="flex-1 accent-primary h-1" />
            <span className="text-[10px] text-foreground w-7 text-right">{activeEl.opacity}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Blend className="w-3 h-3 text-muted-foreground shrink-0" />
            <select value={activeEl.blendMode || "Normal"} onChange={(e) => updateSelected({ blendMode: e.target.value })}
              className="flex-1 bg-secondary/50 rounded px-2 py-1 text-[10px] text-foreground outline-none">
              {blendModes.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Stroke */}
      <SectionHeader label="Stroke" collapsed={!!collapsedSections["Stroke"]} onToggle={() => toggleSection("Stroke")} />
      {!collapsedSections["Stroke"] && (
        <div className="px-1 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <input type="color" value={activeEl.strokeColor.startsWith("#") ? activeEl.strokeColor : "#8b5cf6"} onChange={(e) => updateSelected({ strokeColor: e.target.value })}
              className="w-6 h-6 rounded border border-border/50 cursor-pointer bg-transparent shrink-0" />
            <input type="text" value={activeEl.strokeColor} onChange={(e) => updateSelected({ strokeColor: e.target.value })}
              className="flex-1 bg-secondary/50 rounded px-2 py-1 text-[10px] text-foreground outline-none" />
            <input type="number" value={activeEl.strokeWidth} onChange={(e) => updateSelected({ strokeWidth: Number(e.target.value) })} min={0} max={20}
              className="w-8 bg-secondary/50 rounded px-1 py-1 text-[10px] text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
          </div>
          <div className="flex flex-wrap gap-1">
            {presetColors.map((c) => (
              <button key={c} onClick={() => updateSelected({ strokeColor: c })} className="w-4 h-4 rounded border border-border/30 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            <select value={activeEl.strokeDash || ""} onChange={(e) => updateSelected({ strokeDash: e.target.value })}
              className="bg-secondary/50 rounded px-2 py-1 text-[10px] text-foreground outline-none">
              {strokeDashOptions.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
            </select>
            <select value={activeEl.strokeCap || "butt"} onChange={(e) => updateSelected({ strokeCap: e.target.value })}
              className="bg-secondary/50 rounded px-2 py-1 text-[10px] text-foreground outline-none">
              <option value="butt">Butt</option><option value="round">Round</option><option value="square">Square</option>
            </select>
          </div>
        </div>
      )}

      {/* Effects */}
      <SectionHeader label="Effect" collapsed={!!collapsedSections["Effect"]} onToggle={() => toggleSection("Effect")} />
      {!collapsedSections["Effect"] && (
        <div className="px-1 space-y-1.5">
          <div className="grid grid-cols-3 gap-1">
            {[
              { label: "SX", value: activeEl.shadowX || 0, key: "shadowX" },
              { label: "SY", value: activeEl.shadowY || 0, key: "shadowY" },
              { label: "SB", value: activeEl.shadowBlur || 0, key: "shadowBlur" },
            ].map(f => (
              <div key={f.key} className="flex items-center gap-1 bg-secondary/50 rounded px-1.5 py-1">
                <span className="text-[8px] text-muted-foreground">{f.label}</span>
                <input type="number" value={f.value} onChange={(e) => updateSelected({ [f.key]: Number(e.target.value) })}
                  className="flex-1 bg-transparent text-[10px] text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted-foreground">Shadow Color</span>
            <input type="color" value={activeEl.shadowColor || "#000000"} onChange={(e) => updateSelected({ shadowColor: e.target.value })}
              className="w-5 h-5 rounded border border-border/50 cursor-pointer bg-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <SunDim className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-[9px] text-muted-foreground">Blur</span>
            <input type="range" min={0} max={50} value={activeEl.blurAmount || 0} onChange={(e) => updateSelected({ blurAmount: Number(e.target.value) })} className="flex-1 accent-primary h-1" />
            <span className="text-[10px] text-foreground w-6 text-right">{activeEl.blurAmount || 0}</span>
          </div>
        </div>
      )}

      {/* Typography */}
      {activeEl.type === "Text" && (
        <>
          <SectionHeader label="Typography" collapsed={!!collapsedSections["Typography"]} onToggle={() => toggleSection("Typography")} />
          {!collapsedSections["Typography"] && (
            <div className="px-1 space-y-1.5">
              <select value={activeEl.fontFamily || "Inter"} onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                className="w-full bg-secondary/50 rounded px-2 py-1 text-[10px] text-foreground outline-none">
                {fontFamilies.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
                  <span className="text-[8px] text-muted-foreground">Size</span>
                  <input type="number" value={activeEl.fontSize || 16} onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })} min={8} max={200}
                    className="flex-1 bg-transparent text-[10px] text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <select value={activeEl.fontWeight || "400"} onChange={(e) => updateSelected({ fontWeight: e.target.value })}
                  className="bg-secondary/50 rounded px-2 py-1 text-[10px] text-foreground outline-none">
                  <option value="100">Thin</option><option value="200">ExtraLight</option><option value="300">Light</option>
                  <option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option>
                  <option value="700">Bold</option><option value="800">ExtraBold</option><option value="900">Black</option>
                </select>
              </div>
              <div className="flex gap-0.5">
                <button onClick={() => updateSelected({ fontWeight: activeEl.fontWeight === "700" ? "400" : "700" })}
                  className={`flex-1 p-1 rounded flex items-center justify-center transition-colors ${activeEl.fontWeight === "700" ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground"}`}>
                  <Bold className="w-3 h-3" />
                </button>
                <button onClick={() => updateSelected({ fontStyle: activeEl.fontStyle === "italic" ? "normal" : "italic" })}
                  className={`flex-1 p-1 rounded flex items-center justify-center transition-colors ${activeEl.fontStyle === "italic" ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground"}`}>
                  <Italic className="w-3 h-3" />
                </button>
                <button onClick={() => updateSelected({ textDecoration: activeEl.textDecoration === "underline" ? "none" : "underline" })}
                  className={`flex-1 p-1 rounded flex items-center justify-center transition-colors ${activeEl.textDecoration === "underline" ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground"}`}>
                  <Underline className="w-3 h-3" />
                </button>
              </div>
              <div className="flex gap-0.5">
                {[{ icon: AlignLeft, val: "left" }, { icon: AlignCenter, val: "center" }, { icon: AlignRight, val: "right" }, { icon: AlignJustify, val: "justify" }].map((a) => (
                  <button key={a.val} onClick={() => updateSelected({ textAlign: a.val })}
                    className={`flex-1 p-1 rounded flex items-center justify-center transition-colors ${(activeEl.textAlign || "left") === a.val ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground"}`}>
                    <a.icon className="w-3 h-3" />
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
                  <span className="text-[8px] text-muted-foreground">LH</span>
                  <input type="number" step={0.1} value={activeEl.lineHeight || 1.5} onChange={(e) => updateSelected({ lineHeight: Number(e.target.value) })}
                    className="flex-1 bg-transparent text-[10px] text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
                  <span className="text-[8px] text-muted-foreground">LS</span>
                  <input type="number" step={0.5} value={activeEl.letterSpacing || 0} onChange={(e) => updateSelected({ letterSpacing: Number(e.target.value) })}
                    className="flex-1 bg-transparent text-[10px] text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Layout Guide */}
      <SectionHeader label="Layout Guide" collapsed={!!collapsedSections["Layout Guide"]} onToggle={() => toggleSection("Layout Guide")} />
      {!collapsedSections["Layout Guide"] && (
        <div className="px-1 space-y-1">
          <div className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1.5 text-[10px] text-muted-foreground">
            <Ruler className="w-3 h-3" />
            <span>Position: ({Math.round(activeEl.x)}, {Math.round(activeEl.y)})</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1.5 text-[10px] text-muted-foreground">
            <Maximize2 className="w-3 h-3" />
            <span>Size: {Math.round(activeEl.w)} × {Math.round(activeEl.h)}</span>
          </div>
          <div className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1.5 text-[10px] text-muted-foreground">
            <RotateCcw className="w-3 h-3" />
            <span>Rotation: {activeEl.rotation}°</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-border/30 pt-2">
        <div className="grid grid-cols-2 gap-1 px-1">
          <button onClick={handleDuplicate} className="flex items-center gap-1 px-2 py-1.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            <Copy className="w-3 h-3" /> Duplicate
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1 px-2 py-1.5 rounded text-[10px] text-destructive hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <button onClick={() => updateSelected({ locked: !activeEl.locked })} className="flex items-center gap-1 px-2 py-1.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            {activeEl.locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {activeEl.locked ? "Unlock" : "Lock"}
          </button>
          <button onClick={() => updateSelected({ visible: !activeEl.visible })} className="flex items-center gap-1 px-2 py-1.5 rounded text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
            {activeEl.visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {activeEl.visible ? "Hide" : "Show"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
