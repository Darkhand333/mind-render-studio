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
  Bold, Italic, Underline, AlignJustify, Pipette
} from "lucide-react";
import Chatbot from "./Chatbot";
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
};

const toolGroups = [
  {
    label: "Select",
    tools: [
      { icon: MousePointer, label: "Select", shortcut: "V" },
      { icon: Hand, label: "Pan", shortcut: "H" },
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
    ],
  },
  {
    label: "Insert",
    tools: [
      { icon: Type, label: "Text", shortcut: "X" },
      { icon: Image, label: "Image", shortcut: "I" },
      { icon: Layout, label: "Frame", shortcut: "F" },
      { icon: Box, label: "Component", shortcut: "C" },
    ],
  },
];

const allTools = toolGroups.flatMap((g) => g.tools);

let nextId = 10;
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

const WorkspaceCanvas = () => {
  const [micActive, setMicActive] = useState(false);
  const [activeTool, setActiveTool] = useState("Select");
  const [showCollab, setShowCollab] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [toolbarCols, setToolbarCols] = useState<1 | 2>(2);
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [elements, setElements] = useState<CanvasElement[]>([
    { id: 1, type: "Rectangle", x: 120, y: 80, w: 260, h: 140, label: "Hero Section", fillColor: defaultColors[0], strokeColor: defaultColors[0], strokeWidth: 2, opacity: 100, rotation: 0, cornerRadius: 8, visible: true, locked: false },
    { id: 2, type: "Ellipse", x: 450, y: 200, w: 100, h: 100, label: "Avatar", fillColor: defaultColors[1], strokeColor: defaultColors[1], strokeWidth: 2, opacity: 100, rotation: 0, cornerRadius: 0, visible: true, locked: false },
    { id: 3, type: "Text", x: 120, y: 280, w: 200, h: 40, label: "Heading", fillColor: defaultColors[2], strokeColor: "transparent", strokeWidth: 0, opacity: 100, rotation: 0, cornerRadius: 0, visible: true, locked: false, text: "Hello World", fontSize: 24, fontWeight: "700", fontFamily: "Inter", textAlign: "left" },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
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
  const [multiSelect, setMultiSelect] = useState<number[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const collabRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const inspectorRef = useRef<HTMLDivElement>(null);

  // Click outside to close panels
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (collabRef.current && !collabRef.current.contains(e.target as Node)) setShowCollab(false);
      if (layersRef.current && !layersRef.current.contains(e.target as Node)) setShowLayers(false);
      if (inspectorRef.current && !inspectorRef.current.contains(e.target as Node)) setShowInspector(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
  const handleDelete = () => { if (!selectedId) return; pushHistory(); setElements((p) => p.filter((el) => el.id !== selectedId)); setSelectedId(null); };
  const handleDuplicate = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    pushHistory();
    const newEl = { ...el, id: nextId++, x: el.x + 20, y: el.y + 20, label: `${el.label} copy` };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const isDrawingTool = ["Rectangle", "Ellipse", "Triangle", "Diamond", "Star", "Polygon", "Line", "Arrow", "Frame", "Text", "Component"].includes(activeTool);
  const isPenTool = activeTool === "Pen" || activeTool === "Pencil";

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
        visible: true, locked: false,
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
    if (!selectedId) return;
    setElements((prev) => prev.map((el) => el.id === selectedId ? { ...el, ...updates } : el));
  };

  const handleAlign = (type: string) => {
    if (!selectedId) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    const cw = canvasRect.width / (zoom / 100), ch = canvasRect.height / (zoom / 100);
    const el = elements.find((e) => e.id === selectedId);
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
    if (!selectedId) return;
    pushHistory();
    if (dir === "h") updateSelected({ flipH: !selectedEl?.flipH });
    else updateSelected({ flipV: !selectedEl?.flipV });
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export as SVG
    const svgParts: string[] = [];
    svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">`);
    svgParts.push(`<rect width="1200" height="800" fill="#0d0d14"/>`);
    elements.filter(el => el.visible).forEach(el => {
      const transform = `translate(${el.x},${el.y}) rotate(${el.rotation}) scale(${el.flipH ? -1 : 1},${el.flipV ? -1 : 1})`;
      svgParts.push(`<g transform="${transform}" opacity="${el.opacity / 100}">`);
      if (el.type === "Rectangle" || el.type === "Frame") {
        svgParts.push(`<rect width="${el.w}" height="${el.h}" rx="${el.cornerRadius}" fill="${el.fillColor}33" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}"/>`);
      } else if (el.type === "Ellipse") {
        svgParts.push(`<ellipse cx="${el.w/2}" cy="${el.h/2}" rx="${el.w/2}" ry="${el.h/2}" fill="${el.fillColor}33" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}"/>`);
      } else if (el.type === "Text") {
        svgParts.push(`<text x="0" y="${el.fontSize || 16}" fill="${el.fillColor}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" font-family="${el.fontFamily || 'Inter'}">${el.text || el.label}</text>`);
      }
      svgParts.push(`</g>`);
    });
    svgParts.push(`</svg>`);
    const blob = new Blob([svgParts.join("\n")], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "protocraft-export.svg"; a.click();
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
        {activeTool === "Rectangle" || activeTool === "Frame" || activeTool === "Component" ? (
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
    const s = { fill: el.fillColor + "33", stroke: el.strokeColor, strokeWidth: el.strokeWidth };
    switch (el.type) {
      case "Rectangle": case "Frame":
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
      case "Pen": case "Pencil":
        if (el.points && el.points.length > 1) {
          const d = el.points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          return <path d={d} fill="none" stroke={el.strokeColor} strokeWidth={el.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />;
        }
        return null;
      default: return null;
    }
  };

  const selectedEl = selectedId ? elements.find((e) => e.id === selectedId) || null : null;

  const resizeHandles = ["tl", "tr", "bl", "br", "t", "b", "l", "r"];
  const getHandleStyle = (handle: string, _el: CanvasElement): React.CSSProperties => {
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
  const toolbarWidth = toolbarCols === 1 ? 52 : 72;

  return (
    <div className="relative min-h-screen pt-16 flex" onMouseUp={() => { if (resizing) setResizing(null); }}>
      {/* Left toolbar */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-16 bottom-0 glass-strong flex flex-col pt-1 pb-2 z-30 overflow-y-auto"
        style={{ width: toolbarWidth }}
      >
        {/* Column toggle */}
        <div className="flex justify-center mb-1 px-1">
          <button onClick={() => setToolbarCols(toolbarCols === 1 ? 2 : 1)} title="Toggle columns"
            className="w-full h-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
            {toolbarCols === 1 ? <Columns2 className="w-3 h-3" /> : <Rows2 className="w-3 h-3" />}
          </button>
        </div>

        {toolGroups.map((group) => (
          <div key={group.label} className="px-1 mb-0.5">
            <button onClick={() => toggleGroup(group.label)}
              className="w-full flex items-center gap-0.5 px-1 py-0.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
              {collapsedGroups[group.label] ? <ChevronRight className="w-2 h-2" /> : <ChevronDown className="w-2 h-2" />}
              {group.label}
            </button>
            {!collapsedGroups[group.label] && (
              <div className={`grid gap-0.5 ${toolbarCols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
                {group.tools.map((item) => (
                  <button key={item.label} title={`${item.label} (${item.shortcut})`}
                    onClick={() => { setActiveTool(item.label); if (isPenTool && item.label !== "Pen" && item.label !== "Pencil") finishPen(); }}
                    className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${
                      activeTool === item.label ? "gradient-purple text-primary-foreground neon-glow-sm" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                    }`}>
                    <item.icon className="w-3.5 h-3.5" />
                    <span className="text-[6px] mt-0.5 leading-none">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="w-full h-px bg-border/50 my-1 shrink-0" />

        {/* Actions */}
        <div className={`grid gap-0.5 px-1 ${toolbarCols === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
          {[
            { icon: Undo, label: "Undo", action: handleUndo },
            { icon: Redo, label: "Redo", action: handleRedo },
            { icon: ZoomOut, label: "−", action: () => setZoom((z) => Math.max(z - 10, 25)) },
            { icon: ZoomIn, label: "+", action: () => setZoom((z) => Math.min(z + 10, 400)) },
            { icon: Grid3X3, label: "Grid", action: () => setShowGrid((g) => !g), active: showGrid },
            { icon: Copy, label: "Copy", action: handleDuplicate },
            { icon: Trash2, label: "Del", action: handleDelete },
            { icon: Layers, label: "Layer", action: () => setShowLayers((l) => !l), active: showLayers },
            { icon: Download, label: "Export", action: handleExport },
          ].map((item) => (
            <button key={item.label} title={item.label} onClick={item.action}
              className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all text-[6px] ${
                (item as any).active ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}>
              <item.icon className="w-3 h-3" />
              <span className="mt-0.5 leading-none">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Bottom buttons */}
        <div className="px-1 space-y-0.5">
          <button title="Component Inspector" onClick={() => setShowInspector(!showInspector)}
            className={`w-full h-7 rounded-lg flex items-center justify-center transition-all ${showInspector ? "gradient-purple text-primary-foreground neon-glow-sm" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}>
            <Component className="w-3.5 h-3.5" />
          </button>
          <button title="Collaborate" onClick={() => setShowCollab(!showCollab)}
            className={`w-full h-7 rounded-lg flex items-center justify-center transition-all ${showCollab ? "gradient-purple text-primary-foreground neon-glow-sm" : "text-muted-foreground hover:text-primary hover:bg-primary/10"}`}>
            <Users className="w-3.5 h-3.5" />
          </button>
        </div>
      </motion.aside>

      {/* Floating panels - Collaboration */}
      <AnimatePresence>
        {showCollab && (
          <motion.div ref={collabRef} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="fixed top-20 w-64 glass-strong rounded-2xl p-4 z-30" style={{ left: toolbarWidth + 8 }}>
            <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">Collaboration</h3></div>
            <p className="text-xs text-muted-foreground mb-3">Invite friends to work together</p>
            <input placeholder="Enter email..." className="w-full bg-secondary/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 mb-2" />
            <button className="w-full py-2 rounded-xl gradient-purple text-primary-foreground text-xs font-semibold hover:scale-[1.02] transition-transform">Send Invite</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layers panel */}
      <AnimatePresence>
        {showLayers && (
          <motion.div ref={layersRef} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="fixed top-20 w-56 glass-strong rounded-2xl p-3 z-30 max-h-[60vh] overflow-y-auto" style={{ left: toolbarWidth + 8 }}>
            <div className="flex items-center gap-2 mb-3"><Layers className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">Layers</h3></div>
            {[...elements].reverse().map((el) => (
              <button key={el.id} onClick={() => setSelectedId(el.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors mb-0.5 ${selectedId === el.id ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-secondary/80"}`}>
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: el.fillColor }} />
                <span className="truncate flex-1 text-left">{el.label}</span>
                <button onClick={(ev) => { ev.stopPropagation(); setElements((p) => p.map((x) => x.id === el.id ? { ...x, visible: !x.visible } : x)); }} className="p-0.5 hover:text-foreground">{el.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}</button>
                <button onClick={(ev) => { ev.stopPropagation(); setElements((p) => p.map((x) => x.id === el.id ? { ...x, locked: !x.locked } : x)); }} className="p-0.5 hover:text-foreground">{el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}</button>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Component Inspector panel */}
      <AnimatePresence>
        {showInspector && (
          <motion.div ref={inspectorRef} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="fixed top-20 w-72 glass-strong rounded-2xl z-30 max-h-[75vh] overflow-y-auto" style={{ left: toolbarWidth + 8 }}>
            <ComponentExplainer selectedComponent={selectedEl ? { id: selectedEl.id, type: selectedEl.type.toLowerCase(), label: selectedEl.label } : null} />
            <div className="px-4 pb-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">All Elements ({elements.length})</p>
              <div className="space-y-0.5">
                {elements.map((el) => (
                  <button key={el.id} onClick={() => setSelectedId(el.id)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedId === el.id ? "bg-primary/20 text-foreground border border-primary/30" : "text-muted-foreground hover:bg-secondary/80"}`}>
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: el.fillColor + "44", border: `1px solid ${el.fillColor}` }} />
                    <span className="truncate flex-1 text-left">{el.label}</span>
                    <span className="text-[9px] text-muted-foreground">{el.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className={`flex-1 p-4`} style={{ marginLeft: toolbarWidth, marginRight: selectedEl ? 288 : 0 }}>
        <motion.div
          ref={canvasRef} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[calc(100vh-6rem)] rounded-2xl glass overflow-hidden"
          style={{ cursor: isPenTool || isDrawingTool ? "crosshair" : activeTool === "Pan" ? (panning ? "grabbing" : "grab") : "default" }}
          onMouseDown={handleCanvasMouseDown} onMouseUp={handleCanvasMouseUp} onMouseMove={handleCanvasMouseMove}
          onDoubleClick={() => { if (isPenTool) finishPen(); }}
        >
          {/* Grid */}
          {showGrid && (
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)`,
              backgroundSize: "40px 40px", backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            }} />
          )}

          {/* Status bar */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 backdrop-blur-sm">
            <Move className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground font-medium">{activeTool}</span>
            <span className="text-[10px] text-primary font-bold ml-2">{zoom}%</span>
            <span className="text-[10px] text-muted-foreground">· {elements.length} objects</span>
          </div>

          {/* Shape-specific draw preview */}
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
                  width: el.type === "Line" || el.type === "Arrow" || el.type === "Pen" || el.type === "Pencil" ? undefined : el.w,
                  height: el.type === "Line" || el.type === "Arrow" || el.type === "Pen" || el.type === "Pencil" ? undefined : el.h,
                  transform: `rotate(${el.rotation}deg) scaleX(${el.flipH ? -1 : 1}) scaleY(${el.flipV ? -1 : 1})`,
                  transformOrigin: "center center",
                  opacity: el.opacity / 100,
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
                    <textarea
                      autoFocus
                      value={el.text || ""}
                      onChange={(ev) => setElements((prev) => prev.map((x) => x.id === el.id ? { ...x, text: ev.target.value } : x))}
                      onBlur={() => setEditingTextId(null)}
                      className="bg-transparent border border-primary text-foreground outline-none w-full h-full resize-none p-1"
                      style={{ color: el.fillColor, fontSize: el.fontSize, fontWeight: el.fontWeight, fontFamily: el.fontFamily, textAlign: (el.textAlign as any) || "left", fontStyle: el.fontStyle || "normal", textDecoration: el.textDecoration || "none", lineHeight: el.lineHeight ? `${el.lineHeight}` : undefined, letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined }}
                    />
                  ) : (
                    <span className="select-none whitespace-pre-wrap block w-full" style={{ color: el.fillColor, fontSize: el.fontSize, fontWeight: el.fontWeight, fontFamily: el.fontFamily, textAlign: (el.textAlign as any) || "left", fontStyle: el.fontStyle || "normal", textDecoration: el.textDecoration || "none", lineHeight: el.lineHeight ? `${el.lineHeight}` : undefined, letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined }}>{el.text || el.label}</span>
                  )
                ) : (
                  <svg width={el.type === "Line" || el.type === "Arrow" ? Math.abs(el.w) + 20 : el.w} height={el.type === "Line" || el.type === "Arrow" ? Math.abs(el.h) + 20 : el.h} className="overflow-visible">
                    {renderShape(el)}
                  </svg>
                )}
                {/* Selection & resize handles */}
                {selectedId === el.id && !el.locked && el.type !== "Line" && el.type !== "Arrow" && el.type !== "Pen" && (
                  <>
                    <div className="absolute inset-0 border-2 border-primary pointer-events-none" />
                    {resizeHandles.map((h) => (
                      <div key={h} style={getHandleStyle(h, el)}
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

      {/* Right panel - Property Editor */}
      <AnimatePresence>
        {selectedEl && (
          <motion.aside
            initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-16 bottom-0 w-72 glass-strong z-40 overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-border/50">
                <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: selectedEl.fillColor + "33" }}>
                  <Square className="w-3 h-3" style={{ color: selectedEl.fillColor }} />
                </div>
                <div className="flex-1">
                  <input value={selectedEl.label} onChange={(e) => updateSelected({ label: e.target.value })}
                    className="text-sm font-semibold text-foreground bg-transparent outline-none w-full" />
                  <p className="text-[10px] text-muted-foreground">{selectedEl.type}</p>
                </div>
              </div>

              {/* Position & Size */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Position & Size</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[{ label: "X", value: selectedEl.x, key: "x" }, { label: "Y", value: selectedEl.y, key: "y" }, { label: "W", value: selectedEl.w, key: "w" }, { label: "H", value: selectedEl.h, key: "h" }].map((f) => (
                    <div key={f.key} className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1.5">
                      <span className="text-[10px] text-muted-foreground font-medium w-3">{f.label}</span>
                      <input type="number" value={Math.round(f.value)} onChange={(e) => updateSelected({ [f.key]: Number(e.target.value) })}
                        className="flex-1 bg-transparent text-xs text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Rotation & Radius */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1.5">
                  <RotateCcw className="w-3 h-3 text-muted-foreground" />
                  <input type="number" value={selectedEl.rotation} onChange={(e) => updateSelected({ rotation: Number(e.target.value) })}
                    className="flex-1 bg-transparent text-xs text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <span className="text-[9px] text-muted-foreground">°</span>
                </div>
                <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1.5">
                  <CornerUpRight className="w-3 h-3 text-muted-foreground" />
                  <input type="number" value={selectedEl.cornerRadius} onChange={(e) => updateSelected({ cornerRadius: Number(e.target.value) })}
                    className="flex-1 bg-transparent text-xs text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  <span className="text-[9px] text-muted-foreground">px</span>
                </div>
              </div>

              {/* Transform - Flip */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Transform</p>
                <div className="flex gap-1">
                  <button onClick={() => handleFlip("h")} className={`flex-1 p-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors ${selectedEl.flipH ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground hover:text-primary"}`}>
                    <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
                  </button>
                  <button onClick={() => handleFlip("v")} className={`flex-1 p-1.5 rounded-lg text-xs flex items-center justify-center gap-1 transition-colors ${selectedEl.flipV ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground hover:text-primary"}`}>
                    <FlipVertical className="w-3.5 h-3.5" /> Flip V
                  </button>
                </div>
              </div>

              {/* Alignment */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Alignment</p>
                <div className="flex gap-1">
                  {[
                    { icon: AlignLeft, action: "left" }, { icon: AlignCenter, action: "center-h" }, { icon: AlignRight, action: "right" },
                    { icon: AlignStartVertical, action: "top" }, { icon: AlignCenterVertical, action: "center-v" }, { icon: AlignEndVertical, action: "bottom" },
                  ].map((a) => (
                    <button key={a.action} onClick={() => handleAlign(a.action)} className="flex-1 p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                      <a.icon className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fill */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Fill</p>
                <div className="flex items-center gap-2 mb-2">
                  <input type="color" value={selectedEl.fillColor.startsWith("#") ? selectedEl.fillColor : "#8b5cf6"} onChange={(e) => updateSelected({ fillColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-border/50 cursor-pointer bg-transparent" />
                  <input type="text" value={selectedEl.fillColor} onChange={(e) => updateSelected({ fillColor: e.target.value })}
                    className="flex-1 bg-secondary/50 rounded-lg px-2 py-1.5 text-xs text-foreground outline-none" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {presetColors.map((c) => (
                    <button key={c} onClick={() => updateSelected({ fillColor: c })} className="w-5 h-5 rounded border border-border/30 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              {/* Stroke */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Stroke</p>
                <div className="flex items-center gap-2 mb-2">
                  <input type="color" value={selectedEl.strokeColor.startsWith("#") ? selectedEl.strokeColor : "#8b5cf6"} onChange={(e) => updateSelected({ strokeColor: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-border/50 cursor-pointer bg-transparent" />
                  <input type="text" value={selectedEl.strokeColor} onChange={(e) => updateSelected({ strokeColor: e.target.value })}
                    className="flex-1 bg-secondary/50 rounded-lg px-2 py-1.5 text-xs text-foreground outline-none" />
                  <input type="number" value={selectedEl.strokeWidth} onChange={(e) => updateSelected({ strokeWidth: Number(e.target.value) })} min={0} max={20}
                    className="w-10 bg-secondary/50 rounded-lg px-1.5 py-1.5 text-xs text-foreground outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                </div>
                <div className="flex flex-wrap gap-1">
                  {presetColors.map((c) => (
                    <button key={c} onClick={() => updateSelected({ strokeColor: c })} className="w-5 h-5 rounded border border-border/30 hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>

              {/* Opacity */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Opacity</p>
                <div className="flex items-center gap-2">
                  <input type="range" min={0} max={100} value={selectedEl.opacity} onChange={(e) => updateSelected({ opacity: Number(e.target.value) })} className="flex-1 accent-primary h-1" />
                  <span className="text-xs text-foreground w-8 text-right">{selectedEl.opacity}%</span>
                </div>
              </div>

              {/* Text properties */}
              {selectedEl.type === "Text" && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Typography</p>
                  <div className="space-y-2">
                    {/* Font family */}
                    <select value={selectedEl.fontFamily || "Inter"} onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                      className="w-full bg-secondary/50 rounded-lg px-2 py-1.5 text-xs text-foreground outline-none">
                      {fontFamilies.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {/* Size + Weight */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1.5">
                        <span className="text-[9px] text-muted-foreground">Size</span>
                        <input type="number" value={selectedEl.fontSize || 16} onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })} min={8} max={200}
                          className="flex-1 bg-transparent text-xs text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                      <select value={selectedEl.fontWeight || "400"} onChange={(e) => updateSelected({ fontWeight: e.target.value })}
                        className="bg-secondary/50 rounded-lg px-2 py-1.5 text-xs text-foreground outline-none">
                        <option value="100">Thin</option><option value="200">ExtraLight</option><option value="300">Light</option>
                        <option value="400">Regular</option><option value="500">Medium</option><option value="600">Semibold</option>
                        <option value="700">Bold</option><option value="800">ExtraBold</option><option value="900">Black</option>
                      </select>
                    </div>
                    {/* Style toggles */}
                    <div className="flex gap-1">
                      <button onClick={() => updateSelected({ fontWeight: selectedEl.fontWeight === "700" ? "400" : "700" })}
                        className={`flex-1 p-1.5 rounded-lg flex items-center justify-center transition-colors ${selectedEl.fontWeight === "700" ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground"}`}>
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => updateSelected({ fontStyle: selectedEl.fontStyle === "italic" ? "normal" : "italic" })}
                        className={`flex-1 p-1.5 rounded-lg flex items-center justify-center transition-colors ${selectedEl.fontStyle === "italic" ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground"}`}>
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => updateSelected({ textDecoration: selectedEl.textDecoration === "underline" ? "none" : "underline" })}
                        className={`flex-1 p-1.5 rounded-lg flex items-center justify-center transition-colors ${selectedEl.textDecoration === "underline" ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground"}`}>
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Text alignment */}
                    <div className="flex gap-1">
                      {[
                        { icon: AlignLeft, val: "left" }, { icon: AlignCenter, val: "center" }, { icon: AlignRight, val: "right" }, { icon: AlignJustify, val: "justify" },
                      ].map((a) => (
                        <button key={a.val} onClick={() => updateSelected({ textAlign: a.val })}
                          className={`flex-1 p-1.5 rounded-lg flex items-center justify-center transition-colors ${(selectedEl.textAlign || "left") === a.val ? "bg-primary/20 text-primary" : "hover:bg-primary/10 text-muted-foreground"}`}>
                          <a.icon className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                    {/* Line height + Letter spacing */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1.5">
                        <span className="text-[9px] text-muted-foreground">LH</span>
                        <input type="number" step={0.1} value={selectedEl.lineHeight || 1.5} onChange={(e) => updateSelected({ lineHeight: Number(e.target.value) })}
                          className="flex-1 bg-transparent text-xs text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                      <div className="flex items-center gap-1 bg-secondary/50 rounded-lg px-2 py-1.5">
                        <span className="text-[9px] text-muted-foreground">LS</span>
                        <input type="number" step={0.5} value={selectedEl.letterSpacing || 0} onChange={(e) => updateSelected({ letterSpacing: Number(e.target.value) })}
                          className="flex-1 bg-transparent text-xs text-foreground outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-border/50 pt-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Actions</p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button onClick={handleDuplicate} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                    <Copy className="w-3 h-3" /> Duplicate
                  </button>
                  <button onClick={handleDelete} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                  <button onClick={() => updateSelected({ locked: !selectedEl.locked })} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                    {selectedEl.locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {selectedEl.locked ? "Unlock" : "Lock"}
                  </button>
                  <button onClick={() => updateSelected({ visible: !selectedEl.visible })} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors">
                    {selectedEl.visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {selectedEl.visible ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Floating mic */}
      <motion.button
        onClick={() => setMicActive(!micActive)}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
          micActive ? "gradient-purple neon-glow" : "glass hover:bg-primary/10"
        }`}
        style={{ right: selectedEl ? 304 : 24 }}
      >
        {micActive ? <MicOff className="w-5 h-5 text-primary-foreground" /> : <Mic className="w-5 h-5 text-primary" />}
        {micActive && <motion.div className="absolute inset-0 rounded-full border-2 border-primary/30" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />}
      </motion.button>

      <Chatbot />
    </div>
  );
};

export default WorkspaceCanvas;
