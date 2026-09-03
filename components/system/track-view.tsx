"use client";

import * as React from "react";

import { track, type AnalyticsEvent, type AnalyticsProperties } from "@/lib/analytics";

/**
 * Fires one analytics event when a page is reached, from a server component.
 *
 * Server pages cannot call `track` (it needs the browser), and making a whole
 * page a client component to report an arrival would be a large cost for a
 * small signal. This mounts as a leaf instead, renders nothing, and fires
 * once — which also means it counts arrivals from every path: a nav click, a
 * link inside an AI answer, a pasted deep link, or a search result.
 *
 * Properties must stay enum-like; `sanitizeProperties` drops anything that
 * looks like prose (spec §30).
 */
function TrackView({
  event,
  properties,
}: {
  event: AnalyticsEvent;
  properties?: AnalyticsProperties;
}) {
  // A ref, not state: this must fire exactly once per mount and must never
  // cause a re-render. React 19 StrictMode double-invokes effects in dev, so
  // the guard is what keeps development from double-counting.
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, properties);
    // Mount-only by design; a prop change on a mounted tracker is not a new view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export { TrackView };
