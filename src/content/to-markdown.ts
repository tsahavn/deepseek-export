import showdown from "showdown";
import { ensureCodeView } from "./switcher-utils";
const SELECTORS = {
  USER_PROMPT: ".fbb737a4",
  AI_ANSWER: "._4f9bf79",
  AI_THINKING: ".e1675d8b",
  AI_RESPONSE: ".ds-markdown",
  MESSAGE_TURN: ".dad65929",
  CODE_BLOCK: ".md-code-block",
  CODE_BLOCK_INFO: ".md-code-block-infostring",
  INLINE_MATH: ".math-inline",
  DISPLAY_MATH: ".math-display",
};

interface Conversation {
  type: "user" | "ai";
  content: string | { thinking: string; response: string };
}

// Main function to convert chat container to Markdown
export async function toMarkdown(
  chatContainer: HTMLElement,
  callback: (_markdown: string) => void,
): Promise<void> {
  // Ensure the code view is active before extracting content
  await ensureCodeView(chatContainer);

  const conversations = extractConversations(chatContainer);
  const markdown = formatMarkdown(conversations);
  callback(markdown);
}

// Extract conversations from the DOM
function extractConversations(chatContainer: HTMLElement): Conversation[] {
  const conversations: Conversation[] = [];
  const messageNodes = chatContainer.querySelectorAll(
    `${SELECTORS.USER_PROMPT}, ${SELECTORS.AI_ANSWER}`,
  );

  messageNodes.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;

    if (node.matches(SELECTORS.USER_PROMPT)) {
      conversations.push({
        type: "user",
        content: cleanContent(node, "prompt"),
      });
    } else if (node.matches(SELECTORS.AI_ANSWER)) {
      const thinkingNode = node.querySelector<HTMLElement>(
        SELECTORS.AI_THINKING,
      );
      const responseNode = node.querySelector<HTMLElement>(
        SELECTORS.AI_RESPONSE,
      );
      if (thinkingNode || responseNode) {
        conversations.push({
          type: "ai",
          content: {
            thinking: thinkingNode
              ? cleanContent(thinkingNode, "thinking")
              : "",
            response: responseNode
              ? cleanContent(responseNode, "response")
              : "",
          },
        });
      }
    }
  });

  return conversations;
}

// Clean content based on type
function cleanContent(
  node: HTMLElement,
  type: "prompt" | "thinking" | "response",
): string {
  const clone = node.cloneNode(true) as HTMLElement;

  // Remove buttons and icons
  clone.querySelectorAll("button, .ds-icon, svg").forEach((el) => el.remove());

  // Specific cleaning based on type
  if (type === "prompt") {
    // For prompts, we want mostly plain text, preserving line breaks.
    return clone.innerText.replace(/\n{3,}/g, "\n\n").trim();
  } else if (type === "thinking") {
    // Remove the decorative div before processing
    clone.querySelector("._9ecc93a")?.remove();

    let content = "";
    // Manually walk through nodes to preserve line breaks from text and divs.
    clone.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        content += child.textContent;
      } else if (
        child.nodeType === Node.ELEMENT_NODE &&
        (child as HTMLElement).tagName === "DIV"
      ) {
        content += "\n";
      }
    });

    // Consolidate multiple newlines and trim whitespace
    return content.replace(/\n{3,}/g, "\n\n").trim();
  } else {
    // For responses, we return the innerHTML to be processed by showdown
    return clone.innerHTML;
  }
}

// Format conversations into a single Markdown string
function formatMarkdown(conversations: Conversation[]): string {
  const fullTitle = document.title;
  const title = fullTitle.includes(" - DeepSeek")
    ? fullTitle.split(" - DeepSeek")[0].trim()
    : fullTitle.trim();
  let md = `# ${title || "DeepSeek Conversation"}\n\n`;

  conversations.forEach((conv, index) => {
    if (conv.type === "user") {
      if (index > 0) md += "\n---\n";
      const userContent = (conv.content as string);
      md += `\n[!user]\n${userContent}\n\n`;
    } else if (conv.type === "ai") {
      const aiContent = conv.content as { thinking: string; response: string };
      if (aiContent.thinking) {
        const thinkingContent = aiContent.thinking.split("\n").join("\n> ");
        md += `\n[!think]\n> ${thinkingContent}\n`;
      }
      if (aiContent.response) {
        md += `\n[!response]\n${htmlToMarkdown(aiContent.response)}\n`;
      }
    }
  });

  return md;
}

// Convert HTML to Markdown
function htmlToMarkdown(html: string): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Pre-process Katex math blocks
  tempDiv.querySelectorAll(".katex, .katex-display").forEach((mathEl) => {
    const annotation = mathEl.querySelector("annotation");
    const latex = annotation?.textContent?.trim();
    if (latex) {
      if (mathEl.classList.contains("katex-display")) {
        mathEl.replaceWith(`\n$$\n${latex}\n$$\n`);
      } else {
        mathEl.replaceWith(`$${latex}$`);
      }
    }
  });

  // Pre-process code blocks
  tempDiv.querySelectorAll(SELECTORS.CODE_BLOCK).forEach((codeBlock) => {
    const pre = document.createElement("pre");
    const code = document.createElement("code");

    let lang =
      codeBlock.querySelector(SELECTORS.CODE_BLOCK_INFO)?.textContent?.trim() ||
      "";
    const tabs = codeBlock.querySelectorAll(".ds-segmented-button");
    if (tabs.length === 2 && tabs[0].textContent === "Diagram") {
      lang = "mermaid";
    }

    if (lang) {
      code.className = `language-${lang}`;
    }
    code.textContent = codeBlock.querySelector("pre")?.textContent || "";
    pre.appendChild(code);
    codeBlock.replaceWith(pre);
  });
  // Clean up empty elements that might create unwanted newlines or comments
  tempDiv
    .querySelectorAll("p:empty, div:empty")
    .forEach((el) => el.remove());

  const converter = new showdown.Converter({
    ghCompatibleHeaderId: true,
    simpleLineBreaks: true,
    ghMentions: true,
    tables: true,
  });

  const markdown = converter.makeMarkdown(tempDiv.innerHTML);
  // Post-process to remove erroneous empty comments and extra newlines
  return markdown.replace(/\n?<!-- -->\n?/g, "");
}