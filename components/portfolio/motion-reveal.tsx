"use client";

import { useLayoutEffect } from "react";
import { useAnimate } from "motion/react-mini";

/** Progressive enhancement, inspired by Motion's public editorial stagger demo. */
export function MotionReveal({ children, className, stagger = false }: {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useLayoutEffect(() => {
    const element = scope.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const container = stagger && element.children.length === 1 &&
      element.firstElementChild?.matches("header, section, ul, ol") ? element.firstElementChild : element;
    const targets = stagger ? Array.from(container.children) as HTMLElement[] : [element];
    const tokens = getComputedStyle(element);
    const seconds = (name: string) => {
      const value = tokens.getPropertyValue(name).trim();
      return parseFloat(value) / (value.endsWith("ms") ? 1000 : 1);
    };
    const duration = seconds("--duration-reveal");
    const step = seconds("--duration-stagger");
    const ease = tokens.getPropertyValue("--motion-reveal-ease").split(",").map(Number) as [number, number, number, number];
    const jobs: { node: HTMLElement; delay: number; heading: boolean }[] = [];
    let cursor = 0;
    for (const target of targets) {
      const words = Array.from(target.querySelectorAll<HTMLElement>("[data-motion-word]"));
      if (words.length) {
        const lines: number[] = [];
        for (const word of words) {
          const top = word.getBoundingClientRect().top;
          let line = lines.findIndex(y => Math.abs(y - top) < 2);
          if (line < 0) { line = lines.length; lines.push(top); }
          jobs.push({ node: word, delay: cursor + line * step, heading: true });
        }
        cursor += lines.length * step;
      } else {
        jobs.push({ node: target, delay: cursor, heading: false });
        cursor += step;
      }
    }
    let animations: ReturnType<typeof animate>[] = [];
    let entered = false;
    const reset = () => {
      animations.forEach(animation => animation.stop());
      jobs.forEach(({ node }) => {
        node.style.removeProperty("transform");
        node.style.removeProperty("opacity");
      });
      element.setAttribute("data-motion-state", "complete");
    };
    if (preference.matches) { reset(); return; }

    // Prepare once, before observing. Content never jumps from its final
    // position back to the start when a scroll event arrives.
    jobs.forEach(({ node, heading }) => {
      node.style.setProperty("transform", heading ? "translateY(105%)" : `translateY(${tokens.getPropertyValue("--motion-enter-distance").trim()})`);
      if (!heading) node.style.setProperty("opacity", "0");
    });
    element.setAttribute("data-motion-state", "waiting");
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entered) return;
      entered = true;
      observer.disconnect();
      element.setAttribute("data-motion-state", "running");
      animations = jobs.map(({ node, delay, heading }) => animate(node,
        heading ? { transform: "translateY(0)" } : { transform: "translateY(0)", opacity: 1 },
        { duration, delay, ease },
      ));
      void Promise.all(animations).then(reset);
    }, { root: element.closest("[data-canvas-scroll]"), threshold: 0, rootMargin: "0px 0px -5% 0px" });
    observer.observe(element);
    const revealImmediately = () => { entered = true; observer.disconnect(); reset(); };
    const onPreferenceChange = () => { if (preference.matches) revealImmediately(); };
    const onResize = () => revealImmediately(); // Never retain stale line measurements.
    preference.addEventListener("change", onPreferenceChange);
    element.addEventListener("focusin", revealImmediately);
    window.addEventListener("resize", onResize);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", onPreferenceChange);
      element.removeEventListener("focusin", revealImmediately);
      window.removeEventListener("resize", onResize);
      reset();
    };
  }, [animate, scope, stagger]);

  return <div ref={scope} className={className} data-motion-reveal>{children}</div>;
}
