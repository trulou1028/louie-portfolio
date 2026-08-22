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

  // Captured exactly once, during the first render — see note above.
  const saved = React.useRef<Record<string, number> | null | undefined>(
    undefined,
  );
  if (saved.current === undefined) {
    if (typeof window === "undefined") {
      saved.current = null;
    } else {
      try {
        const raw = window.localStorage.getItem(key);
        saved.current = raw
          ? (JSON.parse(raw) as Record<string, number>)
          : null;
      } catch {
        saved.current = null;
      }
    }
  }

  React.useEffect(() => {
    if (saved.current) {
      (groupRef.current as GroupImperativeHandle | null)?.setLayout(
        saved.current,
      );
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
