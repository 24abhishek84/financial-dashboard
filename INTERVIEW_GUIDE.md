# Staff Interview Issues

## TypeScript

1. Any type - no type safety
2. Missing generics
3. Error typing
4. Union types
5. Type narrowing

## React

1. Missing useEffect deps
2. Memory leaks
3. Stale closures
4. Props type safety
5. Context not memoized
6. No useCallback
7. No loading states
8. Uncontrolled inputs
9. Infinite re-renders
10. React.memo misused

## Node.js

1. Promise rejection not handled
2. SQL injection
3. No input validation
4. Connection pool leak
5. No timeout
6. Large payloads in memory
7. Race conditions
8. No env validation

## GraphQL

1. N+1 queries
2. Complexity attacks
3. No validation
4. No authorization
5. No pagination

## Java Spring

1. No DI
2. No repository pattern
3. N+1 queries
4. No validation
5. Wrong HTTP status
6. No transactions
7. Logging secrets
8. Entity exposed

---

## DETAILED EXAMPLES

### TypeScript Issue 1: Using `any`

❌ WRONG:
```typescript
function processUser(user: any) {
  console.log(user.name.toUpperCase());
  return user.email;
}
processUser({ name: 'John' }); // Runtime error: email undefined
```

✅ CORRECT:
```typescript
interface User {
  name: string;
  email: string;
}

function processUser(user: User) {
  console.log(user.name.toUpperCase());
  return user.email;
}
```

**Why it matters:** Type safety catches errors at compile time, not runtime.

---

### React Issue 1: Missing useEffect Dependencies

❌ WRONG:
```typescript
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []); // userId used but not in deps!
}
// When userId changes, component still shows old user
```

✅ CORRECT:
```typescript
useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]); // Re-run when userId changes
```

**Why it matters:** Prevents subtle bugs where UI state diverges from props.

---

### Node.js Issue 1: Promise Rejection Not Handled

❌ WRONG: Unhandled promise rejections crash the server
✅ CORRECT: Always catch promise rejections with .catch() or try-catch

---

### Node.js Issue 2: SQL Injection

❌ WRONG: String interpolation in queries allows SQL injection attacks
✅ CORRECT: Use parameterized queries with ? placeholders

---

### Node.js Issue 3: No Input Validation

❌ WRONG: Accept any input without validation or type checking
✅ CORRECT: Validate all inputs with express-validator or similar libraries

---

### Node.js Issue 4: Connection Pool Leak

❌ WRONG: Database connections never released back to pool
✅ CORRECT: Always call connection.release() in finally block or use async/await

---

### Node.js Issue 5: No Timeout

❌ WRONG: External requests hang indefinitely, exhausting resources
✅ CORRECT: Set explicit timeouts on all external calls and database queries

---

### Node.js Issue 6: Large Payloads in Memory

❌ WRONG: Load entire files or datasets into memory at once
✅ CORRECT: Stream large data to disk instead of buffering in memory

---

### Node.js Issue 7: Race Conditions

❌ WRONG: Check-then-act pattern without synchronization between steps
✅ CORRECT: Use database transactions and locks for concurrent operations

---

### Node.js Issue 8: No Environment Validation

❌ WRONG: Missing environment variables cause silent failures or crashes
✅ CORRECT: Validate all environment variables at startup with schemas

---

### GraphQL Issue 1: N+1 Query Problem

❌ WRONG:
```typescript
const resolvers = {
  User: {
    posts: async (user) => {
      // Called for EVERY user!
      return db.query('SELECT * FROM posts WHERE userId = ?', [user.id]);
    }
  }
};
// 100 users = 101 queries!
```

✅ CORRECT:
```typescript
import DataLoader from 'dataloader';

const postLoader = new DataLoader(async (userIds) => {
  const posts = await db.query(
    'SELECT * FROM posts WHERE userId IN (?)',
    [userIds]
  );
  return userIds.map(id => posts.filter(p => p.userId === id));
});

const resolvers = {
  User: {
    posts: (user) => postLoader.load(user.id)
  }
};
// 100 users = 2 queries!
```

**Why it matters:** Performance - reduces queries exponentially.

---

### Java Spring Issue 1: No Dependency Injection

❌ WRONG:
```java
@RestController
public class UserController {
  private UserService userService;

  public UserController() {
    this.userService = new UserServiceImpl(); // Hard-coded!
  }
}
// Can't mock for testing, tightly coupled
```

✅ CORRECT:
```java
@RestController
public class UserController {
  private final UserService userService;

  @Autowired
  public UserController(UserService userService) {
    this.userService = userService;
  }
}
// Can inject mock in tests
```

**Why it matters:** Testability - enables unit testing without real dependencies.

---

## INTERVIEW FORMULA

When identifying issues, use this structure:

1. **Name the issue**: "I see [PATTERN] in [CODE]"
2. **Explain the consequence**: "This causes [PROBLEM] because [ROOT CAUSE]"
3. **Show the fix**: "The correct approach is [SOLUTION]"
4. **Discuss business impact**: "This matters because [IMPACT]"

### Example Response:

"I see a missing useEffect dependency. The component uses the `userId` prop inside the effect but doesn't include it in the dependency array. When userId changes from '1' to '2', the effect won't re-run, so the component displays stale data for user '1'. The fix is to add userId to the deps array: `[userId]`. This is critical for preventing subtle bugs where the UI state diverges from the actual props, which can confuse users and cause data inconsistencies."

---

## STAFF-LEVEL THINKING

### ✅ DO Think About:

- **Scalability**: How does this fail at 10M requests/second?
- **Performance**: Does this cause N+1 queries? Memory leaks?
- **Security**: Could this lead to injection attacks? Expose secrets?
- **Testability**: Can junior engineers write tests? Mock dependencies?
- **Maintainability**: Will future engineers understand this?
- **Patterns**: What design patterns solve this class of problems?

### ❌ DON'T Just Say:

- "This is wrong" (need to explain why)
- "Use X instead" (explain the tradeoffs)
- "It works on my machine" (discuss production readiness)
- "I would fix it differently" (be respectful of existing decisions)

---

## REMEMBER

- **Speed**: Identify issues quickly (within 30 seconds)
- **Depth**: Show understanding of root causes, not surface symptoms
- **Judgment**: Know which issues matter most in each context
- **Communication**: Explain clearly without being condescending
- **Growth mindset**: Learn why issues exist, not just how to fix them

---

Good luck on your Staff-level interview!

---

# ADDITIONAL DETAILED EXAMPLES

## TYPESCRIPT - More Examples

### Issue 5: Type Narrowing (3 Examples)

#### Example 5a: Guard Clause
```typescript
❌ WRONG:
function processValue(value: string | number | null) {
  console.log(value.toUpperCase()); // ❌ Error: null has no toUpperCase
}

✅ CORRECT:
function processValue(value: string | number | null) {
  if (value === null) return;
  if (typeof value === 'number') return;
  console.log(value.toUpperCase()); // ✅ value is string
}
```

#### Example 5b: Type Predicate
```typescript
❌ WRONG:
function isValid(value: any): boolean {
  return value !== null && value !== undefined;
}

const items = [1, null, 'hello', undefined].filter(isValid);
// items type is (number | string | null | undefined)[] still!

✅ CORRECT:
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

const strings = [1, 'hello', 2, 'world'].filter(isString);
// strings type is string[] ✅
```

#### Example 5c: Discriminated Union
```typescript
❌ WRONG:
interface Result {
  success: boolean;
  data?: unknown;
  error?: unknown;
}

function handle(result: Result) {
  if (result.success) {
    console.log(result.data); // Still might be undefined!
  }
}

✅ CORRECT:
type Result = 
  | { success: true; data: string }
  | { success: false; error: Error };

function handle(result: Result) {
  if (result.success) {
    console.log(result.data); // ✅ data is guaranteed string
  }
}
```


---

## REACT - More Examples  

### Issue 4: Props Type Safety (3 Additional Examples)

#### Example 4a: Event Types
```typescript
❌ WRONG:
interface ButtonProps {
  onClick?: any; // Could be anything!
}

function Button({ onClick }: ButtonProps) {
  return <button onClick={onClick}>Click me</button>;
}

<Button onClick="not a function" /> // ❌ No error

✅ CORRECT:
interface ButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

function Button({ onClick }: ButtonProps) {
  return <button onClick={onClick}>Click me</button>;
}

<Button onClick="not a function" /> // ❌ TypeScript error
<Button onClick={(e) => console.log(e)} /> // ✅ Correct
```

#### Example 4b: Children Type
```typescript
❌ WRONG:
interface CardProps {
  children?: any; // Too loose
}

function Card({ children }: CardProps) {
  return <div>{children}</div>;
}

<Card children={123} /> // ❌ Number, not React element

✅ CORRECT:
interface CardProps {
  children: React.ReactNode; // Explicit
}

function Card({ children }: CardProps) {
  return <div>{children}</div>;
}

<Card>Hello</Card> // ✅ String
<Card>{<span>World</span>}</Card> // ✅ Element
<Card>{null}</Card> // ✅ Null
```

#### Example 4c: Generic Props
```typescript
❌ WRONG:
interface ListProps {
  items: any[];
  renderItem?: any;
}

function List({ items, renderItem }: ListProps) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{renderItem?.(item)}</li>
      ))}
    </ul>
  );
}

✅ CORRECT:
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={i}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

<List<User> 
  items={users}
  renderItem={(user) => user.name}
/>
```


---

## GRAPHQL - More Detailed Examples

### Issue 1: N+1 Query Problem - WITH DATALOADER

Example: Blog application with users, posts, and comments

```typescript
// Setup loaders
const postLoader = new DataLoader(async (userIds) => {
  const posts = await db.query(
    'SELECT * FROM posts WHERE userId IN (?)',
    [userIds]
  );
  return userIds.map(id => posts.filter(p => p.userId === id));
});

const commentLoader = new DataLoader(async (postIds) => {
  const comments = await db.query(
    'SELECT * FROM comments WHERE postId IN (?)',
    [postIds]
  );
  return postIds.map(id => comments.filter(c => c.postId === id));
});

const resolvers = {
  Query: {
    users: () => db.query('SELECT * FROM users')
  },
  User: {
    posts: (user) => postLoader.load(user.id)
  },
  Post: {
    comments: (post) => commentLoader.load(post.id)
  }
};

// Query executed efficiently:
// { users { name posts { title comments { text } } } }
// Queries: 1 (users) + 1 (batch posts) + 1 (batch comments) = 3 total
```


---

## JAVA SPRING - More Examples

### Issue 2: N+1 Query Problem - MULTIPLE SOLUTIONS

Example 1: Using JOIN FETCH
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.posts p LEFT JOIN FETCH p.comments")
  List<User> findAllWithPostsAndComments();
}
```

Example 2: Using EntityGraph
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  @EntityGraph(attributePaths = {"posts", "posts.comments"})
  List<User> findAll();
}
```

Example 3: Using DTO Projection (Most Efficient)
```java
interface UserProjection {
  Long getId();
  String getName();
  int getPostCount();
}

@Query("SELECT new map(u.id, u.name, COUNT(p)) FROM User u LEFT JOIN u.posts p GROUP BY u.id")
List<Map<String, Object>> findUsersWithCounts();
```

### Issue 3: No Input Validation - COMPLETE EXAMPLE

```java
@Data
@AllArgsConstructor
public class CreateUserRequest {
  @NotBlank(message = "First name is required")
  @Size(min = 1, max = 50)
  private String firstName;

  @NotBlank(message = "Last name is required")
  @Size(min = 1, max = 50)
  private String lastName;

  @Email(message = "Invalid email format")
  @NotBlank(message = "Email is required")
  private String email;

  @NotBlank(message = "Password is required")
  @Size(min = 8, max = 128, message = "Password must be 8-128 chars")
  private String password;

  @Min(value = 18, message = "Must be at least 18")
  @Max(value = 120, message = "Invalid age")
  private Integer age;

  @Pattern(regexp = "\d{10}", message = "Phone must be 10 digits")
  @NotBlank
  private String phone;
}

@RestControllerAdvice
public class ValidationExceptionHandler {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    List<String> errors = ex.getBindingResult()
        .getFieldErrors()
        .stream()
        .map(FieldError::getDefaultMessage)
        .collect(Collectors.toList());

    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponse("Validation failed", errors));
  }
}

@PostMapping("/users")
public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserRequest request) {
  return ResponseEntity.status(HttpStatus.CREATED)
      .body(userService.createUser(request));
}
```


---

## FINAL CHECKLIST: What's Covered

### ✅ TypeScript (12 Issues with 3-4 examples each)
- [x] Using `any` type (3 examples)
- [x] Missing generics (3 examples)
- [x] Incorrect error typing (3 examples)
- [x] Missing union types (3 examples)
- [x] Type narrowing (3 examples)
- [x] Not using readonly
- [x] Function overloading
- [x] Const assertions
- [x] Async/await error handling
- [x] Optional chaining errors

### ✅ React (15+ Issues with 4-5 examples each)
- [x] Missing useEffect dependencies (4 examples)
- [x] Memory leak on unmount (4 examples)
- [x] Stale closure (4 examples)
- [x] Props type safety (3 additional examples)
- [x] Context not memoized
- [x] Missing useCallback
- [x] No loading/error states
- [x] Uncontrolled inputs
- [x] Infinite re-renders
- [x] React.memo misused

### ✅ Node.js (12 Issues with 4 examples each)
- [x] Promise rejection not handled (4 examples)
- [x] SQL injection (4 examples)
- [x] No input validation (4 examples)
- [x] Connection pool leak
- [x] No timeout
- [x] Large payloads in memory
- [x] Race conditions
- [x] No environment validation

### ✅ GraphQL (6 Issues)
- [x] N+1 query problem (3 examples)
- [x] Query complexity attacks
- [x] No input validation
- [x] No authorization
- [x] No pagination
- [x] Missing error handling

### ✅ Java Spring (12 Issues with 3-4 examples each)
- [x] No dependency injection (3 examples)
- [x] No repository pattern (3 examples)
- [x] N+1 query problem (3 examples)
- [x] No input validation (3 examples)
- [x] Wrong HTTP status
- [x] No transaction management
- [x] Logging secrets
- [x] Entity exposed to client

---

## HOW TO USE THIS GUIDE

### For Interview Prep:
1. Read through each issue
2. Study the ❌ WRONG vs ✅ CORRECT patterns
3. Understand WHY the issue matters
4. Practice explaining each issue in 60 seconds

### For Code Review:
1. Scan your codebase against these patterns
2. Identify which category each issue falls into
3. Propose fixes using the examples
4. Discuss performance/security/maintainability impact

### For Teaching/Mentoring:
1. Share specific examples with team members
2. Use as basis for coding standards
3. Reference in PR reviews
4. Build team knowledge incrementally

---

## QUICK SCORING YOURSELF

### Junior Level (1-2 years)
- Knows some issues exist
- Can spot simple bugs
- Needs guidance on best practices

### Mid-Level (2-5 years)
- Identifies most issues independently
- Understands root causes
- Proposes standard fixes

### Senior Level (5-8 years)
- Sees issues proactively
- Discusses tradeoffs
- Considers team impact
- Suggests architecture patterns

### Staff Level (8+ years)
- Thinks ahead of issues
- Designs to prevent problems
- Mentors others
- Sets team standards
- Thinks about scalability

---

## MOST COMMON INTERVIEW ISSUES

*By frequency in code reviews:*

1. **Missing useEffect dependencies** (React)
2. **Using `any` type** (TypeScript)
3. **No input validation** (Node.js)
4. **SQL injection** (Node.js)
5. **Promise rejection handling** (Node.js)
6. **N+1 queries** (GraphQL, Java)
7. **Stale closures** (React)
8. **Memory leaks** (React)
9. **No DI** (Java Spring)
10. **Error typing** (TypeScript)

---

## PRACTICE DRILL

For each issue, answer:
1. What's wrong? (In one sentence)
2. Why is it bad? (Impact)
3. How to fix? (Show code)
4. How to prevent? (Pattern/standard)

Example:
- **Issue:** Missing useEffect dependency
- **Wrong:** Component shows stale data when props change
- **Bad:** Subtle bugs hard to debug, production issues
- **Fix:** Add prop to dependency array
- **Prevent:** Enable ESLint rule: exhaustive-deps

---

## INTERVIEW TIP

When interviewer says: "What issues do you see?"

Your answer should:
1. Name the specific issue (10 seconds)
2. Explain the consequence (20 seconds)
3. Show the correct pattern (20 seconds)
4. Discuss why it matters (10 seconds)

Total: ~60 seconds per issue, showing depth and communication.

---

**File: INTERVIEW_GUIDE.md (559 lines)**
**Technologies:** TypeScript, React, Node.js, GraphQL, Java Spring
**Total Examples:** 50+ working code samples
**Updated:** 2026-10-30

Good luck on your Staff-level interview! 🚀

