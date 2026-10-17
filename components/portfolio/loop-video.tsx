"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";

import { useReducedMotionSafe } from "@/components/portfolio/lumo/use-play";

/**
 * A short, silent product recording that loops. It plays only
 * while it is on screen, never under reduced motion, and always has a
 * pause control: a loop longer than five seconds needs one (WCAG 2.2.2).
 * Until it plays, and whenever it is paused at the start, the poster shows
 * the finished frame, so a reader who never plays it still sees the result.
 *
 * MP4 (H.264) only: every current browser plays it.
 */
export function LoopVideo({ src, poster, label, width, height }: {
  src: string;
  poster: string;
  /** The text equivalent, like an image's alt text. */
  label: string;
  width: number;
  height: number;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotionSafe();
  const [paused, setPaused] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    const video = ref.current;
    if (!video || reduce || paused) { video?.pause(); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => undefined);
      else video.pause();
    }, { threshold: 0.25 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduce, paused]);

  return (
    <div className="relative">
      <video
        ref={ref}
        className="block h-auto w-full"
        width={width}
        height={height}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        <source src={src} type="video/mp4" />
      </video>
      {reduce ? null : (
        <button
          type="button"
          onClick={() => {
            if (playing) return setPaused(true);
            setPaused(false);
            ref.current?.play().catch(() => undefined);
          }}
          aria-label={playing ? "Pause the recording" : "Play the recording"}
          className="focus-ring absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-canvas/80 text-foreground ring-1 ring-foreground/15 backdrop-blur-sm hover:bg-canvas"
        >
          {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
        </button>
      )}
    </div>
  );
}
