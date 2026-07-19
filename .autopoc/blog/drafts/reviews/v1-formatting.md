# Formatting Review: AI Relay Blog v1

## Scores Table

| Dimension | Weight | Score (1-10) | Weighted |
|---|---|---|---|
| Heading hierarchy | 1x | 8 | 8 |
| Code formatting | 1x | 3 | 3 |
| CTA placement | 2x | 3 | 6 |
| SEO readiness | 1x | 3 | 3 |
| Link strategy | 1x | 3 | 3 |
| Editorial compliance | 2x | 5 | 10 |
| Brand standards | 1x | 6 | 6 |
| Word count | 1x | 8 | 8 |
| **Total** | **10x** | | **47** |

**Normalized score: (47 / 100) x 10 = 4.7 / 10**

---

## Line-Level Feedback

### Heading hierarchy (8/10)

- All body headings are H2, no H1 used in the body. Sentence case is correctly applied throughout. Good cascade.
- Minor: No H3 subheadings are used anywhere. The bold lead-ins on lines 21-25 (e.g., `**npm registry override.**`) act as pseudo-headings but aren't real heading elements. Converting these to H3s would improve scannability and semantic structure.
- No title (H1) exists at all for the post. While the rubric says "no H1 in body," the post needs a title somewhere. This is scored under SEO readiness but is worth noting here.

### Code formatting (3/10)

Inline backticks are used extensively throughout the draft. The rubric explicitly requires "no backticks" for a passing score.

Violations (non-exhaustive):
- Line 3: `base_url`
- Line 17: `registry.access.redhat.com/ubi9/nodejs-22`
- Line 22: `.npmrc`, `registry.npmmirror.com`
- Line 24: `output: "standalone"`, `next.config.mjs`, `public/`, `.next/static/`
- Line 25: `USER 0`, `USER 1001`, `chgrp -R 0 /opt/app-root && chmod -R g=u /opt/app-root`
- Line 27: `.npmrc`
- Line 44: `/health`
- Line 79: `output: "standalone"`, `node_modules`, `server.js`
- Line 85: `oc start-build --from-dir`

All inline backticks must be removed. Technical terms and commands should be formatted using the CMS monospace style (typically applied as `<code>` or via the editorial template, not raw markdown backticks).

Additionally, no runnable code snippets are included. Adding a short deployment command block or a curl validation example would strengthen the tutorial value.

### CTA placement (3/10)

- **Top:** No CTA. The introduction (lines 1-7) should include a link to Red Hat OpenShift AI or the Red Hat Developer portal.
- **Mid:** No CTA. The deployment section (lines 40-60) is a natural place for a CTA linking to OpenShift AI documentation or a trial.
- **Closing:** "Try it yourself" (lines 87-98) serves as a CTA but links only to GitHub repos. No link to redhat.com, developers.redhat.com, or any Red Hat property.

Recommended fixes:
1. Add an early CTA after line 7: link to Red Hat OpenShift AI overview page.
2. Add a mid-post CTA after the deployment section: link to OpenShift AI getting started docs.
3. Update the closing CTA to include a developers.redhat.com link alongside the GitHub links.

### SEO readiness (3/10)

- **No title.** The post starts directly with `## What is AI Relay?`. A proper title is required for SEO, social sharing, and editorial standards. Suggested title (50-60 chars): "Deploy an LLM API gateway on OpenShift with AI Relay" (52 chars).
- **First paragraph keywords:** The first paragraph (line 3) mentions "AI API gateway" and "LLM providers," which are relevant keywords. However, "OpenShift" doesn't appear until line 7, and "Red Hat" doesn't appear until line 7 either. The target keyword cluster (LLM gateway + OpenShift) should appear in the first sentence.
- **No meta description or subtitle** is provided.

### Link strategy (3/10)

- **No redhat.com links at all.** The entire post contains zero links to Red Hat properties (developers.redhat.com, redhat.com/openshift, access.redhat.com).
- Links present (lines 89, 98) all point to github.com.
- Line 27 references `quay.io/aicatalyst/ai-relay-web:latest` as text but doesn't link it.
- Recommended additions:
  - Link "Red Hat OpenShift" (line 7) to the OpenShift product page.
  - Link "Red Hat OpenShift AI" (line 13) to the OpenShift AI page.
  - Link "UBI" (line 15) to the UBI documentation on access.redhat.com.
  - Link "OpenShift BuildConfig" (line 27) to the builds documentation.

### Editorial compliance (5/10)

**Oxford commas:** Consistently used. Good.
- Line 3: "provider selection, key rotation, failover, and protocol translation" -- correct.
- Line 5: "OpenAI, Anthropic (Claude), DeepSeek, MiMo, and any custom..." -- correct.
- Line 5: "key rotation, implements circuit-breaker failover across providers, and routes requests" -- correct.

**Contractions:** Partially used. The rubric says "use contractions aggressively."
- Line 42: "doesn't" -- good.
- Line 7: "We wanted to find out" -- fine as-is.
- Line 85: "is needed" should be "isn't needed" (the sentence already says "No local container runtime... is needed" -- restructure to "You don't need a local container runtime").
- Line 44: "This is correct behavior" could be "This is correct behavior" (OK) but "it breaks Kubernetes HTTP probes" on line 82 is fine.
- Generally acceptable but could be more aggressive.

**Acronyms not expanded on first use (major issue):**
- Line 3: "LLM" -- never expanded. First use should read "large language model (LLM)."
- Line 3: "API" -- never expanded. First use should read "API (application programming interface)" or, given ubiquity, this one could be argued as unnecessary.
- Line 15: "UBI" -- never expanded. First use should read "Universal Base Image (UBI)."
- Line 83: "CI/CD" -- never expanded.
- Line 5: "CSS" (line 75) -- never expanded (though commonly understood).

**Numerals:** The rubric requires numerals in running text.
- Line 19: "Three issues" should be "3 issues."
- Line 64: "four test scenarios" should be "4 test scenarios."
- Line 85: No issues.

**Em dashes:** None detected. Compliant.

**Product names:**
- "Red Hat OpenShift" on line 7 -- correct full first mention.
- "Red Hat OpenShift AI" on line 13 -- correct.
- Subsequent uses of "OpenShift" without "Red Hat" prefix (lines 17, 25, 27, 44, 82, 85) -- acceptable after first mention.
- Line 5: "Next.js" -- correct capitalization.
- Line 24: "Next.js" -- correct.

**Lowercase component descriptors:**
- Line 5: "admin dashboard" -- correct (lowercase).
- Line 74: "admin dashboard" -- correct.

### Brand standards (6/10)

- Mermaid diagrams use Red Hat brand colors (`#EE0000` for Red Hat red, `#0066CC` for blue). This is a positive signal.
- No reference to Red Hat fonts or the broader brand style guide.
- The post doesn't include any non-brand visual elements, so there are no violations, but there's no proactive brand reinforcement either.
- The mermaid diagrams are well-styled with brand-appropriate colors and would render nicely.

### Word count (8/10)

Estimated word count: ~950 words. The rubric specifies 800-1300 for tutorials. This is well within range and appropriate for the content covered.

---

## Editorial Compliance Checklist

| Rule | Status | Notes |
|---|---|---|
| Sentence case headings | PASS | All H2s use sentence case correctly |
| Oxford commas | PASS | Consistently applied |
| No backticks | FAIL | 20+ instances of inline backticks throughout |
| Full product name first mention | PASS | "Red Hat OpenShift" on line 7 |
| Lowercase component descriptors | PASS | "admin dashboard" used correctly |
| No H1 in body | PASS | All headings are H2 |
| Expand acronyms on first use | FAIL | LLM, UBI, CI/CD, API never expanded |
| Use contractions aggressively | PARTIAL | Some used, opportunities missed |
| Numerals in running text | FAIL | "Three" (line 19), "four" (line 64) |
| No em dashes (or max 1-2) | PASS | None detected |

---

## Summary

The draft has solid structural fundamentals: good heading hierarchy, appropriate word count, consistent Oxford comma usage, and correct product naming. The mermaid diagrams use proper Red Hat brand colors.

However, 3 significant formatting issues must be addressed before publication:

1. **Remove all inline backticks** and apply monospace formatting through the CMS instead. This is a hard editorial requirement.
2. **Add CTAs** near the top and middle of the post, linking to Red Hat properties (developers.redhat.com, OpenShift AI docs). The current CTA is buried at the end and links only to GitHub.
3. **Expand all acronyms on first use**: LLM, UBI, CI/CD at minimum. Add a proper title for SEO (suggest: "Deploy an LLM API gateway on OpenShift with AI Relay").

Secondary fixes: spell out numbers as numerals ("3 issues" not "Three issues"), add redhat.com links throughout, and use contractions more aggressively.

**Overall weighted score: 4.7 / 10**
