import {
  BookOpen,
  FlaskConical,
  FileText,
  Home,
  Layers,
  PenLine,
  User,
} from "lucide-react";

import type { Route } from "@/lib/routes";

/**
 * Icons for primary navigation.
 *
 * Kept out of `lib/routes.ts` on purpose: that module is imported by the
 * evidence validator, the search layer, and (in Plan 006) the AI tool
 * allowlist. None of those should pull React components into their graph.
 */
export const NAV_ICONS: Partial<Record<Route, React.ComponentType<{ className?: string }>>> =
  {
    "/": Home,
    "/work": Layers,
    "/ai-systems": FlaskConical,
    "/experiments": BookOpen,
    "/writing": PenLine,
    "/about": User,
    "/resume": FileText,
  };
