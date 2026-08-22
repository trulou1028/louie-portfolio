/**
 * Validates the curated evidence index at build time.
 *
 * Runs on `prebuild`, so a citation that points nowhere fails the build
 * rather than reaching a visitor as a broken "Open evidence" link. AI Louie's
 * credibility rests entirely on those links resolving (spec §16.2).
 *
 * Checks: schema conformance, id uniqueness, route allowlisting, and that
 * every anchor names a real section of that page.
 */
import { evidence } from "../content/evidence/evidence";
import { evidenceItemSchema } from "../lib/ai/schemas";
import { CASE_STUDY_ANCHORS, isAnchorOnRoute } from "../lib/routes";

const problems: string[] = [];
const seen = new Set<string>();

for (const [index, item] of evidence.entries()) {
  const where = `evidence[${index}] (${item.id ?? "no id"})`;

  const parsed = evidenceItemSchema.safeParse(item);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      problems.push(`${where}: ${issue.path.join(".")} — ${issue.message}`);
    }
    continue;
  }

  if (seen.has(item.id)) {
    problems.push(`${where}: duplicate id "${item.id}"`);
  }
  seen.add(item.id);

  if (item.anchor) {
    if (!CASE_STUDY_ANCHORS[item.route]) {
      problems.push(
        `${where}: route "${item.route}" has no anchor list, so "#${item.anchor}" cannot be verified`,
      );
    } else if (!isAnchorOnRoute(item.route, item.anchor)) {
      const valid = CASE_STUDY_ANCHORS[item.route].map((a) => a.id).join(", ");
      problems.push(
        `${where}: "${item.route}#${item.anchor}" does not exist. Valid anchors: ${valid}`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(
    `\nEvidence index invalid — ${problems.length} problem(s):\n`,
  );
  for (const problem of problems) console.error(`  • ${problem}`);
  console.error("");
  process.exit(1);
}

console.log(`Evidence index valid: ${evidence.length} entries.`);
