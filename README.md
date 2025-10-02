# FRN Promotions Service

[![VTEX](https://img.shields.io/badge/VTEX-181717?logo=vtex&logoColor=white&color=red)](https://vtex.com/pt-br/)
[![VTEX IO](https://img.shields.io/badge/vtex-io-blue)](https://vtex.io/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-7.x-green)](https://nodejs.org/)

The Promotions Service app, centralizes the retrieval of rates & benefits promotions and exposes a curated route for the storefront. The middleware chain validates inbound requests, calls VTEX's Rates & Benefits API, enriches the response with detailed promotion data, and returns only the fields required by the front end.

## Features

- **Single endpoint**: `GET /_v/custom-promotions` with optional `id` query parameter to fetch one promotion or the full list.
- **Domain validation**: Rejects malformed `idCalculatorConfiguration` values up-front to avoid unnecessary calls.
- **Data normalization**: Uses `formattedPromotion` to expose a predictable payload (id, name, begin/end dates, conditions, SKUs, collections, categories).
- **Error sanitation**: `handleVtexError` translates upstream failures into safe HTTP responses without leaking internal details.
- **Caching ready**: Service leverages VTEX `LRUCache` for the Rates & Benefits client, reducing load on VTEX APIs.
  
## Project Structure

```
frn-promotions-service/
├── manifest.json               # App metadata, policies, builders
├── node/
│   ├── index.ts                # Service entrypoint (clients + routes)
│   ├── service.json            # Route exposure and scaling hints
│   ├── clients/                # VTEX IO clients bag (RatesAndBenefits)
│   ├── middlewares/
│   │   └── promotions/         # Validation + fetching logic
|   |── services/               # Contains the business logic layer
│   ├── utils/                  # Formatting, filtering, error handling
│   └── typings/                # Shared TypeScript definitions
├── docs/                       # Documentation
└── README.md                   
```

## Overview

```
Request ──> validatePromotionId ──> getPromotionWithId ──> getAllPromotions ──> Response
                 │                        │                    │
                 └─────(sets ctx.state.id)└── fetch by ID      └── fetch + map all
```

- `validatePromotionId`: validates `id` (if provided) using `validator.isUUID` and stores it on `ctx.state`.
- `getPromotionWithId`: short-circuits the chain when `id` is present, calling `RatesAndBenefits.getPromotionById` and formatting the result.
- `getAllPromotions`: when no `id` is passed, pulls every promotion through `RatesAndBenefits.getAllBenefits`, filters valid IDs, hydrates details in parallel (`Promise.all`), and formats each entry.

Supporting utilities live in `node/utils/`:

- `filteredPromotionIds`: collects non-empty `idCalculatorConfiguration` values.
- `formattedPromotion`: maps a `CalculatorConfiguration` to the trimmed response schema.
- `handleVtexError`: standardizes error responses (status + message).

## API

### `GET /_v/custom-promotions`

| Query Param | Type   | Description                                                 |
|-------------|--------|-------------------------------------------------------------|
| `id`        | string | Optional VTEX promotion UUID (`idCalculatorConfiguration`). |

#### Responses

- **200 OK (Promotions list)**

✔️ endpoint promotions
```/_v/custom-promotions```
```json
[
  {
  "id": "d38eac5a-f2b3-410f-bc0b-f2211ede433b",
  "name": "Summer",
  "beginDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "conditions": ["cluster-123"],
  "skus": ["12"],
  "collections": ["summer"],
  "categories": ["fashion"]
  },
  {
  "id": "d68eac5a-f2b3-410f-bc0b-f2211ede433b",
  "name": "Summer2",
  "beginDate": "2024-01-01T00:00:00Z",
  "endDate": "2025-01-31T23:59:59Z",
  "conditions": ["cluster-124"],
  "skus": ["13"],
  "collections": ["summer"],
  "categories": ["fashion"]
  }
]
```

- **200 OK (single promotion)**

✔️ endpoint promotion
```/_v/custom-promotions?id=d38eac5a-f2b3-410f-bc0b-f2211ede433b```
```json
{
  "id": "d38eac5a-f2b3-410f-bc0b-f2211ede433b",
  "name": "Summer Sale",
  "beginDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "conditions": ["cluster-123"],
  "skus": ["12"],
  "collections": ["summer"],
  "categories": ["fashion"]
}
```
- **4xx / 5xx**

```json
{
  "message": "Invalid idCalculatorConfiguration format",
  "status": 400
}
```

## References

- [Promotions & Taxes API – Calculator Configuration](https://developers.vtex.com/docs/api-reference/promotions-and-taxes-api#get-/api/rnb/pvt/benefits/calculatorconfiguration)  
  Endpoint used to fetch and manage `idCalculatorConfiguration` data related to Rates & Benefits.

## 🛠 Local Development

### Prerequisites

- VTEX Toolbelt ≥ 3.x (`yarn add -g vtex`)
- Node.js 20 or 18 LTS (aligned with VTEX IO runtime)
- Yarn 1.x (ships with the repo via `yarn.lock`)

### Install & Link

```bash
cd node
yarn install
vtex login <account>
vtex use <workspace>
vtex link

```

The default route is exposed at `https://{workspace}--{account}.myvtex.com/_v/custom-promotions`.

### Quality Tooling

```bash
yarn run lint        # eslint (TypeScript aware)
yarn run test        # tests with Jest

```

Use `lint.sh` (wired to `prereleasy`) before releasing to ensure CI parity.



## ⚙️ Error Handling & Observability

- Errors hit during client calls bubble to `handleVtexError`, which sets `ctx.status` and a minimal `{ message, status }` payload.
- VTEX Colossus logging is available by injecting `ctx.vtex.logger` (kept commented in middleware for quick enablement).
- HTTP caching is handled via VTEX's `LRUCache`; tweak `TIMEOUT_MS`, retry count, and `memoryCache` in `node/index.ts` as needed.

## 🚢 Deployment Notes

- The app inherits policies defined in `manifest.json` (outbound access to `{{account}}.vtexcommercestable.com.br` and logging). Update them if you call additional hosts.
- `prereleasy` runs `bash lint.sh`. Keep the script aligned with the checks you expect in CI.
- Publish via `vtex release` (wraps Toolbelt releasy flow) after passing lint and smoke tests in the target workspace.

