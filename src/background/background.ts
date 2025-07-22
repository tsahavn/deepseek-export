/// <reference types="chrome" />

import DOMPurify from "dompurify";

// Listen for messages from content script
chrome.runtime.onMessage.addListener(
  (
    request: {
      action: string;
      format?: "html" | "md";
      content?: string | HtmlContent;
      markdown?: string;
    },
    sender: chrome.runtime.MessageSender,
    sendResponse: (_response: { success: boolean; error?: string }) => void,
  ) => {
    if (request.action === "getMarkdown" && sender.tab?.id) {
      chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        func: () => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.toMarkdown(
            document.body,
            (markdown: string) => {
              chrome.runtime.sendMessage({
                action: "downloadMarkdown",
                markdown,
              });
            },
          );
        },
      });
    } else if (request.action === "downloadMarkdown" && request.markdown) {
      downloadFile(request.markdown, "md");
      sendResponse({ success: true });
    } else if (request.action === "exportChat" && request.format === "html") {
      if (typeof request.content === "object" && "html" in request.content) {
        const htmlContent = generateHtml(request.content);
        downloadFile(htmlContent, "html");
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: "Invalid HTML content" });
      }
    }
  },
);

function downloadFile(content: string, format: "html" | "md") {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `deepseek-chat-${timestamp}.${format}`;
    const mimeType =
      format === "html" ? "text/html" : "text/markdown;charset=utf-8";

    const blob = new Blob([content], { type: mimeType });
    chrome.downloads.download({
      url: URL.createObjectURL(blob),
      filename,
      saveAs: true,
    });
  } catch (error) {
    console.error("Download failed:", error);
  }
}
interface HtmlContent {
  html: string;
  styles: string;
  title: string;
}

function generateHtml(content: HtmlContent) {
  const sanitizedHtml = DOMPurify.sanitize(content.html);
  const sanitizedStyles = DOMPurify.sanitize(content.styles);
  const escapedTitle = escapeHtml(content.title);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapedTitle}</title>
      <style>
        ${sanitizedStyles}
        body { padding: 20px; font-family: Arial, sans-serif; }
        /* Fix content not showing up problem */
        body > div {
          display: contents;
          width: 100%;
          height: 100%;
        }
        /* Hide chat message textarea */
        body > div > div > div > div:nth-child(3) {
          display: none;
        }
      </style>
    </head>
    <body>
      ${sanitizedHtml}
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&",
    "<": "<",
    ">": ">",
    '"': '"',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m: string) => map[m]);
}
