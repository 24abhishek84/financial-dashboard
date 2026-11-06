# Next.js Staff Interview Guide

## 6 Core Interview Questions with Code Examples

---

## Interview Question 1: "How do you handle data fetching in Next.js? What are the differences between getServerSideProps, getStaticProps, and client-side fetching?"

### The Problem
Choosing the wrong data fetching method leads to poor performance, SEO issues, or unnecessarily stale data.

### ❌ WRONG - Client-Side Fetching for Static Content

```typescript
// pages/products.tsx
import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // WRONG: Data fetched on client-side
    // - Page is blank until data loads (poor UX)
    // - Search engines see empty page (bad SEO)  
    // - Refetches on every page navigation (wasteful)
    // - No static caching possible
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

**Issues:**
- Page loads blank, users see loading spinner
- Google can't see product content (kills SEO)
- Every page visit fetches from API
- No caching, database gets hammered

### ✅ CORRECT - Use getServerSideProps for Dynamic Data

```typescript
// pages/products.tsx
interface ProductsPageProps {
  products: Product[];
}

// ✅ Server-side rendering with error handling
export async function getServerSideProps() {
  try {
    const response = await fetch(`${process.env.API_URL}/products`, {
      timeout: 5000 // Prevent hanging
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      }
      // Fallback on error
      return {
        props: { products: [] },
        revalidate: 10
      };
    }

    const products = await response.json();

    return {
      props: { products },
      revalidate: 60 // Revalidate every 60 seconds (ISR)
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return {
      notFound: true,
      revalidate: 10 // Retry soon if error
    };
  }
}

export default function ProductsPage({ products }: ProductsPageProps) {
  // ✅ Data already available when page renders
  // ✅ Search engines see full content (SEO friendly)
  // ✅ No loading spinner (faster perceived load)
  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

**Benefits:**
- Page loads with full content instantly
- SEO optimized for search engines
- Data fetched server-side before rendering
- Can add error handling and timeouts

### ✅ CORRECT - Use getStaticProps with ISR for Best Performance

```typescript
// pages/blog/[slug].tsx
interface BlogPostProps {
  post: BlogPost;
  lastBuilt?: string;
}

export async function getStaticProps(context) {
  const { slug } = context.params;

  try {
    const post = await fetchBlogPost(slug);

    return {
      props: {
        post,
        lastBuilt: new Date().toISOString()
      },
      // ISR: Regenerate every hour
      // Serves cached version to all users
      // Next visitor after 1hr triggers rebuild
      revalidate: 3600
    };
  } catch (error) {
    console.error(`Failed to fetch blog post ${slug}:`, error);
    return {
      notFound: true,
      revalidate: 60 // Retry soon
    };
  }
}

export async function getStaticPaths() {
  // Pre-generate top 100 most popular posts
  const posts = await fetchAllBlogPosts();
  
  return {
    // Generate these paths at build time
    paths: posts.slice(0, 100).map(post => ({
      params: { slug: post.slug }
    })),
    // Generate other paths on first request
    fallback: 'blocking'
  };
}

export default function BlogPost({ post, lastBuilt }: BlogPostProps) {
  return (
    <article>
      <h1>{post.title}</h1>
      <time>{new Date(lastBuilt!).toLocaleDateString()}</time>
      <p>{post.content}</p>
    </article>
  );
}
```

**Benefits:**
- Instant page loads (static cached pages)
- Automatic updates (ISR revalidation)
- Minimal API calls (cached between revalidations)
- Scales to millions of pages

### Data Fetching Comparison

```
┌──────────────────────┬─────────────┬──────────┬───────────┬──────────┐
│ Method               │ Build Time  │ Runtime  │ Freshness │ Scalable │
├──────────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ Client-side fetch    │ Fast        │ Very slow│ Always    │ No       │
│                      │             │ (blank)  │ fresh     │          │
├──────────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ getServerSideProps   │ Fast        │ Slow     │ Always    │ Yes      │
│                      │             │ (per req)│ fresh     │ (simple) │
├──────────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ getStaticProps       │ Very slow   │ Instant  │ Stale     │ No (all) │
│ (no ISR)             │ (all pages) │ (cached) │ until     │          │
│                      │             │          │ rebuild   │          │
├──────────────────────┼─────────────┼──────────┼───────────┼──────────┤
│ getStaticProps +     │ Fast        │ Instant  │ Fresh on  │ Yes      │
│ ISR revalidate       │ (critical)  │ (cached) │ schedule  │ (yes!)   │
└──────────────────────┴─────────────┴──────────┴───────────┴──────────┘

When to use:
- High-traffic, infrequent updates → ISR (best choice!)
- Always-fresh data needed → getServerSideProps
- Truly static content → getStaticProps (no revalidate)
- Real-time data → Client-side + SWR/React Query
```

### Interview Answer Template

**Q: "Explain the different data fetching methods in Next.js"**

**A:** "Next.js offers three approaches:

1. **Client-side fetching** - Data fetches in browser after load. Good for real-time data that's not critical to initial render. Bad for SEO.

2. **getServerSideProps** - Runs on server for each request. Best for dynamic data that always needs to be fresh. Page is pre-rendered with data.

3. **getStaticProps with ISR** - Generates static HTML at build time, revalidates on schedule. Best performance for high-traffic pages. Uses Incremental Static Regeneration to update without full rebuild.

For most sites, ISR is ideal because it gives you the speed of static sites with the flexibility of dynamic content."

---

## Interview Question 2: "How do you optimize images in Next.js? Why is this important?"

### The Problem
Plain `<img>` tags cause performance issues: no lazy loading, no format optimization, causes layout shift.

### ❌ WRONG - Using Regular HTML Images

```typescript
export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="product-card">
      {/* WRONG: Multiple performance issues */}
      <img 
        src={product.imageUrl}
        alt={product.name}
        width="300"
        height="300"
      />
      
      {/* Issues:
        1. No lazy loading - loads even if user scrolls past
        2. No responsive images - same size for desktop and mobile
        3. No format optimization - serves JPEG when WebP supported
        4. Causes Cumulative Layout Shift - page jumps when image loads
        5. Unbounded file size - could be 5MB on mobile 3G
      */}
      
      <h2>{product.name}</h2>
      <p>${product.price}</p>
    </div>
  );
}
```

**Problems:**
- Page jumps when images load (bad Core Web Vitals)
- Google ranks sites lower due to layout shift
- Mobile users download huge images
- Images load even if not visible

### ✅ CORRECT - Using Next.js Image Component

```typescript
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="product-card">
      {/* ✅ Next.js Image with automatic optimization */}
      <Image
        // Core required props
        src={product.imageUrl}
        alt={product.name}
        width={300}
        height={300}
        
        // ✅ Lazy loading: Only load when user scrolls near
        loading="lazy"
        
        // ✅ Responsive: Different image sizes for different devices
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        
        // ✅ Format optimization: Automatic (WebP for modern, JPEG fallback)
        // Handled automatically - no config needed
        
        // ✅ Blur placeholder: Shows blur while loading
        placeholder="blur"
        blurDataURL={product.blurUrl} // Base64 small image
        
        // ✅ Prevents layout shift by reserving space
        style={{
          aspectRatio: '1 / 1',
          objectFit: 'cover'
        }}
        
        // ✅ Quality optimization
        quality={75} // 0-100, lower = smaller file
      />
      
      <h2>{product.name}</h2>
      <p>${product.price}</p>
    </div>
  );
}
```

**Benefits:**
- Lazy loads (only when visible)
- Responsive sizing
- Format optimization
- No layout shift
- Smaller file sizes

### ✅ CORRECT - Configure Image Domains

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Whitelist allowed image domains
    domains: ['cdn.example.com', 'images.example.com'],
    
    // ✅ Image sizes for responsive srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // ✅ Cache strategy
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for static
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'"
  }
};

module.exports = nextConfig;
```

### Interview Answer Template

**Q: "Why should you use Next.js Image component instead of plain <img>?"**

**A:** "The Image component provides automatic optimization:

1. **Lazy loading** - Images only load when scrolled into view
2. **Responsive sizing** - Different images for mobile/desktop  
3. **Format optimization** - Serves modern formats (WebP) with JPEG fallback
4. **Prevents layout shift** - Reserves space so page doesn't jump
5. **Smaller files** - Quality optimization, srcset generation

This improves Core Web Vitals scores, which directly affects Google rankings. Without optimization, slow image loading reduces SEO and user engagement."

---

## Interview Question 3: "How do you avoid bundling large components to keep your JavaScript small?"

### The Problem
Large third-party components imported statically bloat initial JavaScript bundle, slowing page load.

### ❌ WRONG - All Components Imported Statically

```typescript
// pages/dashboard.tsx
import HeavyAnalyticsChart from '@/components/HeavyAnalyticsChart'; // 500KB
import ComplexDataTable from '@/components/ComplexDataTable'; // 300KB
import AdvancedMapComponent from '@/components/AdvancedMapComponent'; // 800KB
import RichTextEditor from '@/components/RichTextEditor'; // 400KB

// WRONG: All code bundled with page
// Initial JS: 2MB!
// Page becomes interactive slowly
// User waits for all components to download

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyAnalyticsChart />
      <ComplexDataTable />
      <AdvancedMapComponent />
      <RichTextEditor />
    </div>
  );
}
```

**Problems:**
- Large initial JavaScript bundle (slow first paint)
- All code downloaded before page interactive
- Wastes bandwidth if user doesn't scroll to component

### ✅ CORRECT - Dynamic Imports with Suspense

```typescript
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ✅ Dynamic import: Code only loads when component mounts
// ✅ Split into separate chunks
const HeavyAnalyticsChart = dynamic(
  () => import('@/components/HeavyAnalyticsChart'),
  {
    loading: () => <div className="skeleton">Loading chart...</div>,
    ssr: false // Don't render on server (uses browser APIs)
  }
);

const ComplexDataTable = dynamic(
  () => import('@/components/ComplexDataTable'),
  {
    loading: () => <div className="skeleton">Loading table...</div>,
    ssr: true // Can render on server
  }
);

const AdvancedMapComponent = dynamic(
  () => import('@/components/AdvancedMapComponent'),
  {
    loading: () => <div className="skeleton">Loading map...</div>,
    ssr: false // Maps usually need browser APIs like window.mapboxgl
  }
);

const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor'),
  {
    loading: () => <div className="skeleton">Loading editor...</div>,
    ssr: false
  }
);

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* ✅ Each component loads independently on-demand */}
      <Suspense fallback={<div className="skeleton">Loading chart...</div>}>
        <HeavyAnalyticsChart />
      </Suspense>
      
      <Suspense fallback={<div className="skeleton">Loading table...</div>}>
        <ComplexDataTable />
      </Suspense>
      
      {/* Component below fold only loads if user scrolls */}
      <Suspense fallback={<div className="skeleton">Loading map...</div>}>
        <AdvancedMapComponent />
      </Suspense>
      
      <Suspense fallback={<div className="skeleton">Loading editor...</div>}>
        <RichTextEditor />
      </Suspense>
    </div>
  );
}
```

**Benefits:**
- Small initial bundle
- Page becomes interactive faster
- Components load in background as needed
- Better perceived performance

### Interview Answer Template

**Q: "How would you optimize a page with several large components?"**

**A:** "Use Next.js `dynamic()` for code splitting:

1. Import components dynamically instead of statically
2. Each component gets its own chunk, downloaded only when used
3. Provide loading UI (skeleton screens) while downloading
4. Set `ssr: false` for components that need browser APIs

This keeps initial JavaScript small. Page becomes interactive faster, and users only download what they actually see. For maps or charts below the fold, code might never download if user doesn't scroll."

---

## Interview Question 4: "How do you manage secrets and configuration in Next.js?"

### The Problem
Hardcoding secrets in code gets them into version control, exposing them forever.

### ❌ WRONG - Hardcoded Secrets and Config

```typescript
// pages/api/payment.ts
export default async function handler(req, res) {
  // WRONG: Secrets in code
  const STRIPE_SECRET = 'sk_live_abc123xyz789'; // In git history!
  const DATABASE_URL = 'postgresql://user:password@prod.example.com/db'; // Exposed!
  const API_KEY = 'super_secret_key_123'; // Everyone can see this

  // WRONG: Even client-side secrets
}

// lib/stripe.ts
// WRONG: API key visible in client code
const stripeKey = 'pk_live_abc123';
```

**Problems:**
- Secrets in git history (can never be removed)
- Same secret in dev/staging/production
- Everyone with repo access sees production credentials
- Can't safely share code

### ✅ CORRECT - Environment Variables with Next.js

```
FILE: .env.local (Git ignored - local development)
──────────────────────────────────────────────────
# Public variables (available in browser)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_KEY=pk_test_abc123

# Secret variables (server-only)
STRIPE_SECRET_KEY=sk_test_xyz789
DATABASE_URL=postgresql://localhost/mydb
JWT_SECRET=super_secret_local_key

FILE: .env.production (Git safe - NO secrets!)
──────────────────────────────────────────────────
# Public variables (available in browser)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_abc123

# Secret variables (managed by deployment platform)
STRIPE_SECRET_KEY=[Managed by Vercel/AWS/etc]
DATABASE_URL=[Managed by deployment platform]
JWT_SECRET=[Managed by deployment platform]

FILE: .gitignore
──────────────────────────────────────────────────
.env.local
.env.*.local
.env
```

### ✅ CORRECT - Use Environment Variables

```typescript
// pages/api/payment.ts
export default async function handler(req, res) {
  // ✅ Environment variables injected at build time
  // ✅ Secret variables NEVER exposed to client
  
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: req.body.items,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_API_URL}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_API_URL}/cancel`
  });

  res.status(200).json({ sessionId: session.id });
}

// lib/stripe-client.ts
import Stripe from '@stripe/stripe-js';

// ✅ Only NEXT_PUBLIC_ variables available in client code
export async function loadStripe() {
  if (!process.env.NEXT_PUBLIC_STRIPE_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_KEY not configured');
  }
  return Stripe.loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
}

// utils/validation.ts
export function validateEnvVariables() {
  const required = [
    'NEXT_PUBLIC_API_URL',
    'STRIPE_SECRET_KEY',
    'DATABASE_URL',
    'JWT_SECRET'
  ];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env variable: ${key}`);
    }
  }
}

// pages/index.tsx
import { validateEnvVariables } from '@/utils/validation';

export async function getStaticProps() {
  // ✅ Validate config at build time
  validateEnvVariables();

  return {
    props: {},
    revalidate: 60
  };
}
```

### Interview Answer Template

**Q: "How do you handle secrets in Next.js applications?"**

**A:** "Use environment variables with clear rules:

1. **NEXT_PUBLIC_*** prefix = visible in browser (API URLs, public keys)
2. **No prefix** = server-only (database passwords, secret keys)
3. **.env.local** for local development (git-ignored)
4. **.env.production** for production (in git, no actual secrets)
5. **Deployment platform** manages actual production secrets (Vercel, AWS, etc)

This ensures secrets never commit to git and configuration is environment-specific. Plus, you can't accidentally expose secrets in client-side code."

---

## Interview Question 5: "How do you handle errors in Next.js? What's your error handling strategy?"

### The Problem
Missing error handling causes white screens and hard-to-debug issues.

### ❌ WRONG - No Error Handling

```typescript
// pages/index.tsx
export async function getServerSideProps() {
  // WRONG: No error handling
  const response = await fetch('https://api.example.com/config');
  const config = await response.json();

  return { props: { config } };
  // If API is down, entire page crashes with 500 error
}

// pages/products/[id].tsx
export default function ProductPage({ product }) {
  return (
    <div>
      {/* WRONG: No null checks */}
      <h1>{product.name}</h1>
      {/* If product is undefined, crashes here */}
      <img src={product.images[0].url} />
      {/* If images is undefined, TypeError */}
    </div>
  );
}
```

### ✅ CORRECT - Comprehensive Error Handling

```typescript
// pages/_error.tsx - Global error page
import type { NextPageContext } from 'next';

interface ErrorPageProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorPageProps) {
  return (
    <div style={{ textAlign: 'center', padding: '50px 0' }}>
      <h1>
        {statusCode
          ? `Error ${statusCode}`
          : 'An error occurred'}
      </h1>
      <p>We encountered an unexpected error. Please try again.</p>
      <a href="/">Go back to home</a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

// pages/_app.tsx - Error boundary
import { ErrorBoundary } from 'react-error-boundary';
import type { AppProps } from 'next/app';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" style={{ padding: '20px', color: 'red' }}>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;

// pages/products/[id].tsx - Server-side error handling
interface ProductPageProps {
  product?: Product;
  error?: string;
}

export async function getServerSideProps(context) {
  try {
    const response = await fetch(
      `https://api.example.com/products/${context.params.id}`,
      { signal: AbortSignal.timeout(5000) } // Timeout
    );

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 404) {
        return { notFound: true };
      }
      
      if (response.status >= 500) {
        return {
          props: { error: 'Server error. Please try again later.' },
          revalidate: 60
        };
      }
    }

    const product = await response.json();

    return {
      props: { product },
      revalidate: 60
    };
  } catch (error) {
    console.error('Failed to fetch product:', error);

    return {
      props: { error: 'Failed to load product' },
      revalidate: 10 // Try again soon
    };
  }
}

export default function ProductPage(props: ProductPageProps) {
  // ✅ Handle error state
  if (props.error) {
    return <div className="error">{props.error}</div>;
  }

  // ✅ Handle missing product
  if (!props.product) {
    return <div>Product not found</div>;
  }

  const { product } = props;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      
      {/* ✅ Safe property access with fallback */}
      {product.images?.[0]?.url && (
        <img src={product.images[0].url} alt={product.name} />
      )}
      
      <p>${product.price ?? 'Contact for price'}</p>
    </div>
  );
}

// pages/api/checkout.ts - API error handling
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate input
    if (!req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).json({ error: 'Invalid items' });
    }

    if (req.body.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Authenticate
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Process payment
    const session = await stripe.checkout.sessions.create({
      line_items: req.body.items,
      mode: 'payment'
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    // Log error for debugging
    console.error('Checkout error:', error);

    // Return generic error (don't expose details)
    res.status(500).json({ error: 'Payment processing failed' });
  }
}
```

### Interview Answer Template

**Q: "How do you handle errors in Next.js?"**

**A:** "Multi-layered error handling:

1. **getServerSideProps** - Try-catch around data fetching, return different props based on error
2. **404/500 handling** - Return `notFound: true` or graceful fallback props
3. **Error page** (_error.tsx) - Catches unhandled errors
4. **Error boundary** - Catches React component errors
5. **API routes** - Validate input, return appropriate HTTP status codes
6. **User-friendly messages** - Log full errors server-side, show generic message to users

This prevents white screens and gives users clear feedback."

---

## Interview Question 6: "What is ISR and when is it better than getServerSideProps?"

### The Problem
Choosing between static (fast but stale) and server-side (fresh but slow).

### ❌ WRONG - Using getServerSideProps When ISR Would Scale Better

```typescript
// pages/blog/[slug].tsx
// WRONG: Every single request re-queries database
export async function getServerSideProps(context) {
  const post = await db.query(
    'SELECT * FROM posts WHERE slug = ?',
    [context.params.slug]
  );

  return { props: { post } };
}

// Issues with 1,000 concurrent users:
// - Each request waits for database query
// - Database gets 1,000 queries per second
// - Users experience slow page load
// - Server CPU maxes out
// - Eventually crashes under load
```

### ✅ CORRECT - ISR for High Traffic + Periodic Updates

```typescript
// pages/blog/[slug].tsx
interface BlogPostProps {
  post: BlogPost;
  buildTime?: string;
}

export async function getStaticProps(context) {
  const { slug } = context.params as { slug: string };

  try {
    const post = await db.query(
      'SELECT * FROM posts WHERE slug = ?',
      [slug]
    );

    if (!post) {
      return {
        notFound: true,
        revalidate: 60 // Check again in 60 seconds
      };
    }

    return {
      props: {
        post,
        buildTime: new Date().toISOString()
      },
      // ✅ ISR: Regenerate every hour
      // Key: Serve CACHED version to all users
      // Only regenerate if someone visits after revalidate time
      revalidate: 3600
    };
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return {
      notFound: true,
      revalidate: 60 // Retry soon
    };
  }
}

export async function getStaticPaths() {
  // Pre-generate popular posts at build time
  const posts = await db.query(
    'SELECT slug FROM posts ORDER BY views DESC LIMIT 100'
  );

  return {
    paths: posts.map(post => ({
      params: { slug: post.slug }
    })),
    // ✅ Generate new paths on-demand
    // First visitor triggers generation, cached for future visitors
    fallback: 'blocking'
  };
}

export default function BlogPost({ post, buildTime }: BlogPostProps) {
  return (
    <article>
      <h1>{post.title}</h1>
      <time>{buildTime}</time>
      <p>{post.content}</p>
    </article>
  );
}
```

### ISR Strategy Explained

```
Without ISR:
User 1 hits /blog/post-1 → Database query → Slow response → 500ms
User 2 hits /blog/post-1 → Database query → Slow response → 500ms
...
1,000 users → 1,000 database queries → Database overloaded

With ISR (revalidate: 3600):
User 1 hits /blog/post-1 → Database query → Slow → 500ms → Cache for 1 hour
User 2 hits /blog/post-1 → Cached page → Instant → 50ms
User 3 hits /blog/post-1 → Cached page → Instant → 50ms
...
1,000 users → 1 database query + 999 cache hits

After 1 hour:
User 1001 hits /blog/post-1 → Triggers regeneration → Gets stale page temporarily
  → Server regenerates in background
User 1002 hits /blog/post-1 → Fresh page served from new cache

Result: 99.9% cache hit rate, minimal database load, instant page loads!
```

### Interview Answer Template

**Q: "When would you use ISR instead of getServerSideProps?"**

**A:** "ISR is better when you need:

1. **High traffic** - Don't want database query per request
2. **Periodic updates** - Content updates on schedule, not constantly
3. **Massive scalability** - Blog with 100k+ posts

Example: Blog with 10,000 posts:
- Pre-render top 100 popular posts at build (fallback: 'blocking')
- Revalidate every hour (ISR: 3600)
- Long-tail posts generated on first visitor
- After 1 hour, next visitor triggers regeneration in background

Result: Most users get instant cached pages, zero database load for popular posts. Much better than getServerSideProps which hits database every request!"

---

## Summary: When to Use Each

```
Requirement                    → Use This
────────────────────────────────────────────────────────
Real-time data (stock prices)  → Client-side fetch + polling
Dynamic, always fresh          → getServerSideProps
High traffic, infrequent updates → getStaticProps + ISR
SEO important                  → getServerSideProps or ISR
One-time static content        → getStaticProps
Behind authentication          → getServerSideProps or Client-side
```

---

**Updated: 2026-11-02**
Good luck on your Staff-level interview! 🚀
