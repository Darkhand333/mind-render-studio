/* @refresh reset */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MousePointer, Square, Circle, Type, Image, Layout, Plus, Hand,
  ZoomIn, ZoomOut, Move, Layers, Star, Diamond, Triangle, Hexagon,
  Undo, Redo, Grid3X3, Download, PanelLeft, PanelRight, Pen, Pencil,
  Paintbrush, Minus, ArrowUpRight, Box, Slice, Navigation, Scale,
  FileText, File, Search, Package, Component, Home, X, Sparkles,
  Eye, EyeOff, Lock, Unlock, ChevronRight, ChevronDown, Keyboard, Info,
  Play, Link, Unlink, Ruler as RulerIcon, MoreHorizontal, Copy, Trash2,
  Edit3, ExternalLink, FolderPlus, RotateCw, Group, Ungroup, Save, Cloud, LayoutTemplate
} from "lucide-react";
import ComponentExplainer from "../ComponentExplainer";
import HomeSidebar from "./HomeSidebar";
import RightPanel from "./RightPanel";
import TemplatePickerModal from "./TemplatePickerModal";
import { CanvasElement, LeftTab, defaultColors, toolGroups } from "./types";
import { useProjectAutoSave } from "@/hooks/useProjectAutoSave";
import { useAuth } from "@/contexts/AuthContext";

const iconMap: Record<string, any> = {
  MousePointer, Hand, Scale, Square, Circle, Triangle, Diamond, Star, Hexagon,
  Minus, ArrowUpRight, Pen, Pencil, Paintbrush, Type, Image, Layout, Box, Slice, Navigation,
};

const allTools = toolGroups.flatMap(g => g.tools);
let nextId = 1;

// Snap guide types
type SnapGuide = { axis: "x" | "y"; position: number; type: "edge" | "center" };
type PrototypeLink = { fromId: number; toId: number; trigger: "click" | "hover"; animation: "instant" | "slide" | "fade" };

const SNAP_THRESHOLD = 6;
const RULER_SIZE = 20;

const WorkspaceCanvas = () => {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState("Select");
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [projectName, setProjectName] = useState("Untitled");
  const [showFirstTime, setShowFirstTime] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
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
  const [didDrag, setDidDrag] = useState(false);
  const [resizing, setResizing] = useState<{ id: number; handle: string; startX: number; startY: number; startW: number; startH: number; startElX: number; startElY: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<number | null>(null);
  const [leftSidebarView, setLeftSidebarView] = useState<"home" | "workspace">("workspace");
  const [leftTab, setLeftTab] = useState<LeftTab>("layers");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [pages, setPages] = useState([{ id: 1, name: "Page 1", active: true }]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [activeSnapGuides, setActiveSnapGuides] = useState<SnapGuide[]>([]);
  const [prototypeMode, setPrototypeMode] = useState(false);
  const [prototypeLinks, setPrototypeLinks] = useState<PrototypeLink[]>([]);
  const [linkingFrom, setLinkingFrom] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewCurrentFrame, setPreviewCurrentFrame] = useState<number | null>(null);
  const [previewTransition, setPreviewTransition] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState(40);
  const [gridStyle, setGridStyle] = useState<"lines" | "dots" | "cross">("lines");
  const [isDragOver, setIsDragOver] = useState(false);
  // Page context menu
  const [pageContextMenu, setPageContextMenu] = useState<{ pageId: number; x: number; y: number } | null>(null);
  const [renamingPageId, setRenamingPageId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showProjectBrowser, setShowProjectBrowser] = useState(false);
  const [projectBrowserLoading, setProjectBrowserLoading] = useState(false);
  const [recentProjects, setRecentProjects] = useState<Array<{ id: string; name: string; project_type: string; updated_at: string; created_at: string }>>([]);
  const [focusedElementId, setFocusedElementId] = useState<number | null>(null);
  // Rotation handle
  const [rotating, setRotating] = useState<{ id: number; startAngle: number; startRotation: number } | null>(null);
  // Bezier editing
  const [editingBezier, setEditingBezier] = useState<number | null>(null);
  const [draggingCP, setDraggingCP] = useState<{ pointIndex: number; cpType: "cp1" | "cp2" } | null>(null);
  // Multi-select for grouping
  const [multiSelect, setMultiSelect] = useState<number[]>([]);

  const canvasRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const findInputRef = useRef<HTMLInputElement>(null);
  const canvasInteractionRef = useRef(false);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedBackupRef = useRef<string | null>(null);

  const applyWorkspaceData = useCallback((data: { elements?: any[]; pages?: any[]; canvasSettings?: any; name?: string }) => {
    const nextElements = Array.isArray(data.elements) ? data.elements : [];
    const nextPages = Array.isArray(data.pages) && data.pages.length > 0 ? data.pages : [{ id: 1, name: "Page 1", active: true }];
    setElements(nextElements);
    setPages(nextPages);
    const maxId = Math.max(...nextElements.map((e: any) => e.id || 0), 0);
    nextId = maxId + 1;
    setSelectedId(null);
    setLastSelectedId(null);
    setMultiSelect([]);
    setHistory([]);
    setHistoryIdx(-1);
    setFocusedElementId(null);
    setZoom(data.canvasSettings?.zoom ?? 100);
    setPanOffset(data.canvasSettings?.panOffset ?? { x: 0, y: 0 });
    setShowGrid(data.canvasSettings?.showGrid ?? true);
    setGridSize(data.canvasSettings?.gridSize ?? 40);
    setGridStyle(data.canvasSettings?.gridStyle ?? "lines");
    setProjectName(data.name || "Untitled");
  }, []);

  // Callback to load saved project data into state
  const handleLoadProject = useCallback((data: { elements: any[]; pages: any[]; canvasSettings?: any; name: string }) => {
    applyWorkspaceData(data);
  }, [applyWorkspaceData]);

  // Auto-save
  const { projectId, saving, lastSaved, saveNow, rename: renameProject, loadProject, createProject, listProjects } = useProjectAutoSave(
    projectName,
    { elements, pages, canvasSettings: { zoom, panOffset, showGrid, gridSize, gridStyle } },
    handleLoadProject
  );

  // Voice command listener is set up after handleVoiceCommand is defined (below)

  const persistWorkspaceBackup = useCallback((payload: { elements: any[]; pages: any[]; canvasSettings: any; name: string }) => {
    try {
      const serialized = JSON.stringify(payload);
      hydratedBackupRef.current = serialized;
      window.localStorage.setItem("protocraft:workspace-backup", serialized);
    } catch {
      // no-op
    }
  }, []);

  const focusElementInCanvas = useCallback((elementId: number) => {
    const el = elements.find((item) => item.id === elementId);
    const canvas = canvasRef.current;
    if (!el || !canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const targetZoom = Math.max(60, Math.min(zoom, 120));
    const scale = targetZoom / 100;
    const margin = 80;
    const nextPan = {
      x: canvasRect.width / 2 - (el.x + el.w / 2) * scale,
      y: canvasRect.height / 2 - (el.y + el.h / 2) * scale,
    };

    setZoom(targetZoom);
    setPanOffset(nextPan);
    setSelectedId(elementId);
    setLastSelectedId(elementId);
    setFocusedElementId(elementId);

    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    focusTimerRef.current = setTimeout(() => setFocusedElementId(null), 1800);
  }, [elements, zoom]);

  const refreshRecentProjects = useCallback(async () => {
    setProjectBrowserLoading(true);
    try {
      const projects = await listProjects(30);
      setRecentProjects(projects);
    } finally {
      setProjectBrowserLoading(false);
    }
  }, [listProjects]);

  const handleOpenExistingProject = useCallback(async (pid: string) => {
    await loadProject(pid);
    setShowProjectBrowser(false);
  }, [loadProject]);

  const handleImportGeneratedUi = useCallback(async (raw: string) => {
    try {
      const data = JSON.parse(raw);
      const payload = {
        elements: data.elements || [],
        pages: data.pages || [{ id: 1, name: "Page 1", active: true }],
        canvasSettings: data.canvasSettings || { zoom: 75, panOffset: { x: 40, y: 30 }, showGrid: true, gridSize: 40, gridStyle: "lines" },
        name: data.name || data.prompt || "Generated UI",
      };
      applyWorkspaceData(payload);
      persistWorkspaceBackup(payload);
      await createProject(payload.name, payload, "design");
      localStorage.removeItem("protocraft:imported-ui");
      const url = new URL(window.location.href);
      url.searchParams.delete("import");
      url.searchParams.delete("source");
      window.history.replaceState({}, "", url.toString());
      setLeftSidebarView("workspace");
    } catch {
      // no-op
    }
  }, [applyWorkspaceData, createProject, persistWorkspaceBackup]);

  // Handle import from Generate UI page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("import") === "generated") {
      const raw = localStorage.getItem("protocraft:imported-ui");
      if (raw) void handleImportGeneratedUi(raw);
    }
  }, [handleImportGeneratedUi]);

  useEffect(() => {
    const backup = {
      elements,
      pages,
      canvasSettings: { zoom, panOffset, showGrid, gridSize, gridStyle },
      name: projectName,
    };
    persistWorkspaceBackup(backup);
  }, [elements, gridSize, gridStyle, pages, panOffset, persistWorkspaceBackup, projectName, showGrid, zoom]);

  useEffect(() => {
    if (elements.length > 0 || projectId) return;
    try {
      const raw = window.localStorage.getItem("protocraft:workspace-backup");
      if (!raw || raw === hydratedBackupRef.current) return;
      const data = JSON.parse(raw);
      hydratedBackupRef.current = raw;
      applyWorkspaceData(data);
    } catch {
      // no-op
    }
  }, [applyWorkspaceData, elements.length, projectId]);

  useEffect(() => {
    if (!showProjectBrowser) return;
    void refreshRecentProjects();
  }, [refreshRecentProjects, showProjectBrowser]);

  useEffect(() => {
    if (selectedId !== null) setLastSelectedId(selectedId);
  }, [selectedId]);

  useEffect(() => {
    return () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, []);

  // Focus find input when tab changes
  useEffect(() => {
    if (leftTab === "find" && findInputRef.current) {
      setTimeout(() => findInputRef.current?.focus(), 100);
    }
  }, [leftTab]);

  // Canvas-only zoom (wheel event) — zooms toward cursor position
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        // Pinch zoom toward cursor
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const delta = e.deltaY > 0 ? -5 : 5;

        setZoom((prevZoom) => {
          const newZoom = Math.max(10, Math.min(800, prevZoom + delta));
          const scaleFactor = newZoom / prevZoom;
          setPanOffset((prev) => ({
            x: mouseX - scaleFactor * (mouseX - prev.x),
            y: mouseY - scaleFactor * (mouseY - prev.y),
          }));
          return newZoom;
        });
        return;
      }

      if (e.shiftKey) {
        // Shift + scroll pans horizontally (Figma-like)
        const horizontalDelta = Math.abs(e.deltaX) > 0 ? e.deltaX : e.deltaY;
        setPanOffset((prev) => ({
          x: prev.x - horizontalDelta,
          y: prev.y,
        }));
        return;
      }

      // Regular scroll pans normally
      setPanOffset((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
    };

    canvas.addEventListener("wheel", handler, { passive: false });
    return () => canvas.removeEventListener("wheel", handler);
  }, []);

  // Track if last pointer interaction happened inside the canvas
  useEffect(() => {
    const onPointerDownCapture = (event: MouseEvent) => {
      const target = event.target as Node | null;
      canvasInteractionRef.current = !!(canvasRef.current && target && canvasRef.current.contains(target));
    };

    window.addEventListener("mousedown", onPointerDownCapture, true);
    return () => window.removeEventListener("mousedown", onPointerDownCapture, true);
  }, []);

  // Close page context menu on click outside
  useEffect(() => {
    if (!pageContextMenu) return;
    const handler = () => setPageContextMenu(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [pageContextMenu]);

  const activeElId = selectedId ?? lastSelectedId;
  const activeEl = activeElId ? elements.find(e => e.id === activeElId) || null : null;

  const selectAllVisibleElements = useCallback(() => {
    setMultiSelect(elements.filter((el) => el.visible).map((el) => el.id));
    setSelectedId(null);
  }, [elements]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingTextId || renamingPageId) return;

      const activeNode = document.activeElement as HTMLElement | null;
      const isTypingField = !!activeNode && (
        activeNode.tagName === "INPUT" ||
        activeNode.tagName === "TEXTAREA" ||
        activeNode.tagName === "SELECT" ||
        activeNode.isContentEditable
      );

      const key = e.key.toUpperCase();
      const tool = allTools.find((t) => t.shortcut === key);
      if (tool && !e.metaKey && !e.ctrlKey) {
        if (tool.label === "Image") {
          imageInputRef.current?.click();
          e.preventDefault();
          return;
        }
        setActiveTool(tool.label);
        e.preventDefault();
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          handleDelete();
          e.preventDefault();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { handleUndo(); e.preventDefault(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") { handleRedo(); e.preventDefault(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") { e.preventDefault(); handleDuplicate(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "g") { e.preventDefault(); handleGroupSelected(); }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
        if (isTypingField || !canvasInteractionRef.current) return;
        e.preventDefault();
        selectAllVisibleElements();
      }
      if (e.key === "Escape") {
        if (previewMode) { setPreviewMode(false); setPreviewCurrentFrame(null); }
        else if (editingBezier) { setEditingBezier(null); }
        else { setSelectedId(null); setActiveTool("Select"); setMultiSelect([]); }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    selectedId,
    editingTextId,
    previewMode,
    renamingPageId,
    editingBezier,
    selectAllVisibleElements,
  ]);

  const pushHistory = useCallback(() => {
    setHistory(prev => { const h = prev.slice(0, historyIdx + 1); h.push(JSON.parse(JSON.stringify(elements))); return h; });
    setHistoryIdx(i => i + 1);
  }, [elements, historyIdx]);

  const handleUndo = () => { if (historyIdx >= 0) { setElements(JSON.parse(JSON.stringify(history[historyIdx]))); setHistoryIdx(i => i - 1); } };
  const handleRedo = () => { if (historyIdx < history.length - 1) { setElements(JSON.parse(JSON.stringify(history[historyIdx + 1]))); setHistoryIdx(i => i + 1); } };
  const handleDelete = () => { if (!selectedId) return; pushHistory(); setElements(p => p.filter(el => el.id !== selectedId)); setSelectedId(null); setLastSelectedId(null); };
  const handleDuplicate = () => {
    if (!selectedId) return;
    const el = elements.find(e => e.id === selectedId);
    if (!el) return;
    pushHistory();
    const newEl = { ...el, id: nextId++, x: el.x + 20, y: el.y + 20, label: `${el.label} copy` };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  // Group selected elements
  const handleGroupSelected = () => {
    const ids = multiSelect.length > 1 ? multiSelect : selectedId ? [selectedId] : [];
    if (ids.length < 2) return;
    pushHistory();
    const groupId = nextId++;
    const groupEl: CanvasElement = {
      id: groupId, type: "Frame", isGroup: true, children: ids,
      x: Math.min(...ids.map(id => elements.find(e => e.id === id)?.x || 0)),
      y: Math.min(...ids.map(id => elements.find(e => e.id === id)?.y || 0)),
      w: 0, h: 0, label: `Group ${groupId}`,
      fillColor: "transparent", strokeColor: "hsl(263, 70%, 58%)", strokeWidth: 1,
      opacity: 100, rotation: 0, cornerRadius: 0, visible: true, locked: false,
    };
    const maxX = Math.max(...ids.map(id => { const e = elements.find(e => e.id === id); return e ? e.x + e.w : 0; }));
    const maxY = Math.max(...ids.map(id => { const e = elements.find(e => e.id === id); return e ? e.y + e.h : 0; }));
    groupEl.w = maxX - groupEl.x;
    groupEl.h = maxY - groupEl.y;
    setElements(prev => [...prev.map(el => ids.includes(el.id) ? { ...el, groupId } : el), groupEl]);
    setSelectedId(groupId);
    setMultiSelect([]);
  };

  const handleUngroupSelected = () => {
    if (!selectedId) return;
    const group = elements.find(e => e.id === selectedId && e.isGroup);
    if (!group) return;
    pushHistory();
    setElements(prev => prev.filter(e => e.id !== selectedId).map(e => e.groupId === selectedId ? { ...e, groupId: undefined } : e));
    setSelectedId(null);
  };

  // Page operations
  const handleDeletePage = (pageId: number) => {
    if (pages.length <= 1) return;
    setPages(prev => {
      const filtered = prev.filter(p => p.id !== pageId);
      if (!filtered.some(p => p.active)) filtered[0].active = true;
      return filtered;
    });
    setPageContextMenu(null);
  };

  const handleDuplicatePage = (pageId: number) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    const newId = Math.max(...pages.map(p => p.id)) + 1;
    setPages(prev => [...prev, { id: newId, name: `${page.name} (Copy)`, active: false }]);
    setPageContextMenu(null);
  };

  const handleRenamePage = (pageId: number) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    setRenamingPageId(pageId);
    setRenameValue(page.name);
    setPageContextMenu(null);
  };

  const commitRename = () => {
    if (renamingPageId && renameValue.trim()) {
      setPages(prev => prev.map(p => p.id === renamingPageId ? { ...p, name: renameValue.trim() } : p));
    }
    setRenamingPageId(null);
  };

  const handleCopyPageLink = (pageId: number) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;
    navigator.clipboard.writeText(`${window.location.origin}/workspace?page=${page.name}`);
    setPageContextMenu(null);
  };

  // Rotation via drag handle
  const handleRotationMouseDown = (e: React.MouseEvent, elId: number) => {
    e.stopPropagation();
    e.preventDefault();
    const el = elements.find(e => e.id === elId);
    if (!el) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = el.x + el.w / 2;
    const centerY = el.y + el.h / 2;
    const scaleFactor = zoom / 100;
    const mouseX = (e.clientX - rect.left - panOffset.x) / scaleFactor;
    const mouseY = (e.clientY - rect.top - panOffset.y) / scaleFactor;
    const startAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
    pushHistory();
    setRotating({ id: elId, startAngle, startRotation: el.rotation });

    const onMove = (ev: MouseEvent) => {
      const mx = (ev.clientX - rect.left - panOffset.x) / scaleFactor;
      const my = (ev.clientY - rect.top - panOffset.y) / scaleFactor;
      const currentAngle = Math.atan2(my - centerY, mx - centerX) * (180 / Math.PI);
      let newRotation = el.rotation + (currentAngle - startAngle);
      // Snap to 15-degree increments when holding shift
      if (ev.shiftKey) newRotation = Math.round(newRotation / 15) * 15;
      setElements(prev => prev.map(x => x.id === elId ? { ...x, rotation: Math.round(newRotation) } : x));
    };
    const onUp = () => {
      setRotating(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const isDrawingTool = ["Rectangle", "Ellipse", "Triangle", "Diamond", "Star", "Polygon", "Line", "Arrow", "Frame", "Text", "Component", "Slice", "Section"].includes(activeTool);
  const isPenTool = ["Pen", "Pencil", "Brush"].includes(activeTool);

  // Image upload handler
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        pushHistory();
        const maxW = 400, maxH = 400;
        let w = img.width, h = img.height;
        if (w > maxW) { h = h * (maxW / w); w = maxW; }
        if (h > maxH) { w = w * (maxH / h); h = maxH; }
        const newEl: CanvasElement = {
          id: nextId++, type: "Image", x: 100 + Math.random() * 200, y: 100 + Math.random() * 200, w, h,
          label: file.name, fillColor: "transparent", strokeColor: "transparent", strokeWidth: 0,
          opacity: 100, rotation: 0, cornerRadius: 0, visible: true, locked: false,
          imageUrl: reader.result as string,
        };
        setElements(prev => [...prev, newEl]);
        setSelectedId(newEl.id);
        setActiveTool("Select");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [pushHistory]);

  // Drag-and-drop image upload
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length === 0) return;
    const dropPos = getCanvasPos(e as any);
    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          pushHistory();
          let w = img.width, h = img.height;
          const maxW = 400, maxH = 400;
          if (w > maxW) { h = h * (maxW / w); w = maxW; }
          if (h > maxH) { w = w * (maxH / h); h = maxH; }
          const newEl: CanvasElement = {
            id: nextId++, type: "Image",
            x: dropPos.x + idx * 30, y: dropPos.y + idx * 30, w, h,
            label: file.name, fillColor: "transparent", strokeColor: "transparent", strokeWidth: 0,
            opacity: 100, rotation: 0, cornerRadius: 0, visible: true, locked: false,
            imageUrl: reader.result as string,
          };
          setElements(prev => [...prev, newEl]);
          setSelectedId(newEl.id);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
    setActiveTool("Select");
  }, [pushHistory]);

  // Add asset element to canvas
  const addAssetToCanvas = useCallback((assetType: string) => {
    pushHistory();
    const color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
    const configs: Record<string, Partial<CanvasElement>> = {
      "Button": { w: 120, h: 40, cornerRadius: 8, type: "Rectangle", label: "Button" },
      "Card": { w: 240, h: 160, cornerRadius: 12, type: "Rectangle", label: "Card" },
      "Input": { w: 200, h: 40, cornerRadius: 6, type: "Rectangle", label: "Input" },
      "Badge": { w: 80, h: 28, cornerRadius: 14, type: "Rectangle", label: "Badge" },
      "Avatar": { w: 48, h: 48, cornerRadius: 999, type: "Ellipse", label: "Avatar" },
      "Modal": { w: 400, h: 300, cornerRadius: 16, type: "Frame", label: "Modal" },
      "Tooltip": { w: 160, h: 36, cornerRadius: 6, type: "Rectangle", label: "Tooltip" },
      "Dropdown": { w: 200, h: 180, cornerRadius: 8, type: "Rectangle", label: "Dropdown" },
      "Tabs": { w: 300, h: 40, cornerRadius: 8, type: "Rectangle", label: "Tabs" },
      "Accordion": { w: 300, h: 120, cornerRadius: 8, type: "Rectangle", label: "Accordion" },
    };
    const config = configs[assetType] || { w: 100, h: 100, cornerRadius: 8, type: "Rectangle", label: assetType };
    const newEl: CanvasElement = {
      id: nextId++, type: config.type || "Rectangle",
      x: 150 + Math.random() * 200, y: 150 + Math.random() * 200,
      w: config.w || 100, h: config.h || 100,
      label: config.label || assetType, fillColor: color, strokeColor: color, strokeWidth: 2,
      opacity: 100, rotation: 0, cornerRadius: config.cornerRadius || 0,
      visible: true, locked: false,
    };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, [pushHistory]);

  const addIconToCanvas = useCallback((iconName: string) => {
    pushHistory();
    const color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
    const typeMap: Record<string, string> = {
      "Square": "Rectangle", "Circle": "Ellipse", "Triangle": "Triangle", "Star": "Star",
      "Diamond": "Diamond", "Hexagon": "Polygon", "ArrowUpRight": "Arrow", "Minus": "Line",
      "Type": "Text", "Image": "Rectangle", "Layout": "Frame", "Box": "Rectangle",
    };
    const type = typeMap[iconName] || "Rectangle";
    const newEl: CanvasElement = {
      id: nextId++, type, x: 200 + Math.random() * 200, y: 200 + Math.random() * 200,
      w: type === "Text" ? 120 : 60, h: type === "Text" ? 30 : 60,
      label: `${iconName} ${nextId}`, fillColor: color, strokeColor: color, strokeWidth: 2,
      opacity: 100, rotation: 0, cornerRadius: type === "Rectangle" ? 8 : 0,
      visible: true, locked: false,
      ...(type === "Text" ? { text: "Text", fontSize: 16, fontWeight: "400", fontFamily: "Inter", textAlign: "left" } : {}),
    };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, [pushHistory]);

  const getCanvasPos = (e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (e.clientX - rect.left - panOffset.x) / (zoom / 100), y: (e.clientY - rect.top - panOffset.y) / (zoom / 100) };
  };

  // Snap logic
  const calculateSnaps = (movingId: number, x: number, y: number, w: number, h: number): { snappedX: number; snappedY: number; guides: SnapGuide[] } => {
    const guides: SnapGuide[] = [];
    let snappedX = x, snappedY = y;
    const otherEls = elements.filter(el => el.id !== movingId && el.visible);
    const movingEdges = { left: x, right: x + w, centerX: x + w / 2, top: y, bottom: y + h, centerY: y + h / 2 };

    for (const el of otherEls) {
      const edges = { left: el.x, right: el.x + el.w, centerX: el.x + el.w / 2, top: el.y, bottom: el.y + el.h, centerY: el.y + el.h / 2 };
      // X snaps
      for (const [mKey, mVal] of [["left", movingEdges.left], ["right", movingEdges.right], ["centerX", movingEdges.centerX]] as [string, number][]) {
        for (const [eKey, eVal] of [["left", edges.left], ["right", edges.right], ["centerX", edges.centerX]] as [string, number][]) {
          if (Math.abs(mVal - eVal) < SNAP_THRESHOLD) {
            const offset = eVal - mVal;
            snappedX = x + offset;
            guides.push({ axis: "x", position: eVal, type: eKey === "centerX" ? "center" : "edge" });
          }
        }
      }
      // Y snaps
      for (const [mKey, mVal] of [["top", movingEdges.top], ["bottom", movingEdges.bottom], ["centerY", movingEdges.centerY]] as [string, number][]) {
        for (const [eKey, eVal] of [["top", edges.top], ["bottom", edges.bottom], ["centerY", edges.centerY]] as [string, number][]) {
          if (Math.abs(mVal - eVal) < SNAP_THRESHOLD) {
            const offset = eVal - mVal;
            snappedY = y + offset;
            guides.push({ axis: "y", position: eVal, type: eKey === "centerY" ? "center" : "edge" });
          }
        }
      }
    }
    return { snappedX, snappedY, guides };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    canvasInteractionRef.current = true;
    if (previewMode) return;
    if (activeTool === "Pan") { setPanning(true); setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y }); return; }
    // Only handle clicks on the canvas background itself (not on elements) unless drawing
    if (e.target !== canvasRef.current && !isDrawingTool && !isPenTool) return;
    const pos = getCanvasPos(e);
    if (isPenTool) { setPenPoints(prev => [...prev, pos]); return; }
    if (isDrawingTool) { setDrawing(true); setDrawStart(pos); setDrawCurrent(pos); return; }
    // Select tool: clicking empty canvas just deselects. Don't create anything.
    if (activeTool === "Select" || activeTool === "Scale") { setSelectedId(null); return; }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (panning) { setPanning(false); return; }
    if (resizing) { setResizing(null); return; }
    if (drawing && drawStart) {
      const pos = getCanvasPos(e);
      const rawW = Math.abs(pos.x - drawStart.x);
      const rawH = Math.abs(pos.y - drawStart.y);
      // Only create element if user actually dragged (not just clicked)
      if (rawW < 5 && rawH < 5) {
        setDrawing(false); setDrawStart(null); setDrawCurrent(null);
        return;
      }
      const x = Math.min(drawStart.x, pos.x);
      const y = Math.min(drawStart.y, pos.y);
      const w = Math.max(rawW, 20);
      const h = Math.max(rawH, 20);
      pushHistory();
      const color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
      const newEl: CanvasElement = {
        id: nextId++, type: activeTool === "Component" ? "Rectangle" : activeTool, x, y, w, h,
        label: `${activeTool} ${nextId}`, fillColor: color, strokeColor: color, strokeWidth: 2,
        opacity: 100, rotation: 0, cornerRadius: activeTool === "Rectangle" ? 8 : 0,
        visible: true, locked: false, blendMode: "Normal", strokeDash: "", strokeCap: "butt", strokeJoin: "miter",
      };
      if (activeTool === "Text") { newEl.text = "Double-click to edit"; newEl.w = 200; newEl.h = 40; newEl.fontSize = 16; newEl.fontWeight = "400"; newEl.fontFamily = "Inter"; newEl.textAlign = "left"; newEl.fillColor = "#ffffff"; }
      if (activeTool === "Line" || activeTool === "Arrow") { newEl.x = drawStart.x; newEl.y = drawStart.y; newEl.w = pos.x - drawStart.x; newEl.h = pos.y - drawStart.y; }
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
      setDrawing(false); setDrawStart(null); setDrawCurrent(null);
    }
    if (dragging) {
      setDragging(null);
      setActiveSnapGuides([]);
    }
    // Reset drag tracking after a short delay so click handler can read it
    setTimeout(() => setDidDrag(false), 0);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (panning) { setPanOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y }); return; }
    if (drawing && drawStart) setDrawCurrent(getCanvasPos(e));
    if (dragging) {
      setDidDrag(true);
      const pos = getCanvasPos(e);
      const el = elements.find(el => el.id === dragging.id);
      if (el) {
        const rawX = pos.x - dragging.offsetX;
        const rawY = pos.y - dragging.offsetY;
        const { snappedX, snappedY, guides } = calculateSnaps(dragging.id, rawX, rawY, el.w, el.h);
        setActiveSnapGuides(guides);
        setElements(prev => prev.map(el => el.id === dragging.id ? { ...el, x: snappedX, y: snappedY } : el));
      }
    }
    if (resizing) {
      const pos = getCanvasPos(e);
      const dx = pos.x - resizing.startX, dy = pos.y - resizing.startY;
      setElements(prev => prev.map(el => {
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
    const minX = Math.min(...penPoints.map(p => p.x));
    const minY = Math.min(...penPoints.map(p => p.y));
    const relPoints = penPoints.map(p => ({ x: p.x - minX, y: p.y - minY }));
    // Generate default bezier control points (smooth curves)
    const cps = relPoints.map((p, i) => {
      const prev = relPoints[i - 1] || p;
      const next = relPoints[i + 1] || p;
      const dx = (next.x - prev.x) * 0.25;
      const dy = (next.y - prev.y) * 0.25;
      return { cp1x: p.x - dx, cp1y: p.y - dy, cp2x: p.x + dx, cp2y: p.y + dy };
    });
    const newEl: CanvasElement = {
      id: nextId++, type: "Pen", x: minX, y: minY, w: 0, h: 0,
      label: `Path ${nextId}`, fillColor: "transparent", strokeColor: defaultColors[4], strokeWidth: 2,
      opacity: 100, rotation: 0, cornerRadius: 0, visible: true, locked: false,
      points: relPoints, controlPoints: cps,
    };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
    setPenPoints([]);
  };

  const updateSelected = (updates: Partial<CanvasElement>) => {
    const id = selectedId ?? lastSelectedId;
    if (!id) return;
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const handleAlign = (type: string) => {
    const id = selectedId ?? lastSelectedId;
    if (!id) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    const cw = canvasRect.width / (zoom / 100), ch = canvasRect.height / (zoom / 100);
    const el = elements.find(e => e.id === id);
    if (!el) return;
    pushHistory();
    const alignMap: Record<string, Partial<CanvasElement>> = {
      "left": { x: 0 }, "center-h": { x: (cw - el.w) / 2 }, "right": { x: cw - el.w },
      "top": { y: 0 }, "center-v": { y: (ch - el.h) / 2 }, "bottom": { y: ch - el.h },
    };
    if (alignMap[type]) updateSelected(alignMap[type]);
  };

  const handleFlip = (dir: "h" | "v") => {
    if (!activeEl) return;
    pushHistory();
    if (dir === "h") updateSelected({ flipH: !activeEl.flipH });
    else updateSelected({ flipV: !activeEl.flipV });
  };

  const handleNewProject = (width: number, height: number, name: string) => {
    const newFrame: CanvasElement = {
      id: nextId++, type: "Frame", x: 100, y: 100, w: width > 2000 ? width / 2 : width, h: height > 2000 ? height / 2 : height,
      label: name, fillColor: "#1a1a2e", strokeColor: "hsl(263, 70%, 58%)", strokeWidth: 1,
      opacity: 100, rotation: 0, cornerRadius: 0, visible: true, locked: false,
    };
    const nextProject = {
      elements: [newFrame],
      pages: [{ id: 1, name: "Page 1", active: true }],
      canvasSettings: { zoom: 100, panOffset: { x: 0, y: 0 }, showGrid: true, gridSize: 40, gridStyle: "lines" },
      name,
    };
    applyWorkspaceData(nextProject);
    persistWorkspaceBackup(nextProject);
    void createProject(name, nextProject, "design");
    setSelectedId(newFrame.id);
    setLeftSidebarView("workspace");
  };

  // Handle template selection from TemplatePickerModal
  const handleTemplateSelect = (template: { name: string; width: number; height: number; type: string; elements?: any[] }) => {
    pushHistory();
    setProjectName(template.name);
    const baseElements: CanvasElement[] = [];

    if (template.elements && template.elements.length > 0) {
      template.elements.forEach((el: any) => {
        baseElements.push({
          id: nextId++, type: el.type || "Rectangle",
          x: el.x ?? 100, y: el.y ?? 100,
          w: el.w ?? template.width, h: el.h ?? template.height,
          label: el.label || template.name,
          fillColor: el.fillColor || "hsl(263, 70%, 58%)",
          strokeColor: el.strokeColor || "hsl(263, 70%, 58%)",
          strokeWidth: el.strokeWidth ?? 1,
          opacity: el.opacity ?? 100, rotation: 0,
          cornerRadius: el.cornerRadius ?? 0,
          visible: true, locked: false,
          text: el.text, fontSize: el.fontSize, fontWeight: el.fontWeight, fontFamily: el.fontFamily || "Inter", textAlign: el.textAlign || "left",
        });
      });
    } else {
      baseElements.push({
        id: nextId++, type: "Frame",
        x: 100, y: 100,
        w: template.width > 2000 ? template.width / 2 : template.width,
        h: template.height > 2000 ? template.height / 2 : template.height,
        label: template.name, fillColor: "#1a1a2e", strokeColor: "hsl(263, 70%, 58%)", strokeWidth: 1,
        opacity: 100, rotation: 0, cornerRadius: 0, visible: true, locked: false,
      });
    }

    setElements(prev => [...prev, ...baseElements]);
    if (baseElements.length > 0) setSelectedId(baseElements[0].id);
    setLeftSidebarView("workspace");
  };

  // Handle voice commands from VoiceCommandModal
  const handleVoiceCommand = useCallback((cmd: string) => {
    const lower = cmd.toLowerCase().trim();

    const normalizedCmd = (() => {
      if (lower.includes(":")) return lower;

      if (lower.includes("portfolio")) return "template:web-portfolio";
      if (lower.includes("landing") || lower.includes("website") || lower.includes("homepage")) return "template:web-landing";
      if (lower.includes("dashboard")) return "template:web-dashboard";
      if (lower.includes("e-commerce") || lower.includes("ecommerce") || lower.includes("store")) return "template:web-ecommerce";
      if (lower.includes("presentation") || lower.includes("slides") || lower.includes("pitch")) return "template:sl-pitch";
      if (lower.includes("brainstorm") || lower.includes("whiteboard")) return "template:wb-brainstorm";

      if (lower.includes("rectangle") || lower.includes("square") || lower.includes("box")) return "draw:rectangle";
      if (lower.includes("circle") || lower.includes("ellipse")) return "draw:ellipse";
      if (lower.includes("button")) return "draw:button";
      if (lower.includes("navbar") || lower.includes("navigation") || lower.includes("menu")) return "draw:navbar";
      if (lower.includes("hero")) return "draw:hero";
      if (lower.includes("footer")) return "draw:footer";
      if (lower.includes("heading") || lower.includes("title")) return "draw:heading";
      if (lower.includes("text")) return "draw:text";

      if (lower.includes("select all")) return "action:selectAll";
      if (lower.includes("undo")) return "action:undo";
      if (lower.includes("redo")) return "action:redo";
      if (lower.includes("delete") || lower.includes("remove")) return "action:delete";
      if (lower.includes("save")) return "action:save";
      if (lower.includes("export")) return "action:export";
      if (lower.includes("zoom in")) return "zoom:in";
      if (lower.includes("zoom out")) return "zoom:out";

      return lower;
    })();

    if (normalizedCmd.startsWith("draw:")) {
      const shape = normalizedCmd.split(":")[1];
      const color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
      const shapeMap: Record<string, { type: string; w: number; h: number; cornerRadius: number; text?: string; fontSize?: number; fontWeight?: string; fillColor?: string }> = {
        rectangle: { type: "Rectangle", w: 160, h: 120, cornerRadius: 8 },
        ellipse: { type: "Ellipse", w: 120, h: 120, cornerRadius: 0 },
        text: { type: "Text", w: 200, h: 40, cornerRadius: 0, text: "Hello World", fontSize: 24, fontWeight: "400" },
        frame: { type: "Frame", w: 400, h: 300, cornerRadius: 0 },
        star: { type: "Star", w: 100, h: 100, cornerRadius: 0 },
        triangle: { type: "Triangle", w: 120, h: 120, cornerRadius: 0 },
        button: { type: "Rectangle", w: 140, h: 44, cornerRadius: 10, text: "Button", fontSize: 14, fontWeight: "600", fillColor: "hsl(263, 70%, 58%)" },
        card: { type: "Rectangle", w: 280, h: 180, cornerRadius: 12 },
        input: { type: "Rectangle", w: 240, h: 40, cornerRadius: 6 },
        image: { type: "Rectangle", w: 200, h: 200, cornerRadius: 8 },
        heading: { type: "Text", w: 400, h: 50, cornerRadius: 0, text: "Heading", fontSize: 36, fontWeight: "700" },
        paragraph: { type: "Text", w: 400, h: 80, cornerRadius: 0, text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", fontSize: 16, fontWeight: "400" },
        navbar: { type: "Rectangle", w: 800, h: 60, cornerRadius: 0 },
        hero: { type: "Frame", w: 800, h: 400, cornerRadius: 0 },
        footer: { type: "Rectangle", w: 800, h: 80, cornerRadius: 0 },
      };
      const config = shapeMap[shape] || shapeMap.rectangle;
      const fc = config.fillColor || color;
      pushHistory();
      const newEl: CanvasElement = {
        id: nextId++, type: config.type, x: 200 + Math.random() * 200, y: 200 + Math.random() * 150,
        w: config.w, h: config.h,
        label: `${shape.charAt(0).toUpperCase() + shape.slice(1)} ${nextId}`, fillColor: fc, strokeColor: fc, strokeWidth: 2,
        opacity: 100, rotation: 0, cornerRadius: config.cornerRadius,
        visible: true, locked: false,
        ...(config.text ? { text: config.text, fontSize: config.fontSize, fontWeight: config.fontWeight, fontFamily: "Inter", textAlign: "left" } : {}),
      };
      setElements(prev => [...prev, newEl]);
      setSelectedId(newEl.id);
      setActiveTool("Select");
      return;
    }

    if (normalizedCmd.startsWith("template:")) {
      const templateId = normalizedCmd.split(":")[1];
      const voiceTemplates: Record<string, { name: string; width: number; height: number; type: string }> = {
        "web-landing": { name: "Landing Page", width: 1440, height: 900, type: "website" },
        "web-portfolio": { name: "Portfolio", width: 1440, height: 900, type: "website" },
        "web-dashboard": { name: "Dashboard", width: 1440, height: 900, type: "website" },
        "web-ecommerce": { name: "E-Commerce", width: 1440, height: 900, type: "website" },
        "sl-pitch": { name: "Pitch Deck", width: 1920, height: 1080, type: "slides" },
        "wb-brainstorm": { name: "Brainstorm", width: 3000, height: 2000, type: "whiteboard" },
      };

      if (voiceTemplates[templateId]) {
        handleTemplateSelect(voiceTemplates[templateId]);
      } else {
        setShowTemplatePicker(true);
      }
      return;
    }

    if (normalizedCmd === "zoom:in") setZoom(z => Math.min(z + 25, 400));
    else if (normalizedCmd === "zoom:out") setZoom(z => Math.max(z - 25, 25));
    else if (normalizedCmd === "action:undo") handleUndo();
    else if (normalizedCmd === "action:redo") handleRedo();
    else if (normalizedCmd === "action:delete") handleDelete();
    else if (normalizedCmd === "action:export") setShowExportModal(true);
    else if (normalizedCmd === "action:save") saveNow();
    else if (normalizedCmd === "action:selectAll") selectAllVisibleElements();
    else if (normalizedCmd === "action:templates") setShowTemplatePicker(true);
  }, [
    handleDelete,
    handleRedo,
    handleTemplateSelect,
    handleUndo,
    pushHistory,
    saveNow,
    selectAllVisibleElements,
  ]);

  // Listen for voice commands dispatched from navbar
  useEffect(() => {
    const handler = (e: Event) => {
      const cmd = (e as CustomEvent).detail;
      if (cmd) handleVoiceCommand(cmd);
    };
    window.addEventListener("voice-command", handler);
    return () => window.removeEventListener("voice-command", handler);
  }, [handleVoiceCommand]);

  // Prototype link management
  const addPrototypeLink = (fromId: number, toId: number) => {
    setPrototypeLinks(prev => {
      const existing = prev.find(l => l.fromId === fromId);
      if (existing) return prev.map(l => l.fromId === fromId ? { ...l, toId } : l);
      return [...prev, { fromId, toId, trigger: "click", animation: "slide" }];
    });
    setLinkingFrom(null);
  };

  const removePrototypeLink = (fromId: number) => {
    setPrototypeLinks(prev => prev.filter(l => l.fromId !== fromId));
  };

  const startPreview = () => {
    const frames = elements.filter(el => el.type === "Frame");
    if (frames.length > 0) {
      setPreviewCurrentFrame(frames[0].id);
      setPreviewMode(true);
    }
  };

  const handlePreviewClick = (elId: number) => {
    const link = prototypeLinks.find(l => l.fromId === elId);
    if (link) {
      setPreviewTransition(link.animation);
      setTimeout(() => {
        setPreviewCurrentFrame(link.toId);
        setPreviewTransition(null);
      }, link.animation === "instant" ? 0 : 300);
    }
  };

  const toggleSection = (label: string) => setCollapsedSections(p => ({ ...p, [label]: !p[label] }));
  const leftSidebarWidth = leftSidebarOpen ? 260 : 0;
  const rightPanelWidth = rightPanelOpen ? 280 : 0;

  const filteredElements = searchQuery
    ? elements.filter(el => el.label.toLowerCase().includes(searchQuery.toLowerCase()) || el.type.toLowerCase().includes(searchQuery.toLowerCase()))
    : elements;

  // Export
  const generateExport = (format: string) => {
    const visibleEls = elements.filter(el => el.visible);
    if (format === "svg") {
      const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">`, `  <rect width="1200" height="800" fill="#0d0d14"/>`];
      visibleEls.forEach(el => {
        parts.push(`  <g transform="translate(${el.x},${el.y}) rotate(${el.rotation})" opacity="${el.opacity / 100}">`);
        if (el.type === "Rectangle" || el.type === "Frame") parts.push(`    <rect width="${el.w}" height="${el.h}" rx="${el.cornerRadius}" fill="${el.fillColor}33" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}"/>`);
        else if (el.type === "Ellipse") parts.push(`    <ellipse cx="${el.w / 2}" cy="${el.h / 2}" rx="${el.w / 2}" ry="${el.h / 2}" fill="${el.fillColor}33" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}"/>`);
        else if (el.type === "Text") parts.push(`    <text x="0" y="${el.fontSize || 16}" fill="${el.fillColor}" font-size="${el.fontSize}" font-family="${el.fontFamily || 'Inter'}">${el.text || el.label}</text>`);
        parts.push(`  </g>`);
      });
      parts.push(`</svg>`);
      return parts.join("\n");
    }
    if (format === "html") {
      const l = ['<!DOCTYPE html>', '<html lang="en">', '<head>', '  <meta charset="UTF-8">', '  <meta name="viewport" content="width=device-width, initial-scale=1.0">', '  <title>ProtoCraft Export</title>', '  <style>', '    * { margin: 0; padding: 0; box-sizing: border-box; }', '    body { background: #0d0d14; position: relative; width: 1200px; height: 800px; overflow: hidden; }'];
      visibleEls.forEach(el => {
        l.push(`    .el-${el.id} { position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.w}px; height: ${el.h}px; background: ${el.fillColor}33; border: ${el.strokeWidth}px solid ${el.strokeColor}; opacity: ${el.opacity / 100}; ${el.type === "Ellipse" ? "border-radius: 50%;" : el.cornerRadius ? `border-radius: ${el.cornerRadius}px;` : ""} ${el.rotation ? `transform: rotate(${el.rotation}deg);` : ""} }`);
      });
      l.push('  </style>', '</head>', '<body>');
      visibleEls.forEach(el => l.push(`  <div class="el-${el.id}">${el.type === "Text" ? (el.text || el.label) : ""}</div>`));
      l.push('</body>', '</html>');
      return l.join("\n");
    }
    if (format === "react") {
      const l = ['import React from "react";', '', 'const Design = () => {', '  return (', '    <div style={{ position: "relative", width: 1200, height: 800, background: "#0d0d14", overflow: "hidden" }}>'];
      visibleEls.forEach(el => {
        const s: Record<string, any> = { position: "absolute", left: el.x, top: el.y, width: el.w, height: el.h, background: `${el.fillColor}33`, border: `${el.strokeWidth}px solid ${el.strokeColor}`, opacity: el.opacity / 100 };
        if (el.type === "Ellipse") s.borderRadius = "50%"; else if (el.cornerRadius) s.borderRadius = el.cornerRadius;
        if (el.rotation) s.transform = `rotate(${el.rotation}deg)`;
        if (el.type === "Text") { s.color = el.fillColor; s.fontSize = el.fontSize || 16; s.fontFamily = `${el.fontFamily || 'Inter'}, sans-serif`; s.background = "transparent"; s.border = "none"; }
        l.push(`      <div style={${JSON.stringify(s)}}${el.type === "Text" ? `>${el.text || el.label}</div>` : " />"}`);
      });
      l.push('    </div>', '  );', '};', '', 'export default Design;');
      return l.join("\n");
    }
    if (format === "vue") {
      const l = ['<template>', '  <div class="canvas">'];
      visibleEls.forEach(el => l.push(`    <div class="el-${el.id}">${el.type === "Text" ? (el.text || el.label) : ""}</div>`));
      l.push('  </div>', '</template>', '', '<style scoped>', '.canvas { position: relative; width: 1200px; height: 800px; background: #0d0d14; overflow: hidden; }');
      visibleEls.forEach(el => l.push(`.el-${el.id} { position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.w}px; height: ${el.h}px; background: ${el.fillColor}33; border: ${el.strokeWidth}px solid ${el.strokeColor}; opacity: ${el.opacity / 100}; ${el.type === "Ellipse" ? "border-radius: 50%;" : el.cornerRadius ? `border-radius: ${el.cornerRadius}px;` : ""} }`));
      l.push('</style>');
      return l.join("\n");
    }
    if (format === "tailwind") {
      const l = ['export default function Design() {', '  return (', '    <div className="relative w-[1200px] h-[800px] bg-[#0d0d14] overflow-hidden">'];
      visibleEls.forEach(el => {
        const cls = [`absolute left-[${Math.round(el.x)}px] top-[${Math.round(el.y)}px] w-[${Math.round(el.w)}px] h-[${Math.round(el.h)}px]`];
        if (el.type === "Ellipse") cls.push("rounded-full"); else if (el.cornerRadius) cls.push(`rounded-[${el.cornerRadius}px]`);
        l.push(`      <div className="${cls.join(" ")}" style={{background:"${el.fillColor}33",border:"${el.strokeWidth}px solid ${el.strokeColor}"}}${el.type === "Text" ? `>${el.text || el.label}</div>` : " />"}`);
      });
      l.push('    </div>', '  );', '}');
      return l.join("\n");
    }
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

  // Shape rendering
  const renderShapePreview = () => {
    if (!drawing || !drawStart || !drawCurrent) return null;
    const x = Math.min(drawStart.x, drawCurrent.x), y = Math.min(drawStart.y, drawCurrent.y);
    const w = Math.abs(drawCurrent.x - drawStart.x), h = Math.abs(drawCurrent.y - drawStart.y);
    if (w < 2 && h < 2) return null;
    const ps = { fill: "hsl(263, 70%, 58%, 0.15)", stroke: "hsl(263, 70%, 58%)", strokeWidth: 2, strokeDasharray: "6 3" };
    if (activeTool === "Line" || activeTool === "Arrow") {
      return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          <line x1={drawStart.x} y1={drawStart.y} x2={drawCurrent.x} y2={drawCurrent.y} {...ps} fill="none" />
          {activeTool === "Arrow" && (() => {
            const dx = drawCurrent.x - drawStart.x, dy = drawCurrent.y - drawStart.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const ax = dx / len, ay = dy / len, px = -ay, py = ax;
            return <polygon points={`${drawCurrent.x},${drawCurrent.y} ${drawCurrent.x - ax * 10 + px * 4},${drawCurrent.y - ay * 10 + py * 4} ${drawCurrent.x - ax * 10 - px * 4},${drawCurrent.y - ay * 10 - py * 4}`} fill="hsl(263, 70%, 58%)" />;
          })()}
        </svg>
      );
    }
    return (
      <svg className="absolute pointer-events-none" style={{ left: x, top: y, width: w, height: h, zIndex: 5, overflow: "visible" }}>
        {["Rectangle", "Frame", "Component", "Section", "Slice"].includes(activeTool) ? <rect x={0} y={0} width={w} height={h} rx={activeTool === "Rectangle" ? 8 : 0} {...ps} />
          : activeTool === "Ellipse" ? <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} {...ps} />
          : activeTool === "Triangle" ? <polygon points={`${w / 2},0 ${w},${h} 0,${h}`} {...ps} />
          : activeTool === "Diamond" ? <polygon points={`${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`} {...ps} />
          : activeTool === "Star" ? (() => { const cx = w / 2, cy2 = h / 2, or = Math.min(cx, cy2), ir = or * 0.4; const pts = Array.from({ length: 10 }, (_, i) => { const r = i % 2 === 0 ? or : ir; const a = (Math.PI / 5) * i - Math.PI / 2; return `${cx + r * Math.cos(a)},${cy2 + r * Math.sin(a)}`; }).join(" "); return <polygon points={pts} {...ps} />; })()
          : activeTool === "Polygon" ? (() => { const cx = w / 2, cy2 = h / 2, r = Math.min(cx, cy2); const pts = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i - Math.PI / 2; return `${cx + r * Math.cos(a)},${cy2 + r * Math.sin(a)}`; }).join(" "); return <polygon points={pts} {...ps} />; })()
          : activeTool === "Text" ? <><rect x={0} y={0} width={w} height={h} {...ps} /><text x={4} y={h / 2 + 4} fill="hsl(263, 70%, 58%)" fontSize={12} opacity={0.6}>Text</text></>
          : null}
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
        const pts = Array.from({ length: 10 }, (_, i) => { const r = i % 2 === 0 ? or : ir; const a = (Math.PI / 5) * i - Math.PI / 2; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(" ");
        return <polygon points={pts} {...s} />;
      }
      case "Polygon": {
        const cx = el.w / 2, cy = el.h / 2, r = Math.min(cx, cy) - 2;
        const pts = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i - Math.PI / 2; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`; }).join(" ");
        return <polygon points={pts} {...s} />;
      }
      case "Line": return <line x1={0} y1={0} x2={el.w} y2={el.h} stroke={el.strokeColor} strokeWidth={el.strokeWidth} />;
      case "Arrow": {
        const len = Math.sqrt(el.w ** 2 + el.h ** 2) || 1;
        const ax = el.w / len, ay = el.h / len, px = -ay, py = ax;
        return (<><line x1={0} y1={0} x2={el.w} y2={el.h} stroke={el.strokeColor} strokeWidth={el.strokeWidth} /><polygon points={`${el.w},${el.h} ${el.w - ax * 12 + px * 5},${el.h - ay * 12 + py * 5} ${el.w - ax * 12 - px * 5},${el.h - ay * 12 - py * 5}`} fill={el.strokeColor} /></>);
      }
      case "Pen": case "Pencil": case "Brush":
        if (el.points && el.points.length > 1) {
          // Support bezier curves if controlPoints exist
          if (el.controlPoints && el.controlPoints.length === el.points.length) {
            let d = `M${el.points[0].x},${el.points[0].y}`;
            for (let i = 1; i < el.points.length; i++) {
              const cp = el.controlPoints[i - 1];
              const p = el.points[i];
              d += ` C${cp.cp2x},${cp.cp2y} ${el.controlPoints[i].cp1x},${el.controlPoints[i].cp1y} ${p.x},${p.y}`;
            }
            return <path d={d} fill="none" stroke={el.strokeColor} strokeWidth={el.strokeWidth} strokeLinecap="round" strokeLinejoin="round" />;
          }
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

  // Ruler rendering
  const renderRuler = (axis: "x" | "y") => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const totalSize = axis === "x" ? (canvasRect?.width || 1200) : (canvasRect?.height || 800);
    const step = zoom >= 100 ? 50 : zoom >= 50 ? 100 : zoom >= 25 ? 200 : 400;
    const ticks: JSX.Element[] = [];
    const scaleFactor = zoom / 100;

    for (let i = -10000; i < 10000; i += step) {
      const screenPos = axis === "x"
        ? i * scaleFactor + panOffset.x
        : i * scaleFactor + panOffset.y;
      
      if (screenPos < -10 || screenPos > totalSize + 10) continue;

      if (axis === "x") {
        ticks.push(
          <g key={i}>
            <line x1={screenPos} y1={RULER_SIZE - 6} x2={screenPos} y2={RULER_SIZE} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
            <text x={screenPos + 2} y={RULER_SIZE - 8} fill="hsl(var(--muted-foreground))" fontSize={8} fontFamily="monospace">{i}</text>
          </g>
        );
      } else {
        ticks.push(
          <g key={i}>
            <line x1={RULER_SIZE - 6} y1={screenPos} x2={RULER_SIZE} y2={screenPos} stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} />
            <text x={2} y={screenPos + 3} fill="hsl(var(--muted-foreground))" fontSize={8} fontFamily="monospace" transform={`rotate(-90, 2, ${screenPos + 3})`}>{i}</text>
          </g>
        );
      }
    }
    return ticks;
  };

  // Prototype link arrows
  const renderPrototypeLinks = () => {
    if (!prototypeMode) return null;
    return prototypeLinks.map(link => {
      const from = elements.find(el => el.id === link.fromId);
      const to = elements.find(el => el.id === link.toId);
      if (!from || !to) return null;
      const fx = from.x + from.w, fy = from.y + from.h / 2;
      const tx = to.x, ty = to.y + to.h / 2;
      return (
        <g key={`${link.fromId}-${link.toId}`}>
          <line x1={fx} y1={fy} x2={tx} y2={ty} stroke="hsl(45, 90%, 55%)" strokeWidth={2} strokeDasharray="6 3" />
          <circle cx={fx} cy={fy} r={4} fill="hsl(45, 90%, 55%)" />
          <circle cx={tx} cy={ty} r={4} fill="hsl(45, 90%, 55%)" stroke="hsl(var(--background))" strokeWidth={2} />
          <text x={(fx + tx) / 2} y={(fy + ty) / 2 - 8} fill="hsl(45, 90%, 55%)" fontSize={10} textAnchor="middle" fontFamily="Inter">{link.trigger} → {link.animation}</text>
        </g>
      );
    });
  };

  return (
    <div className="relative min-h-screen pt-14 flex" onMouseUp={() => { if (resizing) setResizing(null); }}>
      {/* Top toolbar */}
      <div className="fixed top-14 left-0 right-0 z-30 h-10 glass-strong border-b border-border/30 flex items-center px-2 gap-1">
        <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors" title="Toggle left panel">
          <PanelLeft className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-border/50 mx-1" />

        {/* Hidden image file input */}
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        {toolGroups.map(group => (
          <div key={group.label} className="flex items-center">
            {group.tools.map(item => {
              const Icon = iconMap[item.icon] || Square;
              return (
                <button key={item.label} title={`${item.label} (${item.shortcut})`}
                  onClick={() => {
                    if (item.label === "Image") { imageInputRef.current?.click(); return; }
                    setActiveTool(item.label); if (isPenTool && !["Pen", "Pencil", "Brush"].includes(item.label)) finishPen();
                  }}
                  className={`p-1.5 rounded transition-all ${activeTool === item.label ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}>
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
            <div className="w-px h-4 bg-border/30 mx-0.5" />
          </div>
        ))}

        {/* Project name + save status */}
        <div className="flex items-center gap-2 mx-2">
          <input
            value={projectName}
            onChange={(e) => { setProjectName(e.target.value); renameProject(e.target.value); }}
            className="bg-transparent text-xs font-semibold text-foreground outline-none w-28 truncate hover:bg-secondary/40 rounded px-1.5 py-0.5 focus:bg-secondary/60 transition-colors"
            title="Project name (click to rename)"
          />
          <div className="flex items-center gap-1" title={lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : "Not saved yet"}>
            {saving ? (
              <Cloud className="w-3 h-3 text-muted-foreground animate-pulse" />
            ) : lastSaved ? (
              <Cloud className="w-3 h-3 text-primary" />
            ) : (
              <Save className="w-3 h-3 text-muted-foreground" />
            )}
            <span className="text-[9px] text-muted-foreground">{saving ? "Saving..." : lastSaved ? "Saved" : ""}</span>
          </div>
        </div>

        {/* Templates button */}
        <button onClick={() => setShowTemplatePicker(true)} title="Templates"
          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
          <LayoutTemplate className="w-4 h-4" />
        </button>
        <button onClick={() => setShowProjectBrowser(true)} title="Open previous projects"
          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
          <FolderPlus className="w-4 h-4" />
        </button>

        <div className="flex-1" />

        {/* Prototype toggle */}
        <button onClick={() => { setPrototypeMode(!prototypeMode); setLinkingFrom(null); }}
          title="Prototype Mode"
          className={`p-1.5 rounded transition-colors ${prototypeMode ? "bg-yellow-500/20 text-yellow-400" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}>
          <Link className="w-4 h-4" />
        </button>
        <button onClick={startPreview} title="Preview Prototype" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60">
          <Play className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-border/50 mx-1" />

        <div className="flex items-center gap-1 bg-secondary/50 rounded px-2 py-1">
          <button onClick={() => setZoom(z => Math.max(z - 10, 25))} className="text-muted-foreground hover:text-foreground"><ZoomOut className="w-3.5 h-3.5" /></button>
          <span className="text-xs text-foreground font-medium w-10 text-center">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(z + 10, 400))} className="text-muted-foreground hover:text-foreground"><ZoomIn className="w-3.5 h-3.5" /></button>
        </div>
        <div className="w-px h-5 bg-border/50 mx-1" />

        <button onClick={handleUndo} title="Undo (Ctrl+Z)" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60"><Undo className="w-4 h-4" /></button>
        <button onClick={handleRedo} title="Redo (Ctrl+Y)" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60"><Redo className="w-4 h-4" /></button>
        <div className="relative group">
          <button onClick={() => setShowGrid(!showGrid)} title="Toggle Grid" className={`p-1.5 rounded transition-colors ${showGrid ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}><Grid3X3 className="w-4 h-4" /></button>
          <div className="absolute top-full mt-1 left-0 hidden group-hover:block z-50">
            <div className="glass-strong rounded-lg border border-border/30 p-2 w-44 space-y-2">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Grid Settings</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-8">Size</span>
                <input type="range" min={10} max={100} value={gridSize} onChange={e => setGridSize(Number(e.target.value))} className="flex-1 accent-primary h-1" />
                <span className="text-[10px] text-foreground w-6 text-right">{gridSize}</span>
              </div>
              <div className="flex gap-1">
                {(["lines", "dots", "cross"] as const).map(s => (
                  <button key={s} onClick={() => setGridStyle(s)} className={`flex-1 px-1.5 py-1 rounded text-[10px] capitalize transition-colors ${gridStyle === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary/60"}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setShowRulers(!showRulers)} title="Toggle Rulers" className={`p-1.5 rounded transition-colors ${showRulers ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"}`}><RulerIcon className="w-4 h-4" /></button>
        <button onClick={() => setShowExportModal(true)} title="Export" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60"><Download className="w-4 h-4" /></button>
        <button onClick={() => setShowShortcuts(true)} title="Keyboard Shortcuts" className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60"><Keyboard className="w-4 h-4" /></button>
        <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-1.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-foreground transition-colors" title="Toggle right panel">
          <PanelRight className="w-4 h-4" />
        </button>
      </div>

      {/* Left Sidebar */}
      <AnimatePresence>
        {leftSidebarOpen && (
          <motion.aside
            initial={{ x: -leftSidebarWidth, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -leftSidebarWidth, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 top-24 bottom-0 glass-strong z-20 flex flex-col border-r border-border/30"
            style={{ width: leftSidebarWidth }}
          >
            {leftSidebarView === "home" ? (
              <HomeSidebar onBackToCanvas={() => setLeftSidebarView("workspace")} onNewProject={handleNewProject} />
            ) : (
              <div className="flex flex-col h-full">
                {/* Tabs */}
                <div className="flex items-center border-b border-border/30">
                  {([
                    { id: "pages" as LeftTab, icon: File, label: "Pages" },
                    { id: "layers" as LeftTab, icon: Layers, label: "Layers" },
                    { id: "assets" as LeftTab, icon: Package, label: "Assets" },
                    { id: "find" as LeftTab, icon: Search, label: "Find" },
                    { id: "inspector" as LeftTab, icon: Component, label: "Inspect" },
                  ]).map(tab => (
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

                {/* Prototype links panel (when in prototype mode) */}
                {prototypeMode && leftTab === "layers" && (
                  <div className="px-2 py-1.5 bg-yellow-500/5 border-b border-yellow-500/20">
                    <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-1">🔗 Prototype Mode</p>
                    <p className="text-[9px] text-muted-foreground">Click an element, then click another to link them. Links define click-through navigation.</p>
                    {prototypeLinks.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {prototypeLinks.map(link => {
                          const from = elements.find(el => el.id === link.fromId);
                          const to = elements.find(el => el.id === link.toId);
                          return (
                            <div key={link.fromId} className="flex items-center gap-1 text-[9px] text-yellow-300 bg-yellow-500/10 rounded px-1.5 py-0.5">
                              <span className="truncate">{from?.label}</span>
                              <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{to?.label}</span>
                              <button onClick={() => removePrototypeLink(link.fromId)} className="ml-auto shrink-0 hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto">
                  {leftTab === "pages" && (
                    <div className="p-2 relative">
                      <div className="flex items-center justify-between px-2 mb-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pages</span>
                        <button onClick={() => {
                          const newId = Math.max(...pages.map(p => p.id), 0) + 1;
                          setPages(p => [...p, { id: newId, name: `Page ${newId}`, active: false }]);
                        }} className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary"><Plus className="w-3 h-3" /></button>
                      </div>
                      {pages.map(page => (
                        <div key={page.id} className="relative mb-0.5">
                          {renamingPageId === page.id ? (
                            <div className="flex items-center gap-1 px-3 py-1.5">
                              <FileText className="w-3 h-3 text-primary shrink-0" />
                              <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                                onBlur={commitRename} onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingPageId(null); }}
                                className="flex-1 bg-secondary/60 rounded px-1.5 py-0.5 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary/50" />
                            </div>
                          ) : (
                            <button
                              onClick={() => setPages(p => p.map(pg => ({ ...pg, active: pg.id === page.id })))}
                              onContextMenu={(e) => { e.preventDefault(); setPageContextMenu({ pageId: page.id, x: e.clientX, y: e.clientY }); }}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${page.active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary/60"}`}>
                              <FileText className="w-3 h-3" />
                              <span className="flex-1 text-left truncate">{page.name}</span>
                              {page.active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                              <button onClick={(e) => { e.stopPropagation(); setPageContextMenu({ pageId: page.id, x: e.clientX, y: e.clientY }); }}
                                className="p-0.5 rounded hover:bg-secondary/60 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="w-3 h-3" />
                              </button>
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Page Context Menu */}
                      {pageContextMenu && (
                        <div className="fixed z-[200] glass-strong rounded-lg border border-border/30 py-1 w-44 shadow-lg"
                          style={{ top: pageContextMenu.y, left: pageContextMenu.x }}
                          onClick={e => e.stopPropagation()}>
                          <button onClick={() => handleRenamePage(pageContextMenu.pageId)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60">
                            <Edit3 className="w-3 h-3" /> Rename Page
                          </button>
                          <button onClick={() => handleDuplicatePage(pageContextMenu.pageId)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60">
                            <Copy className="w-3 h-3" /> Duplicate Page
                          </button>
                          <button onClick={() => handleCopyPageLink(pageContextMenu.pageId)} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/60">
                            <ExternalLink className="w-3 h-3" /> Copy Link to Page
                          </button>
                          <div className="h-px bg-border/30 my-1" />
                          <button onClick={() => handleDeletePage(pageContextMenu.pageId)}
                            disabled={pages.length <= 1}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:cursor-not-allowed">
                            <Trash2 className="w-3 h-3" /> Delete Page
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {leftTab === "layers" && (
                    <div className="p-2">
                      <div className="flex items-center justify-between px-2 mb-2">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Layers ({elements.length})</span>
                        <div className="flex items-center gap-0.5">
                          <button onClick={handleGroupSelected} title="Group (Ctrl+G)" className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary">
                            <Group className="w-3 h-3" />
                          </button>
                          <button onClick={handleUngroupSelected} title="Ungroup" className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary">
                            <Ungroup className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {elements.length === 0 ? (
                        <div className="text-center py-8">
                          <Layers className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">No layers yet</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">Draw something on the canvas</p>
                        </div>
                      ) : (
                        [...elements].reverse().map(el => (
                          <div key={el.id}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors mb-0.5 cursor-pointer ${
                              (selectedId === el.id || lastSelectedId === el.id || multiSelect.includes(el.id)) ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                            } ${el.groupId ? "ml-3 border-l border-primary/20" : ""}`}
                            onClick={(e) => {
                              if (e.shiftKey) {
                                setMultiSelect(prev => prev.includes(el.id) ? prev.filter(id => id !== el.id) : [...prev, el.id]);
                              } else {
                                focusElementInCanvas(el.id);
                                setMultiSelect([]);
                              }
                            }}>
                            {el.isGroup && <FolderPlus className="w-3 h-3 text-primary shrink-0" />}
                            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: el.fillColor + "66", border: `1px solid ${el.fillColor}` }} />
                            <span className="truncate flex-1">{el.label}</span>
                            {el.isGroup && <span className="text-[8px] text-primary/60">group</span>}
                            {prototypeLinks.some(l => l.fromId === el.id) && <Link className="w-3 h-3 text-yellow-400 shrink-0" />}
                            <button onClick={ev => { ev.stopPropagation(); setElements(p => p.map(x => x.id === el.id ? { ...x, visible: !x.visible } : x)); }} className="p-0.5 hover:text-foreground shrink-0">
                              {el.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <button onClick={ev => { ev.stopPropagation(); setElements(p => p.map(x => x.id === el.id ? { ...x, locked: !x.locked } : x)); }} className="p-0.5 hover:text-foreground shrink-0">
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
                        <input placeholder="Search assets..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                          className="w-full bg-secondary/50 rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50" />
                      </div>
                      <button onClick={() => toggleSection("Components")} className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                        <span>Components</span>
                        {collapsedSections["Components"] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {!collapsedSections["Components"] && (
                        <div className="px-2 py-1 space-y-0.5">
                          {["Button", "Card", "Input", "Badge", "Avatar", "Modal", "Tooltip", "Dropdown", "Tabs", "Accordion"].map(c => (
                            <div key={c} onClick={() => addAssetToCanvas(c)} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:bg-primary/10 hover:text-foreground cursor-pointer transition-colors">
                              <Component className="w-3 h-3 text-primary" />
                              <span>{c}</span>
                              <Plus className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Images section */}
                      <button onClick={() => toggleSection("Images")} className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                        <span>Images</span>
                        {collapsedSections["Images"] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {!collapsedSections["Images"] && (
                        <div className="px-2 py-1 space-y-1">
                          <button onClick={() => imageInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border/50 text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                            <Image className="w-3.5 h-3.5" /> Upload Image
                          </button>
                          {elements.filter(el => el.type === "Image").length > 0 && (
                            <div className="space-y-0.5">
                              {elements.filter(el => el.type === "Image").map(el => (
                                <div key={el.id} onClick={() => setSelectedId(el.id)} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:bg-secondary/60 cursor-pointer">
                                  {el.imageUrl && <img src={el.imageUrl} alt="" className="w-6 h-6 rounded object-cover" />}
                                  <span className="truncate">{el.label}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      <button onClick={() => toggleSection("Icons")} className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                        <span>Icons</span>
                        {collapsedSections["Icons"] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {!collapsedSections["Icons"] && (
                        <div className="px-2 py-1 grid grid-cols-6 gap-1">
                          {[
                            { Icon: Square, name: "Square" }, { Icon: Circle, name: "Circle" }, { Icon: Triangle, name: "Triangle" },
                            { Icon: Star, name: "Star" }, { Icon: Diamond, name: "Diamond" }, { Icon: Hexagon, name: "Hexagon" },
                            { Icon: ArrowUpRight, name: "ArrowUpRight" }, { Icon: Minus, name: "Minus" }, { Icon: Type, name: "Type" },
                            { Icon: Image, name: "Image" }, { Icon: Layout, name: "Layout" }, { Icon: Box, name: "Box" },
                          ].map((item) => (
                            <div key={item.name} onClick={() => addIconToCanvas(item.name)} title={item.name}
                              className="w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors">
                              <item.Icon className="w-4 h-4" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {leftTab === "find" && (
                    <div className="p-2">
                      <input ref={findInputRef} placeholder="Search elements by name or type..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full bg-secondary/50 rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 mb-2" />
                      {searchQuery && (
                        <p className="text-[10px] text-muted-foreground mb-2 px-1">{filteredElements.length} result{filteredElements.length !== 1 ? "s" : ""} found</p>
                      )}
                      {!searchQuery ? (
                        <div className="text-center py-6">
                          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Type to search elements</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">Search by name, type, or label</p>
                        </div>
                      ) : filteredElements.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No results found</p>
                      ) : (
                        filteredElements.map(el => (
                          <button key={el.id} onClick={() => { setSelectedId(el.id); setLeftTab("layers"); }}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors mb-0.5 ${
                              selectedId === el.id ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-secondary/60"
                            }`}>
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

      {/* Canvas area with rulers */}
      <div className="flex-1 pt-10" style={{ marginLeft: leftSidebarOpen ? leftSidebarWidth : 0, marginRight: rightPanelOpen ? rightPanelWidth : 0 }}>
        <div className="relative w-full h-[calc(100vh-6rem)]">
          {/* Horizontal ruler */}
          {showRulers && (
            <svg className="absolute top-0 left-0 w-full z-10" style={{ height: RULER_SIZE, marginLeft: RULER_SIZE }}>
              <rect width="100%" height={RULER_SIZE} fill="hsl(var(--card))" opacity={0.95} />
              <line x1={0} y1={RULER_SIZE} x2="100%" y2={RULER_SIZE} stroke="hsl(var(--border))" strokeWidth={0.5} />
              {renderRuler("x")}
            </svg>
          )}
          {/* Vertical ruler */}
          {showRulers && (
            <svg className="absolute top-0 left-0 h-full z-10" style={{ width: RULER_SIZE, marginTop: RULER_SIZE }}>
              <rect width={RULER_SIZE} height="100%" fill="hsl(var(--card))" opacity={0.95} />
              <line x1={RULER_SIZE} y1={0} x2={RULER_SIZE} y2="100%" stroke="hsl(var(--border))" strokeWidth={0.5} />
              {renderRuler("y")}
            </svg>
          )}
          {/* Ruler corner */}
          {showRulers && (
            <div className="absolute top-0 left-0 z-20 flex items-center justify-center" style={{ width: RULER_SIZE, height: RULER_SIZE, background: "hsl(var(--card))" }}>
              <RulerIcon className="w-2.5 h-2.5 text-muted-foreground/40" />
            </div>
          )}

          <motion.div
            ref={canvasRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute overflow-hidden bg-white"
            style={{
              top: showRulers ? RULER_SIZE : 0,
              left: showRulers ? RULER_SIZE : 0,
              right: 0,
              bottom: 0,
              cursor: isPenTool || isDrawingTool ? "crosshair" : activeTool === "Pan" ? (panning ? "grabbing" : "grab") : "default",
            }}
            onMouseDown={handleCanvasMouseDown} onMouseUp={handleCanvasMouseUp} onMouseMove={handleCanvasMouseMove}
            onDoubleClick={() => { if (isPenTool) finishPen(); }}
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          >
            {/* Drag-over overlay */}
            {isDragOver && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-lg pointer-events-none">
                <div className="text-center">
                  <Image className="w-10 h-10 text-primary mx-auto mb-2 animate-bounce" />
                  <p className="text-sm font-semibold text-primary">Drop images here</p>
                </div>
              </div>
            )}

            {showGrid && (
              <div className="absolute inset-0 opacity-[0.4]" style={
                gridStyle === "lines" ? {
                  backgroundImage: `linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 1px)`,
                  backgroundSize: `${gridSize}px ${gridSize}px`, backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
                } : gridStyle === "dots" ? {
                  backgroundImage: `radial-gradient(circle, #c0c0c0 1px, transparent 1px)`,
                  backgroundSize: `${gridSize}px ${gridSize}px`, backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
                } : {
                  backgroundImage: `linear-gradient(#d0d0d0 1px, transparent 1px), linear-gradient(90deg, #d0d0d0 1px, transparent 1px), radial-gradient(circle, #b0b0b0 1.5px, transparent 1.5px)`,
                  backgroundSize: `${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px, ${gridSize}px ${gridSize}px`,
                  backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
                }
              } />
            )}

            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 shadow-sm">
              <Move className="w-3 h-3 text-primary" />
              <span className="text-[10px] text-gray-600 font-medium">{prototypeMode ? "Prototype" : activeTool}</span>
              <span className="text-[10px] text-primary font-bold ml-2">{zoom}%</span>
              <span className="text-[10px] text-gray-500">· {elements.length} objects</span>
              {prototypeMode && <span className="text-[10px] text-yellow-600">· {prototypeLinks.length} links</span>}
            </div>

            {renderShapePreview()}

            {/* Snap guides */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 15 }}>
              {activeSnapGuides.map((guide, i) => {
                const scaleFactor = zoom / 100;
                if (guide.axis === "x") {
                  const x = guide.position * scaleFactor + panOffset.x;
                  return <line key={i} x1={x} y1={0} x2={x} y2="100%" stroke="hsl(330, 80%, 60%)" strokeWidth={1} strokeDasharray={guide.type === "center" ? "4 4" : "2 2"} />;
                } else {
                  const y = guide.position * scaleFactor + panOffset.y;
                  return <line key={i} x1={0} y1={y} x2="100%" y2={y} stroke="hsl(330, 80%, 60%)" strokeWidth={1} strokeDasharray={guide.type === "center" ? "4 4" : "2 2"} />;
                }
              })}
            </svg>

            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
              {penPoints.length > 0 && (
                <polyline points={penPoints.map(p => `${p.x},${p.y}`).join(" ")} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="4 2" />
              )}
            </svg>

            <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`, transformOrigin: "0 0" }}>
              {/* Prototype link arrows */}
              <svg className="absolute pointer-events-none" style={{ zIndex: 6, overflow: "visible", width: 1, height: 1 }}>
                {renderPrototypeLinks()}
              </svg>

              {elements.filter(el => el.visible).map(el => (
                <div
                  key={el.id}
                  data-element-id={el.id}
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
                  onClick={e => {
                    e.stopPropagation();
                    // In prototype mode, handle linking
                    if (prototypeMode) {
                      if (linkingFrom === null) {
                        setLinkingFrom(el.id);
                      } else if (linkingFrom !== el.id) {
                        addPrototypeLink(linkingFrom, el.id);
                      } else {
                        setLinkingFrom(null);
                      }
                      return;
                    }
                    // FIX: Don't toggle off if we just dragged
                    if (didDrag) return;
                    setSelectedId(el.id);
                  }}
                  onMouseDown={e => {
                    if (el.locked || prototypeMode) return;
                    e.stopPropagation();
                    const pos = getCanvasPos(e);
                    setDragging({ id: el.id, offsetX: pos.x - el.x, offsetY: pos.y - el.y });
                    setDidDrag(false);
                    setSelectedId(el.id);
                  }}
                  onDoubleClick={e => { e.stopPropagation(); if (el.type === "Text") setEditingTextId(el.id); }}
                >
                  {el.type === "Image" && el.imageUrl ? (
                    <img src={el.imageUrl} alt={el.label}
                      className="w-full h-full rounded select-none pointer-events-none"
                      draggable={false}
                      style={{
                        objectFit: (el.imageObjectFit as any) || "cover",
                        filter: `brightness(${(el.imageBrightness ?? 100) / 100}) contrast(${(el.imageContrast ?? 100) / 100}) saturate(${(el.imageSaturation ?? 100) / 100}) grayscale(${(el.imageGrayscale ?? 0) / 100}) hue-rotate(${el.imageHueRotate ?? 0}deg)`,
                      }}
                    />
                  ) : el.type === "Text" ? (
                    editingTextId === el.id ? (
                      <textarea autoFocus value={el.text || ""}
                        onChange={ev => setElements(prev => prev.map(x => x.id === el.id ? { ...x, text: ev.target.value } : x))}
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
                  {/* Selection border + resize handles + rotation handle */}
                  {selectedId === el.id && !el.locked && !["Line", "Arrow", "Pen", "Pencil", "Brush"].includes(el.type) && (
                    <>
                      <div className="absolute inset-0 border-2 border-primary pointer-events-none" />
                      {resizeHandles.map(h => (
                        <div key={h} style={getHandleStyle(h)}
                          onMouseDown={e => { e.stopPropagation(); const pos = getCanvasPos(e); pushHistory(); setResizing({ id: el.id, handle: h, startX: pos.x, startY: pos.y, startW: el.w, startH: el.h, startElX: el.x, startElY: el.y }); }} />
                      ))}
                      {/* Rotation handle - appears above the element */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing group"
                        style={{ top: -30 }}
                        onMouseDown={(e) => handleRotationMouseDown(e, el.id)}
                        title={`Rotation: ${el.rotation}° (hold Shift for 15° steps)`}
                      >
                        <div className="w-4 h-4 rounded-full bg-primary border-2 border-primary-foreground flex items-center justify-center hover:scale-125 transition-transform">
                          <RotateCw className="w-2.5 h-2.5 text-primary-foreground" />
                        </div>
                        <div className="w-px h-3 bg-primary mx-auto" />
                      </div>
                    </>
                  )}
                  {focusedElementId === el.id && (
                    <div className="absolute -inset-3 rounded-[20px] border-2 border-primary/70 pointer-events-none animate-pulse" />
                  )}
                  {selectedId === el.id && (
                    <div className="absolute -bottom-5 left-0 text-[9px] text-primary font-medium whitespace-nowrap">
                      {Math.round(el.w)} × {Math.round(el.h)} {el.rotation !== 0 && <span className="ml-1 text-accent">↻ {el.rotation}°</span>}
                    </div>
                  )}
                  {/* Prototype linking indicator */}
                  {prototypeMode && linkingFrom === el.id && (
                    <div className="absolute inset-0 border-2 border-yellow-400 rounded pointer-events-none animate-pulse" />
                  )}
                  {prototypeMode && prototypeLinks.some(l => l.fromId === el.id) && (
                    <div className="absolute -top-3 -right-3 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center z-20">
                      <Link className="w-3 h-3 text-background" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel */}
      <AnimatePresence>
        {rightPanelOpen && (
          <motion.aside
            initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed right-0 top-24 bottom-0 glass-strong z-20 overflow-y-auto border-l border-border/30"
            style={{ width: rightPanelWidth }}
          >
            <RightPanel
              activeEl={activeEl}
              selectedId={selectedId}
              collapsedSections={collapsedSections}
              toggleSection={toggleSection}
              updateSelected={updateSelected}
              handleAlign={handleAlign}
              handleFlip={handleFlip}
              handleDuplicate={handleDuplicate}
              handleDelete={handleDelete}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Prototype Preview Overlay */}
      <AnimatePresence>
        {previewMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background flex flex-col">
            <div className="h-12 glass-strong border-b border-border/30 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Prototype Preview</span>
              </div>
              <div className="flex items-center gap-2">
                {previewCurrentFrame && (
                  <span className="text-xs text-muted-foreground">
                    {elements.find(el => el.id === previewCurrentFrame)?.label || "Frame"}
                  </span>
                )}
                <button onClick={() => { setPreviewMode(false); setPreviewCurrentFrame(null); }}
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-secondary/60 text-foreground hover:bg-secondary transition-colors">
                  Exit Preview (Esc)
                </button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              {previewCurrentFrame && (() => {
                const frame = elements.find(el => el.id === previewCurrentFrame);
                if (!frame) return <p className="text-muted-foreground">No frame found</p>;
                // Find elements inside this frame
                const childEls = elements.filter(el =>
                  el.id !== frame.id && el.visible &&
                  el.x >= frame.x && el.y >= frame.y &&
                  el.x + el.w <= frame.x + frame.w && el.y + el.h <= frame.y + frame.h
                );
                return (
                  <motion.div
                    key={previewCurrentFrame}
                    initial={previewTransition === "slide" ? { x: 100, opacity: 0 } : previewTransition === "fade" ? { opacity: 0 } : {}}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative border border-border/30 rounded-lg overflow-hidden"
                    style={{ width: frame.w, height: frame.h, backgroundColor: frame.fillColor }}
                  >
                    {childEls.map(el => (
                      <div key={el.id}
                        className={`absolute ${prototypeLinks.some(l => l.fromId === el.id) ? "cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" : ""}`}
                        style={{
                          left: el.x - frame.x, top: el.y - frame.y,
                          width: el.w, height: el.h,
                          opacity: el.opacity / 100,
                        }}
                        onClick={() => handlePreviewClick(el.id)}
                      >
                        {el.type === "Text" ? (
                          <span style={{ color: el.fillColor, fontSize: el.fontSize, fontWeight: el.fontWeight, fontFamily: el.fontFamily }}>{el.text || el.label}</span>
                        ) : (
                          <svg width={el.w} height={el.h} className="overflow-visible">{renderShape(el)}</svg>
                        )}
                      </div>
                    ))}
                    {/* Show frame's own shape too */}
                    <div className="absolute bottom-2 left-2 text-[9px] text-muted-foreground/50">{frame.label}</div>
                  </motion.div>
                );
              })()}
            </div>
            {/* Frame navigation */}
            <div className="h-14 glass-strong border-t border-border/30 flex items-center justify-center gap-2 px-4">
              {elements.filter(el => el.type === "Frame").map(frame => (
                <button key={frame.id} onClick={() => setPreviewCurrentFrame(frame.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${previewCurrentFrame === frame.id ? "bg-primary/20 text-primary" : "bg-secondary/40 text-muted-foreground hover:text-foreground"}`}>
                  {frame.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProjectBrowser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="glass-strong rounded-2xl border border-border/30 w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Previous projects</h2>
                  <p className="text-xs text-muted-foreground">Open any saved workspace and continue editing it.</p>
                </div>
                <button onClick={() => setShowProjectBrowser(false)} className="p-1 rounded hover:bg-secondary/60 text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
                {projectBrowserLoading ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">Loading projects…</div>
                ) : recentProjects.length === 0 ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">No saved projects yet.</div>
                ) : (
                  recentProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => void handleOpenExistingProject(project.id)}
                      className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${project.id === projectId ? "border-primary/40 bg-primary/10" : "border-border/20 hover:bg-secondary/40"}`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(project.updated_at).toLocaleString()}</p>
                      </div>
                      {project.id === projectId && <span className="text-[10px] font-semibold text-primary">Current</span>}
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setShowExportModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-6 w-[420px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                ].map(item => (
                  <button key={item.format} onClick={() => downloadExport(item.format)}
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
                  {elements.length} elements will be exported
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong rounded-2xl p-6 w-[480px] max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Keyboard className="w-5 h-5 text-primary" /> Keyboard Shortcuts (Windows)</h2>
                <button onClick={() => setShowShortcuts(false)} className="p-1 rounded hover:bg-secondary/60 text-muted-foreground"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { category: "Tools", shortcuts: [
                    { keys: "V", desc: "Select tool" }, { keys: "H", desc: "Pan / Hand tool" }, { keys: "R", desc: "Rectangle" },
                    { keys: "O", desc: "Ellipse" }, { keys: "T", desc: "Triangle" }, { keys: "L", desc: "Line" },
                    { keys: "A", desc: "Arrow" }, { keys: "P", desc: "Pen tool" }, { keys: "X", desc: "Text" },
                    { keys: "F", desc: "Frame" }, { keys: "K", desc: "Scale" }, { keys: "B", desc: "Pencil" },
                  ]},
                  { category: "Actions", shortcuts: [
                    { keys: "Ctrl + Z", desc: "Undo" }, { keys: "Ctrl + Y", desc: "Redo" },
                    { keys: "Ctrl + D", desc: "Duplicate" }, { keys: "Delete", desc: "Delete element" },
                    { keys: "Ctrl + K", desc: "Command palette" }, { keys: "Escape", desc: "Deselect / Select tool" },
                  ]},
                  { category: "View", shortcuts: [
                    { keys: "Ctrl + +", desc: "Zoom in" }, { keys: "Ctrl + -", desc: "Zoom out" },
                    { keys: "Ctrl + 0", desc: "Zoom to 100%" }, { keys: "G", desc: "Toggle grid" },
                  ]},
                ].map(group => (
                  <div key={group.category}>
                    <h3 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{group.category}</h3>
                    <div className="grid grid-cols-2 gap-1">
                      {group.shortcuts.map(s => (
                        <div key={s.desc} className="flex items-center justify-between px-2 py-1.5 rounded bg-secondary/30">
                          <span className="text-[11px] text-muted-foreground">{s.desc}</span>
                          <kbd className="px-1.5 py-0.5 rounded bg-background/60 text-[10px] font-mono text-foreground">{s.keys}</kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Template Picker */}
      <TemplatePickerModal
        open={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
};

export default WorkspaceCanvas;
