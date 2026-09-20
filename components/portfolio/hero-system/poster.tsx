import { cn } from "@/lib/utils";

function HeroSystemPoster({ expanded = false, className }: {
  expanded?: boolean;
  className?: string;
}) {
  const topY = expanded ? 58 : 92;
  const middleY = expanded ? 166 : 146;
  const systemY = expanded ? 274 : 202;

  return (
    <div
      data-testid="hero-system-poster"
      className={cn("absolute inset-0 grid place-items-center", className)}
      aria-hidden="true"
    >
      <svg viewBox="0 0 520 360" className="h-full w-full overflow-visible" role="presentation">
        <defs>
          <linearGradient id="hero-slab" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="hsl(var(--hero-system-layer-highlight))" />
            <stop offset="1" stopColor="hsl(var(--hero-system-layer))" />
          </linearGradient>
          <filter id="hero-shadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="hsl(var(--hero-system-shadow))" floodOpacity="0.52" />
          </filter>
        </defs>

        <g filter="url(#hero-shadow)" transform="translate(26 8)">
          <g>
            <path
              d={`M 72 ${topY + 42} L 218 ${topY - 8} Q 228 ${topY - 12} 238 ${topY - 8} L 356 ${topY + 36} Q 367 ${topY + 40} 358 ${topY + 50} L 218 ${topY + 105} Q 209 ${topY + 109} 199 ${topY + 105} L 75 ${topY + 59} Q 63 ${topY + 54} 72 ${topY + 42} Z`}
              fill="url(#hero-slab)"
              stroke="hsl(var(--hero-system-edge))"
              strokeWidth="1.2"
            />
            <path d={`M 70 ${topY + 54} L 205 ${topY + 106} Q 214 ${topY + 110} 224 ${topY + 106} L 360 ${topY + 50}`} fill="none" stroke="hsl(var(--hero-system-accent))" strokeWidth="2" opacity="0.9" />
            <g fill="none" stroke="hsl(var(--hero-system-mark))" strokeWidth="1.2" opacity="0.88">
              <ellipse cx="204" cy={topY + 30} rx="21" ry="9" />
              <path d={`M 140 ${topY + 51} L 214 ${topY + 79} M 235 ${topY + 68} L 286 ${topY + 49} M 247 ${topY + 58} L 298 ${topY + 39}`} />
            </g>
          </g>

          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path
              d={`M 95 ${middleY + 32} L 214 ${middleY - 9} L 333 ${middleY + 34} M 95 ${middleY + 32} L 208 ${middleY + 75} L 333 ${middleY + 34}`}
              stroke="hsl(var(--hero-system-edge))"
              strokeWidth="8"
              opacity="0.72"
            />
            <path d={`M 145 ${middleY + 31} L 195 ${middleY + 51} L 246 ${middleY + 30} M 195 ${middleY + 51} L 235 ${middleY + 67} L 288 ${middleY + 46}`} stroke="hsl(var(--hero-system-mark))" strokeWidth="1.4" />
            {[145, 195, 246, 235, 288].map((x, index) => (
              <circle key={x} cx={x} cy={middleY + [31, 51, 30, 67, 46][index]} r={index === 1 ? 5 : 3.5} fill={index === 1 ? "hsl(var(--hero-system-accent))" : "hsl(var(--hero-system-layer-highlight))"} stroke="hsl(var(--hero-system-edge))" />
            ))}
          </g>

          <g fill="none" stroke="hsl(var(--hero-system-mark))" strokeWidth="1.4">
            <path d={`M 125 ${systemY + 25} L 174 ${systemY + 45} L 224 ${systemY + 26} L 273 ${systemY + 47} L 322 ${systemY + 26}`} />
            <path d={`M 174 ${systemY + 45} L 226 ${systemY + 64} L 273 ${systemY + 47}`} stroke="hsl(var(--hero-system-accent))" />
            {[125, 174, 224, 273, 322, 226].map((x, index) => (
              <circle key={x} cx={x} cy={systemY + [25, 45, 26, 47, 26, 64][index]} r={index === 5 ? 6 : 4.5} fill={index % 2 === 0 ? "hsl(var(--hero-system-accent))" : "hsl(var(--hero-system-layer-highlight))"} />
            ))}
          </g>

          {[130, 318].map((x) => (
            <path key={x} d={`M ${x} ${topY + 82} L ${x} ${systemY + 31}`} stroke="hsl(var(--hero-system-accent))" strokeWidth="1" opacity="0.22" />
          ))}
        </g>
      </svg>
    </div>
  );
}

export { HeroSystemPoster };
