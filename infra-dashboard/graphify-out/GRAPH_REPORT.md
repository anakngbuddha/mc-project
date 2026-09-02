# Graph Report - c:/Users/markmv/Desktop/mc-project/infra-dashboard  (2026-09-02)

## Corpus Check
- 63 files · ~78,307 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 204 nodes · 178 edges · 43 communities (12 shown, 31 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Frontend TS Config (App)
- Frontend TS Config (Node)
- Alert Service API
- Collector Service (Go)
- Notifier Service
- History Service (Prisma)
- History Service TS Config
- Notifier TS Config
- History Service Package
- Notifier Dev Dependencies
- Frontend Lint Config
- History DB Client
- Collector Provider Types
- Frontend TS References
- Build & Deploy Scripts
- Collector Go Package
- Alert Type (Frontend)
- Rule Type (Frontend)
- Cloud Account Type (Frontend)
- Metric Point Type (Frontend)
- Resource Group Type (Frontend)
- Credential Decryption
- Credential Encryption
- Encrypted Data Type
- Mobile API - Create Account
- Mobile API - Delete Account
- Mobile API - Fetch Alerts
- Mobile API - Fetch Accounts
- Mobile API - Fetch Metrics
- Mobile API - Fetch Resources
- Mobile API - Fetch Rules
- Mobile API - Get Endpoints
- Mobile API - Init Config
- Mobile API - Ping Health
- Mobile API - Save Endpoints
- Mobile API - Toggle Account
- Mobile Alert Type
- Mobile Cloud Account Type
- Mobile Fleet Stats Type
- Mobile Metric Type
- Mobile Resource Type
- Mobile Resource Group Type
- Mobile Rule Type

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `compilerOptions` - 10 edges
4. `compilerOptions` - 10 edges
5. `run()` - 7 edges
6. `scripts` - 6 edges
7. `receive_metric()` - 5 edges
8. `Rule` - 4 edges
9. `MetricInput` - 4 edges
10. `_matches()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `CollectAWS()`  [INFERRED]
  services/collector-service/main.go → services/collector-service/providers/aws.go
- `run()` --calls--> `CollectAzure()`  [INFERRED]
  services/collector-service/main.go → services/collector-service/providers/azure.go

## Import Cycles
- None detected.

## Communities (43 total, 31 thin omitted)

### Community 0 - "Frontend TS Config (App)"
Cohesion: 0.08
Nodes (23): DOM, vite/client, compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib (+15 more)

### Community 1 - "Frontend TS Config (Node)"
Cohesion: 0.10
Nodes (19): node, vite.config.ts, compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection (+11 more)

### Community 2 - "Alert Service API"
Cohesion: 0.23
Nodes (10): BaseModel, Alert, create_rule(), _matches(), MetricInput, alert-service — evaluates incoming metrics against threshold rules and calls not, Called by collector-service alongside history-service — same metric     payload, receive_metric() (+2 more)

### Community 3 - "Collector Service (Go)"
Cohesion: 0.17
Nodes (12): fetchCloudAccounts(), getenv(), CloudAccount, main(), postJSON(), run(), CollectAWS(), CloudAccount (+4 more)

### Community 4 - "Notifier Service"
Cohesion: 0.14
Nodes (13): dependencies, cors, express, cors, express, name, private, scripts (+5 more)

### Community 5 - "History Service (Prisma)"
Cohesion: 0.15
Nodes (13): prisma, devDependencies, prisma, tsx, @types/cors, @types/express, @types/node, typescript (+5 more)

### Community 6 - "History Service TS Config"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 7 - "Notifier TS Config"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 8 - "History Service Package"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, prisma:generate, prisma:migrate, start (+2 more)

### Community 9 - "Notifier Dev Dependencies"
Cohesion: 0.18
Nodes (11): devDependencies, tsx, @types/cors, @types/express, @types/node, typescript, tsx, @types/cors (+3 more)

### Community 10 - "Frontend Lint Config"
Cohesion: 0.20
Nodes (9): oxc, react, typescript, warn, plugins, rules, react/only-export-components, react/rules-of-hooks (+1 more)

### Community 11 - "History DB Client"
Cohesion: 0.22
Nodes (9): @prisma/client, dependencies, cors, express, @prisma/client, zod, cors, express (+1 more)

## Knowledge Gaps
- **126 isolated node(s):** `build-and-push.sh script`, `collector-service`, `Metric`, `CloudAccount`, `$schema` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `History Service (Prisma)` to `History Service Package`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `dependencies` connect `History DB Client` to `History Service Package`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `run()` (e.g. with `CollectAWS()` and `CollectAzure()`) actually correct?**
  _`run()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `build-and-push.sh script`, `collector-service`, `Metric` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Frontend TS Config (App)` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `Frontend TS Config (Node)` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Notifier Service` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._