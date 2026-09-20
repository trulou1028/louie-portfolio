"use client";

import * as React from "react";
import { Dialog as Primitive } from "@base-ui/react/dialog";
import { Sparkles, X } from "lucide-react";
import { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Action } from "@/components/system/action";
import { AskPanel } from "@/components/ai/ask-panel";

/** Closed at arrival; mounted once on demand, preserving the visitor's draft and transcript. */
export function AskLouieProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [activated, setActivated] = React.useState(false);
  function changeOpen(next: boolean) { setOpen(next); if (next) setActivated(true); }
  React.useEffect(() => {
    const onHash = () => { if (window.location.hash === "#ask-ai-louie") changeOpen(true); };
    const frame = requestAnimationFrame(onHash);
    window.addEventListener("hashchange", onHash);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", onHash); };
  }, []);
  return <Dialog open={open} onOpenChange={changeOpen}>
    {children}
    {activated && <DialogPortal keepMounted>
      <DialogOverlay hidden={!open} />
      <Primitive.Popup hidden={!open} onClick={(event) => {
        const link = (event.target as HTMLElement).closest("a");
        if (link?.getAttribute("href")?.startsWith("/")) changeOpen(false);
      }} className="fixed left-1/2 top-1/2 z-50 flex h-[min(760px,90dvh)] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-panel border border-border-default bg-canvas text-foreground shadow-lg outline-none">
        <DialogTitle className="sr-only">Ask Louie</DialogTitle>
        <DialogDescription className="sr-only">Ask about Louie’s work or compare a job description with the portfolio evidence.</DialogDescription>
        <div className="flex shrink-0 justify-end border-b border-border-subtle px-4 py-2">
          <DialogClose render={<Action variant="ghost" size="sm" />}><X aria-hidden="true" className="size-4" />Close</DialogClose>
        </div>
        <AskPanel />
      </Primitive.Popup>
    </DialogPortal>}
  </Dialog>;
}

/** Responsive navigation triggers share one persistent dialog and transcript. */
export function AskLouieTrigger({ className, compact = false }: { className?: string; compact?: boolean }) {
  return <DialogTrigger render={<Action variant={compact ? "ghost" : "secondary"} size={compact ? "sm" : "md"} className={className} />}><Sparkles aria-hidden="true" className="size-4" />Ask Louie</DialogTrigger>;
}
