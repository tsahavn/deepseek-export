import { ensureCodeView } from "./switcher-utils";

// Structural selectors (update as needed)
const SELECTORS = {
  CHAT_CONTAINER: "._0f72b0b",
};

// Ensure elements have valid height for HTML export
function ensureElementHeight(element: Element) {
  if (!element) return;
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.height === "0px") {
    (element as HTMLElement).style.minHeight = "1px";
  }
  Array.from(element.children).forEach(ensureElementHeight);
}

// Force layout recalculation for HTML export
function forceLayoutRecalculation(element: HTMLElement) {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  element.offsetHeight;
}

// Capture chat content for HTML export
export async function toHtml() {
  const chatContainer = document.querySelector<HTMLElement>(
    SELECTORS.CHAT_CONTAINER,
  );
  if (!chatContainer) {
    throw new Error("Chat container not found");
  }

  // Ensure "Code" view is active before cloning
  await ensureCodeView(chatContainer);

  forceLayoutRecalculation(chatContainer);
  const clone = chatContainer.cloneNode(true) as HTMLElement;
  ensureElementHeight(clone);

  Array.from(clone.querySelectorAll("img")).forEach((img) => {
    img.src = img.src.replace(/^blob:/, "");
  });

  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");

  return {
    html: clone.outerHTML,
    styles,
    title: document.title,
  };
}