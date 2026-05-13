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
const HIDDEN_RENDER_HEIGHT = 960;

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
  const tag = node.tagName.toLowerCase();
  if (tag === "input") {
    const input = node as HTMLInputElement;
    return input.value || input.placeholder || input.getAttribute("aria-label") || "Input";
  }
  if (tag === "textarea") {
    const textarea = node as HTMLTextAreaElement;
    return textarea.value || textarea.placeholder || textarea.getAttribute("aria-label") || "Textarea";
  }
  if (tag === "select") {
    const select = node as HTMLSelectElement;
    return select.selectedOptions[0]?.textContent?.trim() || select.getAttribute("aria-label") || "Select";
  }
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

const getBackgroundCss = (style: CSSStyleDeclaration, fallback = "transparent") => {
  const image = style.backgroundImage?.trim();
  if (image && image !== "none") return image;
  return isTransparent(style.backgroundColor) ? fallback : style.backgroundColor;
};

const createGeneratedDocument = (generatedUI: GeneratedUI) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; min-width: ${HIDDEN_RENDER_WIDTH}px; }
    img, svg { display: block; max-width: 100%; }
    button, input, textarea, select { font: inherit; }
    ${generatedUI.css}
  </style>
</head>
<body>
  ${generatedUI.html}
  ${generatedUI.js ? `<script>${generatedUI.js}<\/script>` : ""}
</body>
</html>`;

const isLayoutWrapper = (node: HTMLElement) => {
  const tag = node.tagName.toLowerCase();
  if (["html", "body", "script", "style", "meta", "link"].includes(tag)) return true;
  if (node.children.length > 0) return true;
  const text = getTextValue(node);
  return !text;
};

const createEditableElementsFromLayout = async (generatedUI: GeneratedUI, prompt: string) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return {
      elements: buildFallbackElements(prompt),
      width: 1440,
      height: 960,
    };
  }

  const iframe = document.createElement("iframe");
  iframe.setAttribute("data-generated-ui-import", "true");
  iframe.style.position = "fixed";
  iframe.style.left = "-20000px";
  iframe.style.top = "0";
  iframe.style.width = `${HIDDEN_RENDER_WIDTH}px`;
  iframe.style.height = `${HIDDEN_RENDER_HEIGHT}px`;
  iframe.style.pointerEvents = "none";
  iframe.style.visibility = "hidden";
  iframe.style.zIndex = "-1";
  iframe.srcdoc = createGeneratedDocument(generatedUI);

  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      iframe.addEventListener("load", () => resolve(), { once: true });
      window.setTimeout(resolve, 1200);
    });

    const importDocument = iframe.contentDocument;
    const root = importDocument?.body || null;
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

    const documentElement = importDocument?.documentElement || root;
    const rootRect = root.getBoundingClientRect();
    const documentRect = documentElement.getBoundingClientRect();
    const rootWidth = clamp(Math.ceil(Math.max(root.scrollWidth, documentElement.scrollWidth, rootRect.width, documentRect.width, HIDDEN_RENDER_WIDTH)), 360, 2400);
    const rootHeight = clamp(Math.ceil(Math.max(root.scrollHeight, documentElement.scrollHeight, rootRect.height, documentRect.height, HIDDEN_RENDER_HEIGHT)), 480, 5000);
    const elements: CanvasElement[] = [];
    let nextId = 1;

    const rootStyle = iframe.contentWindow?.getComputedStyle(root) || window.getComputedStyle(root);
    const previewFrameId = nextId++;
    elements.push({
      ...createBaseElement(previewFrameId, "Frame", IMPORT_OFFSET_X, IMPORT_OFFSET_Y, rootWidth, rootHeight, `${prompt || "Generated UI"} exact preview`),
      fillColor: getBackgroundCss(rootStyle, FRAME_FILL),
      strokeColor: FRAME_STROKE,
      strokeWidth: 1,
      cornerRadius: getRadius(rootStyle),
      locked: true,
      opacity: 100,
      generatedPreview: true,
      htmlContent: createGeneratedDocument(generatedUI),
    });

    const nodes = Array.from(root.querySelectorAll("*")) as HTMLElement[];
    const getComputedStyleForNode = (node: HTMLElement) => iframe.contentWindow?.getComputedStyle(node) || window.getComputedStyle(node);

    for (const node of nodes) {
      const style = getComputedStyleForNode(node);
      const rect = node.getBoundingClientRect();
      const tag = node.tagName.toLowerCase();

      if (style.display === "none" || style.visibility === "hidden" || Number.parseFloat(style.opacity || "1") === 0) continue;
      if (rect.width < 4 || rect.height < 4) continue;

      const x = clamp(rect.left - rootRect.left + IMPORT_OFFSET_X, IMPORT_OFFSET_X, IMPORT_OFFSET_X + rootWidth);
      const y = clamp(rect.top - rootRect.top + IMPORT_OFFSET_Y, IMPORT_OFFSET_Y, IMPORT_OFFSET_Y + rootHeight);
      const w = clamp(rect.width, 4, 2200);
      const h = clamp(rect.height, 4, 4000);
      const text = getTextValue(node);

      if (tag === "svg") {
        const svgMarkup = node.outerHTML;
        const imageUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
        elements.push({
          ...createBaseElement(nextId++, "Image", x, y, w, h, node.getAttribute("aria-label") || `${prompt} icon`),
          fillColor: "transparent",
          strokeColor: "transparent",
          imageUrl,
          imageObjectFit: "contain",
          generatedEditable: true,
        });
        continue;
      }

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
          generatedEditable: true,
        });
        continue;
      }

      if (["button", "input", "textarea", "select"].includes(tag)) {
        const fillColor = getBackgroundCss(style, FRAME_FILL);
        const strokeColor = hasVisibleBorder(style) ? style.borderTopColor : FRAME_STROKE;
        const strokeWidth = hasVisibleBorder(style) ? Number.parseFloat(style.borderTopWidth || "1") : 1;

        elements.push({
          ...createBaseElement(nextId++, "Rectangle", x, y, w, h, text || `${tag} field`),
          fillColor,
          strokeColor,
          strokeWidth,
          cornerRadius: getRadius(style),
          generatedEditable: true,
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
            generatedEditable: true,
          });
        }
        continue;
      }

      if (shouldCreateContainer(node, style)) {
        elements.push({
          ...createBaseElement(nextId++, "Frame", x, y, w, h, text?.slice(0, 60) || `${tag} block`),
          fillColor: getBackgroundCss(style, "transparent"),
          strokeColor: hasVisibleBorder(style) ? style.borderTopColor : "transparent",
          strokeWidth: hasVisibleBorder(style) ? Number.parseFloat(style.borderTopWidth || "1") : 0,
          cornerRadius: getRadius(style),
          generatedEditable: true,
        });
      }

      if (shouldAddTextLayer(node) && text && !isLayoutWrapper(node)) {
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
          generatedEditable: true,
        });
      }
    }

    return {
      elements: elements.length > 0 ? elements : buildFallbackElements(prompt),
      width: rootWidth,
      height: rootHeight,
    };
  } finally {
    iframe.remove();
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