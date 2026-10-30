"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * The stacked layout (Louie, 2026-10-29, after meodai.color.pizza): a left
 * column that stays in view beside one column of stacked text. The homepage
 * and the case studies use it, and the app shell drops the site header on
 * those pages (`usesStackedShell`), so the left column carries the name.
 *
 * Like `Canvas`, it owns the page's scrolling: the shell locks the viewport.
 * The scroller is the `canvas` size container, so the layout reflows when
 * the docked Ask Louie panel narrows the page (see `.stacked-shell` in
 * globals.css).
 */
function StackedShell({ aside, rail, children }: {
  aside: React.ReactNode;
  /** A third, sticky column on the right, shown on wide canvases only (the case study contents). */
  rail?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // An inner scroller keeps its position across route changes. Reset it,
  // unless the URL carries a hash, which the deep-link behaviour handles.
  React.useEffect(() => {
    if (!window.location.hash) scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div ref={scrollRef} data-canvas-scroll className="@container/canvas relative h-full min-w-0 overflow-y-auto">
      <div className="stacked-shell" data-rail={rail ? "" : undefined}>
        <div className="stacked-aside">{aside}</div>
        <div className="stacked-main">{children}</div>
        {rail ? <div className="stacked-rail"><div className="sticky top-0 max-h-dvh overflow-y-auto pt-12 pb-6">{rail}</div></div> : null}
      </div>
    </div>
  );
}

export { StackedShell };
