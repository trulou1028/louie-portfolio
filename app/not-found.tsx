import Link from "next/link";

import { Canvas } from "@/components/app-shell/contextual-rail";

/**
 * The 404 page, in the same layout as every other page, so a broken link
 * still shows the name, Ask Louie, and the site links (stacked redesign).
 */
export default function NotFound() {
  return (
    <Canvas>
      <p className="text-meta text-foreground-quiet">Not found</p>
      <h1 className="mt-3 max-w-[14em] font-display text-display-lg text-balance text-foreground">This page does not exist.</h1>
      <p className="mt-6 max-w-[34rem] text-body-lg text-foreground-muted">
        The link may be old. <Link href="/" className="focus-ring rounded-xs underline decoration-accent-line underline-offset-[0.2em] hover:text-accent-hover">See the work</Link> instead.
      </p>
    </Canvas>
  );
}
