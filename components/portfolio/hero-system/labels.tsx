import { HERO_LAYERS } from "@/components/portfolio/hero-system/layers";

function HeroSystemLabels({ expanded }: { expanded: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[44%]"
      aria-hidden="true"
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 220 360" aria-hidden="true">
        {[98, 181, 266].map((y) => (
          <g key={y} className="transition-opacity duration-(--hero-system-label-duration)" opacity={expanded ? 1 : 0}>
            <path d={`M 0 ${y} H 65`} stroke="hsl(var(--hero-system-accent))" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <circle cx="0" cy={y} r="3" fill="hsl(var(--hero-system-accent))" />
            <path d={`M 65 ${y - 7} V ${y + 7}`} stroke="hsl(var(--hero-system-mark))" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      <ol className="absolute inset-0">
        {HERO_LAYERS.map((layer, index) => (
          <li
            key={layer.id}
            className="absolute left-[34%] right-1 transition-all duration-(--hero-system-label-duration)"
            style={{ top: `${[22, 45, 69][index]}%`, opacity: expanded ? 1 : 0, transform: expanded ? "translateX(0)" : "translateX(-0.5rem)" }}
          >
            <span className="block text-body-sm font-medium text-foreground">{layer.label}</span>
            <span className="mt-1 hidden text-label text-foreground-muted min-[460px]:block">{layer.description}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export { HeroSystemLabels };
