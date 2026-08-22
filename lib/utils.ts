import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The type-scale names from spec §8. They share the `text-` prefix with color
 * utilities, and tailwind-merge cannot tell a custom size from a custom color
 * on its own — so without this it treats `text-body-sm` and `text-surface` as
 * the same class group and silently drops one.
 *
 * That is not theoretical: it shipped a primary button with dark text on the
 * moss accent at 3.22:1, caught by the axe audit in Plan 008. Registering the
 * sizes here keeps colors and sizes independent.
 */
export const TYPE_SCALE = [
  "display-xl",
  "display-lg",
  "heading-xl",
  "heading-lg",
  "heading-md",
  "body-lg",
  "body",
  "body-sm",
  "label",
  "system",
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: [...TYPE_SCALE] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
