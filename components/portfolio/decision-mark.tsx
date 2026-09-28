import type { DecisionMarkSpec } from "@/lib/decision-mark";
import { cn } from "@/lib/utils";

/**
 * One amber redline over a screenshot (Plan 037). Must sit inside a
 * `relative overflow-hidden` frame: the dimming outside the mark is a large
 * box-shadow that the frame clips.
 *
 * Decorative to assistive tech. The owning frame repeats the label in its
 * caption, so the meaning never depends on seeing the mark.
 *
 * The label tag sits above the box when there is room, and inside it when
 * the box touches the top of the image. It anchors to whichever side keeps
 * it inside the frame.
 */
function DecisionMark({ mark }: { mark: DecisionMarkSpec }) {
  const labelAbove = mark.y >= 12;
  const anchorEnd = mark.x + mark.w / 2 > 55;

  return (
    <span
      aria-hidden="true"
      data-decision-mark
      className="decision-mark pointer-events-none absolute rounded-xs border-2 border-signal"
      style={{ left: `${mark.x}%`, top: `${mark.y}%`, width: `${mark.w}%`, height: `${mark.h}%` }}
    >
      <span
        className={cn(
          "absolute max-w-[70vw] bg-signal px-1.5 py-0.5 font-mono text-system font-medium text-signal-ink sm:whitespace-nowrap",
          labelAbove ? "bottom-full mb-0.5" : "-top-0.5",
          anchorEnd ? "-right-0.5" : "-left-0.5",
          labelAbove ? "rounded-t-xs" : anchorEnd ? "rounded-bl-xs" : "rounded-br-xs",
        )}
      >
        {mark.label}
      </span>
    </span>
  );
}

export { DecisionMark };
