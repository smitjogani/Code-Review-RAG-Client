export const DEMO_PROJECT_ID = "674a1b2c3d4e5f6789012345";

export const DEMO_PROJECT = {
  _id: DEMO_PROJECT_ID,
  name: "ShopFlow E-Commerce API",
  type: "github",
  language: "TypeScript, Node.js",
  framework: "Express, React",
  tools: "PostgreSQL, Redis, Docker",
  repoUrl: "https://github.com/acme-corp/shopflow-api",
  status: "completed",
};

export const DEMO_ANALYSIS_REPORT = `# Codebase Audit & Strategy Report

## Executive Summary

**ShopFlow E-Commerce API** is a mature TypeScript monolith serving a React storefront and admin dashboard. The codebase demonstrates solid domain separation and production-ready patterns in core commerce flows, with room to improve cross-cutting concerns around authentication, observability, and test coverage.

**Overall File Quality Grade: B+** — Well-structured service layer and clear API boundaries; auth middleware and error handling need hardening before scale.

---

## Architecture & Design Pattern

The project follows a **Layered Architecture** with a thin controller layer, service/domain layer, and repository pattern for data access.

| Layer | Responsibility | Key Directories |
|-------|----------------|-----------------|
| Routes | HTTP routing, validation | \`src/routes/\` |
| Controllers | Request/response mapping | \`src/controllers/\` |
| Services | Business logic | \`src/services/\` |
| Repositories | Database access | \`src/repositories/\` |
| Models | Mongoose schemas | \`src/models/\` |

🟢 **Strong:** Clear separation between \`order.service.ts\` and \`payment.service.ts\` — each owns a single domain.
🟡 **Minor:** Some controllers still contain inline validation that belongs in validators.
🟠 **Medium:** Shared utilities in \`src/utils/\` are growing without sub-module boundaries.

---

## Folder Structure & Architecture

### Current Folder Structure

\`\`\`
shopflow-api/
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   └── utils/
├── tests/
├── docker-compose.yml
└── package.json
\`\`\`

### Suggested New Folder Structure

\`\`\`
shopflow-api/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── payments/
│   │   └── catalog/
│   ├── shared/
│   │   ├── middleware/
│   │   ├── errors/
│   │   └── validators/
│   └── config/
├── tests/
│   ├── unit/
│   └── integration/
└── package.json
\`\`\`

| Aspect | Current | Suggested |
|--------|---------|-----------|
| Discoverability | Moderate — flat layers | High — feature modules |
| Onboarding time | ~2 weeks | ~1 week |
| Cross-module coupling | Some leakage via utils | Explicit module boundaries |

---

## Code Quality Assessment

### Strong Points
- 🟢 **Repository pattern** consistently applied across all data models
- 🟢 **TypeScript strict mode** enabled with minimal \`any\` usage (3 instances)
- 🟢 **Docker Compose** stack mirrors production topology

### Weak Points
- 🟠 **Auth middleware** duplicated across 4 route files instead of centralized guard
- 🟠 **Order service** at 680 lines — candidate for extraction into sub-services
- 🟡 **Test coverage** at 42% — integration tests missing for payment webhooks

### Critical Risks
- 🔴 **\`auth.middleware.ts\`** — JWT secret read from env without rotation strategy; no token blacklist on logout
- 🔴 **\`payment.service.ts\`** — Stripe webhook signature verification commented out in dev branch (line 142)
- 🔴 **SQL injection surface** — raw query in \`report.repository.ts:87\` uses string concatenation

---

## Detailed Code Review & File Quality

- 🟢 \`src/repositories/order.repository.ts\` — Clean query builders, proper index hints on \`userId\` + \`status\`
- 🟢 \`src/config/database.ts\` — Connection pooling configured (min: 5, max: 20)
- 🟡 \`src/services/email.service.ts\` — Template rendering works but lacks retry/backoff for SendGrid failures
- 🟠 \`src/controllers/checkout.controller.ts\` — 340 lines; mixes cart validation with payment orchestration
- 🔴 \`src/middlewares/auth.middleware.ts\` — Missing rate limiting on token refresh endpoint
- 🔴 \`src/services/inventory.service.ts\` — Race condition in stock decrement (no optimistic locking)

---

## Strategic Recommendations

1. **🔴 P0 — Secure auth pipeline:** Centralize JWT middleware, enable webhook signature verification, add token blacklist via Redis.
2. **🟠 P1 — Modularize by domain:** Migrate to \`src/modules/*\` structure over 2 sprints to reduce cross-import coupling.
3. **🟠 P1 — Fix inventory race condition:** Add optimistic locking or Redis-based distributed lock on stock updates.
4. **🟡 P2 — Raise test coverage to 70%:** Prioritize payment webhook and checkout integration tests.
5. **🟡 P2 — Add structured logging:** Replace \`console.log\` in 12 service files with Winston + correlation IDs.

--- SUGGESTED_QUESTIONS ---
- What is the core architectural pattern used in this codebase?
- Explain the authentication and authorization data flow
- Where is technical debt highest and what should we fix first?
`;

export const DEMO_SUGGESTIONS = [
  "What is the core architectural pattern used in this codebase?",
  "Explain the authentication and authorization data flow",
  "Where is technical debt highest and what should we fix first?",
];

export const DEMO_CHAT_RESPONSES = {
  "What is the core architectural pattern used in this codebase?": {
    answer: `## Architectural Pattern: Layered Architecture

ShopFlow uses a **classic Layered (N-Tier) Architecture** with four distinct tiers:

\`\`\`
HTTP Request
    ↓
Routes → Controllers → Services → Repositories → Database
\`\`\`

### How it works in practice

**1. Routes** (\`src/routes/\`) define endpoints and attach middleware:
\`\`\`typescript
router.post('/orders', authMiddleware, orderController.create);
\`\`\`

**2. Controllers** (\`src/controllers/\`) handle HTTP concerns only — parsing req/res, status codes.

**3. Services** (\`src/services/\`) contain all business logic. For example, \`order.service.ts\` orchestrates inventory checks, payment initiation, and email notifications.

**4. Repositories** (\`src/repositories/\`) encapsulate all Mongoose/PostgreSQL queries.

### Why this pattern fits

| Strength | Evidence in codebase |
|----------|---------------------|
| Testability | Services are unit-tested in isolation |
| Team scaling | Different devs can own different service files |
| Predictability | New endpoints follow the same route → controller → service flow |

### Recommended evolution

Move toward **modular monolith** (\`src/modules/orders/\`, \`src/modules/payments/\`) to reduce the growing \`src/utils/\` dependency graph.`,
    sources: [
      { file: "src/routes/order.routes.ts" },
      { file: "src/services/order.service.ts" },
      { file: "src/repositories/order.repository.ts" },
    ],
    suggestions: [
      "How are services communicating with each other?",
      "Show me the order creation flow step by step",
      "What would a microservices split look like for ShopFlow?",
    ],
  },

  "Explain the authentication and authorization data flow": {
    answer: `## Authentication & Authorization Flow

### Login Flow

\`\`\`mermaid
sequenceDiagram
    Client->>+AuthController: POST /auth/login {email, password}
    AuthController->>+AuthService: validateCredentials()
    AuthService->>+UserRepository: findByEmail()
    UserRepository-->>-AuthService: User record
    AuthService->>AuthService: bcrypt.compare(password)
    AuthService->>AuthService: jwt.sign({userId, role})
    AuthService-->>-AuthController: { accessToken, refreshToken }
    AuthController-->>-Client: 200 OK + tokens
\`\`\`

### Protected Route Flow

1. Client sends \`Authorization: Bearer <token>\` header
2. \`auth.middleware.ts\` extracts and verifies JWT
3. Decoded \`userId\` and \`role\` attached to \`req.user\`
4. \`role.middleware.ts\` checks required role (admin, customer, vendor)

### Critical gaps found

| Issue | Location | Risk |
|-------|----------|------|
| No token blacklist on logout | \`auth.service.ts:89\` | Stolen tokens remain valid |
| Refresh endpoint lacks rate limit | \`auth.routes.ts:24\` | Brute-force vector |
| Role check bypassed in 2 admin routes | \`admin.routes.ts:12, 34\` | Privilege escalation |

### Recommended fix

\`\`\`typescript
// Centralized auth guard — src/shared/middleware/auth.guard.ts
export const requireAuth = (roles?: Role[]) => [
  verifyJwt,
  roles?.length ? requireRole(roles) : (_req, _res, next) => next(),
];
\`\`\``,
    sources: [
      { file: "src/middlewares/auth.middleware.ts" },
      { file: "src/services/auth.service.ts" },
      { file: "src/routes/auth.routes.ts" },
    ],
    suggestions: [
      "How should we implement token blacklisting with Redis?",
      "Which admin routes are missing role checks?",
      "What OAuth providers could we add alongside JWT?",
    ],
  },

  "Where is technical debt highest and what should we fix first?": {
    answer: `## Technical Debt Heat Map

Based on cyclomatic complexity, change frequency, and security surface area:

| Priority | Area | Debt Score | Impact |
|----------|------|------------|--------|
| 🔴 P0 | Auth & security | 9.2/10 | Data breach risk |
| 🔴 P0 | Payment webhooks | 8.7/10 | Revenue loss |
| 🟠 P1 | Inventory service | 7.1/10 | Overselling risk |
| 🟠 P1 | Order service size | 6.8/10 | Maintainability |
| 🟡 P2 | Test coverage | 5.4/10 | Regression risk |
| 🟡 P2 | Logging/observability | 4.9/10 | Debug time |

### Fix-first roadmap (next 30 days)

**Week 1–2: Security hardening**
- Re-enable Stripe webhook signature verification in \`payment.service.ts:142\`
- Centralize auth middleware; add Redis token blacklist
- Patch raw SQL in \`report.repository.ts:87\` → parameterized query

**Week 3: Inventory race condition**
- Add optimistic locking on \`inventory.service.ts\` stock decrement
- Write integration test simulating concurrent checkout

**Week 4: Structural cleanup**
- Extract \`checkout.controller.ts\` validation into dedicated validator
- Begin \`src/modules/\` migration starting with \`auth\` module

### Estimated effort

| Item | Dev-days | ROI |
|------|----------|-----|
| Auth pipeline fix | 3 | Critical — blocks prod audit |
| Webhook verification | 0.5 | Critical — payment integrity |
| Inventory locking | 2 | High — prevents overselling |
| Module migration | 8 | Medium — long-term velocity |`,
    sources: [
      { file: "src/services/payment.service.ts" },
      { file: "src/services/inventory.service.ts" },
      { file: "src/middlewares/auth.middleware.ts" },
      { file: "src/repositories/report.repository.ts" },
    ],
    suggestions: [
      "Walk me through the inventory race condition in detail",
      "What does the Stripe webhook fix look like in code?",
      "How should we structure the modules migration?",
    ],
  },
};

export function getDemoChatResponse(question) {
  const normalized = question.trim().toLowerCase();

  for (const [key, response] of Object.entries(DEMO_CHAT_RESPONSES)) {
    if (key.toLowerCase() === normalized) {
      return response;
    }
  }

  for (const [key, response] of Object.entries(DEMO_CHAT_RESPONSES)) {
    const keyWords = key.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const matchCount = keyWords.filter((w) => normalized.includes(w)).length;
    if (matchCount >= 2) {
      return response;
    }
  }

  return {
    answer: `Based on my analysis of **ShopFlow E-Commerce API**, I can help you explore architecture, auth flows, payment integration, and technical debt priorities.

Try asking one of the suggested questions below, or ask about specific files like \`order.service.ts\`, \`auth.middleware.ts\`, or \`payment.service.ts\`.`,
    sources: [{ file: "src/services/order.service.ts" }],
    suggestions: DEMO_SUGGESTIONS,
  };
}

export function parseAnalysisReport(reportText) {
  let report = reportText;
  let suggestions = [];

  if (/---+?\s*SUGGESTED_QUESTIONS\s*---+?/i.test(reportText)) {
    const parts = reportText.split(/---+?\s*SUGGESTED_QUESTIONS\s*---+?/i);
    report = parts[0].trim();
    if (parts[1]) {
      suggestions = parts[1]
        .split("\n")
        .filter((line) => line.trim().startsWith("-"))
        .map((line) => line.replace(/^-\s*/, "").trim());
    }
  }

  return { report, suggestions };
}
