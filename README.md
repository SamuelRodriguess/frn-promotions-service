# FRN Promotions Service

Custom VTEX IO service that centralizes the retrieval of rates & benefits promotions and exposes a curated payload for the storefront. The middleware chain validates inbound requests, calls VTEX's Rates & Benefits API, enriches the response with detailed promotion data, and returns only the fields required by the front end.

## Highlights

- **Single endpoint**: `GET /_v/custom-promotions` with optional `id` query parameter to fetch one promotion or the full list.
- **Domain validation**: Rejects malformed `idCalculatorConfiguration` values up-front to avoid unnecessary calls.
- **Data normalization**: Uses `formattedPromotion` to expose a predictable payload (id, name, begin/end dates, conditions, SKUs, collections, categories).
- **Error sanitation**: `handleVtexError` translates upstream failures into safe HTTP responses without leaking internal details.
- **Caching ready**: Service leverages VTEX `LRUCache` for the Rates & Benefits client, reducing load on VTEX APIs.

## Architecture Overview

```
Request ──> validadePromotionId ──> getPromotionWithId ──> getAllPromotions ──> Response
                 │                        │                    │
                 └─────(sets ctx.state.id)└── fetch by ID      └── fetch + map all
```

- `validadePromotionId`: validates `id` (if provided) using `validator.isUUID` and stores it on `ctx.state`.
- `getPromotionWithId`: short-circuits the chain when `id` is present, calling `RatesAndBenefits.getPromotionById` and formatting the result.
- `getAllPromotions`: when no `id` is passed, pulls every promotion through `RatesAndBenefits.getAllBenefits`, filters valid IDs, hydrates details in parallel (`Promise.all`), and formats each entry.

Supporting utilities live in `node/utils/`:

- `filteredPromotionIds`: collects non-empty `idCalculatorConfiguration` values.
- `formattedPromotion`: maps a `CalculatorConfiguration` to the trimmed response schema.
- `handleVtexError`: standardizes error responses (status + message).

## HTTP API

### `GET /_v/custom-promotions`

| Query Param | Type   | Description                                                 |
|-------------|--------|-------------------------------------------------------------|
| `id`        | string | Optional VTEX promotion UUID (`idCalculatorConfiguration`). |

#### Responses

- **200 OK (single promotion)**

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

- **200 OK (list)**

```json
[
  {
    "id": "...",
    "name": "...",
    "beginDate": "...",
    "endDate": "...",
    "conditions": [],
    "skus": [],
    "collections": [],
    "categories": []
  }
]
```

- **4xx / 5xx**

```json
{
  "message": "Invalid idCalculatorConfiguration format",
  "status": 400
}
```

> **Note:** The Rates & Benefits API requires administrative credentials. Invoke this endpoint with a valid VTEX admin session (or appKey/appToken) to avoid `403` responses from upstream.

## Local Development

### Prerequisites

- VTEX Toolbelt ≥ 3.x (`npm i -g vtex`)
- Node.js 16 or 18 LTS (aligned with VTEX IO runtime)
- Yarn 1.x (ships with the repo via `yarn.lock`)

### Install & Link

```bash
cd node
yarn install
cd ..
vtex login <account>
vtex use <workspace>
vtex link
```

The default route is exposed at `https://{workspace}--{account}.myvtex.com/_v/custom-promotions`.

### Quality Tooling

```bash
yarn lint        # eslint (TypeScript aware)
```

Use `lint.sh` (wired to `prereleasy`) before releasing to ensure CI parity.

## Project Layout

```
frn-promotions-service/
├── manifest.json               # App metadata, policies, builders
├── node/
│   ├── index.ts                # Service entrypoint (clients + routes)
│   ├── service.json            # Route exposure and scaling hints
│   ├── clients/                # VTEX IO clients bag (RatesAndBenefits)
│   ├── middlewares/
│   │   └── promotions/         # Validation + fetching logic
│   ├── utils/                  # Formatting, filtering, error handling
│   └── typings/                # Shared TypeScript definitions
├── docs/                       # Optional project documentation
└── README.md                   # You're here
```

## Error Handling & Observability

- Errors hit during client calls bubble to `handleVtexError`, which sets `ctx.status` and a minimal `{ message, status }` payload.
- VTEX Colossus logging is available by injecting `ctx.vtex.logger` (kept commented in middleware for quick enablement).
- HTTP caching is handled via VTEX's `LRUCache`; tweak `TIMEOUT_MS`, retry count, and `memoryCache` in `node/index.ts` as needed.

## Deployment Notes

- The app inherits policies defined in `manifest.json` (outbound access to `{{account}}.vtexcommercestable.com.br` and logging). Update them if you call additional hosts.
- `prereleasy` runs `bash lint.sh`. Keep the script aligned with the checks you expect in CI.
- Publish via `vtex release` (wraps Toolbelt releasy flow) after passing lint and smoke tests in the target workspace.

