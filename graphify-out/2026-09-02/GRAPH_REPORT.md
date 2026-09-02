# Graph Report - mc-project  (2026-09-02)

## Corpus Check
- 33 files · ~9,461 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 316 nodes · 339 edges · 26 communities (21 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- compilerOptions
- devDependencies
- compilerOptions
- package.json
- package.json
- App.tsx
- main.py
- package.json
- devDependencies
- compilerOptions
- compilerOptions
- Run order
- devDependencies
- main.go
- index.ts
- React + TypeScript + Vite
- tsconfig.json
- index.ts
- collector-service
- huawei.go
- hwSign
- types.go
- build-and-push.sh

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `hwSign()` - 11 edges
4. `compilerOptions` - 10 edges
5. `compilerOptions` - 10 edges
6. `Complete End-to-End Deployment Guide: Azure VM to Huawei Cloud CCE` - 10 edges
7. `run()` - 8 edges
8. `fetchCESMetrics()` - 7 edges
9. `CollectHuawei()` - 6 edges
10. `listECSServers()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `run()` --calls--> `CollectHuawei()`  [INFERRED]
  infra-dashboard/services/collector-service/main.go → infra-dashboard/services/collector-service/providers/huawei.go
- `listECSServers()` --calls--> `hwSign()`  [INFERRED]
  infra-dashboard/services/collector-service/providers/huawei.go → infra-dashboard/services/collector-service/providers/huawei_sign.go
- `fetchCESMetrics()` --calls--> `hwSign()`  [INFERRED]
  infra-dashboard/services/collector-service/providers/huawei.go → infra-dashboard/services/collector-service/providers/huawei_sign.go
- `run()` --calls--> `CollectAWS()`  [INFERRED]
  infra-dashboard/services/collector-service/main.go → infra-dashboard/services/collector-service/providers/aws.go
- `run()` --calls--> `CollectAzure()`  [INFERRED]
  infra-dashboard/services/collector-service/main.go → infra-dashboard/services/collector-service/providers/azure.go

## Import Cycles
- None detected.

## Communities (26 total, 5 thin omitted)

### Community 0 - "compilerOptions"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 1 - "devDependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, devDependencies, autoprefixer, oxlint, postcss, tailwindcss, @types/node, @types/react (+13 more)

### Community 2 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 3 - "package.json"
Cohesion: 0.10
Nodes (19): dependencies, cors, express, @prisma/client, zod, cors, express, name (+11 more)

### Community 4 - "package.json"
Cohesion: 0.12
Nodes (16): dependencies, react, react-dom, recharts, name, private, scripts, build (+8 more)

### Community 5 - "App.tsx"
Cohesion: 0.11
Nodes (16): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, Alert, App(), formatMetricValue() (+8 more)

### Community 6 - "main.py"
Cohesion: 0.23
Nodes (10): BaseModel, Alert, create_rule(), _matches(), MetricInput, alert-service — evaluates incoming metrics against threshold rules and calls not, Called by collector-service alongside history-service — same metric     payload, receive_metric() (+2 more)

### Community 7 - "package.json"
Cohesion: 0.08
Nodes (24): dependencies, cors, express, devDependencies, tsx, @types/cors, @types/express, @types/node (+16 more)

### Community 8 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, prisma, tsx, @types/cors, @types/express, @types/node, typescript, tsx (+5 more)

### Community 9 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 10 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 11 - "Run order"
Cohesion: 0.18
Nodes (10): 1. history-service, 2. notifier, 3. alert-service, 4. collector-service, 5. frontend, Personal Infra Dashboard — Local-only phase, Ports, Run order (+2 more)

### Community 12 - "devDependencies"
Cohesion: 0.06
Nodes (30): 1.1 SSH into your Azure VM, 1.2 Update system packages and install Docker & Git, 1.3 Configure Docker permissions (run without `sudo`), 1.4 Log in to Docker Hub, 2.1 Clone or transfer the codebase, 2.2 Verify directory structure, 2.3 Build and push all images to Docker Hub, 3.1 Create a VPC and Subnet (+22 more)

### Community 13 - "main.go"
Cohesion: 0.17
Nodes (12): fetchCloudAccounts(), getenv(), CloudAccount, main(), postJSON(), run(), CollectAWS(), CloudAccount (+4 more)

### Community 14 - "index.ts"
Cohesion: 0.24
Nodes (9): decryptCredentials(), encryptCredentials(), EncryptedData, getEncryptionKey(), prisma, app, CloudAccountInput, IngestBody (+1 more)

### Community 15 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

### Community 22 - "huawei.go"
Cohesion: 0.25
Nodes (13): Client, cesMetricToStd(), CollectHuawei(), fetchCESMetrics(), CloudAccount, Metric, listECSServers(), truncate() (+5 more)

### Community 23 - "hwSign"
Cohesion: 0.31
Nodes (11): canonicalURI(), escapeRFC3986(), getHeader(), hexSHA256(), hmacSHA256(), hwSign(), TestCanonicalURI(), TestHWSign() (+3 more)

## Knowledge Gaps
- **163 isolated node(s):** `build-and-push.sh script`, `collector-service`, `cesResponse`, `Metric`, `CloudAccount` (+158 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `run()` connect `main.go` to `huawei.go`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `CollectHuawei()` connect `huawei.go` to `main.go`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `hwSign()` (e.g. with `fetchCESMetrics()` and `listECSServers()`) actually correct?**
  _`hwSign()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `build-and-push.sh script`, `collector-service`, `cesResponse` to the rest of the system?**
  _163 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._