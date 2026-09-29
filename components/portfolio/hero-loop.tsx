"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The homepage hero loop (Plan 041): a silent screen recording of the live
 * Neuron Shift prototype. Every frame is the real app; nothing is redrawn.
 * `scripts/record-neuron-hero.cjs` re-records it.
 *
 * Motion rules:
 * - Reduced motion: never plays. The poster (the loop's first frame) stays.
 * - Plays only while on screen, to save battery and CPU.
 * - A visible pause control, because it runs longer than five seconds
 *   (WCAG 2.2.2). A visitor's pause sticks until they press play.
 */
function HeroLoop({
  mp4,
  webm,
  poster,
  label,
  width,
  height,
  className,
}: {
  mp4: string;
  webm?: string;
  poster: string;
  /** What the recording shows, for assistive tech. */
  label: string;
  width: number;
  height: number;
  className?: string;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = React.useState(false);
  const [userPaused, setUserPaused] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [inView, setInView] = React.useState(true);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const node = videoRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const node = videoRef.current;
    if (!node) return;
    if (reduced || userPaused || !inView) {
      node.pause();
    } else {
      // Autoplay can still be refused (data saver, some browsers); the
      // poster then stays, and the play button works.
      node.play().catch(() => setPlaying(false));
    }
  }, [reduced, userPaused, inView]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-plate-neuron shadow-shot ring-1 ring-foreground/10", className)}>
      <video
        ref={videoRef}
        className="block h-auto w-full"
        width={width}
        height={height}
        poster={poster}
        muted
        loop
        playsInline
        preload="auto"
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {webm ? <source src={webm} type="video/webm" /> : null}
        <source src={mp4} type="video/mp4" />
      </video>
      {reduced ? null : (
        <button
          type="button"
          onClick={() => {
            if (playing) {
              setUserPaused(true);
            } else {
              setUserPaused(false);
              videoRef.current?.play().catch(() => {});
            }
          }}
          aria-label={playing ? "Pause the recording" : "Play the recording"}
          className="focus-ring absolute bottom-3 right-3 inline-flex size-9 items-center justify-center rounded-full bg-plate-neuron/80 text-plate-neuron-ink ring-1 ring-plate-neuron-ink/20 backdrop-blur-sm transition-colors duration-(--duration-fast) hover:bg-plate-neuron"
        >
          {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
        </button>
      )}
    </div>
  );
}

export { HeroLoop };
