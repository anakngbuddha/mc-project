# Graph Report - .  (2026-08-28)

## Corpus Check
- Corpus is ~4,056 words - fits in a single context window. You may not need a graph.

## Summary
- 236 nodes · 233 edges · 25 communities (17 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Notifier Service
- Frontend TS Config
- Frontend Dev Tooling
- History Service (Prisma)
- Vite Build Config
- React UI Dependencies
- Oxlint Rules
- Alert Service API
- History Service DevDeps
- History TS Config
- Notifier TS Config
- Collector Service (Go)
- Microservice Architecture
- History DB Layer
- Frontend TS References
- Frontend HTML Entry
- Notifier HTTP Handler
- Go Module
- Pydantic Dependency
- Icon Assets
- Oxlint Config
- Vite Logo Asset

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `compilerOptions` - 10 edges
4. `compilerOptions` - 10 edges
5. `scripts` - 6 edges
6. `receive_metric()` - 5 edges
7. `run()` - 5 edges
8. `scripts` - 5 edges
9. `Infra Dashboard Local-only Phase` - 5 edges
10. `Rule` - 4 edges

## Surprising Connections (you probably didn't know these)
- `frontend Vite React` --semantically_similar_to--> `React TypeScript Vite template`  [INFERRED] [semantically similar]
  README.md → services/frontend/README.md
- `FastAPI dependency` --conceptually_related_to--> `alert-service in-memory state`  [INFERRED]
  services/alert-service/requirements.txt → README.md
- `uvicorn standard dependency` --conceptually_related_to--> `alert-service in-memory state`  [INFERRED]
  services/alert-service/requirements.txt → README.md
- `Frontend HTML entry point` --references--> `Favicon SVG icon`  [EXTRACTED]
  services/frontend/index.html → services/frontend/public/favicon.svg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Infra Dashboard Microservice Pipeline** — readme_collector_service, readme_history_service, readme_alert_service, readme_notifier, readme_frontend [EXTRACTED 1.00]

## Communities (25 total, 8 thin omitted)

### Community 0 - "Notifier Service"
Cohesion: 0.08
Nodes (24): dependencies, cors, express, devDependencies, tsx, @types/cors, @types/express, @types/node (+16 more)

### Community 1 - "Frontend TS Config"
Cohesion: 0.08
Nodes (23): DOM, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib (+15 more)

### Community 2 - "Frontend Dev Tooling"
Cohesion: 0.10
Nodes (21): autoprefixer, oxlint, postcss, devDependencies, autoprefixer, oxlint, postcss, tailwindcss (+13 more)

### Community 3 - "History Service (Prisma)"
Cohesion: 0.10
Nodes (19): @prisma/client, dependencies, cors, express, @prisma/client, zod, cors, express (+11 more)

### Community 4 - "Vite Build Config"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 5 - "React UI Dependencies"
Cohesion: 0.12
Nodes (16): react, react-dom, recharts, dependencies, react, react-dom, recharts, name (+8 more)

### Community 6 - "Oxlint Rules"
Cohesion: 0.13
Nodes (12): oxc, react, typescript, warn, plugins, rules, react/only-export-components, react/rules-of-hooks (+4 more)

### Community 7 - "Alert Service API"
Cohesion: 0.23
Nodes (10): BaseModel, Alert, create_rule(), _matches(), MetricInput, alert-service — evaluates incoming metrics against threshold rules and calls not, Called by collector-service alongside history-service — same metric     payload, receive_metric() (+2 more)

### Community 8 - "History Service DevDeps"
Cohesion: 0.15
Nodes (13): prisma, devDependencies, prisma, tsx, @types/cors, @types/express, @types/node, typescript (+5 more)

### Community 9 - "History TS Config"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 10 - "Notifier TS Config"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 11 - "Collector Service (Go)"
Cohesion: 0.39
Nodes (8): Metric, mockResource, collectMock(), getenv(), main(), postJSON(), round2(), run()

### Community 12 - "Microservice Architecture"
Cohesion: 0.28
Nodes (9): alert-service in-memory state, collector-service mock mode, frontend Vite React, history-service SQLite Prisma, Infra Dashboard Local-only Phase, notifier service, FastAPI dependency, uvicorn standard dependency (+1 more)

### Community 13 - "History DB Layer"
Cohesion: 0.40
Nodes (4): prisma, app, IngestBody, MetricInput

## Knowledge Gaps
- **134 isolated node(s):** `collector-service`, `mockResource`, `$schema`, `typescript`, `oxc` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Frontend Dev Tooling` to `React UI Dependencies`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `History Service DevDeps` to `History Service (Prisma)`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `collector-service`, `mockResource`, `$schema` to the rest of the system?**
  _134 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Notifier Service` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Frontend TS Config` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Frontend Dev Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `History Service (Prisma)` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._