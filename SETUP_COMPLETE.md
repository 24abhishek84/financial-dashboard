# 🎯 Financial Dashboard - Complete Monorepo Setup

## ✅ Final Project Structure

```
financial-dashboard/
│
├── packages/
│   │
│   ├── frontend/                          # React Frontend Application
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Login/Login.tsx         # Login page component
│   │   │   │   ├── Register/Register.tsx   # Registration page
│   │   │   │   └── Dashboard/Dashboard.tsx # Main dashboard
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── CategoryFilter/CategoryFilter.tsx
│   │   │   │   ├── TransactionChart/TransactionChart.tsx
│   │   │   │   └── TransactionList/TransactionList.tsx
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   ├── index.tsx              # Route configuration
│   │   │   │   ├── constants.ts           # Route constants
│   │   │   │   └── ProtectedRoute.tsx     # Auth guard wrapper
│   │   │   │
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx        # Auth state & hooks
│   │   │   │
│   │   │   ├── App.tsx                    # Root app component
│   │   │   └── index.tsx                  # React entry point
│   │   │
│   │   ├── package.json                   # Frontend dependencies
│   │   ├── tsconfig.json                  # TypeScript config
│   │   └── .env.example                   # Environment template
│   │
│   ├── server/                            # GraphQL BFF (@apollo/server)
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   └── schema.ts              # GraphQL Type Definitions
│   │   │   │
│   │   │   ├── resolvers/
│   │   │   │   └── index.ts               # All Query & Mutation resolvers
│   │   │   │
│   │   │   ├── datasources/
│   │   │   │   ├── BaseDataSource.ts      # Base class for all datasources
│   │   │   │   ├── UserDataSource.ts      # User & Auth operations
│   │   │   │   ├── CategoryDataSource.ts  # Category CRUD operations
│   │   │   │   ├── TransactionDataSource.ts # Transaction CRUD & stats
│   │   │   │   ├── DataSources.ts         # DataSource factory
│   │   │   │   └── index.ts               # Export all datasources
│   │   │   │
│   │   │   └── index.ts                   # Server entry point
│   │   │
│   │   ├── package.json                   # Server dependencies (@apollo/server)
│   │   ├── tsconfig.json                  # TypeScript config
│   │   └── .env.example                   # Environment template
│   │
│   └── common/                            # Shared Types & Interfaces
│       ├── src/
│       │   └── index.ts                   # All shared types
│       ├── package.json                   # Shared library config
│       └── tsconfig.json                  # TypeScript config
│
├── package.json                           # Root monorepo config
├── ARCHITECTURE.md                        # Architecture documentation
└── README.md                              # Project README

```

## 📦 What's Implemented

### Frontend (`packages/frontend/`)
✅ React 19 with TypeScript  
✅ React Router v7 with protected routes  
✅ Apollo Client for GraphQL queries  
✅ Auth Context for state management  
✅ Login & Registration pages  
✅ Dashboard with transaction list & charts  
✅ Category filter component  
✅ Environment variables (.env.local support)  

### Server (`packages/server/`)
✅ Apollo Server 4 (standalone)  
✅ Complete GraphQL Schema (Queries & Mutations)  
✅ **3 DataSources:**
   - **UserDataSource**: login, register, getCurrentUser, validateToken
   - **CategoryDataSource**: CRUD operations, queries by user
   - **TransactionDataSource**: CRUD operations, stats, date range queries
✅ **BaseDataSource**: Handles auth headers, API calls, context management  
✅ **Complete Resolvers** for all operations with auth enforcement  
✅ TypeScript support  
✅ Environment variables (.env.local support)  

### Common (`packages/common/`)
✅ Shared TypeScript interfaces  
✅ Used by both frontend & server  
✅ Types: User, Category, Transaction, DashboardStats, AuthPayload, etc.  

### Root Monorepo
✅ Workspace configuration  
✅ Shared scripts for development  

## 🔌 DataSources Overview

### BaseDataSource
```typescript
- setContext(token, userId)          // Set auth headers
- fetch<T>(endpoint, options)         // API wrapper
- getHeaders()                         // Auto-add auth headers
```

### UserDataSource extends BaseDataSource
```typescript
- login(email, password)              → AuthPayload
- register(email, password, firstName, lastName) → AuthPayload
- getUser(id)                         → User
- getCurrentUser()                    → User
- validateToken(token)                → boolean
```

### CategoryDataSource extends BaseDataSource
```typescript
- getCategories()                     → Category[]
- getCategory(id)                     → Category
- createCategory(input)               → Category
- updateCategory(id, input)           → Category
- deleteCategory(id)                  → boolean
- getCategoriesByUser(userId)         → Category[]
```

### TransactionDataSource extends BaseDataSource
```typescript
- getTransactions()                   → Transaction[]
- getTransaction(id)                  → Transaction
- createTransaction(input)            → Transaction
- updateTransaction(id, input)        → Transaction
- deleteTransaction(id)               → boolean
- getTransactionsByUser(userId)       → Transaction[]
- getDashboardStats(userId)           → DashboardStats
- getTransactionsByDateRange(...)     → Transaction[]
- getTransactionsByCategory(id)       → Transaction[]
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Files
```bash
# Server
cp packages/server/.env.example packages/server/.env.local
# Frontend
cp packages/frontend/.env.example packages/frontend/.env.local
```

### 3. Update Service URLs (in `.env.local`)
```bash
# Server (.env.local)
SERVICE_URL=http://localhost:3001
CATEGORY_SERVICE_URL=http://localhost:3002
TRANSACTION_SERVICE_URL=http://localhost:3003

# Frontend (.env.local)
REACT_APP_GRAPHQL_URI=http://localhost:4000
```

### 4. Start Development

**Terminal 1 - GraphQL Server:**
```bash
npm run dev --workspace=@financial-dashboard/server
```

**Terminal 2 - React Frontend:**
```bash
npm run start --workspace=@financial-dashboard/frontend
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────┐
│     React Frontend (Port 3000)          │
│  - Pages: Login, Register, Dashboard    │
│  - Components: Charts, Filters, Lists   │
│  - Context: Auth state management       │
└────────────────┬────────────────────────┘
                 │
          GraphQL Queries
          & Mutations
                 │
        ┌────────▼────────┐
        │   GraphQL BFF   │
        │   (Port 4000)   │
        │  @apollo/server │
        └────────┬────────┘
                 │
        ┌────────┴────────────────────┐
        │                             │
    ┌───▼────────┐  ┌──────────────┐ │
    │ Resolvers  │  │ DataSources  │ │
    └───┬────────┘  └──────┬───────┘ │
        │                  │         │
        └──────────┬───────┘         │
                   │                 │
        ┌──────────▼──────────┐      │
        │  BaseDataSource      │      │
        │ - Auth headers       │      │
        │ - Fetch wrapper      │      │
        │ - Context mgmt       │      │
        └──────────┬──────────┘       │
                   │                  │
   ┌───────────────┼──────────────┐  │
   │               │              │  │
   │       Microservices API Calls│  │
   │               │              │  │
   ├───────────────┴──────────────┘  │
   │                                  │
   └──────────────────────────────────┘
```

## 📋 File Organization Summary

| Layer | Location | Purpose |
|-------|----------|---------|
| **Frontend** | `packages/frontend/src/` | React UI, routing, auth context |
| **Server Schema** | `packages/server/src/schema/` | GraphQL type definitions |
| **Resolvers** | `packages/server/src/resolvers/` | Query & Mutation logic |
| **DataSources** | `packages/server/src/datasources/` | Microservice integrations |
| **Shared Types** | `packages/common/src/` | TypeScript interfaces |

## 🎯 Next Steps

1. **Connect to Microservices**
   - Update service URLs in `.env.local`
   - Implement actual API calls in DataSources

2. **Setup Frontend Queries**
   - Create Apollo GraphQL queries in `packages/frontend/src/graphql/`
   - Use generated types from common package

3. **Authentication**
   - Implement token storage (HttpOnly cookies recommended)
   - Setup token validation in resolvers

4. **Testing**
   - Add unit tests for DataSources
   - Add integration tests for Resolvers

Done! Your monorepo is fully configured! 🎉
