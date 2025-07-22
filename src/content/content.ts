/// <reference types="chrome" />
import "../styles/style.css";
import { toHtml } from "./to-html";
import { toMarkdown } from "./to-markdown";


// Wait for the DOM to be ready before initializing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeUI);
} else {
  initializeUI();
}

function initializeUI() {
  // Prevent re-initialization
  if (document.getElementById("export-container")) {
    return;
  }

  // Create a container for the export buttons
  const container = document.createElement("div");
  container.id = "export-container";
  document.body.appendChild(container);

  // Add export to HTML button
  const exportHtmlButton = document.createElement("button");
  exportHtmlButton.textContent = "Export to HTML";
  exportHtmlButton.id = "export-html-button";
  container.appendChild(exportHtmlButton);

  // Add export to Markdown button
  const exportMdButton = document.createElement("button");
  exportMdButton.textContent = "Export to Markdown";
  exportMdButton.id = "export-md-button";
  container.appendChild(exportMdButton);

  // Export handlers
  exportHtmlButton.addEventListener("click", () => handleExport("html"));
  exportMdButton.addEventListener("click", () => handleExport("md"));
}

async function handleExport(format: "html" | "md") {
  try {
    if (format === "html") {
      const content = await toHtml();
      chrome.runtime.sendMessage(
        {
          action: "exportChat",
          format: "html",
          content,
        },
        (response: { success: boolean; error?: string }) => {
          if (!response?.success) {
            console.error("HTML export failed:", response?.error);
          }
        },
      );
    } else if (format === "md") {
      chrome.runtime.sendMessage({ action: "getMarkdown" });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`DeepSeek Export: Export failed:`, error);
      alert(`Export failed: ${error.message}`);
    } else {
      console.error(`DeepSeek Export: Export failed:`, error);
      alert(`Export failed: An unknown error occurred`);
    }
  }
}

// Make the functions available globally
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.toMarkdown = toMarkdown;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.toHtml = toHtml;
