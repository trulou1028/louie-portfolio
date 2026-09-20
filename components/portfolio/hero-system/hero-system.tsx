"use client";

import * as React from "react";

import { HERO_LAYERS } from "@/components/portfolio/hero-system/layers";
import { HeroSystemPoster } from "@/components/portfolio/hero-system/poster";

// Keep the Three.js chunk out of the initial homepage work. This component is
// rendered only once the reserved scene region has entered view.
const HeroScene = React.lazy(() => import("@/components/portfolio/hero-system/scene"));

class SceneBoundary extends React.Component<{
  children: React.ReactNode;
  onError: () => void;
}, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function HeroSystem() {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const lastTouchAt = React.useRef(0);
  const [pinned, setPinned] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [suppressHover, setSuppressHover] = React.useState(false);
  const [inView, setInView] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState<boolean | null>(null);
  const [canRenderScene, setCanRenderScene] = React.useState(false);
  const [sceneReady, setSceneReady] = React.useState(false);
  const [sceneFailed, setSceneFailed] = React.useState(false);
  const expanded = reducedMotion === true || pinned || hovered;

  React.useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const query = window.matchMedia("(min-width: 540px)");
    const update = () => setCanRenderScene(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  React.useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { root: node.closest("[data-canvas-scroll]"), rootMargin: "160px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !expanded) return;
      setPinned(false);
      setHovered(false);
      setSuppressHover(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "touch") lastTouchAt.current = Date.now();
  };

  const handleMouseMove = () => {
    if (!canRenderScene || suppressHover || Date.now() - lastTouchAt.current < 800) return;
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setSuppressHover(false);
  };

  const toggle = () => {
    if (pinned) {
      setPinned(false);
      setHovered(false);
      setSuppressHover(true);
    } else {
      setPinned(true);
      setSuppressHover(false);
      setInView(true);
    }
  };

  const handleSceneReady = React.useCallback(() => setSceneReady(true), []);
  const handleSceneFailure = React.useCallback(() => setSceneFailed(true), []);

  const showScene = inView && canRenderScene && reducedMotion === false && !sceneFailed;

  return (
    <div
      ref={wrapperRef}
      data-testid="hero-system"
      data-expanded={expanded}
      className="group relative isolate h-28 min-h-0 overflow-visible min-[540px]:h-72 min-[900px]:h-[22rem]"
      onPointerDown={handlePointerDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="hero-system-stage absolute inset-y-0 -left-[8%] -right-[8%] transition-transform duration-(--duration-standard) ease-out group-focus-within:scale-[1.015] min-[540px]:-inset-x-[12%] min-[900px]:-inset-x-[16%]">
        <HeroSystemPoster
          expanded={expanded}
          className={`${showScene && sceneReady && !sceneFailed ? "opacity-0" : "opacity-100"} transition-opacity duration-(--duration-standard) max-[539px]:[&_svg]:-translate-y-[24%] max-[539px]:[&_svg]:scale-[0.7]`}
        />
        {showScene ? (
          <SceneBoundary onError={handleSceneFailure}>
            <React.Suspense fallback={null}>
              <div className="pointer-events-none absolute inset-0 z-10">
                <HeroScene expanded={expanded} onReady={handleSceneReady} onContextLost={handleSceneFailure} />
              </div>
            </React.Suspense>
          </SceneBoundary>
        ) : null}
      </div>

      {reducedMotion === false ? (
        <button
          type="button"
          data-testid="hero-system-control"
          className="absolute inset-0 z-30 cursor-pointer rounded-panel outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
          aria-label={pinned ? "Reassemble the product system" : "Explore the product system layers"}
          aria-describedby="hero-system-description"
          aria-expanded={pinned}
          onClick={toggle}
        >
          <span className="sr-only">{pinned ? "Reassemble" : "Explore the layers"}</span>
        </button>
      ) : null}

      <div id="hero-system-description" className="sr-only">
        <p>This illustrative model describes three layers of Louie&apos;s product design approach.</p>
        <ol>
          {HERO_LAYERS.map((layer) => <li key={layer.id}>{layer.label}: {layer.description}</li>)}
        </ol>
      </div>
    </div>
  );
}

export { HeroSystem };
