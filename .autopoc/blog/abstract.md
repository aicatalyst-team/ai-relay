# Blog Abstract: AI Relay on OpenShift

## Thesis
Deploying AI Relay, a multi-provider LLM API gateway, on Red Hat OpenShift proves that AI infrastructure middleware can run natively on enterprise Kubernetes with UBI containers, providing unified access to multiple LLM providers with routing, failover, and monitoring out of the box.

## Target Audience
Platform engineers and ML engineers managing multi-provider LLM deployments in enterprise environments.

## Blog Type
Red Hat Developer Blog

## Key Points
1. AI Relay unifies OpenAI, Anthropic, DeepSeek, and other LLM APIs behind a single endpoint with smart routing and automatic failover
2. The Next.js application was containerized with UBI9 Node.js images and deployed to OpenShift, passing all PoC validation tests
3. The built-in admin dashboard and health monitoring make it operationally ready for enterprise AI infrastructure

## Products/Projects
Red Hat OpenShift AI, Open Data Hub, UBI9

## CTA
Try deploying your own AI API gateway on OpenShift using the AutoPoC framework.

## Proposed Section Outline
1. What is AI Relay?
2. Why an LLM gateway matters for enterprise AI
3. Containerizing for OpenShift with UBI
4. Deploying to the cluster
5. Validating the deployment
6. What we learned
7. Try it yourself
