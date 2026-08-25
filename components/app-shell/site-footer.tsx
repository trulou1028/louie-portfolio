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
  // The footer container is `flex flex-wrap items-center`, so each link is a
  // flex item and this padding grows its box (not just its hit area) to meet
  // the WCAG 2.2 AA (2.5.8) 24px minimum tap target. InlineLink itself stays
  // untouched — it is also used inline in prose, where vertical padding
  // would disturb line boxes.
  const tapTarget = "py-1";

  return (
    <footer className="border-t border-border-subtle">
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center gap-x-6 gap-y-3 px-6 py-8 text-body-sm text-foreground-muted sm:px-8">
        <InlineLink href="/resume" className={tapTarget}>
          Resume
        </InlineLink>
        {links.linkedin ? (
          <InlineLink href={links.linkedin} className={tapTarget}>
            LinkedIn
          </InlineLink>
        ) : null}
        {links.email ? (
          <InlineLink href={`mailto:${links.email}`} className={tapTarget}>
            Email
          </InlineLink>
        ) : null}
        {links.calendly ? (
          <InlineLink href={links.calendly} className={tapTarget}>
            Book time
          </InlineLink>
        ) : null}
        <span className="ml-auto">
          © {year} {profile.name}
        </span>
      </div>
    </footer>
  );
}

export { SiteFooter };
