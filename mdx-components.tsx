import type { MDXComponents } from "mdx/types";

import { InlineLink } from "@/components/system/inline-link";

/**
 * Prose styling for MDX case studies (spec §8: 65–75 characters per line).
 *
 * Only the plain-prose elements are mapped here. Structural pieces —
 * `CaseStudySection`, `SystemDiagram`, `ArtifactFrame`, `PendingContent` —
 * are imported directly inside each `.mdx` file so the content stays
 * explicit about what it is rendering.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    p: ({ children }) => (
      <p className="mt-4 max-w-[68ch] text-body text-foreground-muted">
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 text-heading-md text-foreground">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="mt-8 text-body-lg font-medium text-foreground">
        {children}
      </h4>
    ),
    ul: ({ children }) => (
      <ul className="mt-4 flex max-w-[68ch] flex-col gap-2">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mt-4 flex max-w-[68ch] list-decimal flex-col gap-2 pl-5">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="text-body text-foreground-muted">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-medium text-foreground">{children}</strong>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-8 max-w-[60ch] border-l-2 border-accent pl-5 font-serif text-heading-md text-balance text-foreground">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <InlineLink href={href ?? "#"}>{children}</InlineLink>
    ),
    code: ({ children }) => (
      <code className="rounded-xs bg-surface-muted px-1.5 py-0.5 font-mono text-body-sm text-foreground">
        {children}
      </code>
    ),
    hr: () => <hr className="mt-12 border-border-subtle" />,
    ...components,
  };
}
