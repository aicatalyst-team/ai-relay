# PoC Plan: ai-relay

## Project Classification
- **Type:** api-service
- **Key Technologies:** TypeScript, Next.js 15, pnpm, React 19, Drizzle ORM
- **ODH Relevance:** AI API gateway that can serve as infrastructure middleware for OpenShift AI model-serving endpoints. Demonstrates multi-provider LLM routing, failover, and monitoring on the platform.

## PoC Objectives
1. Validate that AI Relay can be containerized and deployed on OpenShift as a UBI-based container
2. Confirm the admin dashboard and API endpoints are accessible through OpenShift Routes
3. Verify health endpoint functionality for Kubernetes readiness/liveness probes
4. Demonstrate the models listing endpoint works without requiring external API keys

## Infrastructure Requirements
- **Resource Profile:** small (256Mi RAM, 250m CPU)
- **GPU Required:** No
- **Persistent Storage:** None (in-memory mode sufficient for PoC)
- **Sidecar Containers:** None
- **LLM API Required:** No (app starts in degraded mode without keys, which is sufficient for PoC validation)

## Test Scenarios

### Scenario 1: health-check
- **Description:** Verify the /health endpoint returns a valid JSON response with status and version information
- **Type:** http
- **Input:** GET /health
- **Expected:** Returns 200 or 503 with JSON containing status, version, providers, and features fields
- **Timeout:** 30 seconds

### Scenario 2: models-endpoint
- **Description:** Verify the /v1/models endpoint responds (may return empty list without configured providers)
- **Type:** http
- **Input:** GET /v1/models
- **Expected:** Returns HTTP response (200 or error with JSON body)
- **Timeout:** 30 seconds

### Scenario 3: admin-dashboard
- **Description:** Verify the admin dashboard page loads and returns HTML
- **Type:** http
- **Input:** GET /admin
- **Expected:** Returns 200 with HTML content
- **Timeout:** 30 seconds

### Scenario 4: homepage
- **Description:** Verify the homepage loads correctly
- **Type:** http
- **Input:** GET /
- **Expected:** Returns 200 with HTML content
- **Timeout:** 30 seconds

## Dockerfile Considerations
- Use `registry.access.redhat.com/ubi9/nodejs-22` as base image
- Override .npmrc to use default npm registry instead of Chinese mirror
- Install pnpm globally, then run pnpm install and next build
- Enable Next.js standalone output mode by modifying next.config.mjs
- Use port 3000 (non-privileged, safe for OpenShift)
- Set NODE_ENV=production for optimized build

## Deployment Considerations
- **Deployment Model:** Deployment (long-running web server)
- **Service:** ClusterIP on port 3000
- **Probes:** Use /health endpoint for readiness and liveness
- **Environment Variables:** None required for basic PoC (degraded mode is acceptable)
- **Route:** Create OpenShift Route for external access to admin dashboard
