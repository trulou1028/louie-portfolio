import { profile } from "@/content/profile";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import type { WorkProject } from "@/content/work/projects";

/**
 * JSON-LD structured data (spec §28).
 *
 * Emitted as a script tag with a serialized object rather than interpolated
 * markup, so nothing here can inject HTML. Every field is drawn from the same
 * canonical content the page renders — structured data that disagrees with
 * the visible page is worse than none.
 *
 * Contact links and location are omitted while unverified, exactly as they are
 * in the UI.
 */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The value is JSON we construct, never user or model input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonSchema() {
  const sameAs = [profile.links.linkedin].filter(Boolean);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: profile.name,
        jobTitle: profile.role,
        description: profile.positioning.supporting,
        url: SITE_URL,
        ...(sameAs.length > 0 ? { sameAs } : {}),
        ...(profile.links.email ? { email: profile.links.email } : {}),
        // Rendered only now that the resume verifies it (spec §29).
        ...(profile.location
          ? {
              address: {
                "@type": "PostalAddress",
                addressLocality: "San Francisco",
                addressRegion: "CA",
              },
            }
          : {}),
      }}
    />
  );
}

export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: `${profile.name} — ${profile.role}`,
        url: SITE_URL,
        author: { "@id": `${SITE_URL}/#person` },
      }}
    />
  );
}

export function CreativeWorkSchema({ project }: { project: Pick<WorkProject, "title" | "name" | "href" | "summary" | "tags"> }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title,
        alternateName: project.name,
        url: absoluteUrl(project.href),
        ...(project.summary ? { abstract: project.summary } : {}),
        keywords: [...project.tags].join(", "),
        author: { "@id": `${SITE_URL}/#person` },
        creator: { "@id": `${SITE_URL}/#person` },
      }}
    />
  );
}
