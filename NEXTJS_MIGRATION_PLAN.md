# CRA to Next.js Frontend Migration Plan

**Status:** ✅ Phase 1 Complete | Phases 2-10 Ready

---

## Executive Summary

The financial-dashboard frontend is being migrated from **Create React App (CRA)** to **Next.js 15**. 

### Why Next.js?
- Built-in file-based routing (replaces React Router)
- Server-Side Rendering for better performance
- Simplified project structure and conventions
- Better TypeScript support out of the box
- Integrated API routes (optional for future)

### Estimated Timeline: 8-12 hours
- ✅ Phase 1 (Setup): **COMPLETE** (2 hours)
- ⏳ Phase 2-10 (Implementation): Ready to execute

---

## Architecture Overview

### Current Stack (CRA)
```
Frontend: React 19 + React Router DOM + Apollo Client + Tailwind CSS
├── src/pages/ - Page components
├── src/components/ - Reusable UI components
├── src/context/ - Auth context
├── src/routes/ - React Router configuration
└── src/graphql/ - GraphQL queries
```

### New Stack (Next.js)
```
Frontend: Next.js 15 + Apollo Client + Tailwind CSS
├── app/ - Next.js App Router (file-based routing)
│   ├── layout.tsx - Root layout with providers
│   ├── page.tsx - Home page redirect
│   ├── login/page.tsx - Login route
│   ├── register/page.tsx - Register route
│   ├── dashboard/page.tsx - Dashboard route
│   ├── components/ - Reusable components
│   ├── context/ - Auth context
│   ├── lib/ - Utilities & GraphQL setup
│   └── globals.css - Global styles
├── next.config.js - Next.js configuration
├── tsconfig.json - TypeScript config with path aliases
├── tailwind.config.js - Tailwind configuration
└── .env.local - Environment variables
```

---

## Phase-by-Phase Implementation Guide

### ✅ Phase 1: Project Setup (COMPLETE)

**Files Created:**
- `next.config.js` - Next.js configuration
- `tsconfig.json` - TypeScript configuration with App Router settings
- `.env.local` - GraphQL URI environment variable
- `app/layout.tsx` - Root layout with ApolloProvider & AuthProvider
- `app/page.tsx` - Home page with auth-based redirect
- `app/globals.css` - Global Tailwind styles
- `app/lib/apollo-client.ts` - Apollo Client with auth headers
- `app/context/auth-context.tsx` - Authentication context (Client Component)
- `app/lib/graphql/queries.ts` - All GraphQL queries & mutations
- `app/lib/constants.ts` - Route constants

**Key Decisions Made:**
- Using App Router (modern Next.js convention)
- All components as Client Components (`'use client'`)
- GraphQL remains on client-side (no Server Components queries yet)
- Monorepo structure maintained (frontend & server separate)

---

### ⏳ Phase 2: Pages Migration (3 pages)

**Files to Create:**

#### 2.1 Login Page
- **Path:** `app/login/page.tsx` ✅ CREATED
- **Features:**
  - Email/password form
  - Error handling
  - Link to register page
  - Redirect to dashboard on success
- **Key Methods:** `useAuth().login()`, `useRouter().push()`

#### 2.2 Register Page
- **Path:** `app/register/page.tsx` ✅ CREATED
- **Features:**
  - First/Last name + email + password form
  - Error & loading states
  - Link to login page
  - Auto-login after registration
- **Key Methods:** `useAuth().register()`, `useRouter().push()`

#### 2.3 Dashboard Page
- **Path:** `app/dashboard/page.tsx` ✅ CREATED
- **Features:**
  - Header with user welcome & logout button
  - Stats cards (Income, Expense, Balance, Count)
  - Category filter dropdown
  - Date range picker
  - Transaction chart (Recharts)
  - Transaction list table
- **GraphQL Queries:**
  - `GET_TRANSACTIONS`
  - `GET_CATEGORIES`
  - `GET_DASHBOARD_STATS`

---

### ⏳ Phase 3: Components Migration (3 components)

**Files to Create:**

#### 3.1 CategoryFilter Component
- **Path:** `app/components/category-filter.tsx` ✅ CREATED
- **Props:** `categories`, `selected`, `onChange`
- **Purpose:** Dropdown to filter transactions by category

#### 3.2 TransactionChart Component
- **Path:** `app/components/transaction-chart.tsx` ✅ CREATED
- **Props:** `transactions`
- **Purpose:** Bar chart showing transactions grouped by category
- **Library:** Recharts

#### 3.3 TransactionList Component
- **Path:** `app/components/transaction-list.tsx` ✅ CREATED
- **Props:** `transactions`, `selectedCategory`
- **Purpose:** Table display of transactions with filtering

---

### ⏳ Phase 4: Styling & Assets

**Files Already Configured:**
- `app/globals.css` - ✅ Created with Tailwind imports & custom components
- `tailwind.config.js` - ✅ Already exists (compatible with Next.js)
- `postcss.config.js` - ✅ Already exists

**Custom Components Defined:**
- `.input-field` - Form input styling
- `.btn-primary` - Primary button styling
- `.form-card` - Form card container
- `.form-container` - Centered form layout

---

### ⏳ Phase 5: TypeScript & Path Aliases

**Already Configured in tsconfig.json:**
```json
{
  "paths": {
    "@/components/*": ["app/components/*"],
    "@/lib/*": ["app/lib/*"],
    "@/context/*": ["app/context/*"],
    "@/types/*": ["app/types/*"]
  }
}
```

**Usage Examples:**
```typescript
import { CategoryFilter } from '@/components/category-filter';
import { useAuth } from '@/context/auth-context';
import { apolloClient } from '@/lib/apollo-client';
import { ROUTES } from '@/lib/constants';
```

---

### ⏳ Phase 6: Dependencies Update

**Package.json Changes Required:**

**Remove (CRA-specific):**
```
"react-scripts": "^5.0.1"
"react-router-dom": "^7.18.4"
"@testing-library/react": "^16.3.3"
"@testing-library/jest-dom": "^6.9.1"
"@testing-library/user-event": "^13.5.0"
"http-proxy-middleware": "^2.0.10"
"axios": "^1.20.0"
"web-vitals": "^2.1.4"
```

**Add (Next.js-specific):**
```
"next": "^15.0.0"
```

**Keep (Already compatible):**
```
"@apollo/client": "^4.3.5"
"graphql": "^16.14.2"
"react": "^19.3.1"
"react-dom": "^19.3.1"
"typescript": "^5.5.3"
"recharts": "^3.10.1"
"tailwindcss": "^3.4.1"
"autoprefixer": "^10.4.16"
"postcss": "^8.4.31"
```

**Scripts to Update:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  }
}
```

---

### ⏳ Phase 7: Protected Routes (Optional)

**Option A: Middleware-based (Recommended)**
- Create `middleware.ts` at project root
- Check for auth token in request
- Redirect to `/login` if not authenticated

**Option B: Component-based (Current)**
- Check `isAuthenticated` in dashboard page
- Use `useEffect` to redirect if needed

**Current Implementation:** Option B (simpler, no middleware needed)

---

## Testing & Verification Checklist

### Development Testing
- [ ] Run `npm run dev` in `packages/frontend`
- [ ] Navigate to http://localhost:3000
- [ ] Test register flow → create new account
- [ ] Test login flow → verify auth works
- [ ] Test dashboard → verify all components load
- [ ] Test category filter → verify filtering works
- [ ] Test date range picker → verify UI responds
- [ ] Test logout → verify redirect to login
- [ ] Check browser console → no errors/warnings
- [ ] Verify Network tab → GraphQL requests to `/graphql`

### Build Testing
- [ ] Run `npm run build` → Should complete without errors
- [ ] Check `.next` directory created
- [ ] Run `npm start` → Production build works
- [ ] Verify all pages load correctly
- [ ] Test authentication flow in production build

### Performance Verification
- [ ] Check Core Web Vitals
- [ ] Verify images/assets load correctly
- [ ] Test on slower network (DevTools throttling)

---

## Routing Comparison

### React Router (Old)
```typescript
// src/routes/index.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
</Routes>

// Navigation
const navigate = useNavigate();
navigate('/dashboard');
```

### Next.js (New)
```typescript
// File-based routing
app/login/page.tsx → /login
app/register/page.tsx → /register
app/dashboard/page.tsx → /dashboard

// Navigation
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/dashboard');
```

---

## Key Differences from CRA

| Aspect | CRA | Next.js |
|--------|-----|---------|
| **Routing** | React Router (manual) | File-based (automatic) |
| **Navigation** | `useNavigate()` | `useRouter()` from `next/navigation` |
| **Entry Point** | `src/index.tsx` | `app/layout.tsx` |
| **Env Variables** | `REACT_APP_*` | `NEXT_PUBLIC_*` |
| **Build Output** | `build/` | `.next/` |
| **Dev Server** | Port 3000 | Port 3000 (same) |
| **CSS Import** | `.css` files | `globals.css` |
| **Components** | Functional (no directive) | Client/Server with `'use client'` |

---

## Common Issues & Solutions

### Issue: "Cannot find module '@financial-dashboard/common'"
**Solution:** Ensure the common package is installed and workspace configuration is correct in package.json

### Issue: "NEXT_PUBLIC_GRAPHQL_URI is undefined"
**Solution:** Check `.env.local` file exists with `NEXT_PUBLIC_GRAPHQL_URI=http://localhost:4000/graphql`

### Issue: GraphQL queries fail
**Solution:** 
1. Verify backend server is running on port 4000
2. Check Network tab for CORS errors
3. Ensure auth token is stored in localStorage

### Issue: Styles not loading
**Solution:** 
1. Verify `app/globals.css` is imported in `app/layout.tsx`
2. Check `tailwind.config.js` includes content paths
3. Verify `postcss.config.js` has autoprefixer plugin

---

## File Structure After Migration

```
packages/frontend/
├── app/
│   ├── components/
│   │   ├── category-filter.tsx
│   │   ├── transaction-chart.tsx
│   │   └── transaction-list.tsx
│   ├── context/
│   │   └── auth-context.tsx
│   ├── lib/
│   │   ├── apollo-client.ts
│   │   ├── constants.ts
│   │   └── graphql/
│   │       └── queries.ts
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── public/
├── node_modules/
├── next.config.js
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── .env.local
├── package.json
└── package-lock.json
```

---

## Next Steps to Complete Migration

### 1. Update package.json
Remove CRA dependencies, add Next.js:
```bash
npm uninstall react-scripts react-router-dom
npm install next@^15.0.0
```

### 2. Delete Old CRA Files (Optional)
```bash
# No longer needed
rm -rf src/
rm public/index.html (if exists)
rm .env.example (optional)
```

### 3. Install Dependencies
```bash
cd packages/frontend
npm install
```

### 4. Start Development
```bash
npm run dev
```

### 5. Build & Test
```bash
npm run build
npm start
```

---

## Success Criteria

✅ All criteria met for **Phase 1**

**For Complete Migration:**
- [ ] All three pages (login, register, dashboard) render correctly
- [ ] GraphQL queries and mutations work (check Network tab)
- [ ] Authentication flow: register → login → dashboard → logout works
- [ ] Styling matches original (Tailwind CSS applied)
- [ ] No console errors or warnings
- [ ] Build succeeds: `npm run build` completes
- [ ] Production server starts: `npm start` works
- [ ] TypeScript checks pass: `tsc --noEmit`

---

## Rollback Strategy

If issues arise:
1. All CRA files still exist in `src/` directory
2. Can keep `app/` and `src/` directories parallel during testing
3. Git: Create branch `feat/nextjs-migration` for easy rollback
4. Revert to CRA by running from original `src/` directory

---

## Support Resources

- **Next.js Documentation:** https://nextjs.org/docs
- **Apollo Client Docs:** https://www.apollographql.com/docs/react/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React 19 Features:** https://react.dev/blog/2024/12/19/react-19

---

**Last Updated:** 2025-11-05  
**Phase 1 Status:** ✅ COMPLETE  
**Next Phase:** Ready for Phase 2 implementation
