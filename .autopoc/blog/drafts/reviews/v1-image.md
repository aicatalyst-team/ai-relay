# Image Review -- v1

## Scores

| Dimension | Weight | Score | Weighted |
|---|---|---|---|
| Placement rationale | 2x | 6 | 12 |
| Prompt specificity | 2x | 7 | 14 |
| Brand compliance | 2x | 7 | 14 |
| Aspect ratio & sizing | 1x | 5 | 5 |
| Alt text quality | 1x | 3 | 3 |
| Image count | 1x | 4 | 4 |
| **Total** | | | **52 / 90** |
| **Normalized** | | | **5.8 / 10** |

## Visual Inventory

The draft contains **2 Mermaid diagrams** and **0 image placeholders**:

1. **Build pipeline flow** (lines 29-38) -- `graph LR` showing Clone Repo through Push to Quay.io. Placed after the containerization narrative.
2. **Deployment topology** (lines 48-60) -- `graph TD` with subgraph showing Namespace, Service, Deployment, Pod, and image pull relationship. Placed after the deployment narrative.

No hero image. No screenshots. No generated image placeholders.

## Per-Visual Feedback

### Mermaid Diagram 1: Build Pipeline (lines 29-38)

- **Placement:** Good. Follows the containerization narrative and summarizes the 5-step flow. Aids comprehension.
- **Diagram clarity:** Clear and readable. Node labels are concise. Left-to-right flow is the right choice for a linear pipeline.
- **Diagram type:** `graph LR` is correct for a sequential pipeline.
- **Brand theming:** `%%{init}%%` block present with `#EE0000`, `#A30000`, `#6A6E73`, `#F0F0F0`, `#0066CC`. Nodes D and E have explicit Red Hat red and blue fills. Good.
- **Issue:** No caption or alt text. A reader using a screen reader or a rendering environment that doesn't support Mermaid gets nothing.

### Mermaid Diagram 2: Deployment Topology (lines 48-60)

- **Placement:** Good. Directly follows the deployment description. Shows the Kubernetes resource relationships clearly.
- **Diagram clarity:** Clear. Subgraph labels the namespace. The dashed image-pull line is a nice touch. Node labels include relevant detail (port, image base, framework).
- **Diagram type:** `graph TD` with subgraph is the right choice for showing containment and relationships in a deployment topology.
- **Brand theming:** `%%{init}%%` block present with full Red Hat palette. Namespace uses neutral `#F0F0F0`, services/deployment use blue `#0066CC`, pod uses red `#EE0000`. Good color hierarchy.
- **Issue:** Same accessibility gap -- no caption or alt text.

## Missing Image Opportunities

The following visuals would significantly improve the post:

### 1. Hero Image (critical)

Every Red Hat Developer blog post needs a hero image. This post has none.

**Suggested prompt:** "A wide 16:9 technical illustration showing an AI API gateway (labeled 'AI Relay') sitting between multiple application icons on the left and LLM provider logos (OpenAI, Anthropic, DeepSeek) on the right, with routing arrows. Use Red Hat brand colors: #EE0000 for the gateway, #151515 background, #F0F0F0 for text, #0066CC for connection lines. Clean, minimal, enterprise style."

**Aspect ratio:** 16:9, 1200x675px minimum.

### 2. Admin Dashboard Screenshot (high value)

The post mentions the admin dashboard in three places (intro, validation section, conclusion) but never shows it. A screenshot would make the "operationally ready" claim concrete.

**Suggested placement:** After line 75 ("This is the page where operators would manage API keys...").

**Alt text:** "AI Relay admin dashboard showing the key management panel, model catalog, and usage monitoring interface running in the OpenShift-deployed instance."

### 3. Architecture Overview Diagram (high value)

The "Why an LLM gateway matters" section describes AI Relay's proxy role but has no visual. A Mermaid sequence or flowchart diagram would clarify the request flow.

**Suggested Mermaid (sequence diagram):**
```
sequenceDiagram
    participant App as Application
    participant Relay as AI Relay
    participant GPT as OpenAI
    participant Claude as Anthropic
    App->>Relay: POST /v1/chat/completions
    Relay->>GPT: Route by policy
    GPT--x Relay: 429 Rate Limited
    Relay->>Claude: Failover
    Claude-->>Relay: 200 Response
    Relay-->>App: 200 Response
```

**Placement:** After line 13 (end of "Why an LLM gateway matters" section).

### 4. Test Results Visual (optional)

The validation table at lines 66-72 is functional but could be supplemented with a simple pass/fail visual (e.g., a Mermaid diagram with green checkmarks) to break up the text. Lower priority since the table is already clear.

## Alt Text Issues

Neither Mermaid diagram has accompanying alt text or captions. While Mermaid renders visually in most environments, accessibility requires a fallback. Recommendations:

- Add an HTML comment or paragraph caption before each Mermaid block describing what the diagram shows.
- Example for Diagram 1: *"Figure 1: Build pipeline flow from repository clone through Dockerfile creation, OpenShift BuildConfig, on-cluster binary build, to Quay.io image push."*
- Example for Diagram 2: *"Figure 2: Deployment topology in the poc-ai-relay namespace showing the Service, Deployment, and Pod resources with the container image pulled from Quay.io."*

## Summary

The two existing Mermaid diagrams are well-placed, well-themed, and use appropriate diagram types. They follow Red Hat brand colors correctly in their `%%{init}%%` blocks. However, the post is under-illustrated for a developer blog of this length and technical depth. The most critical gaps are:

1. **No hero image** -- mandatory for Red Hat Developer blog format
2. **No admin dashboard screenshot** -- the post's strongest selling point (operational readiness) is described but never shown
3. **No architecture overview** -- the gateway concept in section 2 needs a visual
4. **No alt text or captions** on the existing Mermaid diagrams

Adding a hero image, an architecture diagram (Mermaid sequence), a dashboard screenshot placeholder, and captions for existing diagrams would bring this to a 7.5-8 range.
