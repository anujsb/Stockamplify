"use client";

import { useEffect } from "react";

export default function SiteGuard({
  disableCopy = false,     // set true if you also want to block copy/paste
  showAlert = false,       // set true to show a small alert on blocked actions
}: { disableCopy?: boolean; showAlert?: boolean }) {
  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (showAlert) alert("Right-click is disabled on this site.");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Block F12
      //if (e.key === "F12") {
        //e.preventDefault();
        //if (showAlert) alert("Developer Tools are disabled.");
       // return;
      //}

      // Block common DevTools shortcuts: Ctrl+Shift+I/J/C, Ctrl+Shift+K (Firefox),
      // Ctrl+U (View Source), Ctrl+S (Save Page), Ctrl+Shift+E (Network pane)
      const key = e.key.toUpperCase();
      const ctrl = e.ctrlKey || e.metaKey;  // meta for Mac (⌘)
      const shift = e.shiftKey;

      const blockedCombos =
        (ctrl && shift && ["I", "J", "C", "K", "E"].includes(key)) ||
        (ctrl && ["U", "S", "P"].includes(key)); // P = print (optional)

      if (blockedCombos) {
        e.preventDefault();
        if (showAlert) alert("This keyboard shortcut is disabled on this site.");
      }
    };

    // Optional: block copy/cut/paste/drag
    const onCopy = (e: ClipboardEvent) => { if (disableCopy) e.preventDefault(); };
    const onCut = (e: ClipboardEvent) => { if (disableCopy) e.preventDefault(); };
    const onPaste = (e: ClipboardEvent) => { if (disableCopy) e.preventDefault(); };
    const onDragStart = (e: DragEvent) => { e.preventDefault(); };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("dragstart", onDragStart);

    if (disableCopy) {
      document.addEventListener("copy", onCopy);
      document.addEventListener("cut", onCut);
      document.addEventListener("paste", onPaste);
    }

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("dragstart", onDragStart);
      if (disableCopy) {
        document.removeEventListener("copy", onCopy);
        document.removeEventListener("cut", onCut);
        document.removeEventListener("paste", onPaste);
      }
    };
  }, [disableCopy, showAlert]);

  return null;
}
