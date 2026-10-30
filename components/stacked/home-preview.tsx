"use client";

import * as React from "react";
import Image from "next/image";

import { useReducedMotionSafe } from "@/components/portfolio/lumo/use-play";

export type PreviewItem = {
  id: string;
  image: { src: string; width: number; height: number };
  /** A short silent loop that plays while its row is hovered. */
  loop?: { src: string; poster: string };
};

const HOVER = "(hover: hover) and (pointer: fine)";
function subscribe(onChange: () => void) {
  const query = window.matchMedia(HOVER);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The homepage's hover preview (stacked redesign, 2026-10-29). Pointing at
 * a project row, or tabbing to its link, shows that project's screenshot in
 * the free space of the left column; a recording plays from the start.
 *
 * Frames mount only where a fine pointer can hover. Touch screens show each
 * row's own screenshot inline instead (`.stacked-inline-media`). The frames
 * repeat the rows' screenshots, so the slot is hidden from assistive tech.
 */
function HomePreview({ items }: { items: readonly PreviewItem[] }) {
  const canHover = React.useSyncExternalStore(subscribe, () => window.matchMedia(HOVER).matches, () => false);
  const reduce = useReducedMotionSafe();
  const [active, setActive] = React.useState<string | null>(null);
  const videos = React.useRef(new Map<string, HTMLVideoElement>());

  React.useEffect(() => {
    if (!canHover) return;
    const rows = [...document.querySelectorAll<HTMLElement>("[data-preview-id]")];
    const offs = rows.map((row) => {
      const id = row.dataset.previewId!;
      const show = () => setActive(id);
      const hide = () => setActive((current) => (current === id ? null : current));
      row.addEventListener("pointerenter", show);
      row.addEventListener("pointerleave", hide);
      row.addEventListener("focusin", show);
      row.addEventListener("focusout", hide);
      return () => {
        row.removeEventListener("pointerenter", show);
        row.removeEventListener("pointerleave", hide);
        row.removeEventListener("focusin", show);
        row.removeEventListener("focusout", hide);
      };
    });
    return () => offs.forEach((off) => off());
  }, [canHover]);

  React.useEffect(() => {
    videos.current.forEach((video, id) => {
      if (id === active && !reduce) {
        video.currentTime = 0;
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [active, reduce]);

  return (
    <div className="preview-slot stacked-wide-only" aria-hidden="true">
      {canHover ? items.map((item) => (
        <div key={item.id} className="preview-frame" data-on={active === item.id ? "" : undefined}>
          {item.loop ? (
            <video
              ref={(el) => { if (el) videos.current.set(item.id, el); else videos.current.delete(item.id); }}
              src={item.loop.src}
              poster={item.loop.poster}
              width={item.image.width}
              height={item.image.height}
              muted
              loop
              playsInline
              preload="none"
            />
          ) : (
            <Image src={item.image.src} width={item.image.width} height={item.image.height} alt="" sizes="30vw" />
          )}
        </div>
      )) : null}
    </div>
  );
}

export { HomePreview };
