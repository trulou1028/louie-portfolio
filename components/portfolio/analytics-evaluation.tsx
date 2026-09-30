import { InlineLink } from "@/components/system/inline-link";

const studies = [
  { name: "Foresights", menu: "90%", meaningful: "70%", expectedTime: "90%", recommend: "70%", comprehension: "75%", url: "https://info.ck12.org/impact-team-studies/foresights-teacher-analysis" },
  { name: "Insights", menu: "90%", meaningful: "90%", expectedTime: "100%", recommend: "90%", comprehension: "73%", url: "https://info.ck12.org/impact-team-studies/insights-study-analysis-bzcgn" },
] as const;

export function AnalyticsEvaluation() {
  return (
    <div className="mt-6 overflow-x-auto rounded-panel border border-border-subtle">
      <table className="w-full text-left text-body-sm">
        <caption className="p-4 text-left text-foreground-muted">Separate studies, ten teachers each, using demo-class data.</caption>
        <thead><tr className="border-y border-border-subtle bg-surface-muted">
          <th scope="col" className="p-4">Reported measure</th>
          {studies.map((s) => <th key={s.name} scope="col" className="p-4"><InlineLink href={s.url}>{s.name} study</InlineLink></th>)}
        </tr></thead>
        <tbody>
          {([
            ["Found the menu easy to interpret", "menu"],
            ["Found it meaningful", "meaningful"],
            ["Anticipated time savings", "expectedTime"],
            ["Would recommend it to a colleague", "recommend"],
            ["Mean comprehension score", "comprehension"],
          ] as const).map(([label, key]) => <tr key={key} className="border-b border-border-subtle"><th scope="row" className="p-4 font-normal">{label}</th>{studies.map((s) => <td key={s.name} className="p-4">{s[key]}</td>)}</tr>)}
          <tr><th scope="row" className="p-4 font-normal">Had difficulty with the key graph</th><td className="p-4">50%</td><td className="p-4">50%</td></tr>
        </tbody>
      </table>
    </div>
  );
}
