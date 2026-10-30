import type { DecisionMarkSpec } from "@/lib/decision-mark";
import { cn } from "@/lib/utils";

/**
 * One decision mark over a screenshot (Plan 037): since the stacked
 * redesign, a thin blue box with a blue label. Must sit inside a
 * `relative overflow-hidden` frame.
 *
 * Decorative to assistive tech. The owning frame repeats the label in its
 * caption, so the meaning never depends on seeing the mark.
 *
 * The label tag sits above the box when there is room, and inside it when
 * the box touches the top of the image. It anchors to whichever side keeps
 * it inside the frame, unless the spec names a side. A spec can also put
 * the label under the box.
 */
function DecisionMark({ mark }: { mark: DecisionMarkSpec }) {
  const labelAbove = mark.y >= 12;
  const anchorEnd = mark.labelAt ? mark.labelAt === "end" : mark.x + mark.w / 2 > 55;

  return (
    <span
      aria-hidden="true"
      data-decision-mark
      className="decision-mark pointer-events-none absolute border-[1.5px] border-signal"
      style={{ left: `${mark.x}%`, top: `${mark.y}%`, width: `${mark.w}%`, height: `${mark.h}%` }}
    >
      <span
        className={cn(
          "absolute max-w-[70vw] bg-signal px-1.5 py-0.5 text-label tracking-normal text-signal-ink sm:whitespace-nowrap",
          mark.labelBelow ? "top-full mt-1" : labelAbove ? "bottom-full mb-1" : "-top-px",
          anchorEnd ? "-right-px" : "-left-px",
        )}
      >
        {mark.label}
      </span>
    </span>
  );
}

export { DecisionMark };
