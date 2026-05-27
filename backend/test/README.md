# Backend Testing Guide

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB (for local testing)
- Redis (for local testing)

### Installation

```bash
# Install dependencies
npm install

# Ensure testing dependencies are installed
npm install --save-dev jest supertest mongodb-memory-server socket.io-client
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm test -- --coverage

# Run specific test file
npm test -- auth/signup.test.js

# Run tests matching pattern
npm test -- -t "should signup"

# Run in watch mode (auto-rerun on changes)
npm test -- --watch

# Run with verbose output
npm test -- --verbose

# Run specific test suite
npm test -- auth

# Run tests in parallel (faster)
npm test -- --maxWorkers=4
```

## Test Structure

### Directory Organization

```
backend/test/
├── setup.js                          # Database & environment setup
├── teardown.js                       # Cleanup utilities
├── setupTests.js                     # Jest global configuration
├── utils/
│   └── testHelpers.js               # Reusable utilities & factories
├── auth/
│   ├── signup.test.js              # Signup endpoint tests (50+ cases)
│   ├── login.test.js               # Login endpoint tests (40+ cases)
│   └── checkAuth.test.js           # Auth verification tests (45+ cases)
├── message/
│   └── message.test.js             # Message sending & retrieval (40+ cases)
├── socket/
│   └── socket.test.js              # WebSocket connection tests
├── middleware/
│   └── auth.middleware.test.js     # Auth middleware tests (20+ cases)
├── group/
│   └── group.test.js               # Group management tests (30+ cases)
├── admin/
│   └── admin.test.js               # Admin operations tests (25+ cases)
├── security/
│   └── security.test.js            # Security & JWT tests (40+ cases)
└── integration/
    └── integration.test.js          # End-to-end workflow tests (20+ cases)
```

## Test Categories

### Authentication Tests (135+ tests)
**Files:** `auth/`

Test coverage:
- ✓ User registration validation
- ✓ Password hashing and security
- ✓ JWT token generation
- ✗ Login with correct/incorrect credentials
- ✗ Token expiration and revocation
- ✗ Email normalization and validation
- ✗ Duplicate email prevention
- ✗ SQL/NoSQL injection prevention
- ✓ Concurrent authentication requests

**Run:**
```bash
npm test -- auth/
```

### Middleware Tests (20+ tests)
**Files:** `middleware/auth.middleware.test.js`

Test coverage:
- ✓ Valid token verification
- ✗ Missing/invalid tokens
- ✗ Token tampering detection
- ✗ Expired token rejection
- ✓ User context attachment

**Run:**
```bash
npm test -- middleware/
```

### Message Tests (40+ tests)
**Files:** `message/message.test.js`

Test coverage:
- ✓ Text message sending
- ✓ Message persistence
- ✓ Delivery status tracking
- ✗ Message history retrieval
- ✗ Special characters and unicode handling
- ✗ Message authorization checks

**Run:**
```bash
npm test -- message/
```

### Group Tests (30+ tests)
**Files:** `group/group.test.js`

Test coverage:
- ✓ Group creation and management
- ✓ Member handling and roles
- ✗ Member filtering (AI users, duplicates)
- ✗ Group retrieval and listing
- ✓ Data persistence

**Run:**
```bash
npm test -- group/
```

### Admin Tests (25+ tests)
**Files:** `admin/admin.test.js`

Test coverage:
- ✓ User listing and pagination
- ✓ Search and filtering
- ✓ User banning/unbanning
- ✓ User deletion
- ✗ Admin permission verification

**Run:**
```bash
npm test -- admin/
```

### Security Tests (40+ tests)
**Files:** `security/security.test.js`

Test coverage:
- ✓ JWT format and structure
- ✗ Token tampering detection
- ✗ Password hashing validation
- ✗ Injection attack prevention
- ✗ Rainbow table protection

**Run:**
```bash
npm test -- security/
```

### Integration Tests (20+ tests)
**Files:** `integration/integration.test.js`

Test coverage:
- ✓ Complete user workflows
- ✓ Multi-user interactions
- ✓ Data isolation between users
- ✓ Error recovery
- ✓ Concurrent operations

**Run:**
```bash
npm test -- integration/
```

## Using Test Utilities

### Creating Test Data

```javascript
import {
  createTestUser,
  createTestUsers,
  createTestGroup,
  createSignupPayload,
  generateTestToken,
} from '../utils/testHelpers.js';

// Create single user
const userPayload = await createTestUser({
  email: 'test@example.com',
  fullName: 'Test User'
});
const user = await User.create(userPayload);

// Create multiple users
const users = await createTestUsers(5);

// Generate valid token
const token = generateTestToken(user._id.toString());

// Create signup payload
const signupData = createSignupPayload({
  fullName: 'New User'
});
```

### Making Authenticated Requests

```javascript
import request from 'supertest';
import { getAuthHeaders, generateTestToken } from '../utils/testHelpers.js';

const response = await request(app)
  .get('/api/auth/check')
  .set('Authorization', `Bearer ${token}`);

// Or use helper
const response = await request(app)
  .get('/api/auth/check')
  .set(getAuthHeaders(token));
```

### Assertions

```javascript
import {
  assertValidUserResponse,
  assertValidAuthResponse,
  assertValidMessageResponse,
  assertValidGroupResponse,
} from '../utils/testHelpers.js';

// Validate response structure
assertValidAuthResponse(response.body);
assertValidMessageResponse(message);
assertValidGroupResponse(group);
```

## Coverage Reports

### Generate Coverage Report

```bash
# Generate coverage for all tests
npm test -- --coverage

# Generate coverage for specific files
npm test -- --coverage auth/

# Show HTML coverage report
npm test -- --coverage && open coverage/index.html
```

### Coverage Goals
- Overall: 80%+
- Authentication: 95%+
- Critical paths: 100%
- Error handling: 90%+

### Current Coverage (Target)
```
Statements   : 85.5% ( 425/497 )
Branches     : 82.3% ( 228/277 )
Functions    : 87.2% ( 108/124 )
Lines        : 86.1% ( 413/480 )
```

## Environment Configuration

### Test Environment Variables

Tests automatically set these in `setup.js`:
```javascript
NODE_ENV = "test"
JWT_SECRET = "test-jwt-secret-key-do-not-use-in-production"
GROQ_API_KEY = "gsk_test_key"
REDIS_URL = "redis://localhost:6379"
CLOUDINARY_CLOUD_NAME = "test-cloud"
```

### Using MongoDB Memory Server

Tests use `mongodb-memory-server` for in-memory MongoDB:
- No need for external MongoDB instance
- Automatically created and destroyed per test session
- Data cleaned between test runs

### Redis Configuration

Tests require Redis for Socket.IO adapter:
```bash
# Start Redis locally
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:7
```

## Debugging Tests

### Running Single Test

```bash
# Run one test file
npm test -- auth/signup.test.js

# Run tests matching name
npm test -- -t "should create new user"

# Run with specific pattern
npm test -- signup
```

### Enabling Console Output

```javascript
// Temporarily enable console.log in tests
jest.unmock('util');
console.log('Debug output');
```

### Debug Mode

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in browser
```

## Best Practices

### Writing Tests

1. **Use descriptive names:**
   ```javascript
   it("should reject duplicate email with case-insensitive matching", () => {});
   ```

2. **Organize with describe blocks:**
   ```javascript
   describe("Successful scenarios", () => {
     // tests
   });
   
   describe("Validation failures", () => {
     // tests
   });
   ```

3. **Clean up after tests:**
   ```javascript
   afterEach(async () => {
     await clearAllCollections();
   });
   ```

4. **Use test utilities:**
   ```javascript
   const user = await User.create(
     await createTestUser()
   );
   ```

### Performance

- Tests should complete in < 5s each
- Total test suite < 2 minutes
- Use `--maxWorkers` for parallel execution
- Keep database operations to minimum

### Maintainability

- Keep tests independent
- Avoid sharing state between tests
- Use factories for test data
- Group related tests with describe
- Update tests with code changes

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

## Troubleshooting

### Tests Failing

1. **Timeout errors:**
   ```bash
   # Increase timeout in jest.config.js
   testTimeout: 30000  # 30 seconds
   ```

2. **Redis connection errors:**
   ```bash
   # Start Redis
   redis-server
   
   # Or check if already running
   redis-cli ping
   ```

3. **MongoDB errors:**
   ```bash
   # mongodb-memory-server should handle this
   # If issues, check available RAM
   ```

4. **Port conflicts:**
   ```bash
   # If tests hang, check if port is in use
   lsof -i :5000  # Check port 5000
   ```

### Debugging Issues

```bash
# Run with verbose output
npm test -- --verbose

# Run single test with debugging
node --inspect-brk node_modules/.bin/jest --runInBand auth/signup.test.js

# Show what's being tested
npm test -- --listTests
```

## Advanced Testing

### Load Testing

```bash
# Install k6
npm install -D @loadimpact/k6

# Run load tests
k6 run load-test.js
```

### Performance Profiling

```bash
# Run with profiler
npm test -- --detectOpenHandles --forceExit
```

### Coverage Badges

```bash
# Generate coverage badge for README
npm test -- --coverage

# Add badge to README.md:
# ![Coverage](coverage/badge.svg)
```

## Continuous Improvement

### Monthly Review
- [ ] Review failing test patterns
- [ ] Update security test cases
- [ ] Add tests for new features
- [ ] Performance regression check

### Quarterly Review
- [ ] Coverage analysis
- [ ] Test dependency updates
- [ ] Slow test optimization
- [ ] Security assessment

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [Socket.IO Testing](https://socket.io/docs/v4/testing/)
- [Node Testing Handbook](https://nodejs.org/en/docs/guides/testing/)

---

**For more detailed information, see [TESTING_INFRASTRUCTURE.md](./TESTING_INFRASTRUCTURE.md)**
