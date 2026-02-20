import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Plus, MousePointer, Type, Image, Square, Layout, Circle,
  Minus, ArrowUpRight, Pen, Hand, ZoomIn, ZoomOut, Users, Move, Copy,
  Trash2, Layers, Star, Diamond, Triangle, Hexagon, AlignLeft, AlignCenter,
  AlignRight, FlipHorizontal, FlipVertical, Lock, Unlock, Eye, EyeOff,
  Undo, Redo, Grid3X3
} from "lucide-react";
import ComponentExplainer from "./ComponentExplainer";
import Chatbot from "./Chatbot";

type CanvasElement = {
  id: number;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  color: string;
  visible: boolean;
  locked: boolean;
  points?: { x: number; y: number }[];
  text?: string;
};

const toolbarItems = [
  { icon: MousePointer, label: "Select", shortcut: "V" },
  { icon: Hand, label: "Pan", shortcut: "H" },
  { icon: Square, label: "Rectangle", shortcut: "R" },
  { icon: Circle, label: "Ellipse", shortcut: "O" },
  { icon: Triangle, label: "Triangle", shortcut: "T" },
  { icon: Diamond, label: "Diamond", shortcut: "D" },
  { icon: Star, label: "Star", shortcut: "S" },
  { icon: Hexagon, label: "Polygon", shortcut: "G" },
  { icon: Minus, label: "Line", shortcut: "L" },
  { icon: ArrowUpRight, label: "Arrow", shortcut: "A" },
  { icon: Pen, label: "Pen", shortcut: "P" },
  { icon: Type, label: "Text", shortcut: "X" },
  { icon: Image, label: "Image", shortcut: "I" },
  { icon: Layout, label: "Frame", shortcut: "F" },
];

const bottomTools = [
  { icon: Undo, label: "Undo", action: "undo" },
  { icon: Redo, label: "Redo", action: "redo" },
  { icon: ZoomOut, label: "Zoom Out", action: "zoomOut" },
  { icon: ZoomIn, label: "Zoom In", action: "zoomIn" },
  { icon: Grid3X3, label: "Grid", action: "grid" },
  { icon: Copy, label: "Duplicate", action: "duplicate" },
  { icon: Trash2, label: "Delete", action: "delete" },
  { icon: Layers, label: "Layers", action: "layers" },
];

let nextId = 10;
const shapeColors = [
  "hsl(263 70% 58%)", "hsl(330 80% 60%)", "hsl(217 91% 60%)",
  "hsl(160 70% 50%)", "hsl(45 90% 55%)", "hsl(0 80% 60%)",
];

const WorkspaceCanvas = () => {
  const [micActive, setMicActive] = useState(false);
  const [activeTool, setActiveTool] = useState("Select");
  const [showCollab, setShowCollab] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [elements, setElements] = useState<CanvasElement[]>([
    { id: 1, type: "Rectangle", x: 120, y: 80, w: 260, h: 140, label: "Hero Section", color: shapeColors[0], visible: true, locked: false },
    { id: 2, type: "Ellipse", x: 450, y: 200, w: 100, h: 100, label: "Avatar", color: shapeColors[1], visible: true, locked: false },
    { id: 3, type: "Text", x: 120, y: 280, w: 200, h: 40, label: "Heading Text", color: shapeColors[2], visible: true, locked: false, text: "Hello World" },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [penPoints, setPenPoints] = useState<{ x: number; y: number }[]>([]);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [dragging, setDragging] = useState<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<number | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const collabRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);

  // Click outside to close collab/layers panels
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (collabRef.current && !collabRef.current.contains(e.target as Node)) {
        setShowCollab(false);
      }
      if (layersRef.current && !layersRef.current.contains(e.target as Node)) {
        setShowLayers(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingTextId) return;
      const key = e.key.toUpperCase();
      const tool = toolbarItems.find((t) => t.shortcut === key);
      if (tool) { setActiveTool(tool.label); e.preventDefault(); }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          handleDelete();
          e.preventDefault();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { handleUndo(); e.preventDefault(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") { handleRedo(); e.preventDefault(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") { handleDuplicate(); e.preventDefault(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedId, editingTextId, elements, historyIdx]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIdx + 1);
      newHistory.push(JSON.parse(JSON.stringify(elements)));
      return newHistory;
    });
    setHistoryIdx((i) => i + 1);
  }, [elements, historyIdx]);

  const handleUndo = () => {
    if (historyIdx >= 0) {
      setElements(JSON.parse(JSON.stringify(history[historyIdx])));
      setHistoryIdx((i) => i - 1);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      setElements(JSON.parse(JSON.stringify(history[historyIdx + 1])));
      setHistoryIdx((i) => i + 1);
    }
  };

  const handleDelete = () => {
    if (!selectedId) return;
    pushHistory();
    setElements((prev) => prev.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const handleDuplicate = () => {
    if (!selectedId) return;
    const el = elements.find((e) => e.id === selectedId);
    if (!el) return;
    pushHistory();
    const newEl = { ...el, id: nextId++, x: el.x + 20, y: el.y + 20, label: `${el.label} copy` };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const isDrawingTool = ["Rectangle", "Ellipse", "Triangle", "Diamond", "Star", "Polygon", "Line", "Arrow", "Frame", "Text"].includes(activeTool);
  const isPenTool = activeTool === "Pen";

  const getCanvasPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current && !isDrawingTool && !isPenTool) return;
    const pos = getCanvasPos(e);

    if (isPenTool) {
      setPenPoints((prev) => [...prev, pos]);
      return;
    }

    if (isDrawingTool) {
      setDrawing(true);
      setDrawStart(pos);
      return;
    }

    if (activeTool === "Select") {
      setSelectedId(null);
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (drawing && drawStart) {
      const pos = getCanvasPos(e);
      const x = Math.min(drawStart.x, pos.x);
      const y = Math.min(drawStart.y, pos.y);
      const w = Math.max(Math.abs(pos.x - drawStart.x), 20);
      const h = Math.max(Math.abs(pos.y - drawStart.y), 20);
      pushHistory();
      const color = shapeColors[Math.floor(Math.random() * shapeColors.length)];
      const newEl: CanvasElement = {
        id: nextId++, type: activeTool, x, y, w, h,
        label: `${activeTool} ${nextId}`, color, visible: true, locked: false,
      };
      if (activeTool === "Text") {
        newEl.text = "Double-click to edit";
        newEl.w = 180;
        newEl.h = 36;
      }
      if (activeTool === "Line" || activeTool === "Arrow") {
        newEl.x = drawStart.x;
        newEl.y = drawStart.y;
        newEl.w = pos.x - drawStart.x;
        newEl.h = pos.y - drawStart.y;
      }
      setElements((prev) => [...prev, newEl]);
      setSelectedId(newEl.id);
      setDrawing(false);
      setDrawStart(null);
    }

    if (dragging) setDragging(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const pos = getCanvasPos(e);
      setElements((prev) =>
        prev.map((el) =>
          el.id === dragging.id
            ? { ...el, x: pos.x - dragging.offsetX, y: pos.y - dragging.offsetY }
            : el
        )
      );
    }
  };

  const finishPen = () => {
    if (penPoints.length < 2) { setPenPoints([]); return; }
    pushHistory();
    const minX = Math.min(...penPoints.map((p) => p.x));
    const minY = Math.min(...penPoints.map((p) => p.y));
    const newEl: CanvasElement = {
      id: nextId++, type: "Pen", x: minX, y: minY, w: 0, h: 0,
      label: `Path ${nextId}`, color: shapeColors[4], visible: true, locked: false,
      points: penPoints.map((p) => ({ x: p.x - minX, y: p.y - minY })),
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newEl.id);
    setPenPoints([]);
  };

  const handleBottomAction = (action: string) => {
    switch (action) {
      case "undo": handleUndo(); break;
      case "redo": handleRedo(); break;
      case "zoomIn": setZoom((z) => Math.min(z + 10, 200)); break;
      case "zoomOut": setZoom((z) => Math.max(z - 10, 50)); break;
      case "grid": setShowGrid((g) => !g); break;
      case "duplicate": handleDuplicate(); break;
      case "delete": handleDelete(); break;
      case "layers": setShowLayers((l) => !l); break;
    }
  };

  const renderShape = (el: CanvasElement) => {
    const s = { fill: el.color + "33", stroke: el.color, strokeWidth: 2 };
    switch (el.type) {
      case "Rectangle": case "Frame":
        return <rect x={1} y={1} width={el.w - 2} height={el.h - 2} rx={el.type === "Frame" ? 0 : 8} {...s} />;
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
        return <line x1={0} y1={0} x2={el.w} y2={el.h} stroke={el.color} strokeWidth={2} />;
      case "Arrow": {
        const len = Math.sqrt(el.w ** 2 + el.h ** 2);
        const ax = el.w / len, ay = el.h / len;
        const px = -ay, py = ax;
        const tipX = el.w, tipY = el.h;
        const arrowSize = 12;
        return (
          <>
            <line x1={0} y1={0} x2={tipX} y2={tipY} stroke={el.color} strokeWidth={2} />
            <polygon
              points={`${tipX},${tipY} ${tipX - ax * arrowSize + px * 5},${tipY - ay * arrowSize + py * 5} ${tipX - ax * arrowSize - px * 5},${tipY - ay * arrowSize - py * 5}`}
              fill={el.color}
            />
          </>
        );
      }
      case "Pen":
        if (el.points && el.points.length > 1) {
          const d = el.points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
          return <path d={d} fill="none" stroke={el.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
        }
        return null;
      default: return null;
    }
  };

  const selectedEl = selectedId ? elements.find((e) => e.id === selectedId) || null : null;

  return (
    <div className="relative min-h-screen pt-16 flex">
      {/* Left toolbar */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-16 bottom-0 w-14 glass-strong flex flex-col items-center pt-3 pb-3 gap-0.5 z-30 overflow-y-auto"
      >
        {toolbarItems.map((item) => (
          <button
            key={item.label}
            title={`${item.label} (${item.shortcut})`}
            onClick={() => {
              setActiveTool(item.label);
              if (isPenTool && item.label !== "Pen") finishPen();
            }}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
              activeTool === item.label
                ? "gradient-purple text-primary-foreground neon-glow-sm"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}

        <div className="w-8 h-px bg-border/50 my-1 shrink-0" />

        {bottomTools.map((item) => (
          <button
            key={item.label}
            title={item.label}
            onClick={() => handleBottomAction(item.action)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
              (item.action === "grid" && showGrid) || (item.action === "layers" && showLayers)
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
          >
            <item.icon className="w-4 h-4" />
          </button>
        ))}

        <div className="flex-1" />

        {/* Collaboration */}
        <button
          title="Collaborate"
          onClick={() => setShowCollab(!showCollab)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0 ${
            showCollab ? "gradient-purple text-primary-foreground neon-glow-sm" : "text-muted-foreground hover:text-primary hover:bg-primary/10"
          }`}
        >
          <Users className="w-4 h-4" />
        </button>

        <button
          title="Add component"
          onClick={() => {
            pushHistory();
            const newEl: CanvasElement = {
              id: nextId++, type: "Rectangle", x: 200 + Math.random() * 100, y: 150 + Math.random() * 100,
              w: 120, h: 80, label: `Component ${nextId}`, color: shapeColors[Math.floor(Math.random() * shapeColors.length)],
              visible: true, locked: false,
            };
            setElements((prev) => [...prev, newEl]);
            setSelectedId(newEl.id);
          }}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </motion.aside>

      {/* Collaboration panel */}
      <AnimatePresence>
        {showCollab && (
          <motion.div
            ref={collabRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-16 top-20 w-64 glass-strong rounded-2xl p-4 z-30"
          >
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Collaboration</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Invite friends to work together in real-time</p>
            <input
              placeholder="Enter email to invite..."
              className="w-full bg-secondary/50 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 mb-2"
            />
            <button className="w-full py-2 rounded-xl gradient-purple text-primary-foreground text-xs font-semibold hover:scale-[1.02] transition-transform">
              Send Invite
            </button>
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground mb-2">Online now</p>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full gradient-purple" />
                <span className="text-xs text-foreground">You</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layers panel */}
      <AnimatePresence>
        {showLayers && (
          <motion.div
            ref={layersRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-16 top-20 w-56 glass-strong rounded-2xl p-3 z-30 max-h-[60vh] overflow-y-auto"
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Layers</h3>
            </div>
            {[...elements].reverse().map((el) => (
              <button
                key={el.id}
                onClick={() => setSelectedId(el.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors mb-0.5 ${
                  selectedId === el.id ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: el.color }} />
                <span className="truncate flex-1 text-left">{el.label}</span>
                <button
                  onClick={(ev) => { ev.stopPropagation(); setElements((p) => p.map((x) => x.id === el.id ? { ...x, visible: !x.visible } : x)); }}
                  className="p-0.5 hover:text-foreground"
                >
                  {el.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button
                  onClick={(ev) => { ev.stopPropagation(); setElements((p) => p.map((x) => x.id === el.id ? { ...x, locked: !x.locked } : x)); }}
                  className="p-0.5 hover:text-foreground"
                >
                  {el.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <div className="flex-1 ml-14 mr-72 p-8">
        <motion.div
          ref={canvasRef}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[70vh] rounded-2xl glass overflow-hidden"
          style={{ cursor: isPenTool ? "crosshair" : isDrawingTool ? "crosshair" : activeTool === "Pan" ? "grab" : "default" }}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onMouseMove={handleCanvasMouseMove}
          onDoubleClick={() => { if (isPenTool) finishPen(); }}
        >
          {/* Grid */}
          {showGrid && (
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px),
                                  linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />
          )}

          {/* Tool & zoom indicator */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/80 backdrop-blur-sm">
            <Move className="w-3 h-3 text-primary" />
            <span className="text-[10px] text-muted-foreground font-medium">{activeTool} Tool</span>
            <span className="text-[10px] text-primary font-bold ml-2">{zoom}%</span>
          </div>

          {/* SVG layer for shapes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "0 0" }}>
            {/* Drawing preview */}
            {drawing && drawStart && (
              <rect
                x={Math.min(drawStart.x, drawStart.x)}
                y={Math.min(drawStart.y, drawStart.y)}
                width={10}
                height={10}
                fill="hsl(var(--primary) / 0.1)"
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            )}
            {/* Pen preview */}
            {penPoints.length > 0 && (
              <polyline
                points={penPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="4 2"
              />
            )}
          </svg>

          {/* Elements */}
          {elements.filter((el) => el.visible).map((el) => (
            <div
              key={el.id}
              className={`absolute transition-shadow duration-200 ${el.locked ? "pointer-events-none opacity-60" : "cursor-move"} ${
                selectedId === el.id ? "ring-2 ring-primary" : ""
              }`}
              style={{
                left: el.x,
                top: el.y,
                width: el.type === "Line" || el.type === "Arrow" || el.type === "Pen" ? undefined : el.w,
                height: el.type === "Line" || el.type === "Arrow" || el.type === "Pen" ? undefined : el.h,
                transform: `scale(${zoom / 100})`,
                transformOrigin: "0 0",
              }}
              onClick={(e) => { e.stopPropagation(); if (activeTool === "Select") setSelectedId(el.id === selectedId ? null : el.id); }}
              onMouseDown={(e) => {
                if (activeTool !== "Select" || el.locked) return;
                e.stopPropagation();
                const pos = getCanvasPos(e);
                setDragging({ id: el.id, offsetX: pos.x - el.x, offsetY: pos.y - el.y });
                setSelectedId(el.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (el.type === "Text") setEditingTextId(el.id);
              }}
            >
              {el.type === "Text" ? (
                editingTextId === el.id ? (
                  <input
                    autoFocus
                    value={el.text || ""}
                    onChange={(ev) => setElements((prev) => prev.map((x) => x.id === el.id ? { ...x, text: ev.target.value } : x))}
                    onBlur={() => setEditingTextId(null)}
                    onKeyDown={(ev) => { if (ev.key === "Enter") setEditingTextId(null); }}
                    className="bg-transparent border-b border-primary text-foreground text-sm outline-none w-full"
                    style={{ color: el.color }}
                  />
                ) : (
                  <span className="text-sm font-medium select-none" style={{ color: el.color }}>
                    {el.text || el.label}
                  </span>
                )
              ) : (
                <svg width={el.type === "Line" || el.type === "Arrow" ? Math.abs(el.w) + 20 : el.w} height={el.type === "Line" || el.type === "Arrow" ? Math.abs(el.h) + 20 : el.h} className="overflow-visible">
                  {renderShape(el)}
                </svg>
              )}
              {selectedId === el.id && (
                <div className="absolute -bottom-5 left-0 text-[9px] text-primary font-medium whitespace-nowrap">{el.label}</div>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Right panel - Component Explainer */}
      <motion.aside
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed right-0 top-16 bottom-0 w-72 glass-strong z-40 overflow-y-auto"
      >
        <ComponentExplainer
          selectedComponent={
            selectedEl ? { id: selectedEl.id, type: selectedEl.type.toLowerCase(), label: selectedEl.label } : null
          }
        />
      </motion.aside>

      {/* Floating mic button */}
      <motion.button
        onClick={() => setMicActive(!micActive)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-8 right-80 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${
          micActive ? "gradient-purple neon-glow" : "glass hover:bg-primary/10"
        }`}
      >
        {micActive ? <MicOff className="w-5 h-5 text-primary-foreground" /> : <Mic className="w-5 h-5 text-primary" />}
        {micActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default WorkspaceCanvas;
