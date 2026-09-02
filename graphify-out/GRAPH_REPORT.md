# Graph Report - mc-project  (2026-09-02)

## Corpus Check
- 52 files · ~19,854 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 463 nodes · 569 edges · 32 communities (27 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.8)
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
- dependencies
- package.json
- expo
- plugins
- tsconfig.json

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `react` - 14 edges
4. `hwSign()` - 11 edges
5. `expo` - 11 edges
6. `compilerOptions` - 10 edges
7. `compilerOptions` - 10 edges
8. `Complete End-to-End Deployment Guide: Azure VM to Huawei Cloud CCE` - 10 edges
9. `run()` - 8 edges
10. `fetchCESMetrics()` - 7 edges

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

## Communities (32 total, 5 thin omitted)

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
Cohesion: 0.06
Nodes (32): dependencies, cors, express, @prisma/client, zod, devDependencies, prisma, tsx (+24 more)

### Community 4 - "package.json"
Cohesion: 0.11
Nodes (18): dependencies, lucide-react, react, react-dom, recharts, react, name, private (+10 more)

### Community 5 - "App.tsx"
Cohesion: 0.10
Nodes (20): Metric, Resource, Alert, AlertCenter(), formatOperator(), Props, Rule, CloudAccount (+12 more)

### Community 6 - "main.py"
Cohesion: 0.23
Nodes (10): BaseModel, Alert, create_rule(), _matches(), MetricInput, alert-service — evaluates incoming metrics against threshold rules and calls not, Called by collector-service alongside history-service — same metric     payload, receive_metric() (+2 more)

### Community 7 - "package.json"
Cohesion: 0.08
Nodes (24): dependencies, cors, express, devDependencies, tsx, @types/cors, @types/express, @types/node (+16 more)

### Community 8 - "devDependencies"
Cohesion: 0.06
Nodes (54): App(), styles, Tab, AlertItem(), formatOperator(), Props, styles, Header() (+46 more)

### Community 9 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 10 - "compilerOptions"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, rootDir, skipLibCheck (+4 more)

### Community 11 - "Run order"
Cohesion: 0.17
Nodes (11): 1. history-service, 2. notifier, 3. alert-service, 4. collector-service, 5. frontend (Enterprise Web Dashboard), 6. mobile (React Native / Expo Go), Personal Infra Dashboard — Local-only phase, Ports (+3 more)

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

### Community 26 - "dependencies"
Cohesion: 0.10
Nodes (21): expo, expo-haptics, expo-status-bar, dependencies, expo, expo-haptics, expo-status-bar, lucide-react-native (+13 more)

### Community 27 - "package.json"
Cohesion: 0.11
Nodes (17): @babel/core, devDependencies, @babel/core, @types/react, typescript, @types/react, typescript, main (+9 more)

### Community 28 - "expo"
Cohesion: 0.12
Nodes (16): backgroundColor, adaptiveIcon, expo, android, icon, ios, name, orientation (+8 more)

### Community 29 - "plugins"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 30 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): compilerOptions, strict, extends, expo/tsconfig.base

## Knowledge Gaps
- **224 isolated node(s):** `build-and-push.sh script`, `collector-service`, `cesResponse`, `Metric`, `CloudAccount` (+219 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `devDependencies` to `App.tsx`, `plugins`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `plugins` connect `plugins` to `devDependencies`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `hwSign()` (e.g. with `fetchCESMetrics()` and `listECSServers()`) actually correct?**
  _`hwSign()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `build-and-push.sh script`, `collector-service`, `cesResponse` to the rest of the system?**
  _224 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._