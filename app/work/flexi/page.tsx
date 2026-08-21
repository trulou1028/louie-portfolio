import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CK-12 Flexi",
};

// TODO(content): real page content arrives in a later plan.
export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[820px] px-6 py-16">
      <h1 className="font-serif text-display-lg">CK-12 Flexi</h1>
      <p className="mt-4 text-body-lg text-foreground-muted">Designing an AI tutor that helps students learn instead of simply giving them answers.</p>
    </main>
  );
}
