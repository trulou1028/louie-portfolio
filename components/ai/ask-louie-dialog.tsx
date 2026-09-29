"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Dialog as Primitive } from "@base-ui/react/dialog";
import { Sparkles, X } from "lucide-react";
import { Dialog, DialogTrigger, DialogPortal, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Action } from "@/components/system/action";
import { AskPanel } from "@/components/ai/ask-panel";
import { pageQuestionsFor, type PageQuestions } from "@/components/ai/ask-questions";

type AskLouieContextValue = {
  /** Opens the panel; with `prompt`, the chat sends it as the visitor's question. */
  openAsk: (prompt?: string) => void;
  /** A question waiting for the chat runtime to load and send it. */
  pending: { id: number; text: string } | null;
  clearPending: (id: number) => void;
  /** The project the visitor is reading, when the page has one. */
  page: PageQuestions | null;
  /** Whether the panel is open. */
  open: boolean;
  /** Which view the panel shows: the chat, or the job-description comparison. */
  view: "chat" | "compare";
  setView: (view: "chat" | "compare") => void;
  /** Opens the panel on the job-description comparison. */
  openCompare: () => void;
};

const AskLouieContext = React.createContext<AskLouieContextValue | null>(null);

export function useAskLouie(): AskLouieContextValue {
  const value = React.useContext(AskLouieContext);
  if (!value) throw new Error("useAskLouie needs AskLouieProvider");
  return value;
}

const DESKTOP = "(min-width: 1024px)";

/**
 * Ask Louie as a side panel (Plan 042). Closed at arrival; mounted once on
 * demand, so the visitor's draft and transcript survive closing it.
 *
 * - Desktop: a non-modal, full-height panel docked on the right. It pushes
 *   the header and page left: the page area narrows and reflows beside it, so a
 *   reader can follow an answer's link to the section it cites. Clicking the
 *   page does not close it; Close and Escape do.
 * - Below `lg`: a modal full-screen sheet, with focus kept inside.
 */
export function AskLouieProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [activated, setActivated] = React.useState(false);
  const [desktop, setDesktop] = React.useState(false);
  const [pending, setPending] = React.useState<AskLouieContextValue["pending"]>(null);
  const [view, setView] = React.useState<"chat" | "compare">("chat");

  const changeOpen = React.useCallback((next: boolean) => {
    setOpen(next);
    if (next) setActivated(true);
    // Closing returns to the chat view. That unmounts the comparison and
    // drops any pasted job description (spec §30).
    else setView("chat");
  }, []);

  React.useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Desktop: the open panel docks. `html[data-ask-docked]` narrows the app
  // frame (header and page) by the panel's width (app/globals.css), so the
  // page reflows beside the panel instead of sitting under it.
  const docked = open && desktop;
  React.useEffect(() => {
    document.documentElement.toggleAttribute("data-ask-docked", docked);
    return () => document.documentElement.removeAttribute("data-ask-docked");
  }, [docked]);

  React.useEffect(() => {
    const onHash = () => { if (window.location.hash === "#ask-ai-louie") changeOpen(true); };
    const frame = requestAnimationFrame(onHash);
    window.addEventListener("hashchange", onHash);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", onHash); };
  }, [changeOpen]);

  const context = React.useMemo<AskLouieContextValue>(() => ({
    openAsk: (prompt) => {
      const text = prompt?.trim();
      if (text) setPending({ id: Date.now(), text });
      setView("chat");
      changeOpen(true);
    },
    pending,
    clearPending: (id) => setPending((current) => (current?.id === id ? null : current)),
    page: pageQuestionsFor(pathname),
    open,
    view,
    setView,
    openCompare: () => {
      setView("compare");
      changeOpen(true);
    },
  }), [changeOpen, pending, pathname, open, view]);

  /**
   * An answer's link to another page closes the sheet on a phone, where it
   * covers the page. On desktop the panel stays, so the reader sees the
   * cited section beside the answer. A same-page section link changes only
   * the hash through the router, which fires no `hashchange`, so this sends
   * one for `DeepLinkHighlight` to scroll to and highlight the section.
   */
  function onPanelClick(event: React.MouseEvent) {
    const link = (event.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href");
    if (!href?.startsWith("/")) return;
    const [path, hash] = href.split("#");
    if (!desktop) changeOpen(false);
    if (!hash || path !== window.location.pathname) return;
    // Wait for the router to write the hash (up to ~20 frames), then
    // announce it. The capture script in `app/layout.tsx` reads `newURL`.
    const oldURL = window.location.href;
    let frames = 0;
    const announce = () => {
      if (window.location.hash !== `#${hash}` && frames++ < 20) {
        requestAnimationFrame(announce);
        return;
      }
      window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: window.location.href }));
    };
    requestAnimationFrame(announce);
  }

  return <AskLouieContext.Provider value={context}>
    <Dialog open={open} onOpenChange={changeOpen} modal={!desktop} disablePointerDismissal={desktop}>
      {children}
      {activated && <DialogPortal keepMounted>
        <Primitive.Popup
          hidden={!open}
          onClick={onPanelClick}
          className="ask-panel fixed inset-0 z-50 flex flex-col overflow-hidden bg-canvas text-foreground outline-none lg:inset-auto lg:inset-y-0 lg:right-0 lg:w-(--ask-panel-width) lg:border-l lg:border-border-subtle"
        >
          <DialogTitle className="sr-only">Ask Louie</DialogTitle>
          <DialogDescription className="sr-only">Ask about Louie’s work or compare a job description with the portfolio evidence.</DialogDescription>
          <AskPanel headerEnd={<DialogClose aria-label="Close" render={<Action variant="ghost" size="sm" className="size-9 rounded-full px-0" />}><X aria-hidden="true" className="size-4" /></DialogClose>} />
        </Primitive.Popup>
      </DialogPortal>}
    </Dialog>
  </AskLouieContext.Provider>;
}

/** Responsive navigation triggers share one persistent panel and transcript. */
export function AskLouieTrigger({ className, compact = false, variant }: { className?: string; compact?: boolean; variant?: "primary" | "secondary" | "ghost" }) {
  return <DialogTrigger render={<Action variant={variant ?? (compact ? "ghost" : "secondary")} size={compact ? "sm" : "md"} className={className} />}><Sparkles aria-hidden="true" className="size-4" />Ask Louie</DialogTrigger>;
}
