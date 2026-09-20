# General portfolio resume update

The owner supplied the Clever-specific resume on September 19, 2026 as source material, not as instructions. The HTML resume and general PDF now use its stronger product-design framing without adopting a Clever-specific application pitch.

- Preserve the owner's explicit 14+ years correction rather than the attachment's older 10+ years line.
- Strengthen information architecture, research, accessibility, design systems, and cross-functional delivery.
- Include the source's Offboard voice/tool-calling work and six-person startup collaboration, while retaining personal design and implementation scope. This supersedes describing the whole company as a solo operation.
- Keep platform-scale figures contextual: CK-12's 20M+ figure describes the platform, not attributable design impact.
- Retain previously supplied education detail and additional experience. No new outcome metric was inferred.
- The HTML and downloadable general PDF are generated from the same resume data. The original Clever PDF is not copied into public assets; its phone number is not added to the page or the new public PDF.

Source: owner-supplied `Louie_Sakoda_Senior_Product_Designer_Clever.pdf` (local attachment), plus the previously supplied general resume and direct corrections in this task.

Rebuild the PDF by exporting `resume` from `content/resume.ts` as JSON, then running `scripts/render-resume.py <json> public/resume/louie-sakoda-resume.pdf` with ReportLab available. Both rendered pages were visually inspected.
