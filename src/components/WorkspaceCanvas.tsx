import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Plus, MousePointer, Type, Image, Square, Layout, Circle,
  Minus, ArrowUpRight, Pen, Hand, ZoomIn, ZoomOut, Users, Move, Copy,
  Trash2, Layers, Star, Diamond, Triangle, Hexagon, AlignLeft, AlignCenter,
  AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  FlipHorizontal, FlipVertical, Lock, Unlock, Eye, EyeOff,
  Undo, Redo, Grid3X3, RotateCcw, CornerUpRight, Box, Pencil,
  Component, ChevronDown, ChevronRight, Download, Columns2, Rows2,
  Bold, Italic, Underline, AlignJustify, Pipette, Search, FileText,
  FolderOpen, Clock, Archive, Trash, Share2, Settings, ChevronLeft,
  Maximize2, PanelLeft, PanelRight, Slice, Scale, Ruler, LayoutGrid,
  Droplet, Sparkles, SunDim, Blend, Frame, Scissors, Crop, Paintbrush,
  Palette, Hash, Navigation, GripVertical, MoreHorizontal, X,
  File, Home, UsersRound, Package, BookOpen, FolderClosed, Globe
} from "lucide-react";
import ComponentExplainer from "./ComponentExplainer";

type CanvasElement = {
  id: number;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  rotation: number;
  cornerRadius: number;
  visible: boolean;
  locked: boolean;
  flipH?: boolean;
  flipV?: boolean;
  points?: { x: number; y: number }[];
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  lineHeight?: number;
  letterSpacing?: number;
  blendMode?: string;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  blurAmount?: number;
  strokeDash?: string;
  strokeCap?: string;
  strokeJoin?: string;
  constraintH?: string;
  constraintV?: string;
  autoLayout?: boolean;
  layoutDirection?: string;
  layoutGap?: number;
  layoutPadding?: number;
};

const toolGroups = [
  {
    label: "Select",
    tools: [
      { icon: MousePointer, label: "Select", shortcut: "V" },
      { icon: Hand, label: "Pan", shortcut: "H" },
      { icon: Scale, label: "Scale", shortcut: "K" },
    ],
  },
  {
    label: "Shapes",
    tools: [
      { icon: Square, label: "Rectangle", shortcut: "R" },
      { icon: Circle, label: "Ellipse", shortcut: "O" },
      { icon: Triangle, label: "Triangle", shortcut: "T" },
      { icon: Diamond, label: "Diamond", shortcut: "D" },
      { icon: Star, label: "Star", shortcut: "S" },
      { icon: Hexagon, label: "Polygon", shortcut: "G" },
    ],
  },
  {
    label: "Draw",
    tools: [
      { icon: Minus, label: "Line", shortcut: "L" },
      { icon: ArrowUpRight, label: "Arrow", shortcut: "A" },
      { icon: Pen, label: "Pen", shortcut: "P" },
      { icon: Pencil, label: "Pencil", shortcut: "B" },
      { icon: Paintbrush, label: "Brush", shortcut: "E" },
    ],
  },
  {
    label: "Insert",
    tools: [
      { icon: Type, label: "Text", shortcut: "X" },
      { icon: Image, label: "Image", shortcut: "I" },
      { icon: Layout, label: "Frame", shortcut: "F" },
      { icon: Box, label: "Component", shortcut: "C" },
      { icon: Slice, label: "Slice", shortcut: "W" },
      { icon: Navigation, label: "Section", shortcut: "N" },
    ],
  },
];

const allTools = toolGroups.flatMap((g) => g.tools);

let nextId = 1;
const defaultColors = [
  "hsl(263, 70%, 58%)", "hsl(330, 80%, 60%)", "hsl(217, 91%, 60%)",
  "hsl(160, 70%, 50%)", "hsl(45, 90%, 55%)", "hsl(0, 80%, 60%)",
];

const presetColors = [
  "#ffffff", "#000000", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#6366f1", "#a855f7",
];

const fontFamilies = [
  "Inter", "Arial", "Helvetica", "Georgia", "Times New Roman",
  "Courier New", "Verdana", "Trebuchet MS", "Comic Sans MS", "Impact",
  "Palatino", "Garamond", "Bookman", "Avant Garde",
];

const blendModes = ["Normal", "Multiply", "Screen", "Overlay", "Darken", "Lighten", "Color Dodge", "Color Burn", "Hard Light", "Soft Light", "Difference", "Exclusion"];
const strokeDashOptions = [
  { label: "Solid", value: "" },
  { label: "Dash", value: "8 4" },
  { label: "Dot", value: "2 4" },
  { label: "Dash-Dot", value: "8 4 2 4" },
];

type LeftTab = "pages" | "layers" | "assets" | "find" | "inspector";
type LeftSidebarView = "home" | "workspace";

const WorkspaceCanvas = () => {
  const [activeTool, setActiveTool] = useState("Select");
  const [showGrid, setShowGrid] = useState(true);
  const [toolbarCols, setToolbarCols] = useState<1 | 2>(2);
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  // Start with empty canvas - no default elements
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [lastSelectedId, setLastSelectedId] = useState<number | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);
  const [penPoints, setPenPoints] = useState<{ x: number; y: number }[]>([]);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [dragging, setDragging] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const [resizing, setResizing] = useState<{ id: number; handle: string; startX: number; startY: number; startW: number; startH: number; startElX: number; startElY: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<number | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Left sidebar state
  const [leftSidebarView, setLeftSidebarView] = useState<LeftSidebarView>("workspace");
  const [leftTab, setLeftTab] = useState<LeftTab>("layers");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Right panel collapsed sections
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Pages
  const [pages, setPages] = useState([
    { id: 1, name: "Page 1", active: true },
  ]);

  // Export modal
  const [showExportModal, setShowExportModal] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Keep lastSelectedId in sync
  useEffect(() => {
    if (selectedId !== null) setLastSelectedId(selectedId);
  }, [selectedId]);

  // The element to show in the right panel - persist even after deselect
  const activeElId = selectedId ?? lastSelectedId;
  const activeEl = activeElId ? elements.find((e) => e.id === activeElId) || null : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingTextId) return;
      const key = e.key.toUpperCase();
      const tool = allTools.find((t) => t.shortcut === key);
      if (tool && !e.metaKey && !e.ctrlKey) { setActiveTool(tool.label); e.preventDefault(); }
      if (e.key === "Delete" || e.key === "Backspace") { if (selectedId) { handleDelete(); e.preventDefault(); } }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { handleUndo(); e.preventDefault(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") { handleRedo(); e.preventDefault(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") { e.preventDefault(); handleDuplicate(); }
      if (e.key === "Escape") { setSelectedId(null); setActiveTool("Select"); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, editingTextId, elements, historyIdx]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => {
      const h = prev.slice(0, historyIdx + 1);
      h.push(JSON.parse(JSON.stringify(elements)));
      return h;
    });
    setHistoryIdx((i) => i + 1);
  }, [elements, historyIdx]);

  const handleUndo = () => { if (historyIdx >= 0) { setElements(JSON.parse(JSON.stringify(history[historyIdx]))); setHistoryIdx((i) => i - 1); } };
  const handleRedo = () => { if (historyIdx < history.length - 1) { setElements(JSON.parse(JSON.stringify(history[historyIdx + 1]))); setHistoryIdx((i) => i + 1); } };
  const handleDelete = () => { if (!selectedId) return; pushHistory(); setElements((p) => p.filter((el) => el.id !== selectedId)); setSelectedId(null); setLastSelectedId(null); };
  const handleDuplicate = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    pushHistory();
    const newEl = { ...el, id: nextId++, x: el.x + 20, y: el.y + 20, label: `${el.label} copy` };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const isDrawingTool = ["Rectangle", "Ellipse", "Triangle", "Diamond", "Star", "Polygon", "Line", "Arrow", "Frame", "Text", "Component", "Slice", "Section"].includes(activeTool);
  const isPenTool = activeTool === "Pen" || activeTool === "Pencil" || activeTool === "Brush";

  const getCanvasPos = (e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (e.clientX - rect.left - panOffset.x) / (zoom / 100), y: (e.clientY - rect.top - panOffset.y) / (zoom / 100) };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "Pan") {
      setPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }
    if (e.target !== canvasRef.current && !isDrawingTool && !isPenTool) return;
    const pos = getCanvasPos(e);
    if (isPenTool) { setPenPoints((prev) => [...prev, pos]); return; }
    if (isDrawingTool) { setDrawing(true); setDrawStart(pos); setDrawCurrent(pos); return; }
    if (activeTool === "Select") setSelectedId(null);
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (panning) { setPanning(false); return; }
    if (resizing) { setResizing(null); return; }
    if (drawing && drawStart) {
      const pos = getCanvasPos(e);
      const x = Math.min(drawStart.x, pos.x);
      const y = Math.min(drawStart.y, pos.y);
      const w = Math.max(Math.abs(pos.x - drawStart.x), 20);
      const h = Math.max(Math.abs(pos.y - drawStart.y), 20);
      pushHistory();
      const color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
      const newEl: CanvasElement = {
        id: nextId++, type: activeTool === "Component" ? "Rectangle" : activeTool, x, y, w, h,
        label: `${activeTool} ${nextId}`, fillColor: color, strokeColor: color, strokeWidth: 2,
        opacity: 100, rotation: 0, cornerRadius: activeTool === "Rectangle" ? 8 : 0,
        visible: true, locked: false, blendMode: "Normal", strokeDash: "", strokeCap: "butt", strokeJoin: "miter",
      };
      if (activeTool === "Text") {
        newEl.text = "Double-click to edit"; newEl.w = 200; newEl.h = 40;
        newEl.fontSize = 16; newEl.fontWeight = "400"; newEl.fontFamily = "Inter";
        newEl.textAlign = "left"; newEl.fillColor = "#ffffff";
      }
      if (activeTool === "Line" || activeTool === "Arrow") { newEl.x = drawStart.x; newEl.y = drawStart.y; newEl.w = pos.x - drawStart.x; newEl.h = pos.y - drawStart.y; }
      setElements((prev) => [...prev, newEl]);
      setSelectedId(newEl.id);
      setDrawing(false); setDrawStart(null); setDrawCurrent(null);
    }
    if (dragging) setDragging(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (panning) {
      setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (drawing && drawStart) { setDrawCurrent(getCanvasPos(e)); }
    if (dragging) {
      const pos = getCanvasPos(e);
      setElements((prev) => prev.map((el) => el.id === dragging.id ? { ...el, x: pos.x - dragging.offsetX, y: pos.y - dragging.offsetY } : el));
    }
    if (resizing) {
      const pos = getCanvasPos(e);
      const dx = pos.x - resizing.startX;
      const dy = pos.y - resizing.startY;
      setElements((prev) => prev.map((el) => {
        if (el.id !== resizing.id) return el;
        let { startW, startH, startElX, startElY } = resizing;
        let newW = startW, newH = startH, newX = startElX, newY = startElY;
        if (resizing.handle.includes("r")) newW = Math.max(20, startW + dx);
        if (resizing.handle.includes("b")) newH = Math.max(20, startH + dy);
        if (resizing.handle.includes("l")) { newW = Math.max(20, startW - dx); newX = startElX + dx; }
        if (resizing.handle.includes("t")) { newH = Math.max(20, startH - dy); newY = startElY + dy; }
        return { ...el, x: newX, y: newY, w: newW, h: newH };
      }));
    }
  };

  const finishPen = () => {
    if (penPoints.length < 2) { setPenPoints([]); return; }
    pushHistory();
    const minX = Math.min(...penPoints.map((p) => p.x));
    const minY = Math.min(...penPoints.map((p) => p.y));
    const newEl: CanvasElement = {
      id: nextId++, type: "Pen", x: minX, y: minY, w: 0, h: 0,
      label: `Path ${nextId}`, fillColor: "transparent", strokeColor: defaultColors[4], strokeWidth: 2,
      opacity: 100, rotation: 0, cornerRadius: 0, visible: true, locked: false,
      points: penPoints.map((p) => ({ x: p.x - minX, y: p.y - minY })),
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    setPenPoints([]);
  };

  const updateSelected = (updates: Partial<CanvasElement>) => {
    const id = selectedId ?? lastSelectedId;
    if (!id) return;
    setElements((prev) => prev.map((el) => el.id === id ? { ...el, ...updates } : el));
  };

  const handleAlign = (type: string) => {
    const id = selectedId ?? lastSelectedId;
    if (!id) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    const cw = canvasRect.width / (zoom / 100), ch = canvasRect.height / (zoom / 100);
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    pushHistory();
    switch (type) {
      case "left": updateSelected({ x: 0 }); break;
      case "center-h": updateSelected({ x: (cw - el.w) / 2 }); break;
      case "right": updateSelected({ x: cw - el.w }); break;
      case "top": updateSelected({ y: 0 }); break;
      case "center-v": updateSelected({ y: (ch - el.h) / 2 }); break;
      case "bottom": updateSelected({ y: ch - el.h }); break;
    }
  };

  const handleFlip = (dir: "h" | "v") => {
    if (!activeEl) return;
    pushHistory();
    if (dir === "h") updateSelected({ flipH: !activeEl?.flipH });
    else updateSelected({ flipV: !activeEl?.flipV });
  };

  // Multi-language export
  const generateExport = (format: string) => {
    const visibleEls = elements.filter(el => el.visible);
    
    if (format === "svg") {
      const svgParts: string[] = [];
      svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">`);
      svgParts.push(`  <rect width="1200" height="800" fill="#0d0d14"/>`);
      visibleEls.forEach(el => {
        const transform = `translate(${el.x},${el.y}) rotate(${el.rotation})`;
        svgParts.push(`  <g transform="${transform}" opacity="${el.opacity / 100}">`);
        if (el.type === "Rectangle" || el.type === "Frame") {
          svgParts.push(`    <rect width="${el.w}" height="${el.h}" rx="${el.cornerRadius}" fill="${el.fillColor}33" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}"/>`);
        } else if (el.type === "Ellipse") {
          svgParts.push(`    <ellipse cx="${el.w/2}" cy="${el.h/2}" rx="${el.w/2}" ry="${el.h/2}" fill="${el.fillColor}33" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}"/>`);
        } else if (el.type === "Text") {
          svgParts.push(`    <text x="0" y="${el.fontSize || 16}" fill="${el.fillColor}" font-size="${el.fontSize}" font-family="${el.fontFamily || 'Inter'}">${el.text || el.label}</text>`);
        }
        svgParts.push(`  </g>`);
      });
      svgParts.push(`</svg>`);
      return svgParts.join("\n");
    }

    if (format === "html") {
      const lines = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        '  <title>ProtoCraft Export</title>',
        '  <style>',
        '    * { margin: 0; padding: 0; box-sizing: border-box; }',
        '    body { background: #0d0d14; position: relative; width: 1200px; height: 800px; overflow: hidden; }',
      ];
      visibleEls.forEach(el => {
        lines.push(`    .el-${el.id} {`);
        lines.push(`      position: absolute;`);
        lines.push(`      left: ${el.x}px; top: ${el.y}px;`);
        lines.push(`      width: ${el.w}px; height: ${el.h}px;`);
        if (el.type === "Ellipse") lines.push(`      border-radius: 50%;`);
        else if (el.cornerRadius) lines.push(`      border-radius: ${el.cornerRadius}px;`);
        lines.push(`      background: ${el.fillColor}33;`);
        lines.push(`      border: ${el.strokeWidth}px solid ${el.strokeColor};`);
        lines.push(`      opacity: ${el.opacity / 100};`);
        if (el.rotation) lines.push(`      transform: rotate(${el.rotation}deg);`);
        if (el.type === "Text") {
          lines.push(`      color: ${el.fillColor};`);
          lines.push(`      font-size: ${el.fontSize || 16}px;`);
          lines.push(`      font-family: ${el.fontFamily || 'Inter'}, sans-serif;`);
          lines.push(`      font-weight: ${el.fontWeight || '400'};`);
          lines.push(`      background: transparent; border: none;`);
        }
        lines.push(`    }`);
      });
      lines.push('  </style>', '</head>', '<body>');
      visibleEls.forEach(el => {
        if (el.type === "Text") {
          lines.push(`  <div class="el-${el.id}">${el.text || el.label}</div>`);
        } else {
          lines.push(`  <div class="el-${el.id}"></div>`);
        }
      });
      lines.push('</body>', '</html>');
      return lines.join("\n");
    }

    if (format === "react") {
      const lines = [
        'import React from "react";',
        '',
        'const ProtoCraftDesign = () => {',
        '  return (',
        '    <div style={{ position: "relative", width: 1200, height: 800, background: "#0d0d14", overflow: "hidden" }}>',
      ];
      visibleEls.forEach(el => {
        const style: Record<string, any> = {
          position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h,
          background: `${el.fillColor}33`, border: `${el.strokeWidth}px solid ${el.strokeColor}`,
          opacity: el.opacity / 100,
        };
        if (el.type === "Ellipse") style.borderRadius = "50%";
        else if (el.cornerRadius) style.borderRadius = el.cornerRadius;
        if (el.rotation) style.transform = `rotate(${el.rotation}deg)`;
        if (el.type === "Text") {
          style.color = el.fillColor;
          style.fontSize = el.fontSize || 16;
          style.fontFamily = `${el.fontFamily || 'Inter'}, sans-serif`;
          style.fontWeight = el.fontWeight || "400";
          style.background = "transparent";
          style.border = "none";
        }
        const styleStr = JSON.stringify(style);
        if (el.type === "Text") {
          lines.push(`      <div style={${styleStr}}>${el.text || el.label}</div>`);
        } else {
          lines.push(`      <div style={${styleStr}} />`);
        }
      });
      lines.push('    </div>', '  );', '};', '', 'export default ProtoCraftDesign;');
      return lines.join("\n");
    }

    if (format === "vue") {
      const lines = [
        '<template>',
        '  <div class="canvas">',
      ];
      visibleEls.forEach(el => {
        if (el.type === "Text") {
          lines.push(`    <div class="el-${el.id}">${el.text || el.label}</div>`);
        } else {
          lines.push(`    <div class="el-${el.id}"></div>`);
        }
      });
      lines.push('  </div>', '</template>', '', '<style scoped>');
      lines.push('.canvas { position: relative; width: 1200px; height: 800px; background: #0d0d14; overflow: hidden; }');
      visibleEls.forEach(el => {
        lines.push(`.el-${el.id} { position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.w}px; height: ${el.h}px; background: ${el.fillColor}33; border: ${el.strokeWidth}px solid ${el.strokeColor}; opacity: ${el.opacity / 100}; ${el.type === "Ellipse" ? "border-radius: 50%;" : el.cornerRadius ? `border-radius: ${el.cornerRadius}px;` : ""} ${el.rotation ? `transform: rotate(${el.rotation}deg);` : ""} }`);
      });
      lines.push('</style>');
      return lines.join("\n");
    }

    if (format === "tailwind") {
      const lines = [
        'export default function Design() {',
        '  return (',
        '    <div className="relative w-[1200px] h-[800px] bg-[#0d0d14] overflow-hidden">',
      ];
      visibleEls.forEach(el => {
        const cls = [`absolute`];
        cls.push(`left-[${Math.round(el.x)}px] top-[${Math.round(el.y)}px] w-[${Math.round(el.w)}px] h-[${Math.round(el.h)}px]`);
        if (el.type === "Ellipse") cls.push("rounded-full");
        else if (el.cornerRadius) cls.push(`rounded-[${el.cornerRadius}px]`);
        if (el.type === "Text") {
          lines.push(`      <div className="${cls.join(" ")}" style={{color:"${el.fillColor}",fontSize:${el.fontSize||16}}}>${el.text||el.label}</div>`);
        } else {
          lines.push(`      <div className="${cls.join(" ")}" style={{background:"${el.fillColor}33",border:"${el.strokeWidth}px solid ${el.strokeColor}"}} />`);
        }
      });
      lines.push('    </div>', '  );', '}');
      return lines.join("\n");
    }

    // JSON
    return JSON.stringify(visibleEls, null, 2);
  };

  const downloadExport = (format: string) => {
    const content = generateExport(format);
    const ext: Record<string, string> = { html: "html", react: "tsx", vue: "vue", svg: "svg", tailwind: "tsx", json: "json" };
    const mime: Record<string, string> = { html: "text/html", react: "text/plain", vue: "text/plain", svg: "image/svg+xml", tailwind: "text/plain", json: "application/json" };
    const blob = new Blob([content], { type: mime[format] || "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `protocraft-export.${ext[format] || "txt"}`; a.click();
    URL.revokeObjectURL(url);
  };

  const renderShapePreview = () => {
    if (!drawing || !drawStart || !drawCurrent) return null;
    const x = Math.min(drawStart.x, drawCurrent.x);
    const y = Math.min(drawStart.y, drawCurrent.y);
    const w = Math.abs(drawCurrent.x - drawStart.x);
    const h = Math.abs(drawCurrent.y - drawStart.y);
    if (w < 2 && h < 2) return null;

    const previewStyle = { fill: "hsl(263, 70%, 58%, 0.15)", stroke: "hsl(263, 70%, 58%)", strokeWidth: 2, strokeDasharray: "6 3" };

    if (activeTool === "Line" || activeTool === "Arrow") {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          <line x1={drawStart.x} y1={drawStart.y} x2={drawCurrent.x} y2={drawCurrent.y} {...previewStyle} fill="none" />
          {activeTool === "Arrow" && (() => {
            const dx = drawCurrent.x - drawStart.x, dy = drawCurrent.y - drawStart.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const ax = dx / len, ay = dy / len, px = -ay, py = ax, s = 10;
            return <polygon points={`${drawCurrent.x},${drawCurrent.y} ${drawCurrent.x - ax * s + px * 4},${drawCurrent.y - ay * s + py * 4} ${drawCurrent.x - ax * s - px * 4},${drawCurrent.y - ay * s - py * 4}`} fill="hsl(263, 70%, 58%)" />;
          })()}
        </svg>
      );
    }

    return (
      <svg className="absolute pointer-events-none" style={{ left: x, top: y, width: w, height: h, zIndex: 5, overflow: "visible" }}>
        {activeTool === "Rectangle" || activeTool === "Frame" || activeTool === "Component" || activeTool === "Section" || activeTool === "Slice" ? (
          <rect x={0} y={0} width={w} height={h} rx={activeTool === "Rectangle" ? 8 : 0} {...previewStyle} />
        ) : activeTool === "Ellipse" ? (
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} {...previewStyle} />
        ) : activeTool === "Triangle" ? (
          <polygon points={`${w / 2},0 ${w},${h} 0,${h}`} {...previewStyle} />
        ) : activeTool === "Diamond" ? (
          <polygon points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`} {...previewStyle} />
        ) : activeTool === "Star" ? (() => {
          const cx = w / 2, cy = h / 2, or = Math.min(cx, cy), ir = or * 0.4;
          const pts = Array.from({ length: 10 }, (_, i) => {
            const r = i % 2 === 0 ? or : ir;
            const a = (Math.PI / 5) * i - Math.PI / 2;
            return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
          }).join(" ");
          return <polygon points={pts} {...previewStyle} />;
        })() : activeTool === "Polygon" ? (() => {
          const cx = w / 2, cy = h / 2, r = Math.min(cx, cy);
          const pts = Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI / 3) * i - Math.PI / 2;
            return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
          }).join(" ");
          return <polygon points={pts} {...previewStyle} />;
        })() : activeTool === "Text" ? (
          <><rect x={0} y={0} width={w} height={h} {...previewStyle} /><text x={4} y={h / 2 + 4} fill="hsl(263, 70%, 58%)" fontSize={12} opacity={0.6}>Text</text></>
        ) : null}
      </svg>
    );
  };

  const renderShape = (el: CanvasElement) => {
    const s: any = { fill: el.fillColor + "33", stroke: el.strokeColor, strokeWidth: el.strokeWidth };
    if (el.strokeDash) s.strokeDasharray = el.strokeDash;
    if (el.strokeCap) s.strokeLinecap = el.strokeCap;
    if (el.strokeJoin) s.strokeLinejoin = el.strokeJoin;
    switch (el.type) {
      case "Rectangle": case "Frame": case "Slice": case "Section":
        return <rect x={1} y={1} width={el.w - 2} height={el.h - 2} rx={el.cornerRadius} {...s} />;
      case "Ellipse":
        return <ellipse cx={el.w / 2} cy={el.h / 2} rx={el.w / 2 - 1} ry={el.h / 2 - 1} {...s} />;
      case "Triangle":
        return <polygon points={`${el.w / 2},2 ${el.w - 2},${el.h - 2} 2,${el.h - 2}`} {...s} />;
      case "Diamond":
        return <polygon points={`${el.w / 2},2 ${el.w - 2},${el.h / 2} ${el.w / 2},${el.h - 2} 2,${el.h / 2}`} {...s} />;
      case "Star": {
        const cx = el.w / 2, cy = el.h / 2, or = Math.min(cx, cy) - 2, ir = or * 0.4;
        const pts = Array.from({ length: 10 }, (_, i) => {
          const r = i % 2 === 0 ? or : ir;
          const a = (Math.PI / 5) * i - Math.PI / 2;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ");
        return <polygon points={pts} {...s} />;
      }
      case "Polygon": {
        const cx = el.w / 2, cy = el.h / 2, r = Math.min(cx, cy) - 2;
        const pts = Array.from({ length: 6 }, (_, i) => {
          const a = (Math.PI / 3) * i - Math.PI / 2;
          return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
        }).join(" ");
        return <polygon points={pts} {...s} />;
      }
      case "Line":
        return <line x1={0} y1={0} x2={el.w} y2={el.h} stroke={el.strokeColor} strokeWidth={el.strokeWidth} />;
      case "Arrow": {
        const len = Math.sqrt(el.w ** 2 + el.h ** 2) || 1;
        const ax = el.w / len, ay = el.h / len, px = -ay, py = ax, as2 = 12;
        return (<><line x1={0} y1={0} x2={el.w} y2={el.h} stroke={el.strokeColor} strokeWidth={el.strokeWidth} /><polygon points={`${el.w},${el.h} ${el.w - ax * as2 + px * 5},${el.h - ay * as2 + py * 5} ${el.w - ax * as2 - px * 5},${el.h - ay * as2 - py * 5}`} fill={el.strokeColor} /></>);
      }
      case "Pen": case "Pencil": case "Brush":
        if (el.points && el.points.length > 1) {
          const d = el.points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          return <path d={d} fill="none" stroke={el.strokeColor} strokeWidth={el.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />;
        }
        return null;
      default: return null;
    }
  };

  const resizeHandles = ["tl", "tr", "bl", "br", "t", "b", "l", "r"];
  const getHandleStyle = (handle: string): React.CSSProperties => {
    const size = 8, half = size / 2;
    const base: React.CSSProperties = { position: "absolute", width: size, height: size, borderRadius: 2, background: "hsl(var(--primary))", border: "1px solid hsl(var(--primary-foreground))", zIndex: 10 };
    switch (handle) {
      case "tl": return { ...base, top: -half, left: -half, cursor: "nwse-resize" };
      case "tr": return { ...base, top: -half, right: -half, cursor: "nesw-resize" };
      case "bl": return { ...base, bottom: -half, left: -half, cursor: "nesw-resize" };
      case "br": return { ...base, bottom: -half, right: -half, cursor: "nwse-resize" };
      case "t": return { ...base, top: -half, left: "50%", marginLeft: -half, cursor: "ns-resize" };
      case "b": return { ...base, bottom: -half, left: "50%", marginLeft: -half, cursor: "ns-resize" };
      case "l": return { ...base, top: "50%", left: -half, marginTop: -half, cursor: "ew-resize" };
      case "r": return { ...base, top: "50%", right: -half, marginTop: -half, cursor: "ew-resize" };
      default: return base;
    }
  };

  const toggleGroup = (label: string) => setCollapsedGroups((p) => ({ ...p, [label]: !p[label] }));
  const toggleSection = (label: string) => setCollapsedSections((p) => ({ ...p, [label]: !p[label] }));
  const toolbarWidth = toolbarCols === 1 ? 52 : 72;
  const leftSidebarWidth = leftSidebarOpen ? 240 : 0;
  const rightPanelWidth = rightPanelOpen ? 280 : 0;

  const filteredElements = searchQuery
    ? elements.filter(el => el.label.toLowerCase().includes(searchQuery.toLowerCase()) || el.type.toLowerCase().includes(searchQuery.toLowerCase()))
    : elements;

  // Home sidebar items
  const homeItems = [
    { icon: Clock, label: "Recents", count: elements.length },
    { icon: Globe, label: "Community", count: 0 },
    { icon: FileText, label: "Drafts", count: 1 },
    { icon: FolderOpen, label: "All Projects", count: 3 },
    { icon: Trash, label: "Trash", count: 0 },
    { icon: Package, label: "Resources", count: 12 },
    { icon: UsersRound, label: "Team Project", count: 2 },
  ];

  const SectionHeader = ({ label, collapsed }: { label: string; collapsed: boolean }) => (
    <button onClick={() => toggleSection(label)} className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
      <span>{label}</span>
      {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
    </button>
  );

  return (
    <div className="relative min-h-screen pt-14 flex" onMouseUp={() => { if (resizing) setResizing(null); }}>
      {/* Top toolbar - Figma style */}
      <div className="fixed top-14 left-0 right-0 z-30 h-10 glass-strong border-b border-border/30 flex items-center px-2 gap-1">
        {/* Left: sidebar toggle + tool groups inline */}
        <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors" title="Toggle left panel">
          <PanelLeft className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-border/50 mx-1" />
        
        {toolGroups.map((group) => (
          <div key={group.label} className="flex items-center">
            {group.tools.map((item) => (
              <button key={item.label} title={`${item.label} (${item.shortcut})`}
                onClick={() => { setActiveTool(item.label); if (isPenTool && !["Pen", "Pencil", "Brush"].includes(item.label)) finishPen(); }}
                className={`p-1.5 rounded transition-all ${
                  activeTool === item.label ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}>
                <item.icon className="w-4 h-4" />
              </button>
            ))}
            <div className="w-px h-4 bg-border/30 mx-0.5" />
          </div>
        ))}

        <div className="flex-1" />

        {/* Center: zoom */}
        <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
          <button onClick={() => setZoom((z) => Math.max(z - 10, 25))} className="text-muted-foreground hover:text-foreground"><ZoomOut className="w-3.5 h-3.5" /></button>
          <span className="text-xs text-foreground font-medium w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom((z) => Math.min(z + 10, 400))} className="text-muted-foreground hover:text-foreground"><ZoomIn className="w-3.5 h-3.5" /></button>
        </div>

        <div className="w-px h-5 bg-border/50 mx-1" />

        {/* Actions */}
        <button onClick={handleUndo} title="Undo (Ctrl+Z)" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60"><Undo className="w-4 h-4" /></button>
        <button onClick={handleRedo} title="Redo (Ctrl+Y)" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60"><Redo className="w-4 h-4" /></button>
        <button onClick={() => setShowGrid(!showGrid)} title="Toggle Grid" className={`p-1.5 rounded transition-colors ${showGrid ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}><Grid3X3 className="w-4 h-4" /></button>
        <button onClick={() => setShowExportModal(true)} title="Export" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60"><Download className="w-4 h-4" /></button>
        <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors" title="Toggle right panel">
          <PanelRight className="w-4 h-4" />
        </button>
      </div>

      {/* Left Sidebar - Figma style */}
      <AnimatePresence>
        {leftSidebarOpen && (
          <motion.aside
            initial={{ x: -leftSidebarWidth, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -leftSidebarWidth, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 top-24 bottom-0 glass-strong z-20 flex flex-col border-r border-border/30"
            style={{ width: leftSidebarWidth }}
          >
            {/* Sidebar view toggle */}
            {leftSidebarView === "home" ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
                  <span className="text-sm font-semibold text-foreground">ProtoCraft</span>
                  <button onClick={() => setLeftSidebarView("workspace")} className="text-xs text-primary hover:underline">Back to Canvas</button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {homeItems.map((item) => (
                    <button key={item.label} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
                      <item.icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count > 0 && <span className="text-[10px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded">{item.count}</span>}
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-border/30">
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm gradient-purple text-primary-foreground hover:scale-[1.01] transition-transform">
                    <Share2 className="w-4 h-4" />
                    Share Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex items-center border-b border-border/30">
                  {[
                    { id: "pages" as LeftTab, icon: File, label: "Pages" },
                    { id: "layers" as LeftTab, icon: Layers, label: "Layers" },
                    { id: "assets" as LeftTab, icon: Package, label: "Assets" },
                    { id: "find" as LeftTab, icon: Search, label: "Find" },
                    { id: "inspector" as LeftTab, icon: Component, label: "Inspect" },
                  ].map((tab) => (
                    <button key={tab.id} onClick={() => setLeftTab(tab.id)}
                      className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-colors border-b-2 ${
                        leftTab === tab.id ? "text-primary border-primary" : "text-muted-foreground hover:text-foreground border-transparent"
                      }`}>
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Home link */}
                <button onClick={() => setLeftSidebarView("home")} className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors border-b border-border/20">
                  <Home className="w-3 h-3" />
                  <span>Home / Projects</span>
                </button>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">
                  {leftTab === "pages" && (
                    <div className="p-2">
                      <div className="flex items-center justify-between px-2 mb-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pages</span>
                        <button onClick={() => setPages((p) => [...p, { id: p.length + 1, name: `Page ${p.length + 1}`, active: false }])} className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary"><Plus className="w-3 h-3" /></button>
                      </div>
                      {pages.map((page) => (
                        <button key={page.id} onClick={() => setPages((p) => p.map((pg) => ({ ...pg, active: pg.id === page.id })))}
                          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors mb-0.5 ${page.active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}>
                          <FileText className="w-3 h-3" />
                          <span className="flex-1 text-left">{page.name}</span>
                          {page.active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </button>
                      ))}
                    </div>
                  )}

                  {leftTab === "layers" && (
                    <div className="p-2">
                      <div className="px-2 mb-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Layers ({elements.length})</span>
                      </div>
                      {elements.length === 0 ? (
                        <div className="text-center py-8">
                          <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No layers yet</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">Draw something on the canvas</p>
                        </div>
                      ) : (
                        [...elements].reverse().map((el) => (
                          <div key={el.id}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors mb-0.5 cursor-pointer ${
                              (selectedId === el.id || lastSelectedId === el.id) ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                            }`}
                            onClick={() => setSelectedId(el.id)}>
                            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: el.fillColor + "66", border: `1px solid ${el.fillColor}` }} />
                            <span className="truncate flex-1">{el.label}</span>
                            <button onClick={(ev) => { ev.stopPropagation(); setElements((p) => p.map((x) => x.id === el.id ? { ...x, visible: !x.visible } : x)); }} className="p-0.5 hover:text-foreground shrink-0">
                              {el.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <button onClick={(ev) => { ev.stopPropagation(); setElements((p) => p.map((x) => x.id === el.id ? { ...x, locked: !x.locked } : x)); }} className="p-0.5 hover:text-foreground shrink-0">
                              {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {leftTab === "assets" && (
                    <div className="p-2">
                      <div className="px-2 mb-2">
                        <input placeholder="Search assets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-secondary/50 rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50" />
                      </div>
                      <SectionHeader label="Components" collapsed={!!collapsedSections["Components"]} />
                      {!collapsedSections["Components"] && (
                        <div className="px-2 py-1 space-y-0.5">
                          {["Button", "Card", "Input", "Badge", "Avatar", "Modal", "Tooltip"].map((c) => (
                            <div key={c} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:bg-secondary/60 cursor-pointer">
                              <Component className="w-3 h-3 text-primary" />
                              <span>{c}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <SectionHeader label="Icons" collapsed={!!collapsedSections["Icons"]} />
                      {!collapsedSections["Icons"] && (
                        <div className="px-2 py-1 grid grid-cols-6 gap-1">
                          {[Square, Circle, Triangle, Star, Diamond, Hexagon, ArrowUpRight, Minus, Type, Image, Layout, Box].map((Icon, i) => (
                            <div key={i} className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:bg-secondary/60 hover:text-foreground cursor-pointer">
                              <Icon className="w-4 h-4" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {leftTab === "find" && (
                    <div className="p-2">
                      <input placeholder="Find in design..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-secondary/50 rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 mb-2" />
                      {filteredElements.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No results found</p>
                      ) : (
                        filteredElements.map((el) => (
                          <button key={el.id} onClick={() => setSelectedId(el.id)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:bg-secondary/60 mb-0.5">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: el.fillColor + "66" }} />
                            <span className="truncate flex-1 text-left">{el.label}</span>
                            <span className="text-[9px] text-muted-foreground/60">{el.type}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {leftTab === "inspector" && (
                    <ComponentExplainer selectedComponent={activeEl ? { id: activeEl.id, type: activeEl.type.toLowerCase(), label: activeEl.label } : null} />
                  )}
                </div>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className="flex-1 pt-10" style={{ marginLeft: leftSidebarOpen ? leftSidebarWidth : 0, marginRight: rightPanelOpen ? rightPanelWidth : 0 }}>
        <motion.div
          ref={canvasRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="relative w-full h-[calc(100vh-6rem)] overflow-hidden bg-[hsl(240,15%,4%)]"
          style={{ cursor: isPenTool || isDrawingTool ? "crosshair" : activeTool === "Pan" ? (panning ? "grabbing" : "grab") : "default" }}
          onMouseDown={handleCanvasMouseDown} onMouseUp={handleCanvasMouseUp} onMouseMove={handleCanvasMouseMove}
          onDoubleClick={() => { if (isPenTool) finishPen(); }}
        >
          {/* Grid */}
          {showGrid && (
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)`,
              backgroundSize: "40px 40px", backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            }} />
          )}

          {/* Status bar */}
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 backdrop-blur-sm">
            <Move className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground font-medium">{activeTool}</span>
            <span className="text-[10px] text-primary font-bold ml-2">{zoom}%</span>
            <span className="text-[10px] text-muted-foreground">· {elements.length} objects</span>
          </div>

          {/* Shape preview */}
          {renderShapePreview()}

          {/* Pen preview */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
            {penPoints.length > 0 && (
              <polyline points={penPoints.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="4 2" />
            )}
          </svg>

          {/* Render elements */}
          <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`, transformOrigin: "0 0" }}>
            {elements.filter((el) => el.visible).map((el) => (
              <div
                key={el.id}
                className={`absolute ${el.locked ? "pointer-events-none opacity-60" : "cursor-move"}`}
                style={{
                  left: el.x, top: el.y,
                  width: ["Line", "Arrow", "Pen", "Pencil", "Brush"].includes(el.type) ? undefined : el.w,
                  height: ["Line", "Arrow", "Pen", "Pencil", "Brush"].includes(el.type) ? undefined : el.h,
                  transform: `rotate(${el.rotation}deg) scaleX(${el.flipH ? -1 : 1}) scaleY(${el.flipV ? -1 : 1})`,
                  transformOrigin: "center center",
                  opacity: el.opacity / 100,
                  mixBlendMode: (el.blendMode?.toLowerCase().replace(" ", "-") || "normal") as any,
                  filter: el.blurAmount ? `blur(${el.blurAmount}px)` : undefined,
                }}
                onClick={(e) => { e.stopPropagation(); if (activeTool === "Select") setSelectedId(el.id === selectedId ? null : el.id); }}
                onMouseDown={(e) => {
                  if (activeTool !== "Select" || el.locked) return;
                  e.stopPropagation();
                  const pos = getCanvasPos(e);
                  setDragging({ id: el.id, offsetX: pos.x - el.x, offsetY: pos.y - el.y });
                  setSelectedId(el.id);
                }}
                onDoubleClick={(e) => { e.stopPropagation(); if (el.type === "Text") setEditingTextId(el.id); }}
              >
                {el.type === "Text" ? (
                  editingTextId === el.id ? (
                    <textarea autoFocus value={el.text || ""}
                      onChange={(ev) => setElements((prev) => prev.map((x) => x.id === el.id ? { ...x, text: ev.target.value } : x))}
                      onBlur={() => setEditingTextId(null)}
                      className="bg-transparent border border-primary text-foreground outline-none w-full h-full resize-none p-1"
                      style={{ color: el.fillColor, fontSize: el.fontSize, fontWeight: el.fontWeight, fontFamily: el.fontFamily, textAlign: (el.textAlign as any) || "left", fontStyle: el.fontStyle || "normal", textDecoration: el.textDecoration || "none", lineHeight: el.lineHeight ? `${el.lineHeight}` : undefined, letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined }}
                    />
                  ) : (
                    <span className="select-none whitespace-pre-wrap block w-full" style={{ color: el.fillColor, fontSize: el.fontSize, fontWeight: el.fontWeight, fontFamily: el.fontFamily, textAlign: (el.textAlign as any) || "left", fontStyle: el.fontStyle || "normal", textDecoration: el.textDecoration || "none", lineHeight: el.lineHeight ? `${el.lineHeight}` : undefined, letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined }}>{el.text || el.label}</span>
                  )
                ) : (
                  <svg width={["Line", "Arrow"].includes(el.type) ? Math.abs(el.w) + 20 : el.w} height={["Line", "Arrow"].includes(el.type) ? Math.abs(el.h) + 20 : el.h} className="overflow-visible">
                    {renderShape(el)}
                  </svg>
                )}
                {/* Selection & resize handles */}
                {selectedId === el.id && !el.locked && !["Line", "Arrow", "Pen", "Pencil", "Brush"].includes(el.type) && (
                  <>
                    <div className="absolute inset-0 border-2 border-primary pointer-events-none" />
                    {resizeHandles.map((h) => (
                      <div key={h} style={getHandleStyle(h)}
                        onMouseDown={(e) => { e.stopPropagation(); const pos = getCanvasPos(e); pushHistory(); setResizing({ id: el.id, handle: h, startX: pos.x, startY: pos.y, startW: el.w, startH: el.h, startElX: el.x, startElY: el.y }); }} />
                    ))}
                  </>
                )}
                {selectedId === el.id && (
                  <div className="absolute -bottom-5 left-0 text-[9px] text-primary font-medium whitespace-nowrap">{Math.round(el.w)} × {Math.round(el.h)}</div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Always visible with persistent selection */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.aside
            initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-24 bottom-0 glass-strong z-20 overflow-y-auto border-l border-border/30"
            style={{ width: rightPanelWidth }}
          >
            {activeEl ? (
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
                  {selectedId !== activeEl.id && <span className="text-[8px] text-muted-foreground/50 bg-secondary/50 px-1.5 py-0.5 rounded">Last selected</span>}
                </div>

                {/* Position & Size */}
                <SectionHeader label="Position" collapsed={!!collapsedSections["Position"]} />
                {!collapsedSections["Position"] && (
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {[{ label: "X", value: activeEl.x, key: "x" }, { label: "Y", value: activeEl.y, key: "y" }, { label: "W", value: activeEl.w, key: "w" }, { label: "H", value: activeEl.h, key: "h" }].map((f) => (
                      <div key={f.key} className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
                        <span className="text-[9px] text-muted-foreground font-medium w-3">{f.label}</span>
                        <input type="number" value={Math.round(f.value)} onChange={(e) => updateSelected({ [f.key]: Number(e.target.value) })}
                          className="flex-1 bg-transparent text-[11px] text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Rotation & Radius */}
                <SectionHeader label="Transform" collapsed={!!collapsedSections["Transform"]} />
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
                <SectionHeader label="Layout" collapsed={!!collapsedSections["Layout"]} />
                {!collapsedSections["Layout"] && (
                  <div className="px-1 space-y-1.5">
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
                        <span className="text-[9px] text-muted-foreground">H Constraint</span>
                        <select value={activeEl.constraintH || "left"} onChange={(e) => updateSelected({ constraintH: e.target.value })}
                          className="flex-1 bg-transparent text-[10px] text-foreground outline-none">
                          <option value="left">Left</option><option value="right">Right</option><option value="center">Center</option><option value="scale">Scale</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
                        <span className="text-[9px] text-muted-foreground">V Constraint</span>
                        <select value={activeEl.constraintV || "top"} onChange={(e) => updateSelected({ constraintV: e.target.value })}
                          className="flex-1 bg-transparent text-[10px] text-foreground outline-none">
                          <option value="top">Top</option><option value="bottom">Bottom</option><option value="center">Center</option><option value="scale">Scale</option>
                        </select>
                      </div>
                    </div>
                    {/* Alignment */}
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
                    {/* Auto layout */}
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
                        <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
                          <span className="text-[9px] text-muted-foreground">Gap</span>
                          <input type="number" value={activeEl.layoutGap || 0} onChange={(e) => updateSelected({ layoutGap: Number(e.target.value) })}
                            className="flex-1 bg-transparent text-[10px] text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                        <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
                          <span className="text-[9px] text-muted-foreground">Pad</span>
                          <input type="number" value={activeEl.layoutPadding || 0} onChange={(e) => updateSelected({ layoutPadding: Number(e.target.value) })}
                            className="flex-1 bg-transparent text-[10px] text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Appearance / Fill */}
                <SectionHeader label="Appearance" collapsed={!!collapsedSections["Appearance"]} />
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
                    {/* Opacity */}
                    <div className="flex items-center gap-2">
                      <Droplet className="w-3 h-3 text-muted-foreground shrink-0" />
                      <input type="range" min={0} max={100} value={activeEl.opacity} onChange={(e) => updateSelected({ opacity: Number(e.target.value) })} className="flex-1 accent-primary h-1" />
                      <span className="text-[10px] text-foreground w-7 text-right">{activeEl.opacity}%</span>
                    </div>
                    {/* Blend mode */}
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
                <SectionHeader label="Stroke" collapsed={!!collapsedSections["Stroke"]} />
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
                <SectionHeader label="Effect" collapsed={!!collapsedSections["Effect"]} />
                {!collapsedSections["Effect"] && (
                  <div className="px-1 space-y-1.5">
                    {/* Shadow */}
                    <div className="grid grid-cols-3 gap-1">
                      <div className="flex items-center gap-1 bg-secondary/50 rounded px-1.5 py-1">
                        <span className="text-[8px] text-muted-foreground">SX</span>
                        <input type="number" value={activeEl.shadowX || 0} onChange={(e) => updateSelected({ shadowX: Number(e.target.value) })}
                          className="flex-1 bg-transparent text-[10px] text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                      <div className="flex items-center gap-1 bg-secondary/50 rounded px-1.5 py-1">
                        <span className="text-[8px] text-muted-foreground">SY</span>
                        <input type="number" value={activeEl.shadowY || 0} onChange={(e) => updateSelected({ shadowY: Number(e.target.value) })}
                          className="flex-1 bg-transparent text-[10px] text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                      <div className="flex items-center gap-1 bg-secondary/50 rounded px-1.5 py-1">
                        <span className="text-[8px] text-muted-foreground">SB</span>
                        <input type="number" value={activeEl.shadowBlur || 0} onChange={(e) => updateSelected({ shadowBlur: Number(e.target.value) })}
                          className="flex-1 bg-transparent text-[10px] text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-muted-foreground">Shadow Color</span>
                      <input type="color" value={activeEl.shadowColor || "#000000"} onChange={(e) => updateSelected({ shadowColor: e.target.value })}
                        className="w-5 h-5 rounded border border-border/50 cursor-pointer bg-transparent" />
                    </div>
                    {/* Blur */}
                    <div className="flex items-center gap-2">
                      <SunDim className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-[9px] text-muted-foreground">Blur</span>
                      <input type="range" min={0} max={50} value={activeEl.blurAmount || 0} onChange={(e) => updateSelected({ blurAmount: Number(e.target.value) })} className="flex-1 accent-primary h-1" />
                      <span className="text-[10px] text-foreground w-6 text-right">{activeEl.blurAmount || 0}</span>
                    </div>
                  </div>
                )}

                {/* Typography (Text only) */}
                {activeEl.type === "Text" && (
                  <>
                    <SectionHeader label="Typography" collapsed={!!collapsedSections["Typography"]} />
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
                <SectionHeader label="Layout Guide" collapsed={!!collapsedSections["Layout Guide"]} />
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
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center mb-3">
                  <MousePointer className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">No element selected</p>
                <p className="text-[10px] text-muted-foreground/60">Click on an element or draw a shape to see its properties here</p>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-6 w-[420px] max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Export Project</h2>
                <button onClick={() => setShowExportModal(false)} className="p-1 rounded hover:bg-secondary/60 text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Export your design to different code formats</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { format: "html", label: "HTML/CSS", desc: "Static HTML with inline styles", icon: "🌐" },
                  { format: "react", label: "React (JSX)", desc: "React component with inline styles", icon: "⚛️" },
                  { format: "vue", label: "Vue.js", desc: "Vue SFC with scoped styles", icon: "💚" },
                  { format: "tailwind", label: "React + Tailwind", desc: "React with Tailwind CSS classes", icon: "🎨" },
                  { format: "svg", label: "SVG", desc: "Scalable Vector Graphics", icon: "📐" },
                  { format: "json", label: "JSON Data", desc: "Raw element data for processing", icon: "📦" },
                ].map((item) => (
                  <button key={item.format} onClick={() => { downloadExport(item.format); }}
                    className="flex flex-col items-start gap-1 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/30 hover:border-primary/30 transition-all text-left group">
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-[10px] text-muted-foreground">
                  <Sparkles className="w-3 h-3 inline text-primary mr-1" />
                  {elements.length} elements will be exported from the current canvas
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkspaceCanvas;
