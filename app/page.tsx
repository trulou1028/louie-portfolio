import { profile } from "@/content/profile";

// TODO(content): this is a scaffold placeholder. The real homepage — hero,
// AI Louie entry point, selected work, experiments, profile panel — is built
// in Plan 003 against spec §11.
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[820px] px-6 py-24">
      <p className="font-mono text-system uppercase text-foreground-muted">
        {profile.positioning.eyebrow}
      </p>
      <h1 className="mt-6 font-serif text-display-xl text-foreground">
        {profile.positioning.primary}
      </h1>
      <p className="mt-6 max-w-[60ch] text-body-lg text-foreground-muted">
        {profile.positioning.supporting}
      </p>
    </main>
  );
}
