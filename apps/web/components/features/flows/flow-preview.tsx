"use client";

import { useCanvasStore } from "@/stores/canvas-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, X, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function FlowPreview() {
  const { isCopilotOpen, toggleCopilot, copilotMessages, addCopilotMessage } = useCanvasStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [copilotMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    addCopilotMessage({ role: "user", content: input.trim() });
    setInput("");

    setTimeout(() => {
      addCopilotMessage({
        role: "assistant",
        content: "I'll help you build that automation. Let me create the flow for you...",
      });
    }, 1000);
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 w-80">
      <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-biolume" />
            <h3 className="text-xs font-semibold">AI Copilot</h3>
          </div>
          <button
            onClick={toggleCopilot}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <ScrollArea className="h-64 p-3" viewportRef={scrollRef}>
          <div className="space-y-3">
            {copilotMessages.map((msg, i) => (
              <div key={i} className="flex gap-2">
                <div
                  className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                    msg.role === "assistant"
                      ? "bg-biolume/20 text-biolume"
                      : "bg-cobalto/20 text-cobalto"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="h-3 w-3" />
                  ) : (
                    <User className="h-3 w-3" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-foreground/90">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-2 border-t border-border/50">
          <div className="flex gap-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your flow..."
              className="h-8 text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />
            <Button size="icon-sm" variant="biolume" onClick={handleSend}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
