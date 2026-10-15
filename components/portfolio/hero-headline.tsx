import Image from "next/image";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";

/**
 * The homepage headline (Plan 051): "I make complex things / feel simple."
 *
 * Small screenshots sit inside the line. After "complex things" they cycle
 * through dense screens (a class prediction chart, a skill table, an operator
 * console); after "feel simple." through calm ones (Flexi's follow-up
 * choices, Offboard's step-by-step plan, the risk pause with three clear
 * options). Hovering one shows a sharp, full-size preview. A lime line draws
 * behind "feel simple." All motion is CSS in `app/globals.css` ("Homepage
 * headline").
 *
 * The heading's accessible name is the plain sentence from the profile. The
 * visual line, with its images, is hidden from assistive tech, and the
 * screenshots are decorative: the case studies below carry the same screens
 * with full alt text.
 */
type Shot = { src: string; width: number; height: number };

const COMPLEX: readonly Shot[] = [
  { src: "/work/ck12-analytics/foresights.png", width: 1280, height: 768 },
  { src: "/work/ck12-analytics/insights.png", width: 1280, height: 768 },
  { src: "/work/neuron-shift/console.webp", width: 2880, height: 1800 },
];

const SIMPLE: readonly Shot[] = [
  { src: "/work/flexi/follow-up.webp", width: 1278, height: 753 },
  { src: "/work/offboard/layoff-plan.webp", width: 2000, height: 999 },
  { src: "/work/offboard/risk-gate.webp", width: 2000, height: 1472 },
];

const LINES = [
  { words: ["I", "make", "complex", "things"], shots: COMPLEX, neon: false },
  { words: ["feel", "simple."], shots: SIMPLE, neon: true },
] as const;

/** The visual line must say exactly what the profile says. */
const VISUAL_TEXT = LINES.map((line) => line.words.join(" ")).join(" ");

/** The three screens, stacked so they can cycle. */
function Screens({ shots, sizes }: { shots: readonly Shot[]; sizes: string }) {
  return shots.map((shot, k) => (
    <Image
      key={shot.src}
      src={shot.src}
      alt=""
      fill
      sizes={sizes}
      preload={k === 0 && sizes === "160px"}
      className="object-cover object-left-top"
      style={{ "--k": k } as React.CSSProperties}
    />
  ));
}

/**
 * A thumbnail inside the line, plus its hover preview. The preview is its
 * own element at full size (22rem), not the thumbnail scaled up, so it stays
 * sharp. Both cycle on the same clock, so they always show the same screen.
 */
function ShotStack({ shots, index }: { shots: readonly Shot[]; index: number }) {
  return (
    <span className="hero-shot-wrap" style={{ "--i": index } as React.CSSProperties}>
      <span className="hero-shot"><Screens shots={shots} sizes="160px" /></span>
      <span className="hero-preview"><Screens shots={shots} sizes="352px" /></span>
    </span>
  );
}

export function HeroHeadline({ className }: { className?: string }) {
  if (process.env.NODE_ENV !== "production" && VISUAL_TEXT !== profile.positioning.primary) {
    console.warn(`HeroHeadline: the visual line "${VISUAL_TEXT}" no longer matches profile.positioning.primary.`);
  }

  let i = 0;
  return (
    <h1 className={cn("font-display text-home-hero text-foreground", className)}>
      <span className="sr-only">{profile.positioning.primary}</span>
      <span aria-hidden="true">
        {LINES.map((line, lineIndex) => {
          // A plain space between word boxes, so the line can still wrap.
          const words = line.words.flatMap((word, w) => [
            w > 0 ? " " : null,
            <span key={word} className="hero-word" style={{ "--i": i++ } as React.CSSProperties}>
              {word}
            </span>,
          ]);
          return (
            <span key={lineIndex} className="block">
              {line.neon ? <span className="hero-neon">{words}</span> : words}
              {" "}
              <ShotStack shots={line.shots} index={i++} />
            </span>
          );
        })}
      </span>
    </h1>
  );
}
