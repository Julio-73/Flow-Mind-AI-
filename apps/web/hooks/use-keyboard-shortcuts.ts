"use client";

import { useEffect } from "react";

type ShortcutAction =
  | "save"
  | "undo"
  | "redo"
  | "duplicate"
  | "delete"
  | "search"
  | "run"
  | "escape"
  | "new-flow";

const SHORTCUT_MAP: Record<string, ShortcutAction> = {};

if (typeof window !== "undefined") {
  SHORTCUT_MAP["meta+s"] = "save";
  SHORTCUT_MAP["ctrl+s"] = "save";
  SHORTCUT_MAP["meta+z"] = "undo";
  SHORTCUT_MAP["ctrl+z"] = "undo";
  SHORTCUT_MAP["meta+shift+z"] = "redo";
  SHORTCUT_MAP["ctrl+shift+z"] = "redo";
  SHORTCUT_MAP["meta+d"] = "duplicate";
  SHORTCUT_MAP["ctrl+d"] = "duplicate";
  SHORTCUT_MAP["delete"] = "delete";
  SHORTCUT_MAP["backspace"] = "delete";
  SHORTCUT_MAP["meta+k"] = "search";
  SHORTCUT_MAP["ctrl+k"] = "search";
  SHORTCUT_MAP["meta+enter"] = "run";
  SHORTCUT_MAP["ctrl+enter"] = "run";
  SHORTCUT_MAP["escape"] = "escape";
  SHORTCUT_MAP["n"] = "new-flow";
}

export function useKeyboardShortcuts(handlers: Partial<Record<ShortcutAction, () => void>>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const key = [
        e.metaKey || e.ctrlKey ? "meta" : "",
        e.shiftKey ? "shift" : "",
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join("+");

      const action = SHORTCUT_MAP[key];
      if (action && handlers[action]) {
        e.preventDefault();
        handlers[action]!();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handlers, enabled]);
}
