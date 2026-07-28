import { Database, Fingerprint, FileText } from "lucide-react";
import AccordionSection from "./AccordionSection";
import Tag from "./Tag";
import { renderMarkdown } from "../lib/markdown";

export default function DetailsPanel({ analysis }) {
  const clauses = analysis.clauses || {};
  const allTags = [
    ...(clauses.data_collection || []),
    ...(clauses.data_sharing || []),
    ...(clauses.cookies || []),
    ...(clauses.retention || []),
  ];

  const transparencyFindings = (analysis.findings || []).filter(
    (f) => f.category === "Transparency" || f.category === "Compliance & Transparency"
  );

  return (
    <div className="mx-4 mb-3">
      <p className="mb-2 px-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-text-secondary">
        Case File
      </p>

      {allTags.length > 0 && (
        <AccordionSection icon={Database} title="What They Collect" count={allTags.length}>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((item, i) => (
              <Tag key={`${item}-${i}`}>{item}</Tag>
            ))}
          </div>
        </AccordionSection>
      )}

      {transparencyFindings.length > 0 && (
        <AccordionSection icon={Fingerprint} title="The Missing Evidence" count={transparencyFindings.length}>
          <ul className="flex flex-col gap-1.5">
            {transparencyFindings.map((f, i) => (
              <li key={i} className="text-[11px] leading-snug text-text-secondary">
                • {f.label}
              </li>
            ))}
          </ul>
        </AccordionSection>
      )}

      <AccordionSection icon={FileText} title="Detective's Full Report">
        <div
          className="prose-sm text-[11px] leading-relaxed text-text-secondary [&_h4]:mt-2 [&_h4]:mb-1 [&_h4]:text-[11.5px] [&_h4]:font-semibold [&_h4]:text-text-primary [&_ul]:pl-4 [&_li]:mb-1 [&_strong]:text-text-primary"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis.privacy_report) }}
        />
      </AccordionSection>
    </div>
  );
}
