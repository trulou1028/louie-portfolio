import { describe, expect, it } from "vitest";

import { resolveAnswerLink } from "@/lib/ai/answer-link";
import { profile } from "@/content/profile";

describe("resolveAnswerLink", () => {
  it("accepts a real route", () => {
    expect(resolveAnswerLink("/work/offboard")).toEqual({
      kind: "internal",
      href: "/work/offboard",
    });
    expect(resolveAnswerLink("/")).toEqual({ kind: "internal", href: "/" });
  });

  it("accepts a real anchor on that route", () => {
    expect(resolveAnswerLink("/work/offboard#architecture")).toEqual({
      kind: "internal",
      href: "/work/offboard#architecture",
    });
  });

  it("rejects an anchor that is not a section of the route", () => {
    // A plausible-looking anchor would scroll nowhere and quietly break the
    // "open the evidence" promise.
    expect(resolveAnswerLink("/work/offboard#nope")).toEqual({ kind: "invalid" });
    // Real anchor, wrong case study.
    expect(resolveAnswerLink("/work/flexi#architecture")).toEqual({
      kind: "invalid",
    });
  });

  it("rejects a route that does not exist", () => {
    expect(resolveAnswerLink("/work/imaginary")).toEqual({ kind: "invalid" });
    expect(resolveAnswerLink("/admin")).toEqual({ kind: "invalid" });
  });

  it("rejects the invented base URL that prompted this guard", () => {
    // Observed in a real answer: the model prepended a placeholder host to an
    // otherwise correct route. `InlineLink` would have rendered it as a live
    // new-tab link, because it does not start with "/".
    expect(resolveAnswerLink("<your-link-here>/work/offboard")).toEqual({
      kind: "invalid",
    });
    expect(resolveAnswerLink("https://example.com/work/offboard")).toEqual({
      kind: "invalid",
    });
  });

  it("rejects scheme-based injection", () => {
    for (const href of [
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "//evil.example/work/offboard",
    ]) {
      expect(resolveAnswerLink(href), href).toEqual({ kind: "invalid" });
    }
  });

  it("accepts Louie's own published links, and only by exact match", () => {
    const { linkedin } = profile.links;
    if (linkedin) {
      expect(resolveAnswerLink(linkedin)).toEqual({
        kind: "external",
        href: linkedin,
      });
      // Prefix matching would let a lookalike host through.
      expect(resolveAnswerLink(`${linkedin}.evil.example`)).toEqual({
        kind: "invalid",
      });
    }
  });

  it("rejects empty and missing hrefs", () => {
    expect(resolveAnswerLink(undefined)).toEqual({ kind: "invalid" });
    expect(resolveAnswerLink("")).toEqual({ kind: "invalid" });
    expect(resolveAnswerLink("   ")).toEqual({ kind: "invalid" });
  });

  it("rejects a query string, which nothing on this site reads", () => {
    expect(resolveAnswerLink("/work/offboard?redirect=evil.example")).toEqual({
      kind: "invalid",
    });
  });
});

describe("link text that names a project (Plan 042)", () => {
  it("sends a project name linked to another page to that project's page", () => {
    expect(resolveAnswerLink("/resume", "Offboard")).toEqual({ kind: "internal", href: "/work/offboard" });
    expect(resolveAnswerLink("/work/offboard#architecture", "Flexi")).toEqual({ kind: "internal", href: "/work/flexi" });
  });
  it("keeps a link whose text matches its page, including its anchor", () => {
    expect(resolveAnswerLink("/work/offboard#architecture", "the Offboard architecture")).toEqual({ kind: "internal", href: "/work/offboard#architecture" });
    expect(resolveAnswerLink("/resume", "my resume")).toEqual({ kind: "internal", href: "/resume" });
  });
  it("leaves links alone when the text names several projects or none", () => {
    expect(resolveAnswerLink("/work", "Offboard and Flexi")).toEqual({ kind: "internal", href: "/work" });
    expect(resolveAnswerLink("/about", "how I work")).toEqual({ kind: "internal", href: "/about" });
  });
  it("still rejects invalid targets", () => {
    expect(resolveAnswerLink("https://example.com", "Offboard")).toEqual({ kind: "invalid" });
  });
});
