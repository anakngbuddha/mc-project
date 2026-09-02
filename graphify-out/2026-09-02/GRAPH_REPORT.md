# Graph Report - mc-project  (2026-08-28)

## Corpus Check
- 23 files · ~4,056 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 236 nodes · 235 edges · 22 communities (19 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
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

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `compilerOptions` - 10 edges
4. `compilerOptions` - 10 edges
5. `scripts` - 6 edges
6. `Run order` - 6 edges
7. `receive_metric()` - 5 edges
8. `run()` - 5 edges
9. `scripts` - 5 edges
10. `Personal Infra Dashboard — Local-only phase` - 5 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (22 total, 3 thin omitted)

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
Cohesion: 0.13
Nodes (12): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, Alert, Metric, Resource (+4 more)

### Community 6 - "main.py"
Cohesion: 0.23
Nodes (10): BaseModel, Alert, create_rule(), _matches(), MetricInput, alert-service — evaluates incoming metrics against threshold rules and calls not, Called by collector-service alongside history-service — same metric     payload, receive_metric() (+2 more)

### Community 7 - "package.json"
Cohesion: 0.14
Nodes (13): dependencies, cors, express, cors, express, name, private, scripts (+5 more)

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
Cohesion: 0.18
Nodes (11): devDependencies, tsx, @types/cors, @types/express, @types/node, typescript, tsx, @types/cors (+3 more)

### Community 13 - "main.go"
Cohesion: 0.39
Nodes (8): Metric, mockResource, collectMock(), getenv(), main(), postJSON(), round2(), run()

### Community 14 - "index.ts"
Cohesion: 0.40
Nodes (4): prisma, app, IngestBody, MetricInput

### Community 15 - "React + TypeScript + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + TypeScript + Vite

## Knowledge Gaps
- **134 isolated node(s):** `collector-service`, `mockResource`, `$schema`, `typescript`, `oxc` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `collector-service`, `mockResource`, `$schema` to the rest of the system?**
  _134 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._