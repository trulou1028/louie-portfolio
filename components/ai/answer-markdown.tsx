import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

import { InlineLink } from "@/components/system/inline-link";
import { resolveAnswerLink } from "@/lib/ai/answer-link";

/**
 * Renders one assistant answer's markdown (Plan 018).
 *
 * The model writes in markdown; before this, the panel printed it as plain
 * text — literal asterisks and hyphens instead of bold text and bullet
 * lists. This follows the same explicit-element-map convention as
 * `mdx-components.tsx` (case-study prose), but scaled for the ~318px chat
 * rail rather than a 68ch article column: `text-body-sm`, tighter spacing,
 * headings mapped down so nothing display-sized shows up in a narrow rail.
 *
 * Security (spec §32): no rehype plugin is registered here. `react-markdown`'s
 * default behavior — proven out for this exact case — is to render any raw
 * HTML in the model's answer as escaped, visible text rather than as live
 * DOM. Do not add the opt-in rehype plugin that re-enables raw HTML
 * passthrough, and do not pass any option with the same effect; that would
 * silently reopen this. The e2e suite has a test guarding it.
 */
const components: Components = {
  p: ({ children }) => (
    <p className="mt-2 text-body-sm text-foreground first:mt-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="mt-2 flex list-disc flex-col gap-1 pl-4 text-body-sm text-foreground first:mt-0">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2 flex list-decimal flex-col gap-1 pl-4 text-body-sm text-foreground first:mt-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-body-sm text-foreground">{children}</li>,
  h1: ({ children }) => (
    <h1 className="mt-3 text-body-lg font-semibold text-foreground first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 text-body font-semibold text-foreground first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2 text-body-sm font-semibold text-foreground first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-2 text-body-sm font-medium text-foreground first:mt-0">
      {children}
    </h4>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-2 border-l-2 border-accent-muted pl-3 text-body-sm text-foreground-muted italic first:mt-0">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded-xs bg-surface-muted px-1 py-0.5 font-mono text-[0.8em] break-words text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-2 overflow-x-auto rounded-sm bg-surface-muted p-2 font-mono text-[0.8em] text-foreground first:mt-0 [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  /**
   * A link only survives if `resolveAnswerLink` recognises where it points
   * (spec §32 — model output is never trusted as routing data). Anything else
   * renders as the link's own text: the sentence still reads, but a
   * fabricated destination never becomes clickable.
   *
   * This is what catches an invented base URL. `InlineLink` treats any href
   * that does not start with `/` or `#` as external, so the observed
   * `<your-link-here>/work/offboard` used to render as a live new-tab link to
   * nowhere.
   */
  a: ({ href, children }) => {
    const link = resolveAnswerLink(href);
    if (link.kind === "invalid") return <>{children}</>;
    return <InlineLink href={link.href}>{children}</InlineLink>;
  },
};

function AnswerMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {text}
    </ReactMarkdown>
  );
}

export { AnswerMarkdown };
