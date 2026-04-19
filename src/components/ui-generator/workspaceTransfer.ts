import { CanvasElement } from "../workspace/types";

export type GeneratedUI = { html: string; css: string; js: string };

export type WorkspaceImportPayload = {
  name: string;
  elements: CanvasElement[];
  pages: { id: number; name: string; active: boolean }[];
  canvasSettings: {
    zoom: number;
    panOffset: { x: number; y: number };
    showGrid: boolean;
    gridSize: number;
    gridStyle: "lines" | "dots" | "cross";
  };
  prompt: string;
  htmlContent?: string;
};

const FRAME_FILL = "hsl(0, 0%, 100%)";
const FRAME_STROKE = "hsl(220, 12%, 82%)";
const IMPORT_OFFSET_X = 60;
const IMPORT_OFFSET_Y = 60;
const HIDDEN_RENDER_WIDTH = 1440;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const round = (value: number) => Math.round(value * 100) / 100;

const isTransparent = (value: string | null | undefined) => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === "transparent" || normalized === "rgba(0, 0, 0, 0)" || normalized === "rgb(0 0 0 / 0)";
};

const hasVisibleBorder = (style: CSSStyleDeclaration) => {
  const borderWidth = Number.parseFloat(style.borderTopWidth || "0");
  return borderWidth > 0 && !isTransparent(style.borderTopColor);
};

const hasVisibleBox = (style: CSSStyleDeclaration) => {
  if (!isTransparent(style.backgroundColor)) return true;
  if (hasVisibleBorder(style)) return true;
  return !!style.boxShadow && style.boxShadow !== "none";
};

const getRadius = (style: CSSStyleDeclaration) => {
  const radius = Number.parseFloat(style.borderTopLeftRadius || "0");
  return Number.isFinite(radius) ? radius : 0;
};

const waitForLayout = async () => {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
};

const waitForImages = async (root: HTMLElement) => {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }

          const done = () => resolve();
          image.addEventListener("load", done, { once: true });
          image.addEventListener("error", done, { once: true });
          window.setTimeout(done, 1200);
        })
    )
  );
};

const createBaseElement = (
  id: number,
  type: string,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string
): CanvasElement => ({
  id,
  type,
  x: round(x),
  y: round(y),
  w: round(w),
  h: round(h),
  label,
  fillColor: FRAME_FILL,
  strokeColor: "transparent",
  strokeWidth: 0,
  opacity: 100,
  rotation: 0,
  cornerRadius: 0,
  visible: true,
  locked: false,
});

const buildFallbackElements = (prompt: string): CanvasElement[] => [
  {
    ...createBaseElement(1, "Frame", IMPORT_OFFSET_X, IMPORT_OFFSET_Y, 1440, 960, prompt || "Generated UI"),
    fillColor: FRAME_FILL,
    strokeColor: FRAME_STROKE,
    strokeWidth: 1,
    cornerRadius: 24,
  },
];

const getTextValue = (node: HTMLElement) => {
  if (node instanceof HTMLInputElement) return node.value || node.placeholder || node.getAttribute("aria-label") || "Input";
  if (node instanceof HTMLTextAreaElement) return node.value || node.placeholder || node.getAttribute("aria-label") || "Textarea";
  if (node instanceof HTMLSelectElement) return node.selectedOptions[0]?.textContent?.trim() || node.getAttribute("aria-label") || "Select";
  return node.textContent?.replace(/\s+/g, " ").trim() || "";
};

const isTextElement = (node: HTMLElement) => {
  const tag = node.tagName.toLowerCase();
  if (["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "label", "small", "strong", "em"].includes(tag)) {
    return true;
  }
  if (tag === "a" || tag === "button") return true;
  if (["input", "textarea", "select"].includes(tag)) return true;
  return false;
};

const shouldCreateContainer = (node: HTMLElement, style: CSSStyleDeclaration) => {
  const tag = node.tagName.toLowerCase();
  if (["img", "svg", "path", "button", "input", "textarea", "select", "option"].includes(tag)) return false;
  if (["section", "article", "aside", "header", "footer", "nav", "main", "form", "figure"].includes(tag)) return true;
  if (!hasVisibleBox(style)) return false;
  if (node.children.length === 1 && !node.textContent?.trim()) return false;
  return true;
};

const shouldAddTextLayer = (node: HTMLElement) => {
  if (!isTextElement(node)) return false;
  if (node.querySelector("img, svg, input, textarea, select")) return false;
  return !!getTextValue(node);
};

const createEditableElementsFromLayout = async (generatedUI: GeneratedUI, prompt: string) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      elements: buildFallbackElements(prompt),
      width: 1440,
      height: 960,
    };
  }

  const host = document.createElement("div");
  host.setAttribute("data-generated-ui-import", "true");
  host.style.position = "fixed";
  host.style.left = "-20000px";
  host.style.top = "0";
  host.style.width = `${HIDDEN_RENDER_WIDTH}px`;
  host.style.pointerEvents = "none";
  host.style.visibility = "hidden";
  host.style.zIndex = "-1";

  host.innerHTML = `
    <style>
      *, *::before, *::after { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      img { display: block; max-width: 100%; }
      button, input, textarea, select { font: inherit; }
      ${generatedUI.css}
    </style>
    <div data-generated-ui-root>
      ${generatedUI.html}
    </div>
  `;

  document.body.appendChild(host);

  try {
    const root = host.querySelector("[data-generated-ui-root]") as HTMLElement | null;
    if (!root) {
      return {
        elements: buildFallbackElements(prompt),
        width: 1440,
        height: 960,
      };
    }

    await waitForLayout();
    await waitForImages(root);
    await waitForLayout();

    const rootRect = root.getBoundingClientRect();
    const rootWidth = clamp(Math.ceil(Math.max(root.scrollWidth, rootRect.width, 360)), 360, 2200);
    const rootHeight = clamp(Math.ceil(Math.max(root.scrollHeight, rootRect.height, 480)), 480, 4000);
    const elements: CanvasElement[] = [];
    let nextId = 1;

    const rootStyle = window.getComputedStyle(root);
    if (hasVisibleBox(rootStyle)) {
      elements.push({
        ...createBaseElement(nextId++, "Frame", IMPORT_OFFSET_X, IMPORT_OFFSET_Y, rootWidth, rootHeight, prompt || "Generated UI"),
        fillColor: isTransparent(rootStyle.backgroundColor) ? FRAME_FILL : rootStyle.backgroundColor,
        strokeColor: hasVisibleBorder(rootStyle) ? rootStyle.borderTopColor : FRAME_STROKE,
        strokeWidth: hasVisibleBorder(rootStyle) ? Number.parseFloat(rootStyle.borderTopWidth || "1") : 1,
        cornerRadius: getRadius(rootStyle),
      });
    }

    const nodes = Array.from(root.querySelectorAll("*")) as HTMLElement[];

    for (const node of nodes) {
      const style = window.getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const tag = node.tagName.toLowerCase();

      if (style.display === "none" || style.visibility === "hidden" || Number.parseFloat(style.opacity || "1") === 0) continue;
      if (rect.width < 4 || rect.height < 4) continue;

      const x = clamp(rect.left - rootRect.left + IMPORT_OFFSET_X, IMPORT_OFFSET_X, IMPORT_OFFSET_X + rootWidth);
      const y = clamp(rect.top - rootRect.top + IMPORT_OFFSET_Y, IMPORT_OFFSET_Y, IMPORT_OFFSET_Y + rootHeight);
      const w = clamp(rect.width, 4, 2200);
      const h = clamp(rect.height, 4, 4000);
      const text = getTextValue(node);

      if (tag === "img") {
        const src = node.getAttribute("src");
        if (!src) continue;
        elements.push({
          ...createBaseElement(nextId++, "Image", x, y, w, h, node.getAttribute("alt") || `${prompt} image`),
          fillColor: "transparent",
          strokeColor: "transparent",
          imageUrl: src,
          imageObjectFit: style.objectFit || "cover",
          cornerRadius: getRadius(style),
        });
        continue;
      }

      if (["button", "input", "textarea", "select"].includes(tag)) {
        const fillColor = isTransparent(style.backgroundColor) ? FRAME_FILL : style.backgroundColor;
        const strokeColor = hasVisibleBorder(style) ? style.borderTopColor : FRAME_STROKE;
        const strokeWidth = hasVisibleBorder(style) ? Number.parseFloat(style.borderTopWidth || "1") : 1;

        elements.push({
          ...createBaseElement(nextId++, "Rectangle", x, y, w, h, text || `${tag} field`),
          fillColor,
          strokeColor,
          strokeWidth,
          cornerRadius: getRadius(style),
        });

        if (text) {
          elements.push({
            ...createBaseElement(nextId++, "Text", x + 12, y + Math.max(8, h * 0.18), Math.max(w - 24, 40), Math.max(h - 16, 24), text.slice(0, 80)),
            fillColor: isTransparent(style.color) ? "hsl(240, 10%, 12%)" : style.color,
            text,
            fontSize: Number.parseFloat(style.fontSize || "16") || 16,
            fontWeight: style.fontWeight || "400",
            fontFamily: style.fontFamily || "Inter",
            textAlign: style.textAlign || "left",
            lineHeight: Number.parseFloat(style.lineHeight || "0") || undefined,
            letterSpacing: Number.parseFloat(style.letterSpacing || "0") || undefined,
          });
        }
        continue;
      }

      if (shouldCreateContainer(node, style)) {
        elements.push({
          ...createBaseElement(nextId++, "Frame", x, y, w, h, text?.slice(0, 60) || `${tag} block`),
          fillColor: isTransparent(style.backgroundColor) ? "transparent" : style.backgroundColor,
          strokeColor: hasVisibleBorder(style) ? style.borderTopColor : "transparent",
          strokeWidth: hasVisibleBorder(style) ? Number.parseFloat(style.borderTopWidth || "1") : 0,
          cornerRadius: getRadius(style),
        });
      }

      if (shouldAddTextLayer(node) && text) {
        elements.push({
          ...createBaseElement(nextId++, "Text", x, y, w, h, text.slice(0, 80)),
          fillColor: isTransparent(style.color) ? "hsl(240, 10%, 12%)" : style.color,
          text,
          fontSize: Number.parseFloat(style.fontSize || "16") || 16,
          fontWeight: style.fontWeight || "400",
          fontFamily: style.fontFamily || "Inter",
          textAlign: style.textAlign || "left",
          lineHeight: Number.parseFloat(style.lineHeight || "0") || undefined,
          letterSpacing: Number.parseFloat(style.letterSpacing || "0") || undefined,
        });
      }
    }

    return {
      elements: elements.length > 0 ? elements : buildFallbackElements(prompt),
      width: rootWidth,
      height: rootHeight,
    };
  } finally {
    host.remove();
  }
};

export const generatedUiToWorkspacePayload = async (
  generatedUI: GeneratedUI,
  prompt: string
): Promise<WorkspaceImportPayload> => {
  const { elements, width, height } = await createEditableElementsFromLayout(generatedUI, prompt);

  return {
    name: prompt || "Generated UI",
    elements,
    pages: [{ id: 1, name: "Page 1", active: true }],
    canvasSettings: {
      zoom: 60,
      panOffset: { x: Math.max(40, (1400 - width) * 0.08), y: Math.max(30, (900 - height) * 0.05) },
      showGrid: true,
      gridSize: 40,
      gridStyle: "lines",
    },
    prompt,
  };
};