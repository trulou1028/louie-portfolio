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
 * Plan 051: on the desktop homepage the panel opens on arrival. A visitor who
 * closes it has said they do not want it, so this flag keeps it closed on
 * later visits. The e2e suite sets it by default (playwright.config.ts).
 */
export const ASK_CLOSED_KEY = "ask-louie-closed";

/** Opening on arrival needs room: at 1280px the page keeps 860px beside the panel. */
const AUTO_OPEN = "(min-width: 1280px)";

/**
 * Ask Louie as a side panel (Plan 042). Mounted once, on first open, so the
 * visitor's draft and transcript survive closing it. Closed at arrival,
 * except on the desktop homepage, where it opens beside the page without
 * taking focus (Plan 051) unless the visitor closed it before.
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
  // True while the panel is open because the page opened it, not the
  // visitor: it must not pull keyboard focus away from the page.
  const [openedByPage, setOpenedByPage] = React.useState(false);
  const autoOpenChecked = React.useRef(false);

  const changeOpen = React.useCallback((next: boolean) => {
    setOpen(next);
    setOpenedByPage(false);
    if (next) setActivated(true);
    else {
      // Closing returns to the chat view. That unmounts the comparison and
      // drops any pasted job description (spec §30).
      setView("chat");
      try { window.localStorage.setItem(ASK_CLOSED_KEY, "1"); } catch { /* storage blocked: it simply opens again next time */ }
    }
  }, []);

  React.useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Plan 051: open beside the desktop homepage on arrival, once per load,
  // when the window is wide enough for the page to stay readable beside it.
  React.useEffect(() => {
    if (!desktop || pathname !== "/" || autoOpenChecked.current) return;
    // In a frame, like the hash check below, so the open is not a state
    // update inside the effect body. The flag is set in the frame too, so a
    // cancelled frame (Strict Mode's double run) does not skip the open.
    const frame = requestAnimationFrame(() => {
      autoOpenChecked.current = true;
      if (!window.matchMedia(AUTO_OPEN).matches) return;
      let closedBefore = false;
      try { closedBefore = window.localStorage.getItem(ASK_CLOSED_KEY) === "1"; } catch { /* treat as not closed */ }
      if (closedBefore) return;
      setOpen(true);
      setActivated(true);
      setOpenedByPage(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [desktop, pathname]);

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
          initialFocus={openedByPage ? false : undefined}
          className="ask-panel fixed inset-0 z-50 flex flex-col overflow-hidden bg-canvas text-foreground outline-none lg:inset-auto lg:inset-y-0 lg:right-0 lg:w-(--ask-panel-width) lg:border-l lg:border-border-subtle"
        >
          <PanelResizer />
          <DialogTitle className="sr-only">Ask Louie</DialogTitle>
          <DialogDescription className="sr-only">Ask about Louie’s work or compare a job description with the portfolio evidence.</DialogDescription>
          <AskPanel headerEnd={<DialogClose aria-label="Close" render={<Action variant="ghost" size="sm" className="size-9 rounded-full px-0" />}><X aria-hidden="true" className="size-4" /></DialogClose>} />
        </Primitive.Popup>
      </DialogPortal>}
    </Dialog>
  </AskLouieContext.Provider>;
}

const WIDTH_KEY = "ask-louie-width";
/** The default too (Louie, 2026-10-16): the panel opens at its narrowest. */
const MIN_WIDTH = 350;
const MAX_WIDTH = 720;
/** The page keeps at least this much width beside the panel. */
const PAGE_MIN = 600;

function clampWidth(width: number) {
  const max = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, window.innerWidth - PAGE_MIN));
  return Math.round(Math.min(max, Math.max(MIN_WIDTH, width)));
}

/**
 * Drag the panel's left edge to resize it (Plan 051, Louie's review
 * 2026-10-15). Desktop only, where the panel docks. It follows the window
 * splitter pattern: a focusable separator that arrow keys move too. The
 * width lives in `--ask-panel-width`, which sizes the panel and narrows the
 * page by the same amount, and it is remembered across visits.
 */
function PanelResizer() {
  const [width, setWidth] = React.useState(MIN_WIDTH);

  const apply = React.useCallback((next: number) => {
    const value = clampWidth(next);
    document.documentElement.style.setProperty("--ask-panel-width", `${value}px`);
    setWidth(value);
    return value;
  }, []);

  const save = (value: number) => {
    try { window.localStorage.setItem(WIDTH_KEY, String(value)); } catch { /* storage blocked: the width lasts this visit */ }
  };

  // Restore the remembered width, in a frame (no state update in the effect body).
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let saved = Number.NaN;
      try { saved = Number(window.localStorage.getItem(WIDTH_KEY)); } catch { /* use the default */ }
      if (saved) apply(saved);
    });
    return () => cancelAnimationFrame(frame);
  }, [apply]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    document.documentElement.toggleAttribute("data-ask-resizing", true);
    let last = width;
    const move = (e: PointerEvent) => { last = apply(window.innerWidth - e.clientX); };
    const up = () => {
      document.documentElement.removeAttribute("data-ask-resizing");
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      save(last);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    // The panel is on the right, so moving its edge left makes it wider.
    const step = event.shiftKey ? 64 : 16;
    const next =
      event.key === "ArrowLeft" ? width + step :
      event.key === "ArrowRight" ? width - step :
      event.key === "Home" ? MIN_WIDTH :
      event.key === "End" ? MAX_WIDTH : null;
    if (next === null) return;
    event.preventDefault();
    save(apply(next));
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize Ask Louie panel"
      aria-valuemin={MIN_WIDTH}
      aria-valuemax={MAX_WIDTH}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className="group absolute inset-y-0 left-0 z-10 hidden w-3 -translate-x-1/2 cursor-col-resize touch-none outline-none lg:block"
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-transparent transition-colors duration-(--duration-fast) group-hover:bg-accent-fill group-focus-visible:bg-accent-fill" />
    </div>
  );
}

/** Responsive navigation triggers share one persistent panel and transcript. */
export function AskLouieTrigger({ className, compact = false, variant }: { className?: string; compact?: boolean; variant?: "primary" | "secondary" | "ghost" }) {
  return <DialogTrigger render={<Action variant={variant ?? (compact ? "ghost" : "secondary")} size={compact ? "sm" : "md"} className={className} />}><Sparkles aria-hidden="true" className="size-4" />Ask Louie</DialogTrigger>;
}
