import { InlineLink } from "@/components/system/inline-link";
import { profile } from "@/content/profile";

/**
 * Site footer (spec §11 §6). Kept simple on purpose.
 *
 * Contact links appear only once real values exist in `content/profile.ts`.
 */
function SiteFooter() {
  const year = new Date().getFullYear();
  const { links } = profile;

  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-3 px-6 py-8 text-body-sm text-foreground-muted sm:px-8">
        <InlineLink href="/resume">Resume</InlineLink>
        {links.linkedin ? (
          <InlineLink href={links.linkedin}>LinkedIn</InlineLink>
        ) : null}
        {links.email ? (
          <InlineLink href={`mailto:${links.email}`}>Email</InlineLink>
        ) : null}
        <span className="ml-auto">
          © {year} {profile.name}
        </span>
      </div>
    </footer>
  );
}

export { SiteFooter };
