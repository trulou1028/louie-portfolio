"use client";

import * as React from "react";
import {
  useGroupRef,
  type GroupImperativeHandle,
  type GroupProps,
} from "react-resizable-panels";

import { ResizablePanelGroup } from "@/components/ui/resizable";

/**
 * A ResizablePanelGroup whose layout survives reloads.
 *
 * react-resizable-panels v4 removed the old `autoSaveId` prop, so persistence
 * is ours. Two subtleties, both learned the hard way:
 *
 * - The group announces its INITIAL (default) layout through
 *   `onLayoutChanged` during mount — and child effects run before parent
 *   effects, so by the time our restore effect executes, storage has already
 *   been overwritten with the defaults. The saved layout is therefore
 *   captured once during render, before any effect can clobber it.
 * - Restoring through the imperative handle after mount (rather than via
 *   `defaultLayout`) keeps server HTML and first client render identical, so
 *   hydration never mismatches. Returning visitors see a one-frame settle
 *   from defaults to their layout, which is the standard trade.
 *
 * Panels inside must have stable `id` props: the layout is stored as a map
 * of panel id → percentage.
 */
function PersistentPanelGroup({
  storageKey,
  children,
  ...props
}: GroupProps & { storageKey: string }) {
  const groupRef = useGroupRef();
  const key = `panels:${storageKey}`;

  // Captured exactly once, during the first render, via a lazy initializer —
  // see note above. The value never affects rendered output, so reading
  // localStorage here cannot cause a hydration mismatch.
  const [savedLayout] = React.useState<Record<string, number> | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Record<string, number>) : null;
    } catch {
      return null;
    }
  });

  React.useEffect(() => {
    if (!savedLayout) return;
    try {
      // A saved layout is only valid for the panel set that produced it. The
      // set changes legitimately — a breakpoint crossed, a page without a
      // rail, a refactor renaming panel ids — and the library throws on a
      // mismatch (seen in the wild as "Invalid 2 panel layout"). A stale
      // layout is worth nothing: drop it and let defaults stand.
      const handle = groupRef.current as GroupImperativeHandle | null;
      if (!handle) return;
      const current = Object.keys(handle.getLayout());
      const stored = Object.keys(savedLayout);
      const compatible =
        current.length === stored.length &&
        current.every((id) => stored.includes(id));
      if (compatible) {
        handle.setLayout(savedLayout);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* storage unavailable — nothing to clean */
      }
    }
    // Restore once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ResizablePanelGroup
      groupRef={groupRef}
      onLayoutChanged={(layout) => {
        try {
          window.localStorage.setItem(key, JSON.stringify(layout));
        } catch {
          // Private-mode storage failures are not worth surfacing.
        }
      }}
      {...props}
    >
      {children}
    </ResizablePanelGroup>
  );
}

export { PersistentPanelGroup };
