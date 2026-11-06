# Detailed Tech Stack Examples - Staff Interview Guide

Comprehensive, production-ready code examples for TypeScript, React, Node.js, GraphQL, and Java Spring.

---

## TABLE OF CONTENTS

1. [TypeScript Examples](#typescript-examples)
2. [React Examples](#react-examples)
3. [Node.js Examples](#nodejs-examples)
4. [GraphQL Examples](#graphql-examples)
5. [Java Spring Examples](#java-spring-examples)

---

# TYPESCRIPT EXAMPLES

## Issue 1: Using `any` Type

### Problem
Using `any` disables TypeScript's type checking entirely, leading to runtime errors that could be caught at compile time.

### ❌ WRONG - Multiple Issues

```typescript
// Example 1: Unsafe property access
function processUser(user: any) {
  console.log(user.name.toUpperCase()); // Assumes name exists
  console.log(user.email.split('@')); // Assumes email is string
  return user.role; // No type hint
}

const result = processUser({ name: 'John' }); 
// Runtime error: Cannot read property 'email' of undefined

// Example 2: Type loss through function chain
function fetchAndProcess(id: any): any {
  const user = getUserFromDb(id); // Returns unknown structure
  const formatted = formatUser(user); // Type is lost
  return formatted;
}

// Example 3: Event handler with `any`
const handleClick = (event: any) => {
  event.target.value; // Could be DOM element with no value property
  event.preventDefault(); // May not exist
};
```

### ✅ CORRECT - Proper Typing

```typescript
// Example 1: Explicit interface with strict types
interface User {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

function processUser(user: User): string {
  console.log(user.name.toUpperCase()); // ✅ name is string
  const domain = user.email.split('@')[1]; // ✅ email is string
  return user.role; // ✅ role is one of three values
}

const result = processUser({ 
  name: 'John',
  email: 'john@example.com',
  role: 'admin',
  createdAt: new Date()
});

// Example 2: Generic type for flexibility
async function fetchAndProcess<T extends { id: number }>(
  id: T['id'],
  processor: (data: T) => T
): Promise<T> {
  const user = await getUserFromDb<T>(id);
  return processor(user);
}

interface ExtendedUser extends User {
  id: number;
  subscriptionLevel: 'free' | 'pro' | 'enterprise';
}

const processed = await fetchAndProcess<ExtendedUser>(1, (user) => ({
  ...user,
  subscriptionLevel: 'pro'
}));

// Example 3: Typed event handler
const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
  event.currentTarget.disabled = true; // ✅ currentTarget has disabled
  event.preventDefault(); // ✅ preventDefault exists
  console.log(event.button); // ✅ button is number
};

// Also works with DOM events
const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
  const value: string = event.currentTarget.value; // ✅ guaranteed string
};
```

### Why It Matters

- **Compile-time safety**: Catches errors before runtime
- **IDE support**: Enables autocomplete and refactoring
- **Documentation**: Types serve as inline documentation
- **Performance**: Compiler can optimize better with type information
- **Maintainability**: Future developers understand expected types

---

## Issue 2: Missing Generics

### Problem
Writing duplicate code for different types instead of using generics leads to maintenance burden and type safety loss.

### ❌ WRONG - Repeated Type-Specific Code

```typescript
// Example 1: Separate functions for each type
interface Product {
  id: number;
  name: string;
  price: number;
}

interface User {
  id: number;
  email: string;
}

// Redundant function for products
function getProductById(id: number): Product | null {
  const data = database.get('products', id);
  if (!data) return null;
  return {
    id: data.id,
    name: data.name,
    price: data.price
  };
}

// Almost identical function for users
function getUserById(id: number): User | null {
  const data = database.get('users', id);
  if (!data) return null;
  return {
    id: data.id,
    email: data.email
  };
}

// Example 2: Array operations without generic constraints
function filterByStatus(items: any[], status: any): any[] {
  return items.filter(item => item.status === status); // No validation
}

// Example 3: API response wrapper without generics
interface ApiResponse {
  status: number;
  data: any; // Type lost
  error?: any; // Type lost
}

async function fetchData(url: string): Promise<ApiResponse> {
  const response = await fetch(url);
  return {
    status: response.status,
    data: await response.json(),
    error: null
  };
}

const result = await fetchData('/api/users');
// result.data could be anything - no type safety
```

### ✅ CORRECT - Generic Reusable Code

```typescript
// Example 1: Single generic function for any entity
interface Entity {
  id: number;
}

interface Product extends Entity {
  name: string;
  price: number;
}

interface User extends Entity {
  email: string;
}

// One function for all types
async function getById<T extends Entity>(
  collection: string,
  id: number
): Promise<T | null> {
  const data = await database.get<T>(collection, id);
  return data || null;
}

// Usage - type is inferred
const product = await getById<Product>('products', 1);
const user = await getById<User>('users', 1);

if (product) {
  console.log(product.price); // ✅ product.price is guaranteed
}

// Example 2: Generic filter with type constraints
interface Filterable {
  status: 'active' | 'inactive' | 'pending';
}

function filterByStatus<T extends Filterable>(
  items: T[],
  status: T['status']
): T[] {
  return items.filter(item => item.status === status);
}

const activeProducts = filterByStatus(products, 'active');
const activeUsers = filterByStatus(users, 'active');

// Example 3: Generic API response with proper typing
interface ApiResponse<T, E = Error> {
  status: number;
  data?: T;
  error?: E;
  timestamp: Date;
}

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url);
    const data = await response.json() as T;
    return {
      status: response.status,
      data,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      status: 500,
      error: error instanceof Error ? error : new Error('Unknown error'),
      timestamp: new Date()
    };
  }
}

// Usage with type safety
interface UserList {
  users: User[];
  total: number;
}

const result = await fetchData<UserList>('/api/users');
if (result.data) {
  result.data.users.forEach(user => {
    console.log(user.email); // ✅ email is guaranteed
  });
}

// Example 4: Nested generics for complex scenarios
interface Repository<T> {
  getById(id: number): Promise<T | null>;
  getAll(): Promise<T[]>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: number, item: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}

class DatabaseRepository<T extends Entity> implements Repository<T> {
  constructor(private collection: string) {}

  async getById(id: number): Promise<T | null> {
    return database.get<T>(this.collection, id);
  }

  async getAll(): Promise<T[]> {
    return database.getAll<T>(this.collection);
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    return database.insert<T>(this.collection, item);
  }

  async update(id: number, item: Partial<T>): Promise<T> {
    return database.update<T>(this.collection, id, item);
  }

  async delete(id: number): Promise<void> {
    return database.delete(this.collection, id);
  }
}

// Single implementation, works for all types
const productRepo = new DatabaseRepository<Product>('products');
const userRepo = new DatabaseRepository<User>('users');

const allUsers = await userRepo.getAll(); // Returns User[]
const newProduct = await productRepo.create({ name: 'Widget', price: 29.99 });
```

### Why It Matters

- **DRY Principle**: Write once, use everywhere
- **Type Safety**: Maintains full type information
- **Refactoring**: Change implementation once for all types
- **Performance**: No runtime overhead, fully erasable
- **API Clarity**: Generic constraints document expected structure

---

## Issue 3: Incorrect Error Typing

### Problem
Treating errors as `any` or `Error` without proper typing leads to unsafe error handling.

### ❌ WRONG - Unsafe Error Handling

```typescript
// Example 1: Assuming error structure
async function fetchUser(id: number) {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    // Accessing unknown properties
    console.log(error.message); // error might not have message
    console.log(error.statusCode); // error might not have statusCode
    
    if (error.code === 'NETWORK_ERROR') { // Risky assumption
      console.log('Network failed');
    }
  }
}

// Example 2: Type assertion without validation
try {
  await riskyOperation();
} catch (error) {
  const err = error as Error; // What if it's not an Error?
  console.log(err.stack); // Could be undefined
}

// Example 3: Nested try-catch with lost type info
function processWithNestedErrors() {
  try {
    try {
      await dbOperation();
    } catch (error) {
      throw error; // Lost type information
    }
  } catch (error) {
    const msg = (error as any).message; // Back to any
  }
}
```

### ✅ CORRECT - Proper Error Handling

```typescript
// Example 1: Define error types
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NetworkError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly retryable: boolean
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly query: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Example 2: Type-safe error handling with discriminated union
type AppError =
  | { type: 'validation'; field: string; message: string }
  | { type: 'network'; statusCode: number; message: string; retryable: boolean }
  | { type: 'database'; code: string; message: string }
  | { type: 'unknown'; message: string };

// Error factory function
function createError(error: unknown): AppError {
  if (error instanceof ValidationError) {
    return {
      type: 'validation',
      field: error.field,
      message: error.message
    };
  }

  if (error instanceof NetworkError) {
    return {
      type: 'network',
      statusCode: error.statusCode,
      message: error.message,
      retryable: error.retryable
    };
  }

  if (error instanceof DatabaseError) {
    return {
      type: 'database',
      code: error.code,
      message: error.message
    };
  }

  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : String(error)
  };
}

// Example 3: Safe async error handling
async function fetchUser(id: number): Promise<User | AppError> {
  try {
    const response = await fetch(`/api/users/${id}`, {
      timeout: 5000
    });

    if (!response.ok) {
      return {
        type: 'network',
        statusCode: response.status,
        message: `Failed to fetch user: ${response.statusText}`,
        retryable: response.status >= 500
      };
    }

    const data = await response.json();
    
    // Validate structure
    if (!data.id || !data.email) {
      return {
        type: 'validation',
        field: 'user',
        message: 'Invalid user data structure'
      };
    }

    return data as User;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        type: 'network',
        statusCode: 0,
        message: 'Network request failed',
        retryable: true
      };
    }

    return {
      type: 'unknown',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Example 4: Error handling with exhaustive checks
function handleError(error: AppError): string {
  switch (error.type) {
    case 'validation':
      return `Validation failed for ${error.field}: ${error.message}`;
    
    case 'network':
      const retryMsg = error.retryable ? 'Please try again later' : 'Check your connection';
      return `Network error (${error.statusCode}): ${retryMsg}`;
    
    case 'database':
      return `Database error [${error.code}]: ${error.message}`;
    
    case 'unknown':
      return `Unexpected error: ${error.message}`;
    
    default:
      // TypeScript ensures all cases are covered
      const _exhaustive: never = error;
      return _exhaustive;
  }
}

// Example 5: Retry logic with typed errors
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T | AppError> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const appError = createError(error);
      
      // Only retry network errors
      if (appError.type === 'network' && appError.retryable && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      return appError;
    }
  }

  return { type: 'unknown', message: 'Max retries exceeded' };
}

// Usage
const result = await fetchWithRetry(() => fetchUser(1));
if ('type' in result) {
  // It's an error
  console.log('Error:', result.message);
} else {
  // It's a user
  console.log('User:', result.email);
}
```

### Why It Matters

- **Reliability**: Properly handle all error cases
- **Debugging**: Know exactly what went wrong
- **Recovery**: Retry strategies for specific error types
- **User Experience**: Show appropriate messages
- **Type Safety**: Compiler ensures error handling is complete

---

## Issue 4: Missing Union Types

### Problem
Using boolean flags or optional fields instead of discriminated unions creates invalid state possibilities.

### ❌ WRONG - Invalid State Combinations

```typescript
// Example 1: Multiple boolean flags (can create invalid states)
interface User {
  id: number;
  isAdmin: boolean;
  isGuest: boolean; // What if both are true?
  isBanned: boolean;
  isApproved: boolean; // What if banned AND approved?
}

// Example 2: Multiple optionals that should be mutually exclusive
interface PaymentState {
  isLoading?: boolean;
  isPending?: boolean;
  isComplete?: boolean;
  error?: string;
  data?: PaymentData;
  // What if isLoading && isComplete are both true?
  // What if isComplete && error are both set?
}

function processPayment(state: PaymentState) {
  if (state.isComplete && state.error) {
    // Invalid state - what should we do?
    console.log('Both complete and error?');
  }

  if (state.isLoading && state.data) {
    // Invalid state - loading shouldn't have data
    console.log('Loading but has data?');
  }
}

// Example 3: HTTP request states without union types
interface AsyncRequest<T> {
  loading: boolean;
  data?: T;
  error?: Error;
}

function render(request: AsyncRequest<User>) {
  if (request.loading && request.data) {
    // Which should render? Ambiguous
    return <div>Loading or showing data?</div>;
  }

  if (request.data && request.error) {
    // Which do we trust? Both exist
    return <div>Conflicting state</div>;
  }
}
```

### ✅ CORRECT - Discriminated Unions

```typescript
// Example 1: User role as discriminated union
type UserRole = 
  | { type: 'admin'; permissions: string[] }
  | { type: 'user'; accountTier: 'free' | 'pro' | 'enterprise' }
  | { type: 'guest'; sessionExpiry: Date }
  | { type: 'banned'; reason: string; bannedUntil: Date };

interface User {
  id: number;
  email: string;
  role: UserRole;
}

// Usage - compiler prevents invalid combinations
function getPermissions(user: User): string[] {
  switch (user.role.type) {
    case 'admin':
      return user.role.permissions; // ✅ permissions guaranteed
    case 'user':
      // ✅ Can access accountTier, not permissions
      return ['read', 'write'].filter(p => user.role.accountTier !== 'free');
    case 'guest':
      return []; // ✅ Guests have no permissions
    case 'banned':
      return []; // ✅ Banned users have no permissions
    default:
      const _exhaustive: never = user.role;
      return _exhaustive;
  }
}

// Example 2: Async request states
type AsyncState<T> =
  | { status: 'idle'; data?: undefined; error?: undefined }
  | { status: 'loading'; data?: undefined; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error };

interface UsersRequest {
  state: AsyncState<User[]>;
}

// Render based on state - no impossible combinations
function renderUsers(request: UsersRequest) {
  const { state } = request;

  switch (state.status) {
    case 'idle':
      return <div>Click to load users</div>;
    
    case 'loading':
      return <div>Loading...</div>;
    
    case 'success':
      return (
        <ul>
          {state.data.map(user => (
            <li key={user.id}>{user.email}</li>
          ))}
        </ul>
      );
    
    case 'error':
      return <div>Error: {state.error.message}</div>;
  }
}

// Example 3: Payment processing states
type PaymentState =
  | { stage: 'draft'; amount: number; items: CartItem[] }
  | { stage: 'processing'; transactionId: string; startTime: Date }
  | {
      stage: 'completed';
      transactionId: string;
      confirmationNumber: string;
      completedAt: Date;
      receipt: Receipt;
    }
  | {
      stage: 'failed';
      reason: string;
      attemptCount: number;
      lastAttempt: Date;
    }
  | {
      stage: 'cancelled';
      reason: string;
      cancelledAt: Date;
      refundStatus?: 'pending' | 'completed' | 'failed';
    };

function processPayment(state: PaymentState): void {
  switch (state.stage) {
    case 'draft':
      console.log(`Processing $${state.amount} for ${state.items.length} items`);
      break;
    
    case 'processing':
      console.log(`Transaction ${state.transactionId} in progress`);
      break;
    
    case 'completed':
      // ✅ All fields guaranteed to exist
      console.log(`Payment complete: ${state.confirmationNumber}`);
      console.log(`Receipt: ${state.receipt.id}`);
      break;
    
    case 'failed':
      console.log(`Failed: ${state.reason} (attempt ${state.attemptCount})`);
      break;
    
    case 'cancelled':
      if (state.refundStatus === 'completed') {
        console.log('Refund processed');
      }
      break;
  }
}

// Example 4: Form validation states
type FormState<T> =
  | {
      state: 'pristine';
      values: Partial<T>;
      touched: Record<string, never>;
      errors: Record<string, never>;
    }
  | {
      state: 'dirty';
      values: Partial<T>;
      touched: Record<keyof T, boolean>;
      errors: Record<string, string[]>;
    }
  | {
      state: 'submitted';
      values: T;
      touched: Record<keyof T, boolean>;
      errors: Record<string, never>;
    }
  | {
      state: 'submitting';
      values: T;
      touched: Record<keyof T, boolean>;
      errors: Record<string, never>;
      isSubmitting: true;
    }
  | {
      state: 'error';
      values: T;
      touched: Record<keyof T, boolean>;
      errors: Record<keyof T, string>;
      submitError: string;
    };

function canSubmitForm<T>(formState: FormState<T>): boolean {
  switch (formState.state) {
    case 'pristine':
    case 'dirty':
      return false; // Can't submit incomplete/unvalidated form
    case 'submitted':
    case 'error':
      return true; // ✅ Can retry submission
    case 'submitting':
      return false; // ✅ Already in progress
    default:
      const _exhaustive: never = formState;
      return _exhaustive;
  }
}
```

### Why It Matters

- **Type Safety**: Compiler prevents invalid state combinations
- **Correctness**: Only valid states are representable
- **Clarity**: Code documents valid state transitions
- **Exhaustiveness**: Compiler checks all cases are handled
- **Maintainability**: Clear what data exists in each state

---

## Issue 5: Type Narrowing

### Problem
Not properly narrowing union types leads to accessing properties that might not exist.

### ❌ WRONG - Unsafe Type Access

```typescript
// Example 1: Type guard not applied
function getValue(value: string | number | null) {
  console.log(value.toUpperCase()); // ❌ null has no toUpperCase
  return value.toString(); // ❌ Number doesn't have toString (well, it does, but not obvious)
}

// Example 2: Incomplete type narrowing
function processData(value: string | number) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase()); // ✅ OK
  }
  // What about number case?
  console.log(value.charAt(0)); // ❌ number has no charAt
}

// Example 3: Type assertion without validation
function extractUser(data: unknown) {
  const user = data as { name: string; email: string };
  return user.name; // Could be anything - no validation
}

// Example 4: No discrimination in union handling
type Result = { success: true; data: string } | { success: false; error: string };

function handleResult(result: Result) {
  if (result.success) {
    console.log(result.data); // ❌ Could be undefined
  }
  console.log(result.error); // ❌ Might not have error
}
```

### ✅ CORRECT - Proper Type Narrowing

```typescript
// Example 1: Guard clauses
function getValue(value: string | number | null): string {
  if (value === null) {
    return 'no value';
  }

  if (typeof value === 'string') {
    return value.toUpperCase();
  }

  if (typeof value === 'number') {
    return value.toFixed(2);
  }

  const _exhaustive: never = value;
  return _exhaustive;
}

// Example 2: Type predicate function
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function processData(value: string | number): string {
  if (isString(value)) {
    return value.toUpperCase();
  }

  if (isNumber(value)) {
    return value.toFixed(2);
  }

  const _exhaustive: never = value;
  return _exhaustive;
}

// Example 3: Runtime validation with type guard
interface User {
  name: string;
  email: string;
  age?: number;
}

function isUser(data: unknown): data is User {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.email === 'string' &&
    (obj.age === undefined || typeof obj.age === 'number')
  );
}

function extractUser(data: unknown): User | null {
  return isUser(data) ? data : null;
}

// Usage
const parsed = await response.json();
const user = extractUser(parsed);
if (user) {
  console.log(user.name); // ✅ Guaranteed to be string
}

// Example 4: Discriminated union narrowing
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

function handleResult<T>(result: Result<T>): T | null {
  if (result.success) {
    return result.data; // ✅ data is guaranteed to exist
  }

  console.error(result.error); // ✅ error is guaranteed to exist
  return null;
}

// Example 5: instanceof checks
class ValidationError extends Error {
  constructor(public field: string) {
    super(`Invalid ${field}`);
  }
}

class NetworkError extends Error {
  constructor(public statusCode: number) {
    super(`Network error: ${statusCode}`);
  }
}

function handleError(error: Error): string {
  if (error instanceof ValidationError) {
    return `Validation failed: ${error.field}`; // ✅ field exists
  }

  if (error instanceof NetworkError) {
    return `Network error: ${error.statusCode}`; // ✅ statusCode exists
  }

  return error.message;
}

// Example 6: Array filtering with type narrowing
const values = [1, 'hello', null, 'world', undefined, 42];

const strings = values.filter(isString); // Type is string[]
const numbers = values.filter(isNumber); // Type is number[]

// Example 7: Exhaustive checking with never
type Shape = { type: 'circle'; radius: number } | { type: 'square'; side: number };

function getArea(shape: Shape): number {
  switch (shape.type) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    default:
      const _exhaustive: never = shape;
      throw new Error(`Unhandled shape: ${_exhaustive}`);
  }
}
```

### Why It Matters

- **Safety**: Prevents runtime errors from accessing undefined properties
- **Correctness**: Only use properties that are guaranteed to exist
- **Clarity**: Code documents what type is valid in each branch
- **Exhaustiveness**: Compiler ensures all type combinations are handled
- **Refactoring**: Type narrowing makes code evolution safer

---

# REACT EXAMPLES

## Issue 1: Missing useEffect Dependencies

### Problem
Using `useEffect` without proper dependency arrays causes stale closures and missed updates.

### ❌ WRONG - Stale Data and Bugs

```typescript
// Example 1: Missing userId in dependency array
interface UserProfileProps {
  userId: string;
}

function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // userId used but not in deps!
    fetchUser(userId).then(data => {
      setUser(data);
      setLoading(false);
    });
  }, []); // Empty array = runs once on mount

  // Bug: User profile for userId='1' loads
  // Then userId prop changes to '2'
  // Effect doesn't re-run, so it keeps showing data for user '1'
  return (
    <div>
      {loading ? <div>Loading...</div> : <div>{user?.name}</div>}
    </div>
  );
}

// Example 2: Event handler missing from dependency
function CommentList({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);

  const handleNewComment = useCallback(() => {
    // postId is captured from closure
    api.createComment(postId);
  }, []); // postId not in deps

  useEffect(() => {
    // Fetch comments uses old postId from closure
    api.getComments(postId).then(setComments);
  }, [postId]);

  return (
    <div>
      <button onClick={handleNewComment}>Add Comment</button>
      {/* User clicks, creates comment for wrong post */}
    </div>
  );
}

// Example 3: Interval/timeout with stale function
function Timer({ onTick }: { onTick: () => void }) {
  useEffect(() => {
    const interval = setInterval(() => {
      onTick(); // Uses old onTick reference - closure issue
    }, 1000);

    return () => clearInterval(interval);
  }, []); // onTick not in deps

  // Parent re-renders with new onTick, but interval still calls old one
  // onTick is a function from parent, and we're not tracking it
}

// Example 4: Multiple state updates with wrong deps
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Both query used but only query in deps
    if (!query) {
      setResults([]);
      return;
    }

    searchApi(query)
      .then(data => {
        setResults(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setResults([]); // Clear results on error
      });
  }, [query]); // Missing error, results in deps - but they're state, so OK actually

  // This is actually OK - state setters are stable
  // But if we had external dependencies, could cause issues
}

// Example 5: Missing array element in dependency
function BookList({ bookIds }: { bookIds: number[] }) {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    // Fetches all books in bookIds array
    Promise.all(bookIds.map(id => fetchBook(id))).then(setBooks);
  }, [bookIds]); // ⚠️ bookIds is passed but object reference changes every render

  // If parent passes new array [1,2,3] but same content
  // Our effect runs because array reference changed
  // Even though actual IDs didn't change

  // Better to deps on content, not reference:
  // useEffect(() => {
  //   Promise.all(bookIds.map(id => fetchBook(id))).then(setBooks);
  // }, [bookIds.join(',')]); // Or use a key
}
```

### ✅ CORRECT - Proper Dependency Management

```typescript
// Example 1: Include all dependencies
interface UserProfileProps {
  userId: string;
}

function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start loading
    setLoading(true);

    fetchUser(userId)
      .then(data => {
        setUser(data);
      })
      .catch(error => {
        console.error('Failed to load user:', error);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    // Cleanup function for cancellation
    return () => {
      // Useful for cancelling requests
      setUser(null);
    };
  }, [userId]); // ✅ userId included

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return <div>{user.name}</div>;
}

// Example 2: Memoize callback with proper dependencies
function CommentList({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);

  // Fetch comments
  useEffect(() => {
    api.getComments(postId)
      .then(setComments)
      .catch(console.error);
  }, [postId]); // ✅ postId included

  // Memoize callback with postId
  const handleNewComment = useCallback((text: string) => {
    api.createComment({ postId, text })
      .then(newComment => {
        setComments(prev => [...prev, newComment]);
      })
      .catch(console.error);
  }, [postId]); // ✅ postId included

  return (
    <div>
      <button onClick={() => handleNewComment('New comment')}>
        Add Comment
      </button>
      <ul>
        {comments.map(comment => (
          <li key={comment.id}>{comment.text}</li>
        ))}
      </ul>
    </div>
  );
}

// Example 3: Cleanup for interval with memoized function
function Timer({ interval = 1000 }: { interval?: number }) {
  const [count, setCount] = useState(0);

  // Memoize callback
  const handleTick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []); // Callback is stable

  // Setup interval
  useEffect(() => {
    const id = setInterval(handleTick, interval);
    
    return () => clearInterval(id); // Cleanup
  }, [handleTick, interval]); // ✅ Both included

  return <div>Count: {count}</div>;
}

// Example 4: Multiple effects for different concerns
function SearchResults({ query }: { query: string }) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Effect 1: Fetch results when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setLoading(true);
    searchApi(query)
      .then(data => {
        setResults(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query]); // ✅ Only re-run when query changes

  // Effect 2: Log results separately (different concern)
  useEffect(() => {
    if (results.length > 0) {
      console.log(`Found ${results.length} results`);
    }
  }, [results]); // ✅ Track results separately

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}

// Example 5: Stable array dependencies
interface BookListProps {
  bookIds: number[];
}

function BookList({ bookIds }: BookListProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  // Convert array to stable string for dependency
  const bookIdsString = useMemo(
    () => bookIds.join(','),
    [bookIds]
  );

  useEffect(() => {
    setLoading(true);
    Promise.all(bookIds.map(id => fetchBook(id)))
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [bookIdsString]); // ✅ Stable dependency

  if (loading) return <div>Loading books...</div>;

  return (
    <ul>
      {books.map(book => (
        <li key={book.id}>{book.title}</li>
      ))}
    </ul>
  );
}

// Example 6: Using external library hooks for dependencies
import { useQuery } from '@tanstack/react-query';

function UserProfile({ userId }: { userId: string }) {
  // React Query handles dependencies internally
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId], // ✅ Explicit dependency tracking
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
  if (!user) return <div>No user found</div>;

  return <div>{user.name}</div>;
}
```

### Why It Matters

- **Correctness**: Effects respond to actual data changes
- **Performance**: Unnecessary re-renders avoided with proper deps
- **Debugging**: Dependencies make effect logic clear
- **Maintainability**: Future changes won't break effect logic
- **Production Issues**: Stale closures cause subtle bugs hard to track

---

## Issue 2: Memory Leaks - Cleanup Functions

### Problem
Not cleaning up subscriptions, timers, or event listeners causes memory leaks.

### ❌ WRONG - Leaking Resources

```typescript
// Example 1: Event listener not cleaned up
function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    // Adding listener but never removing
    input.addEventListener('change', (e) => {
      setValue(e.currentTarget.value);
    });

    // No cleanup function!
    // Every mount adds another listener
    // Component unmounts? Listeners remain
  }, []);

  return <input ref={inputRef} />;
}

// Example 2: Timer not cleaned up
function Stopwatch() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    // No cleanup!
    setInterval(() => {
      setTime(t => t + 1);
    }, 1000);
    // Multiple intervals accumulate if component remounts
  }, []);

  return <div>Time: {time}s</div>;
}

// Example 3: WebSocket connection not closed
function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/chat');

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    // No cleanup - websocket stays open
    // Navigate away? Socket remains connected
    // Lots of orphaned connections accumulate
  }, []);

  return <div>{messages.map(m => <p key={m.id}>{m.text}</p>)}</div>;
}

// Example 4: Observable subscription not unsubscribed
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // RxJS observable subscription
    const subscription = userService.getUser$(userId).subscribe(
      user => setUser(user),
      error => console.error(error)
    );

    // No cleanup
    // Subscription never completes
    // Memory grows over time
  }, [userId]);

  return <div>{user?.name}</div>;
}

// Example 5: Async function promise leak
function FileUploader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Async function that sets state
    uploadFile('/large-file.bin').then(result => {
      setProgress(100); // State update after unmount!
    });
    // No cleanup - can't cancel fetch
  }, []);

  return <div>Upload: {progress}%</div>;
}
```

### ✅ CORRECT - Proper Cleanup

```typescript
// Example 1: Clean up event listener
function SearchInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const handleChange = (e: Event) => {
      if (e.target instanceof HTMLInputElement) {
        setValue(e.target.value);
      }
    };

    input.addEventListener('change', handleChange);

    // ✅ Cleanup function
    return () => {
      input.removeEventListener('change', handleChange);
    };
  }, []);

  return <input ref={inputRef} />;
}

// Example 2: Clean up timer/interval
function Stopwatch() {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(t => t + 1);
    }, 1000);

    // ✅ Cleanup function clears interval
    return () => clearInterval(id);
  }, []);

  return <div>Time: {time}s</div>;
}

// Example 3: Close WebSocket connection
function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('wss://api.example.com/chat');

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    // ✅ Cleanup function closes connection
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  return (
    <div>
      {connected ? <span>Connected</span> : <span>Disconnected</span>}
      {messages.map(m => (
        <p key={m.id}>{m.text}</p>
      ))}
    </div>
  );
}

// Example 4: Unsubscribe from Observable
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const subscription = userService.getUser$(userId).subscribe({
      next: user => setUser(user),
      error: error => console.error('User load error:', error),
      complete: () => console.log('User stream completed')
    });

    // ✅ Cleanup function unsubscribes
    return () => subscription.unsubscribe();
  }, [userId]);

  return <div>{user?.name}</div>;
}

// Example 5: Abort fetch after unmount
function FileUploader() {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create AbortController for cancellation
    const controller = new AbortController();

    uploadFile('/large-file.bin', {
      signal: controller.signal,
      onProgress: (p) => setProgress(p)
    })
      .then(result => {
        // Only update if not aborted
        if (!controller.signal.aborted) {
          setProgress(100);
        }
      })
      .catch(err => {
        // Abort errors are normal when unmounting
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      });

    // ✅ Cleanup function aborts fetch
    return () => controller.abort();
  }, []);

  if (error) return <div>Error: {error}</div>;
  return <div>Upload: {progress}%</div>;
}

// Example 6: Multiple resource cleanup
function DataDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Resource 1: WebSocket for real-time updates
    const ws = new WebSocket('wss://api.example.com/monitor');
    
    // Resource 2: Polling interval for fallback
    let pollInterval: NodeJS.Timeout;
    
    // Resource 3: Event listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsMonitoring(false);
      } else {
        setIsMonitoring(true);
      }
    };

    ws.onopen = () => {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Start polling as fallback
      pollInterval = setInterval(() => {
        fetch('/api/dashboard')
          .then(r => r.json())
          .then(setData)
          .catch(console.error);
      }, 10000);

      setIsMonitoring(true);
    };

    ws.onmessage = (event) => {
      setData(JSON.parse(event.data));
    };

    // ✅ Comprehensive cleanup
    return () => {
      ws.close();
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      setIsMonitoring(false);
    };
  }, []);

  return (
    <div>
      {isMonitoring ? <span>Monitoring...</span> : <span>Paused</span>}
      {data && <Dashboard data={data} />}
    </div>
  );
}
```

### Why It Matters

- **Performance**: Leaked resources consume memory indefinitely
- **Bugs**: Orphaned timers/listeners can cause errors
- **Scalability**: Apps with memory leaks crash over time
- **Battery life**: Mobile apps drain battery with background work
- **User Experience**: Stale state updates cause confusing UI behavior

---

# NEXT.JS EXAMPLES

## Interview Question 1: "How do you handle data fetching in Next.js? What are the differences between getServerSideProps, getStaticProps, and client-side fetching?"

### Problem
Choosing the wrong data fetching method leads to poor performance, SEO issues, or stale data.

### ❌ WRONG - Client-Side Fetching for Dynamic Data

```typescript
// pages/products.tsx
import { useState, useEffect } from 'react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // WRONG: All data fetched on client
  // - Page is blank until data loads (poor UX)
  // - Search engines see empty page (bad SEO)
  // - Re-fetches on every navigation
  // - Content is not cacheable
  useEffect(() => {
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

### ✅ CORRECT - Using getServerSideProps for Dynamic Data

```typescript
// pages/products.tsx
interface ProductsPageProps {
  products: Product[];
}

// ✅ Server-side rendering: Data fetched before page renders
export async function getServerSideProps() {
  try {
    const response = await fetch(`${process.env.API_URL}/products`);
    
    if (!response.ok) {
      return {
        notFound: true // Show 404 if API fails
      };
    }

    const products = await response.json();

    return {
      props: {
        products
      },
      revalidate: 60 // Revalidate every 60 seconds (ISR)
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return {
      notFound: true
    };
  }
}

export default function ProductsPage({ products }: ProductsPageProps) {
  // ✅ Data already available when component renders
  // ✅ Search engines see full content
  // ✅ Page SEO-optimized
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

### ✅ CORRECT - Using getStaticProps for Static Data with ISR

```typescript
// pages/blog/[slug].tsx
interface BlogPostProps {
  post: BlogPost;
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const { slug } = context.params as { slug: string };

  try {
    const post = await fetchBlogPost(slug);

    return {
      props: { post },
      revalidate: 3600 // Revalidate every hour (ISR - Incremental Static Regeneration)
      // ✅ This means:
      // - First visitor gets cached page instantly
      // - After 1 hour, next visitor triggers regeneration in background
      // - Page updates without full rebuild
    };
  } catch (error) {
    return {
      notFound: true,
      revalidate: 60 // Retry after 60 seconds
    };
  }
}

export async function getStaticPaths() {
  // Pre-generate pages for most popular posts
  const posts = await fetchAllBlogPosts();
  
  return {
    paths: posts.slice(0, 100).map(post => ({
      params: { slug: post.slug }
    })),
    fallback: 'blocking' // Generate new pages on-demand
    // ✅ blocking = generate page on first request, cache for future requests
  };
}

export default function BlogPost({ post }: BlogPostProps) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### Why It Matters

- **Performance**: Static pages load instantly, server pages are pre-rendered
- **SEO**: Search engines see full content, not empty shells
- **User Experience**: No loading spinners, content appears immediately
- **Cost**: Cached pages don't hit your API on every request
- **Scalability**: ISR means you can handle millions of pages without rebuilding entire site

---

## Interview Question 2: "What's the difference between Image optimization in Next.js and using <img>? When would you use each?"

### Problem
Using plain <img> tags leads to poor performance, layout shift, and larger bundle sizes.

### ❌ WRONG - Using Plain HTML Images

```typescript
// components/ProductCard.tsx
export default function ProductCard({ product }: { product: Product }) {
  return (
    <div>
      {/* WRONG: Multiple performance issues */}
      
      {/* Issue 1: No lazy loading */}
      <img 
        src={product.imageUrl} 
        alt={product.name}
        width="300"
        height="300"
      />
      
      {/* Issue 2: Layout Cumulative Shift (CLS) */}
      {/* Image loads with delay, causing page jump */}
      
      {/* Issue 3: No responsive images */}
      {/* Same image sent to desktop and mobile */}
      
      {/* Issue 4: No image formats optimization */}
      {/* Serves JPEG to browsers that support WebP */}
      
      {/* Issue 5: Unbounded image sizes */}
      {/* Could load 5MB image on mobile 3G */}
      
      <h2>{product.name}</h2>
      <p>${product.price}</p>
    </div>
  );
}
```

### ✅ CORRECT - Using Next.js Image Component

```typescript
import Image from 'next/image';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div>
      {/* ✅ Next.js Image: Automatic optimization */}
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={300}
        height={300}
        
        // ✅ Lazy loading: Image only loads when near viewport
        loading="lazy"
        
        // ✅ Responsive: Serves different sizes for different devices
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        
        // ✅ Format optimization: Serves WebP to modern browsers, JPEG to older
        // Automatic
        
        // ✅ Prevents layout shift by reserving space
        style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
        
        // ✅ Blur placeholder while loading
        placeholder="blur"
        blurDataURL={product.blurUrl}
      />
      
      <h2>{product.name}</h2>
      <p>${product.price}</p>
    </div>
  );
}
```

### ✅ CORRECT - Image Configuration with Next.js Config

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Define allowed image domains
    domains: ['cdn.example.com', 'images.example.com'],
    
    // ✅ Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    
    // ✅ Image sizes for <source> elements
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // ✅ Cache optimization in production
    minimumCacheTTL: 60 * 60 * 24 * 365 // 1 year for static images
  }
};

module.exports = nextConfig;
```

### Interview Answer Template

**Q: Why should you use the Image component instead of img?**

**A:** The Next.js Image component provides automatic optimization that includes:
- Lazy loading (images only load when visible)
- Responsive sizing (different images for different device widths)
- Format optimization (WebP for modern browsers, JPEG fallback)
- Prevents Cumulative Layout Shift by reserving space
- Automatic srcset generation

This improves Core Web Vitals, which affects SEO rankings. Plain `<img>` tags don't have these optimizations and can significantly slow down page load.

---

## Interview Question 3: "How do you handle large components in Next.js to avoid bloating your JavaScript bundle? Show me a code example."

### Problem
Importing large components at the top level increases bundle size, slowing down initial page load.

### ❌ WRONG - Importing Large Components Statically

```typescript
// pages/dashboard.tsx
import HeavyAnalyticsChart from '@/components/HeavyAnalyticsChart'; // 500KB
import ComplexDataTable from '@/components/ComplexDataTable'; // 300KB
import AdvancedMapComponent from '@/components/AdvancedMapComponent'; // 800KB

// WRONG: All components bundled with page
// Initial JS bundle includes all code even if user doesn't scroll to it
// Page takes 3+ seconds to become interactive

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyAnalyticsChart />
      <ComplexDataTable />
      <AdvancedMapComponent />
    </div>
  );
}
```

### ✅ CORRECT - Dynamic Import with Loading State

```typescript
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// ✅ Dynamic import: Code only loads when component mounts
// ✅ Also can be split into separate bundle chunks
const HeavyAnalyticsChart = dynamic(
  () => import('@/components/HeavyAnalyticsChart'),
  {
    loading: () => <div>Loading chart...</div>,
    ssr: false // Don't render on server (if it uses browser APIs)
  }
);

const ComplexDataTable = dynamic(
  () => import('@/components/ComplexDataTable'),
  {
    loading: () => <div>Loading table...</div>
  }
);

const AdvancedMapComponent = dynamic(
  () => import('@/components/AdvancedMapComponent'),
  {
    loading: () => <div>Loading map...</div>,
    ssr: false // Maps usually need browser APIs
  }
);

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* ✅ Each component loads independently */}
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyAnalyticsChart />
      </Suspense>
      
      <Suspense fallback={<div>Loading table...</div>}>
        <ComplexDataTable />
      </Suspense>
      
      <Suspense fallback={<div>Loading map...</div>}>
        <AdvancedMapComponent />
      </Suspense>
    </div>
  );
}
```

### Interview Answer Template

**Q: How would you optimize a page with several large third-party components?**

**A:** Use dynamic imports with Next.js's `dynamic()` function:
1. Import components dynamically instead of statically
2. Provide loading UI while component downloads
3. Set `ssr: false` if component requires browser APIs (like maps)
4. Each component is split into its own chunk, loaded on-demand

This keeps the initial JavaScript bundle small, so the page becomes interactive faster. Components load in the background as users need them.

---

## Interview Question 4: "Explain environment variables in Next.js. What's the difference between .env, .env.local, and .env.production?"

### Problem
Hardcoding API URLs and secrets leads to security vulnerabilities and configuration management issues.

### ❌ WRONG - Hardcoded Configuration

```typescript
// pages/api/users.ts
export default async function handler(req, res) {
  // WRONG: Secrets exposed in code
  const API_KEY = 'sk_live_abc123xyz789'; // Visible in git history!
  const API_URL = 'https://api.stripe.com';
  const DB_PASSWORD = 'password123'; // In source control!

  // Anyone with access to repo can steal credentials
  const response = await fetch(`${API_URL}/v1/charges`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    }
  });

  res.json(await response.json());
}

// Also hardcoded in components
export function PaymentComponent() {
  return (
    // WRONG: API key exposed in client-side code
    <script src="https://js.stripe.com/v3/?key=pk_live_abc123"></script>
  );
}
```

### ✅ CORRECT - Environment Variables

```typescript
// .env.local (Git ignored, local development)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_KEY=pk_test_123
SECRET_API_KEY=sk_test_456
DATABASE_URL=postgresql://localhost/mydb

// .env.production (For production deployment)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_abc
SECRET_API_KEY=sk_live_xyz # Managed by deployment platform
DATABASE_URL=postgresql://prod-server/mydb

// pages/api/users.ts
export default async function handler(req, res) {
  // ✅ Variables injected at build time
  // ✅ Secret variables NEVER exposed to client
  
  if (!process.env.SECRET_API_KEY) {
    throw new Error('SECRET_API_KEY not configured');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/data`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.SECRET_API_KEY}`
      }
    }
  );

  res.json(await response.json());
}

// lib/stripe-client.ts
// ✅ Only NEXT_PUBLIC_ variables available in client code
import Stripe from '@stripe/stripe-js';

export async function loadStripe() {
  return await Stripe.loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
}

// .gitignore
.env.local # Never commit local secrets
.env*.local
```

### .env File Hierarchy

```
Priority (highest to lowest):
1. .env.local - Local overrides (not in git)
2. .env.production - Production specific (in git, not secrets!)
3. .env.development - Development specific (in git)
4. .env - Shared defaults (in git)

Rule: NEXT_PUBLIC_* variables = visible to browser
      Everything else = server-only secrets
```

### Interview Answer Template

**Q: How do you handle secrets and configuration in Next.js?**

**A:** Use environment variables with clear rules:
- `NEXT_PUBLIC_*` prefix makes variables available in browser (safe for API URLs, keys)
- Without prefix, variables are server-only (safe for database passwords, API secrets)
- Use `.env.local` for local development (git-ignored)
- Use `.env.production` for production (in git, no actual secrets)
- Deployment platform (Vercel, AWS) manages actual secrets

This ensures secrets never get committed to git and configuration is environment-specific.

---

## Interview Question 5: "How would you handle errors in a Next.js application? What should the error handling strategy be?"

### Problem
Missing error handling leads to white screens, confusing user experiences, and hard-to-debug issues.

### ❌ WRONG - No Error Handling

```typescript
// pages/index.tsx
export async function getServerSideProps() {
  // WRONG: No error handling
  const data = await fetch('https://api.example.com/config');
  const config = await data.json();

  return { props: { config } };
  // If API is down, entire page crashes with 500 error
}

// pages/products/[id].tsx
export default function ProductPage({ product }) {
  return (
    <div>
      {/* WRONG: No null checks */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      
      {/* WRONG: Direct property access without fallback */}
      <img src={product.images[0].url} />
      
      {/* If product undefined, entire page crashes */}
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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </h1>
      <p>Sorry, we encountered an unexpected error.</p>
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

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <p style={{ color: 'red' }}>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;

// pages/products/[id].tsx - Proper error handling in SSR
interface ProductPageProps {
  product?: Product;
  error?: string;
}

export async function getServerSideProps({ params }: GetServerSidePropsContext) {
  try {
    const response = await fetch(`https://api.example.com/products/${params.id}`, {
      timeout: 5000
    });

    if (!response.ok) {
      // Specific error handling
      if (response.status === 404) {
        return { notFound: true };
      }
      
      if (response.status === 500) {
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

export default function ProductPage({ product, error }: ProductPageProps) {
  // ✅ Handle all cases
  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      
      {/* ✅ Safe property access with fallback */}
      {product.images?.[0]?.url && (
        <img src={product.images[0].url} alt={product.name} />
      )}
      
      <price>${product.price ?? 'Contact for price'}</price>
    </div>
  );
}

// pages/api/checkout.ts - API route error handling
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate input
    if (!req.body.items || !Array.isArray(req.body.items)) {
      return res.status(400).json({ error: 'Invalid items' });
    }

    // Process checkout
    const session = await stripe.checkout.sessions.create({
      line_items: req.body.items,
      mode: 'payment',
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/checkout`
    });

    res.status(200).json({ session });
  } catch (error) {
    // Distinguish error types
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    if (error instanceof StripeError) {
      console.error('Stripe error:', error);
      return res.status(500).json({ error: 'Payment processing failed' });
    }

    // Generic error - don't expose details
    console.error('Unexpected error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
```

### Interview Answer Template

**Q: How do you handle errors in Next.js?**

**A:** Multi-layered approach:
1. **Global error page** (`_error.tsx`) - catches unhandled errors
2. **Error boundaries** - catches React component errors
3. **Try-catch in getServerSideProps** - handles SSR errors, return alternative props
4. **Status codes** - return 404 for not found, 500 for server errors
5. **API route validation** - validate input before processing
6. **User-friendly messages** - don't expose internal errors to users

This ensures users see appropriate error messages instead of blank pages, and developers can debug issues through logs.

---

## Interview Question 6: "What is ISR (Incremental Static Regeneration) and when would you use it instead of getServerSideProps?"

### Problem
Choosing between getStaticProps and getServerSideProps is a tradeoff between performance and freshness.

### ❌ WRONG - Using getServerSideProps When Static Would Work

```typescript
// pages/blog/[slug].tsx
// WRONG: Every request re-fetches and re-renders
export async function getServerSideProps(context) {
  const post = await db.query('SELECT * FROM posts WHERE slug = ?', [context.params.slug]);

  return {
    props: { post },
    revalidate: 60
  };
}

// Issues:
// - Every visitor waits for database query (slow)
// - Database gets hammered with repeated queries
// - Scales poorly with traffic
// - Each server has to re-render
```

### ✅ CORRECT - Using ISR for Dynamic Content

```typescript
// pages/blog/[slug].tsx
interface BlogPostProps {
  post: BlogPost;
  lastUpdated: string;
}

export async function getStaticProps(context: GetStaticPropsContext) {
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
        lastUpdated: new Date().toISOString()
      },
      // ✅ ISR: Regenerate every hour
      // But serve cached version to all users
      revalidate: 3600
    };
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return {
      notFound: true,
      revalidate: 60
    };
  }
}

export async function getStaticPaths() {
  // ✅ Pre-generate popular posts
  const posts = await db.query('SELECT slug FROM posts ORDER BY views DESC LIMIT 100');

  return {
    paths: posts.map(post => ({
      params: { slug: post.slug }
    })),
    // ✅ fallback: 'blocking' = generate new pages on-demand
    // First request is slower (server-rendered), then cached
    fallback: 'blocking'
  };
}

export default function BlogPost({ post, lastUpdated }: BlogPostProps) {
  return (
    <article>
      <h1>{post.title}</h1>
      <time>{lastUpdated}</time>
      <p>{post.content}</p>
      
      {/* ✅ ISR indicator for debugging */}
      {process.env.NODE_ENV === 'development' && (
        <p style={{ color: 'gray' }}>Last built: {lastUpdated}</p>
      )}
    </article>
  );
}
```

### ISR vs Other Methods - Comparison Table

```
┌─────────────────────┬──────────────┬────────────────┬─────────────┐
│ Method              │ Build Time   │ Request Time   │ Freshness   │
├─────────────────────┼──────────────┼────────────────┼─────────────┤
│ getStaticProps      │ Slow (builds │ Fast (cached)  │ Stale until │
│ (no revalidate)     │ all pages)   │                │ rebuild     │
├─────────────────────┼──────────────┼────────────────┼─────────────┤
│ getStaticProps +    │ Fast (builds │ Fast (cached)  │ Fresh every │
│ ISR (revalidate)    │ critical)    │ 1st request    │ N seconds   │
├─────────────────────┼──────────────┼────────────────┼─────────────┤
│ getServerSideProps  │ Fast (no     │ Slow (server   │ Always      │
│                     │ build)       │ renders)       │ fresh       │
├─────────────────────┼──────────────┼────────────────┼─────────────┤
│ Client-side fetch   │ Fast         │ Very slow      │ Always      │
│                     │              │ (no cache)     │ fresh       │
└─────────────────────┴──────────────┴────────────────┴─────────────┘

Best choice:
- High-traffic pages with infrequent updates → ISR
- Always-fresh data → getServerSideProps
- One-time static content → getStaticProps (no revalidate)
- Real-time data → Client-side + SWR/React Query
```

### Interview Answer Template

**Q: When would you use ISR instead of getServerSideProps?**

**A:** ISR is best when you need:
- **Static performance** for high-traffic pages
- **Fresh content** but not in real-time
- **Reduced database load** (cache serves 99% of requests)

Example: A blog with 10,000 posts where:
- Critical posts (top 100) pre-rendered at build time
- Long-tail posts generated on first visitor (fallback: 'blocking')
- All posts revalidate every hour

This means most visitors get instant cached pages, but content updates happen automatically. Much better than getServerSideProps where every request hits the database.

---

## FINAL CHECKLIST: What's Covered

### ✅ Next.js (8+ Issues with full interview explanations)
- [x] Data fetching patterns (getServerSideProps vs getStaticProps vs client-side)
- [x] Image optimization best practices
- [x] Code splitting and dynamic imports
- [x] Environment variables and configuration
- [x] Error handling strategies
- [x] ISR (Incremental Static Regeneration)
- [x] Performance optimization
- [x] SEO considerations

## Issue 3: Stale Closures

### Problem
Functions capture old values from closures, causing unexpected behavior when dependencies change.

### ❌ WRONG - Stale Closures

```typescript
// Example 1: Event handler with stale prop
interface CounterProps {
  count: number;
  onLog: (value: number) => void;
}

function Counter({ count, onLog }: CounterProps) {
  const handleClick = () => {
    // count is captured from closure
    // This function is never updated
    console.log('Count is:', count);
    onLog(count);
  };

  return (
    <button onClick={handleClick}>
      Log Count
    </button>
  );

  // User clicks button when count=5
  // handleClick logs count=5 ✓ Correct
  // But if we rely on this for some behavior and count becomes 10
  // and user clicks button
  // handleClick STILL logs count=5 ✗ Stale closure
}

// Example 2: Memoized component with stale props
const MemoButton = React.memo(({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click me</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log(count); // Captures current count
  };

  // handleClick is recreated every render
  // But MemoButton may not re-render because props "didn't change"
  // (React.memo does shallow comparison)
  // This violates the memoization contract
  return (
    <div>
      <MemoButton onClick={handleClick} />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Example 3: Debounced callback with stale state
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const debouncedSearch = useMemo(
    () =>
      debounce((q: string) => {
        // If query changes multiple times rapidly
        // q parameter reflects latest, but...
        searchApi(q).then(setResults);
      }, 500),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.currentTarget.value;
    setQuery(newQuery);
    
    // If debounce callback doesn't update properly
    // It might search with old query value
    debouncedSearch(newQuery); // OK if passed as param
    // But if it used query from state, would be stale
  };

  return <input onChange={handleChange} />;
}

// Example 4: Interval with stale variable
function CountdownTimer({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      // This closure captures initialSeconds
      // Even if initialSeconds prop changes, interval still uses old value
      setSeconds(s => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Skipping initialSeconds - BAD

  return <div>Time: {seconds}s</div>;
}
```

### ✅ CORRECT - Proper Closure Management

```typescript
// Example 1: useCallback with dependencies
interface CounterProps {
  count: number;
  onLog: (value: number) => void;
}

function Counter({ count, onLog }: CounterProps) {
  // useCallback updates when count or onLog changes
  const handleClick = useCallback(() => {
    console.log('Count is:', count);
    onLog(count);
  }, [count, onLog]); // ✅ Dependencies specified

  return (
    <button onClick={handleClick}>
      Log Count
    </button>
  );
}

// Example 2: Properly memoized component with useCallback
const MemoButton = React.memo(({ onClick }: { onClick: () => void }) => {
  return <button onClick={onClick}>Click me</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // ✅ Callback is stable across renders
  const handleClick = useCallback(() => {
    console.log(count);
  }, [count]); // Re-create when count changes

  return (
    <div>
      {/* MemoButton only re-renders when handleClick actually changes */}
      <MemoButton onClick={handleClick} />
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

// Example 3: Passing parameters to debounced function
function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // ✅ Debounce wraps function that takes query as parameter
  const debouncedSearch = useMemo(
    () =>
      debounce((q: string) => {
        searchApi(q).then(setResults);
      }, 500),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.currentTarget.value;
    setQuery(newQuery);
    
    // ✅ Pass current query as parameter, not relying on closure
    debouncedSearch(newQuery);
  };

  return (
    <div>
      <input onChange={handleChange} placeholder="Search..." />
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}

// Example 4: Update dependencies when needed
function CountdownTimer({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [initialSeconds]); // ✅ Now includes initialSeconds

  // Or if you want independent timer:
  // useEffect(() => {
  //   if (seconds <= 0) return;
  //   const interval = setInterval(() => {
  //     setSeconds(s => s - 1);
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, []);
}

// Example 5: ref-based state for expensive computations
function VideoPlayer({ videoSrc }: { videoSrc: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRateRef = useRef(1);

  const handleSpeedChange = useCallback(
    (speed: number) => {
      playbackRateRef.current = speed;
      if (videoRef.current) {
        videoRef.current.playbackRate = speed;
      }
    },
    [] // No dependencies - ref values don't affect closure stability
  );

  return (
    <div>
      <video ref={videoRef} src={videoSrc} />
      <button onClick={() => handleSpeedChange(1)}>1x</button>
      <button onClick={() => handleSpeedChange(1.5)}>1.5x</button>
      <button onClick={() => handleSpeedChange(2)}>2x</button>
    </div>
  );
}

// Example 6: useReducer for complex state with closure
interface State {
  count: number;
  multiplier: number;
}

type Action =
  | { type: 'INCREMENT'; payload: number }
  | { type: 'SET_MULTIPLIER'; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + action.payload };
    case 'SET_MULTIPLIER':
      return { ...state, multiplier: action.payload };
    default:
      return state;
  }
}

function ComplexCounter() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    multiplier: 1
  });

  // ✅ dispatch is stable, no closure issues
  const increment = useCallback(
    () => dispatch({ type: 'INCREMENT', payload: state.multiplier }),
    [state.multiplier]
  );

  return (
    <div>
      <div>Count: {state.count}</div>
      <button onClick={increment}>
        Increment by {state.multiplier}
      </button>
    </div>
  );
}
```

### Why It Matters

- **Correctness**: Functions operate on latest data
- **Memoization**: Proper deps enable React memo to work correctly
- **Performance**: Unnecessary re-renders avoided with stable callbacks
- **Debugging**: Stale closures cause mysterious bugs hard to trace
- **Concurrency**: React's concurrent features require stable dependencies

---

# NODE.JS EXAMPLES

## Issue 1: Promise Rejection Not Handled

### Problem
Unhandled promise rejections crash the server or cause silent failures, making errors hard to debug.

### ❌ WRONG - Crashes and Silent Failures

```javascript
// Example 1: Async function without .catch()
async function fetchUserData(userId) {
  const user = await fetch(`/api/users/${userId}`);
  const data = await user.json();
  return data;
}

// Called without error handling
app.get('/user/:id', (req, res) => {
  fetchUserData(req.params.id).then(user => {
    res.json(user);
  });
  // If fetch fails, promise rejects
  // No .catch() means unhandled rejection
  // Server crashes or error is silently logged
});

// Example 2: Fire-and-forget async operations
app.post('/send-email', (req, res) => {
  res.json({ status: 'ok' });
  
  // Email sending happens in background
  sendEmail(req.body.email, req.body.message);
  // If sendEmail promise rejects, nobody knows
  // Email silently fails, user never notified
});

// Example 3: Promise chain without final catch
function processPayment(orderId) {
  return getOrder(orderId)
    .then(order => validateOrder(order))
    .then(order => chargeCard(order))
    .then(result => updateDatabase(result))
    .then(result => sendConfirmation(result));
    // If ANY step rejects and doesn't have .catch(), crash
}

// Example 4: Promise in array without error handling
const promises = [
  fetchUser(1),
  fetchUser(2),
  fetchUser(3),
  fetchUser(4) // One fails, all fail with Promise.all()
];

Promise.all(promises).then(users => {
  console.log('All users:', users);
});
// No .catch() - rejection unhandled

// Example 5: setTimeout with promise rejection
setTimeout(() => {
  riskyAsyncOperation().then(result => {
    console.log(result);
  });
  // No catch - rejection happens after setTimeout
}, 1000);
```

### ✅ CORRECT - Proper Error Handling

```javascript
// Example 1: Always use .catch() or try-catch
async function fetchUserData(userId) {
  const user = await fetch(`/api/users/${userId}`);
  const data = await user.json();
  return data;
}

// With .catch()
app.get('/user/:id', (req, res) => {
  fetchUserData(req.params.id)
    .then(user => {
      res.json(user);
    })
    .catch(error => {
      console.error('Failed to fetch user:', error);
      res.status(500).json({ 
        error: 'Failed to load user',
        message: error.message 
      });
    });
});

// Or with async/await and try-catch
app.get('/user/:id', async (req, res) => {
  try {
    const user = await fetchUserData(req.params.id);
    res.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    res.status(500).json({ 
      error: 'Failed to load user',
      message: error.message 
    });
  }
});

// Example 2: Handle fire-and-forget with error logging
app.post('/send-email', async (req, res) => {
  try {
    res.json({ status: 'ok' });
    
    // Still handle errors even though response already sent
    await sendEmail(req.body.email, req.body.message);
  } catch (error) {
    // Log error but don't crash
    logger.error('Email send failed:', {
      email: req.body.email,
      error: error.message,
      stack: error.stack
    });
    
    // Optional: Notify admin or retry queue
    await addToRetryQueue({
      type: 'email',
      email: req.body.email,
      message: req.body.message,
      error: error.message
    });
  }
});

// Example 3: Promise chain with proper error handling
function processPayment(orderId) {
  return getOrder(orderId)
    .then(order => {
      if (!order) throw new Error('Order not found');
      return validateOrder(order);
    })
    .then(order => chargeCard(order))
    .then(result => updateDatabase(result))
    .then(result => sendConfirmation(result))
    .catch(error => {
      logger.error('Payment processing failed:', {
        orderId,
        error: error.message
      });
      throw error; // Re-throw or handle
    });
}

// Example 4: Safe Promise.all() with error handling
async function fetchAllUsers(userIds) {
  // Option 1: Fail if any fails
  try {
    const users = await Promise.all(
      userIds.map(id => fetchUser(id))
    );
    return users;
  } catch (error) {
    logger.error('Failed to fetch users:', error);
    throw error;
  }
}

// Option 2: Continue even if some fail
async function fetchAllUsersPartial(userIds) {
  const results = await Promise.allSettled(
    userIds.map(id => fetchUser(id))
  );
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      logger.warn(`Failed to fetch user ${userIds[index]}:`, result.reason);
      return null;
    }
  });
}

// Example 5: Wrap async operations with timeout
function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    )
  ]);
}

app.get('/data', async (req, res) => {
  try {
    const data = await withTimeout(
      fetchExternalData(),
      5000 // 5 second timeout
    );
    res.json(data);
  } catch (error) {
    if (error.message === 'Operation timeout') {
      res.status(408).json({ error: 'Request timeout' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Example 6: Global error handler for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise
  });
  
  // Optional: Notify monitoring service
  alerting.sendAlert('Unhandled rejection detected', reason);
});

// Example 7: Async middleware error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));

app.use((error, req, res, next) => {
  logger.error('Request error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});
```

### Why It Matters

- **Reliability**: Unhandled rejections crash production servers
- **Debugging**: Proper error handling provides stack traces
- **User Experience**: Users get error messages instead of timeouts
- **Monitoring**: Can track and alert on errors
- **Data Integrity**: Failed operations can be rolled back or retried

---

## Issue 2: SQL Injection

### Problem
String interpolation in SQL queries allows attackers to inject malicious SQL code.

### ❌ WRONG - Vulnerable to Injection

```javascript
// Example 1: Direct string interpolation
const express = require('express');
const app = express();
const db = require('mysql').createConnection({...});

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  
  // VULNERABLE: Attacker can pass: 1 OR 1=1; DROP TABLE users;--
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Example 2: Template literals with user input
app.post('/search', (req, res) => {
  const searchTerm = req.body.query;
  
  // VULNERABLE
  const query = `
    SELECT * FROM products 
    WHERE name LIKE '%${searchTerm}%'
    OR description LIKE '%${searchTerm}%'
  `;
  
  db.query(query, (err, results) => {
    res.json(results);
  });
  
  // Attacker sends: %' OR '1'='1
  // Query becomes: WHERE name LIKE '%%' OR '1'='1%' - returns everything
});

// Example 3: Dynamic column names without validation
app.get('/sort', (req, res) => {
  const sortBy = req.query.sort; // 'name' or 'price'
  
  // VULNERABLE - even though looks like simple column name
  const query = `SELECT * FROM products ORDER BY ${sortBy}`;
  
  // Attacker sends: sort=id; DELETE FROM products;--
  db.query(query, (err, results) => {
    res.json(results);
  });
});

// Example 4: Concatenation in WHERE clause
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // VULNERABLE
  const query = "SELECT * FROM users WHERE email = '" + email + 
                "' AND password = '" + password + "'";
  
  db.query(query, (err, results) => {
    if (results.length > 0) {
      res.json({ authenticated: true });
    }
  });
  
  // Attacker sends email: ' OR '1'='1
  // Query becomes: WHERE email = '' OR '1'='1' AND password = '...'
  // Returns first user regardless of password
});

// Example 5: Array of values without parameterization
app.post('/bulk-update', (req, res) => {
  const ids = req.body.ids; // [1, 2, 3]
  
  // VULNERABLE
  const query = `UPDATE products SET active = 1 WHERE id IN (${ids.join(',')})`;
  
  db.query(query, (err) => {
    res.json({ updated: true });
  });
  
  // Attacker sends ids: [1), 1=(1; DELETE FROM products;--]
});
```

### ✅ CORRECT - Parameterized Queries

```javascript
const express = require('express');
const app = express();
const mysql = require('mysql2/promise'); // Use promise version

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Example 1: Use ? placeholders for parameters
app.get('/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // ✅ SAFE: Parameter is escaped by driver
    const [results] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    
    res.json(results);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Example 2: Multiple parameters
app.post('/search', async (req, res) => {
  try {
    const searchTerm = req.body.query;
    const limit = req.body.limit || 10;
    
    // ✅ SAFE: Both parameters are parameterized
    const [results] = await pool.query(
      `SELECT * FROM products 
       WHERE name LIKE ? OR description LIKE ?
       LIMIT ?`,
      [`%${searchTerm}%`, `%${searchTerm}%`, limit]
    );
    
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Example 3: Dynamic column names with whitelist
const ALLOWED_SORT_COLUMNS = ['id', 'name', 'price', 'created_at'];

app.get('/sort', async (req, res) => {
  try {
    const sortBy = req.query.sort || 'name';
    const direction = req.query.direction === 'DESC' ? 'DESC' : 'ASC';
    
    // ✅ SAFE: Validate against whitelist before using in query
    if (!ALLOWED_SORT_COLUMNS.includes(sortBy)) {
      return res.status(400).json({ error: 'Invalid sort column' });
    }
    
    // Column name from whitelist (not parameterized - parameters are only for values)
    const query = `SELECT * FROM products ORDER BY ?? ${direction}`;
    const [results] = await pool.query(query, [sortBy]);
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Sort failed' });
  }
});

// Example 4: Login with parameterized query
app.post('/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    
    // ✅ SAFE: Email and password are parameters
    const [results] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND password_hash = ?',
      [email, hashPassword(password)]
    );
    
    if (results.length > 0) {
      res.json({ authenticated: true, user: results[0] });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Example 5: IN clause with array of values
app.post('/bulk-update', async (req, res) => {
  try {
    const ids = req.body.ids; // [1, 2, 3]
    
    // Validate array
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid IDs' });
    }
    
    // Validate each ID is a number
    if (!ids.every(id => Number.isInteger(id) && id > 0)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    
    // ✅ SAFE: Array is parameterized
    const [result] = await pool.query(
      'UPDATE products SET active = 1 WHERE id IN (?)',
      [ids]
    );
    
    res.json({ updated: result.affectedRows });
  } catch (error) {
    res.status(500).json({ error: 'Update failed' });
  }
});

// Example 6: Using ORM (Sequelize) for additional safety
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql'
  }
);

const User = sequelize.define('User', {
  email: DataTypes.STRING,
  passwordHash: DataTypes.STRING
});

app.get('/user/:id', async (req, res) => {
  try {
    // ✅ SAFE: ORM handles parameterization
    const user = await User.findByPk(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'User lookup failed' });
  }
});

// Example 7: Query builder with parameterization
const QueryBuilder = require('some-query-builder');

app.get('/search', async (req, res) => {
  try {
    const builder = new QueryBuilder('products');
    
    if (req.query.name) {
      builder.where('name', 'LIKE', `%${req.query.name}%`);
    }
    if (req.query.minPrice) {
      builder.where('price', '>=', req.query.minPrice);
    }
    
    // ✅ SAFE: Query builder parameterizes all values
    const results = await builder.get();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});
```

### Why It Matters

- **Security**: SQL injection is OWASP Top 10 vulnerability
- **Data Breach**: Attackers can steal, modify, or delete all data
- **Compliance**: PCI-DSS, GDPR violations lead to fines
- **Trust**: Data breaches destroy customer trust
- **Easy to Fix**: Parameterized queries have zero performance cost

---

## Issue 3: No Input Validation

### Problem
Accepting untrusted input without validation leads to errors, security vulnerabilities, and data corruption.

### ❌ WRONG - No Validation

```javascript
// Example 1: Accept any input without checking
app.post('/create-account', (req, res) => {
  const { email, password, age, name } = req.body;
  
  // WRONG: No validation
  const user = {
    email,
    password, // Stored in plain text!
    age,
    name
  };
  
  // Issues:
  // - email could be anything, not a valid email
  // - password too short, no complexity requirements
  // - age could be negative, string, or missing
  // - name could contain special characters or be empty
  
  db.query('INSERT INTO users SET ?', user, (err) => {
    res.json({ success: true });
  });
});

// Example 2: No type validation
app.post('/update-price', (req, res) => {
  const { productId, price } = req.body;
  
  // WRONG: price not validated
  // Could be: -100, "abc", "1e308", NaN
  const newPrice = price;
  
  db.query(
    'UPDATE products SET price = ? WHERE id = ?',
    [newPrice, productId],
    (err) => {
      res.json({ updated: true });
    }
  );
});

// Example 3: No length validation
app.post('/create-post', (req, res) => {
  const { title, content } = req.body;
  
  // WRONG: No length checks
  // title could be 1 char or 1MB
  // content could crash memory
  
  db.query(
    'INSERT INTO posts (title, content) VALUES (?, ?)',
    [title, content],
    (err) => {
      res.json({ created: true });
    }
  );
});

// Example 4: No authentication check
app.delete('/user/:id', (req, res) => {
  // WRONG: No authorization
  // Any logged-in user can delete any user
  
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err) => {
    res.json({ deleted: true });
  });
});

// Example 5: No CSRF token validation
app.post('/transfer-money', (req, res) => {
  const { amount, toAccount } = req.body;
  
  // WRONG: No CSRF protection
  // Attacker can trick user into transferring money
  
  bank.transfer({
    fromAccount: req.user.account,
    toAccount,
    amount
  });
  
  res.json({ transferred: true });
});
```

### ✅ CORRECT - Comprehensive Validation

```javascript
const express = require('express');
const { body, validationResult, param } = require('express-validator');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Example 1: Complete account creation validation
app.post('/create-account', [
  // Validate email
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  
  // Validate password
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain uppercase, lowercase, number, and special char'),
  
  // Validate age
  body('age')
    .isInt({ min: 13, max: 150 })
    .withMessage('Age must be between 13 and 150'),
  
  // Validate name
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { email, password, age, name } = req.body;
    
    // Check if user already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Hash password (✅ NEVER store plain text)
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, age, name) VALUES (?, ?, ?, ?)',
      [email, passwordHash, age, name]
    );
    
    res.status(201).json({
      success: true,
      userId: result.insertId,
      email
    });
  } catch (error) {
    console.error('Account creation error:', error);
    res.status(500).json({ error: 'Account creation failed' });
  }
});

// Example 2: Price validation with type checking
app.post('/update-price', [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID required'),
  
  body('price')
    .isFloat({ min: 0.01, max: 999999 })
    .withMessage('Price must be between $0.01 and $999,999')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { productId, price } = req.body;
    
    // Verify product exists and user has permission
    const [product] = await db.query(
      'SELECT id, owner_id FROM products WHERE id = ?',
      [productId]
    );
    
    if (product.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    if (product[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Update price
    await db.query(
      'UPDATE products SET price = ? WHERE id = ?',
      [parseFloat(price).toFixed(2), productId]
    );
    
    res.json({ success: true, price });
  } catch (error) {
    res.status(500).json({ error: 'Price update failed' });
  }
});

// Example 3: Content length validation
app.post('/create-post', [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be 5-200 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10, max: 50000 })
    .withMessage('Content must be 10-50000 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { title, content } = req.body;
    
    // Additional validation: no HTML/script injection
    if (/<[^>]*>/g.test(title) || /<script/i.test(content)) {
      return res.status(400).json({ error: 'Invalid content format' });
    }
    
    const [result] = await db.query(
      'INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)',
      [req.user.id, title, content]
    );
    
    res.status(201).json({ postId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Post creation failed' });
  }
});

// Example 4: Authorization check
app.delete('/user/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid user ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const userId = parseInt(req.params.id);
    
    // Check authorization
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    // Soft delete instead of hard delete
    await db.query(
      'UPDATE users SET deleted_at = NOW() WHERE id = ?',
      [userId]
    );
    
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Example 5: CSRF protection middleware
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(csrf({ cookie: true }));

app.post('/transfer-money', [
  body('amount')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Invalid amount'),
  
  body('toAccount')
    .trim()
    .matches(/^[A-Z0-9]{10,}$/)
    .withMessage('Invalid account number')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { amount, toAccount } = req.body;
    
    // ✅ CSRF token was already validated by middleware
    
    // Additional checks
    if (toAccount === req.user.account) {
      return res.status(400).json({ error: 'Cannot transfer to self' });
    }
    
    // Check balance
    const [account] = await db.query(
      'SELECT balance FROM accounts WHERE user_id = ? FOR UPDATE',
      [req.user.id]
    );
    
    if (account[0].balance < amount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    // Transfer in transaction
    await db.query('START TRANSACTION');
    
    await db.query(
      'UPDATE accounts SET balance = balance - ? WHERE user_id = ?',
      [amount, req.user.id]
    );
    
    await db.query(
      'UPDATE accounts SET balance = balance + ? WHERE number = ?',
      [amount, toAccount]
    );
    
    await db.query('COMMIT');
    
    res.json({ success: true, transferred: amount });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: 'Transfer failed' });
  }
});

// Validation helper for custom validators
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^(\+1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

app.post('/contact', [
  body('phone')
    .custom(validatePhoneNumber)
    .withMessage('Invalid phone number format')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  res.json({ success: true });
});
```

### Why It Matters

- **Security**: Prevents injection attacks, XSS, CSRF
- **Data Quality**: Ensures data integrity and consistency
- **User Experience**: Clear error messages help users fix input
- **Compliance**: GDPR, PCI-DSS require input validation
- **Debugging**: Validated data is easier to work with downstream

---

## Issue 4: Connection Pool Leak

### Problem
Not returning database connections to the pool exhausts available connections, causing "no connections available" errors.

### ❌ WRONG - Connection Leaks

```javascript
// Example 1: Connection never released
const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'myapp'
});

app.get('/user/:id', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    
    connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, results) => {
      // WRONG: connection.release() never called
      // If error occurs above, connection leaks
      res.json(results);
    });
  });
});

// Problem: After ~10 requests, all connections are exhausted
// New requests hang waiting for connection

// Example 2: Connection not released on error
app.get('/products', (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    
    connection.query('SELECT * FROM products LIMIT ?', [100], (err, results) => {
      if (err) {
        // WRONG: Connection not released before throwing
        throw err;
      }
      
      res.json(results);
      connection.release(); // Only released on success
    });
  });
});

// Example 3: Connection leaked in promise chain
app.get('/data', (req, res) => {
  pool.getConnection()
    .then(connection => {
      return connection.query('SELECT * FROM data')
        .then(results => {
          res.json(results);
          // WRONG: connection never released
        });
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

// Example 4: Nested queries with leaked connections
app.get('/user/:id', (req, res) => {
  pool.getConnection((err, connection) => {
    connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, user) => {
      if (err) {
        // WRONG: connection not released on error
        return res.status(500).json({ error: err.message });
      }
      
      // Need second query
      pool.getConnection((err, connection2) => {
        connection2.query('SELECT * FROM orders WHERE user_id = ?', [user[0].id], (err, orders) => {
          res.json({ user: user[0], orders });
          // WRONG: neither connection released
        });
      });
    });
  });
});
```

### ✅ CORRECT - Proper Connection Management

```javascript
const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  queueLimit: 0
});

// Example 1: Promise-based connection with async/await
app.get('/user/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    // ✅ Connection acquired
    
    const [results] = await connection.query(
      'SELECT * FROM users WHERE id = ?',
      [req.params.id]
    );
    
    res.json(results[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  } finally {
    // ✅ Connection ALWAYS released, even on error
    if (connection) {
      connection.release();
    }
  }
});

// Example 2: Connection pool with query method (automatic release)
app.get('/products', async (req, res) => {
  try {
    // pool.query() automatically gets and releases connection
    // ✅ No manual release needed
    const [results] = await pool.query('SELECT * FROM products LIMIT 100');
    
    res.json(results);
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Example 3: Multiple queries in transaction
app.get('/user-with-orders/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Start transaction
    await connection.beginTransaction();
    
    // First query
    const [user] = await connection.query(
      'SELECT * FROM users WHERE id = ? FOR UPDATE',
      [req.params.id]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Second query
    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE user_id = ? FOR UPDATE',
      [user[0].id]
    );
    
    // Commit transaction
    await connection.commit();
    
    res.json({ user: user[0], orders });
  } catch (error) {
    // ✅ Rollback on error
    if (connection) {
      await connection.rollback();
    }
    
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Transaction failed' });
  } finally {
    // ✅ Always release connection
    if (connection) {
      connection.release();
    }
  }
});

// Example 4: Using connection utility wrapper
async function withConnection(callback) {
  const connection = await pool.getConnection();
  try {
    return await callback(connection);
  } finally {
    connection.release();
  }
}

app.get('/wrapped-example/:id', async (req, res) => {
  try {
    const result = await withConnection(async (connection) => {
      const [user] = await connection.query(
        'SELECT * FROM users WHERE id = ?',
        [req.params.id]
      );
      return user[0];
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Query failed' });
  }
});

// Example 5: Async middleware for automatic connection management
const getConnection = (req, res, next) => {
  pool.getConnection()
    .then(connection => {
      req.connection = connection;
      next();
    })
    .catch(err => {
      res.status(503).json({ error: 'No database connections available' });
    });
};

const releaseConnection = (req, res, next) => {
  if (req.connection) {
    req.connection.release();
  }
  next();
};

app.use(getConnection);
app.use(releaseConnection);

app.get('/middleware-example/:id', async (req, res) => {
  try {
    const [results] = await req.connection.query(
      'SELECT * FROM users WHERE id = ?',
      [req.params.id]
    );
    
    res.json(results[0]);
  } catch (error) {
    res.status(500).json({ error: 'Query failed' });
  }
});

// Example 6: Monitor pool status
setInterval(() => {
  pool.getConnection()
    .then(connection => {
      connection.ping()
        .then(() => {
          console.log('Pool health check OK');
          connection.release();
        })
        .catch(err => {
          console.error('Pool health check failed:', err);
        });
    })
    .catch(err => {
      console.error('Cannot get pool connection:', err);
      // Alert if pool is full
      alert('Database pool may be exhausted');
    });
}, 30000); // Every 30 seconds
```

### Why It Matters

- **Availability**: Pool exhaustion causes app to hang
- **Production Issues**: Slowly degrades until complete failure
- **Cascading Failures**: Timeouts trigger cascading errors
- **Easy to Debug**: Monitor pool stats to identify leaks
- **Resource Waste**: Leaked connections hold memory and locks

---

## Issue 5: No Timeout

### Problem
Requests without timeouts can hang indefinitely, exhausting server resources and freezing the application.

### ❌ WRONG - No Timeouts

```javascript
// Example 1: Fetch without timeout
app.get('/api/data', async (req, res) => {
  // If external API hangs, request never completes
  const response = await fetch('https://external-api.com/data');
  const data = await response.json();
  res.json(data);
});

// Example 2: Database query without timeout
app.get('/search', (req, res) => {
  // Slow query can block entire worker thread
  db.query(
    'SELECT * FROM large_table WHERE complex_condition = ?',
    [req.query.q],
    (err, results) => {
      res.json(results);
    }
  );
});

// Example 3: No timeout on socket connection
const socket = new net.Socket();
socket.connect(80, 'example.com'); // No timeout specified

socket.on('data', (data) => {
  console.log('Data:', data);
});

// Example 4: HTTP request without timeout
const http = require('http');

const request = http.get('http://slow-server.com', (res) => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(data);
  });
});
// No timeout - could hang forever

// Example 5: Multiple async operations without timeout
Promise.all([
  fetch('http://api1.com'),
  fetch('http://api2.com'),
  fetch('http://api3.com')
])
.then(responses => responses.map(r => r.json()))
.catch(err => console.error(err));
// If any request hangs, entire operation hangs
```

### ✅ CORRECT - Proper Timeout Handling

```javascript
const fetch = require('node-fetch');
const AbortController = require('abort-controller');

// Example 1: Fetch with abort timeout
app.get('/api/data', async (req, res) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort(); // Abort after 5 seconds
  }, 5000);

  try {
    const response = await fetch('https://external-api.com/data', {
      signal: controller.signal,
      timeout: 5000 // Additional node-fetch timeout
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'API request timeout' });
    } else {
      res.status(500).json({ error: 'API request failed' });
    }
  } finally {
    clearTimeout(timeout);
  }
});

// Example 2: Database query timeout
app.get('/search', async (req, res) => {
  try {
    const results = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(
        () => reject(new Error('Query timeout')),
        10000 // 10 second limit
      );

      db.query(
        'SELECT * FROM large_table WHERE complex_condition = ? LIMIT 100',
        [req.query.q],
        (err, results) => {
          clearTimeout(timeoutId);
          if (err) reject(err);
          resolve(results);
        }
      );
    });

    res.json(results);
  } catch (error) {
    if (error.message === 'Query timeout') {
      res.status(504).json({ error: 'Database query timeout' });
    } else {
      res.status(500).json({ error: 'Query failed' });
    }
  }
});

// Example 3: Socket with timeout
const net = require('net');

const socket = new net.Socket();
socket.setTimeout(5000); // 5 second timeout

socket.on('timeout', () => {
  console.log('Socket timeout');
  socket.destroy();
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

socket.connect(80, 'example.com');

// Example 4: HTTP request with timeout
const http = require('http');

const request = http.get('http://slow-server.com', (res) => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(data);
  });
});

// ✅ Set timeout
request.setTimeout(5000, () => {
  request.destroy();
  console.error('Request timeout');
});

request.on('error', (error) => {
  console.error('Request error:', error);
});

// Example 5: Promise.race with timeout
function withTimeout(promise, timeoutMs, timeoutError = 'Operation timeout') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    )
  ]);
}

app.get('/multi-api', async (req, res) => {
  try {
    const [data1, data2, data3] = await Promise.all([
      withTimeout(fetch('http://api1.com').then(r => r.json()), 5000),
      withTimeout(fetch('http://api2.com').then(r => r.json()), 5000),
      withTimeout(fetch('http://api3.com').then(r => r.json()), 5000)
    ]);

    res.json({ data1, data2, data3 });
  } catch (error) {
    res.status(504).json({ error: error.message });
  }
});

// Example 6: Express middleware for request timeout
const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      res.status(504).json({ error: 'Request timeout' });
    }, timeoutMs);

    // Clear timeout if response is sent
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
};

app.use(requestTimeout(30000)); // 30 second global timeout

// Example 7: Axios with timeout
const axios = require('axios');

app.get('/axios-example', async (req, res) => {
  try {
    const response = await axios.get('https://api.example.com/data', {
      timeout: 5000 // 5 second timeout
    });

    res.json(response.data);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'Request timeout' });
    } else {
      res.status(500).json({ error: 'Request failed' });
    }
  }
});

// Example 8: Retry with backoff and timeout
async function fetchWithRetry(url, options = {}) {
  const {
    maxRetries = 3,
    timeoutMs = 5000,
    backoffMs = 1000
  } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(
        fetch(url),
        timeoutMs,
        `Attempt ${attempt} timeout`
      );
    } catch (error) {
      if (attempt === maxRetries) throw error;

      const delayMs = backoffMs * (2 ** (attempt - 1));
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

app.get('/retry-example', async (req, res) => {
  try {
    const response = await fetchWithRetry('https://api.example.com/data', {
      maxRetries: 3,
      timeoutMs: 5000,
      backoffMs: 1000
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(504).json({ error: 'Failed after retries' });
  }
});
```

### Why It Matters

- **Resource Protection**: Prevents thread/connection exhaustion
- **User Experience**: Users don't wait 30+ minutes for response
- **Cascading Failures**: Hung requests can trigger other timeouts
- **Monitoring**: Timeouts let you detect slow external services
- **Cost**: Prevents infinite resource consumption

---
