# RHOAI Evaluation: ai-relay

## Strategy: Red Hat AI 2026

## Impact Dimensions

| Dimension | Score (0-20) | Rationale |
|-----------|-------------|-----------|
| Audience Value | 16 | AI API gateways are highly relevant to enterprise teams managing multiple LLM providers. The multi-key rotation, failover, and cost/latency routing features address real production pain points. |
| Strategic Alignment | 14 | Model-serving proxy aligns with the inference and model-serving strategy area. Demonstrates how OpenShift can host AI infrastructure middleware. Not a core Red Hat product but complements the stack. |
| Strategy Fit | 13 | Fits the model-serving category. Demonstrates OpenShift as a platform for AI infrastructure. Does not directly use InstructLab, RHEL AI, or KServe but complements them as a routing layer. |
| Platform Leverage | 15 | Excellent OpenShift fit: web service with health endpoints, admin UI, API routes. Demonstrates Deployment, Service, Route patterns. Can showcase scaling and HA. |
| Demo Potential | 17 | Rich admin dashboard with usage charts, provider management, model testing. API endpoints for chat completions. Health check endpoint. Very visual and interactive demo. |

**Impact Score: 15.0 / 20**

## Feasibility Dimensions

| Dimension | Score (0-20) | Rationale |
|-----------|-------------|-----------|
| Container Readiness | 16 | Standard Next.js app with clear build/start scripts. No native dependencies. pnpm-based with lock file. Straightforward to containerize with UBI Node image. |
| Dependency Profile | 15 | Only 7 runtime dependencies, all well-maintained npm packages. No native modules. .npmrc points to Chinese mirror but easily overridden. |
| Reproduction Confidence | 14 | Well-structured codebase with 27 test files. Clear entry points. Works in multiple deployment modes (Vercel, Cloudflare, Local). Self-contained without external DB requirement. |
| Complexity Sweet Spot | 15 | Right level of complexity for a PoC: single service, clear API surface, admin UI for demo, health endpoints for validation. Not too simple, not too complex. |

**Feasibility Score: 15.0 / 20**

## Overall Assessment

- **Total Score: 75 / 100**
- **Relationship to Red Hat AI: adjacent** (complements model-serving infrastructure)
- **Strategy Areas: model-serving, inference**
- **Capability Labels: model-serving, api-gateway, llm-proxy**

## Strengths
- Rich admin dashboard provides excellent demo visuals
- OpenAI-compatible API means easy integration testing
- Multi-provider failover is a compelling enterprise feature
- Health endpoint enables proper K8s readiness/liveness probes
- Clean dependency profile with no GPU requirements

## Risks
- Requires at least one LLM provider API key for full functionality
- .npmrc configured for Chinese npm mirror (needs override)
- No existing Dockerfile (needs to be created)
- Drizzle ORM PostgreSQL support is optional but adds value if deployed
