# Monorepo Architecture

## Project Structure

```
financial-dashboard/
├── packages/
│   ├── frontend/                   # React Frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── routes/
│   │   │   ├── context/
│   │   │   ├── graphql/           # Generated queries/mutations
│   │   │   ├── App.tsx
│   │   │   └── index.tsx
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.local
│   │
│   ├── server/                     # GraphQL BFF (@apollo/server)
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   └── schema.ts      # GraphQL Type Definitions
│   │   │   ├── resolvers/
│   │   │   │   └── index.ts       # Query & Mutation Resolvers
│   │   │   ├── datasources/
│   │   │   │   ├── BaseDataSource.ts
│   │   │   │   ├── UserDataSource.ts
│   │   │   │   ├── CategoryDataSource.ts
│   │   │   │   ├── TransactionDataSource.ts
│   │   │   │   └── DataSources.ts
│   │   │   └── index.ts            # Server entry point
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── common/                     # Shared Types
│       ├── src/
│       │   └── index.ts            # Types & Interfaces
│       ├── package.json
│       └── tsconfig.json
│
├── package.json                    # Root monorepo config
└── ARCHITECTURE.md                 # This file
```

## Data Flow

```
React Frontend (packages/frontend)
         ↓
Queries/Mutations (via Apollo Client)
         ↓
GraphQL BFF (packages/server)
         ↓
Resolvers (parse request)
         ↓
DataSources (call microservices)
         ↓
External Microservices/APIs
```

## Package Details

### Frontend (`packages/frontend`)
- React 19 with TypeScript
- React Router for navigation
- Apollo Client for GraphQL
- Context for auth state
- **Dependencies**: react, react-router-dom, @apollo/client, @financial-dashboard/common

### Server (`packages/server`)
- Apollo Server 4 (standalone)
- TypeScript support
- Three DataSources:
  - **UserDataSource**: Auth, user info
  - **CategoryDataSource**: Category CRUD
  - **TransactionDataSource**: Transaction CRUD, stats
- **Dependencies**: @apollo/server, @financial-dashboard/common

### Common (`packages/common`)
- Shared TypeScript interfaces
- Used by both frontend and server
- Generated types from GraphQL schema
- **Package type**: shared library

## DataSources Architecture

Each DataSource extends `BaseDataSource`:
- Handles authentication headers
- Manages API calls to microservices
- Sets context (token, userId) per request

```typescript
// Example: UserDataSource
- login(email, password) → AuthPayload
- register(...) → AuthPayload
- getUser(id) → User
- getCurrentUser() → User
- validateToken(token) → boolean
```

## Resolvers

Complete resolvers for all operations:
- **Queries**: me, user, categories, transactions, dashboardStats
- **Mutations**:
  - Auth: login, register
  - Categories: createCategory, updateCategory, deleteCategory
  - Transactions: createTransaction, updateTransaction, deleteTransaction

All mutations enforce authentication (throw if no token/userId).

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment files**
   ```bash
   cp packages/server/.env.example packages/server/.env.local
   cp packages/frontend/.env.example packages/frontend/.env.local
   ```

3. **Update service URLs**
   Edit `.env.local` files to point to your microservices.

4. **Start server** (one terminal)
   ```bash
   npm run dev --workspace=@financial-dashboard/server
   ```

5. **Start frontend** (another terminal)
   ```bash
   npm run start --workspace=@financial-dashboard/frontend
   ```

## Benefits

✅ **Complete Separation**: Frontend and Server are independent packages
✅ **Reusable Types**: Common types used by both layers
✅ **Type Safety**: Full TypeScript with schema validation
✅ **Scalable DataSources**: Easy to add new microservice integrations
✅ **Clean Architecture**: Resolvers → DataSources → Services
✅ **Monorepo**: Single repo, but deployable packages
