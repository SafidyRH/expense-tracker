# API Route Inventory

This inventory is the human-readable companion to `/openapi.json`.
The CI-enforced security inventory is generated from OpenAPI by
`src/openapi/security-inventory.ts` and tested in `src/openapi/openapi.test.ts`.

Every documented operation must declare either:

- `security: [...]` for protected operations.
- `x-public: true` for intentional public operations.

Protected resource operations may also declare `x-ownership` to identify the
BOLA/BOPLA test surface.

## Documentation

| Method | Path | Auth | Source | OpenAPI |
| --- | --- | --- | --- | --- |
| GET | `/docs` | Public | `src/app.ts` | UI for `/openapi.json` |
| GET | `/openapi.json` | Public | `src/app.ts` | Generated document |

## System

| Method | Path | Auth | Source | OpenAPI |
| --- | --- | --- | --- | --- |
| GET | `/` | Public | `src/app.ts` | Yes |
| GET | `/health` | Public | `src/app.ts` | Yes |

## Auth

| Method | Path | Auth | Source | OpenAPI |
| --- | --- | --- | --- | --- |
| GET | `/me` | Session cookie | `src/app.ts` | Yes |
| POST | `/api/auth/sign-in/email` | Public | `src/openapi/auth.openapi.ts` | Documented, delegated runtime |
| POST | `/api/auth/sign-up/email` | Public | `src/openapi/auth.openapi.ts` | Documented, delegated runtime |
| GET | `/api/auth/get-session` | Public | `src/openapi/auth.openapi.ts` | Documented, delegated runtime |
| POST | `/api/auth/sign-out` | Session cookie | `src/openapi/auth.openapi.ts` | Documented, delegated runtime |
| ALL | `/api/auth/*` | Better Auth managed | `src/app.ts` | Runtime delegation |

## Accounts

| Method | Path | Auth | Source | OpenAPI |
| --- | --- | --- | --- | --- |
| GET | `/api/accounts` | Session cookie | `src/modules/accounts/http/account.routes.ts` | Yes |
| POST | `/api/accounts` | Session cookie | `src/modules/accounts/http/account.routes.ts` | Yes |
| GET | `/api/accounts/{id}` | Session cookie | `src/modules/accounts/http/account.routes.ts` | Yes |
| PATCH | `/api/accounts/{id}` | Session cookie | `src/modules/accounts/http/account.routes.ts` | Yes |
| DELETE | `/api/accounts/{id}` | Session cookie | `src/modules/accounts/http/account.routes.ts` | Yes |

## Categories

| Method | Path | Auth | Source | OpenAPI |
| --- | --- | --- | --- | --- |
| GET | `/api/categories` | Session cookie | `src/modules/categories/http/category.routes.ts` | Yes |
| POST | `/api/categories` | Session cookie | `src/modules/categories/http/category.routes.ts` | Yes |
| PATCH | `/api/categories/{id}` | Session cookie | `src/modules/categories/http/category.routes.ts` | Yes |
| DELETE | `/api/categories/{id}` | Session cookie | `src/modules/categories/http/category.routes.ts` | Yes |

## Budgets

| Method | Path | Auth | Source | OpenAPI |
| --- | --- | --- | --- | --- |
| GET | `/api/budgets` | Session cookie | `src/modules/budgets/http/budget.routes.ts` | Yes |
| PUT | `/api/budgets/global` | Session cookie | `src/modules/budgets/http/budget.routes.ts` | Yes |
| PUT | `/api/budgets/categories/{categoryId}` | Session cookie | `src/modules/budgets/http/budget.routes.ts` | Yes |
| DELETE | `/api/budgets/categories/{categoryId}` | Session cookie | `src/modules/budgets/http/budget.routes.ts` | Yes |

## Transactions

| Method | Path | Auth | Source | OpenAPI |
| --- | --- | --- | --- | --- |
| GET | `/api/transactions` | Session cookie | `src/modules/transactions/http/transaction.routes.ts` | Yes |
| POST | `/api/transactions/expenses` | Session cookie | `src/modules/transactions/http/transaction.routes.ts` | Yes |
| POST | `/api/transactions/incomes` | Session cookie | `src/modules/transactions/http/transaction.routes.ts` | Yes |
| POST | `/api/transactions/transfers` | Session cookie | `src/modules/transactions/http/transaction.routes.ts` | Yes |
