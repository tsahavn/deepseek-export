// Shared utility to ensure "Code" is selected for all switchers
export function ensureCodeView(container: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const switchers = container.querySelectorAll(".ds-segmented");
    console.log(`[DeepSeek Export] Found ${switchers.length} switchers.`);
    let switchersToUpdate = 0;

    switchers.forEach((switcher, index) => {
      const diagramTab = switcher.querySelector<HTMLElement>(
        '[role="tab"]:first-child',
      );
      const codeTab = switcher.querySelector<HTMLElement>(
        '[role="tab"]:last-child',
      );

      console.log(
        `[DeepSeek Export] Switcher ${index}: Diagram tab: ${diagramTab?.textContent}, Code tab: ${codeTab?.textContent}, Diagram selected: ${diagramTab?.getAttribute("aria-selected")}`,
      );

      if (
        diagramTab?.textContent?.trim() === "Diagram" &&
        codeTab?.textContent?.trim() === "Code" &&
        diagramTab.getAttribute("aria-selected") === "true"
      ) {
        console.log(`[DeepSeek Export] Clicking Code tab for switcher ${index}.`);
        switchersToUpdate++;
        // Simulate a more realistic user click
        const mouseDownEvent = new MouseEvent("mousedown", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        const mouseUpEvent = new MouseEvent("mouseup", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        codeTab.dispatchEvent(mouseDownEvent);
        codeTab.dispatchEvent(mouseUpEvent);
        codeTab.click();
      }
    });

    if (switchersToUpdate > 0) {
      // Give the DOM time to update after the clicks
      setTimeout(() => {
        console.log(
          `[DeepSeek Export] Switched ${switchersToUpdate} blocks to Code view.`,
        );
        resolve();
      }, 200); // 200ms delay to be safer
    } else {
      console.log("[DeepSeek Export] No switchers needed updating.");
      resolve(); // No switchers needed updating
    }
  });
}