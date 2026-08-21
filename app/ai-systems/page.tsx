import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Systems",
};

// TODO(content): real page content arrives in a later plan.
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[820px] px-6 py-16">
      <h1 className="font-serif text-display-lg">AI Systems</h1>
      <p className="mt-4 text-body-lg text-foreground-muted">How these products are architected.</p>
    </div>
  );
}
