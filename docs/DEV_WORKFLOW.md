# 🔄 Developer Workflow & Best Practices

## Overview

This guide establishes the workflow and standards for contributing to PASO.

---

## Git Workflow

### Branch Strategy

PASO uses **Git Flow** with the following branch types:

```
main (production)
  ↓
release/v1.x.x (prepare for release)
  ↓
develop (integration branch)
  ├─ feature/user-feature
  ├─ feature/messaging-feature
  ├─ fix/bug-fix
  └─ docs/documentation-update
```

**Branch naming convention**:

```
feature/short-description      # New feature
fix/bug-description            # Bug fix
docs/topic                     # Documentation
refactor/component-name        # Code refactor
perf/optimization              # Performance improvement
test/test-name                 # Test additions
chore/task                     # Maintenance task
```

### Creating a Feature Branch

```bash
# 1. Sync with upstream
git fetch upstream
git rebase upstream/develop

# 2. Create feature branch from develop
git checkout -b feature/add-typing-indicators

# 3. Make commits
git add .
git commit -m "feat: Add typing indicator events to Socket.IO"

# 4. Push to your fork
git push origin feature/add-typing-indicators

# 5. Open Pull Request on GitHub
# Target: develop branch (NOT main)
```

### Commit Message Standards

**Format**:
```
<type>: <subject>

<body>

<footer>
```

**Type**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no functional change)
- `refactor`: Code refactor
- `perf`: Performance improvement
- `test`: Test additions/changes
- `chore`: Maintenance, dependencies

**Example**:
```
feat: Add typing indicators to group messages

- Emit 'typing' event when user starts typing
- Emit 'stopTyping' when user stops or sends
- Display typing status in UI with animated dots
- Clear typing status on disconnect

Fixes #123
```

**Subject line**:
- Imperative mood ("add" not "added" or "adds")
- No period at end
- Max 50 characters
- Lowercase

**Body**:
- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line

**Footer**:
- Reference issues: `Fixes #123` or `Closes #456`
- Breaking changes: `BREAKING CHANGE: description`

---

## Pull Request Process

### Before Opening PR

1. **Tests pass locally**
   ```bash
   npm test -- --coverage
   ```

2. **Code style correct**
   ```bash
   npm run lint -- --fix
   npm run format
   ```

3. ✅ **No console.log statements** (except debug code)

4. ✅ **No hardcoded secrets or credentials**

5. ✅ **Manual testing completed**
   - Feature works as expected
   - No breaking changes
   - Doesn't break existing functionality

### Opening a PR

**Title format**:
```
[Type] Brief description of changes
```

Example: `[feat] Add typing indicators to group chat`

**Description template**:

```markdown
## Description
Brief explanation of changes

## Changes Made
- [ ] Change 1
- [ ] Change 2
- [ ] Change 3

## Testing Done
- [ ] Manual testing completed
- [ ] All tests passing
- [ ] Coverage maintained

## Screenshots/Demo
[If applicable: Add screenshots or video]

## Related Issues
Fixes #123
Related to #456

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes
```

### Code Review Standards

**For Authors**:
- ✅ Be open to feedback
- ✅ Respond to all comments
- ✅ Request re-review after changes
- ✅ Thank reviewers

**For Reviewers**:
- ✅ Review within 24 hours if possible
- ✅ Be constructive in feedback
- ✅ Approve when satisfied
- ✅ Request changes if needed (not optional)

### Approval & Merging

**Required**:
- [ ] 1+ approvals (for documentation)
- [ ] 2+ approvals (for code changes)
- [ ] All CI checks passing
- [ ] No merge conflicts

**Merge strategy**: Squash commits on merge (keeps history clean)

---

## Local Development Workflow

### Daily Workflow

```bash
# Morning: sync with upstream
git fetch upstream
git rebase upstream/develop

# Work on feature
git checkout feature/your-feature
# ... make changes ...

# Commit changes frequently
git add src/components/NewFeature.jsx
git commit -m "feat: Add component skeleton"

git add src/utils/newUtil.js
git commit -m "feat: Add utility function"

# Test before pushing
npm test
npm run lint

# Push to fork
git push origin feature/your-feature
```

### Handling Merge Conflicts

```bash
# Before opening PR, ensure no conflicts
git fetch upstream
git rebase upstream/develop

# If conflicts arise
# Git will mark conflicts in files
# Edit files to resolve
# Then:
git add .
git rebase --continue

# Force push (safe with rebase)
git push origin feature/your-feature --force-with-lease
```

### Syncing Fork with Upstream

```bash
# Set upstream if not done
git remote add upstream https://github.com/CodePlaygroundHub/paso-chat-app.git

# Sync develop branch
git fetch upstream
git checkout develop
git rebase upstream/develop
git push origin develop

# Sync feature branch
git checkout feature/your-feature
git rebase upstream/develop
git push origin feature/your-feature --force-with-lease
```

---

## Code Quality Standards

### TypeScript/JavaScript

```javascript
// ✅ Good: Clear, well-commented
export const validateMessage = (message) => {
  // Ensure message content exists and is not empty
  if (!message?.content?.trim()) {
    throw new Error('Message content is required');
  }

  // Check length constraints (min 1, max 10000 chars)
  if (message.content.length > 10000) {
    throw new Error('Message exceeds maximum length');
  }

  return true;
};

// ❌ Bad: No comments, unclear
const vm = (m) => {
  if (!m?.c?.trim() || m.c.length > 10000) throw new Error('Bad msg');
  return true;
};
```

### Naming Conventions

```javascript
// ✅ Clear, intention-obvious names
const getUserMessages = (userId) => { }
const isValidEmail = (email) => { }
const formatTimestamp = (date) => { }

// ❌ Unclear abbreviations
const getUM = (uID) => { }  // ❌
const isVE = (em) => { }     // ❌
const fmt = (d) => { }       // ❌
```

### Function Size

- **Ideal**: <50 lines per function
- **Maximum**: <100 lines per function
- **Rationale**: Easier to test, understand, maintain

### Comment Guidelines

```javascript
// ✅ Explain WHY, not WHAT
// Cache user presence for 1 hour to reduce database load
// while maintaining <100ms latency for presence updates
await redis.setex(`presence:${userId}`, 3600, status);

// ❌ Obvious comments
// Set presence in redis
redis.setex(`presence:${userId}`, 3600, status);
```

---

## Testing Standards

### Unit Tests

```javascript
describe('MessageService.sendMessage', () => {
  it('should create message with valid data', async () => {
    const result = await MessageService.sendMessage({
      senderId: 'user1',
      recipientId: 'user2',
      content: 'Hello'
    });

    expect(result).toHaveProperty('_id');
    expect(result.status).toBe('sent');
  });

  it('should reject empty message', async () => {
    await expect(
      MessageService.sendMessage({
        senderId: 'user1',
        recipientId: 'user2',
        content: '' // Empty
      })
    ).rejects.toThrow();
  });
});
```

**Coverage targets**:
- Backend: 90%+
- Frontend components: 80%+
- Overall: 85%+

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific suite
npm test message.test.js

# Watch mode (re-run on change)
npm test -- --watch

# Update snapshots
npm test -- -u
```

---

## Performance Expectations

### Page Load
- Target: <2 seconds
- Measurement: Largest Contentful Paint (LCP)

### API Response
- P95: <200ms
- P99: <500ms
- P100: <1s

### Message Latency
- P95: <100ms
- P99: <300ms

### Bundle Size
- Main: <100KB gzipped
- Total: <300KB gzipped

---

## Documentation Standards

### Code Documentation

```javascript
/**
 * Send a message to a user or group
 * 
 * @param {Object} messageData - Message data
 * @param {string} messageData.senderId - ID of sender
 * @param {string} messageData.recipientId - ID of recipient
 * @param {string} messageData.content - Message content
 * @returns {Promise<Message>} Created message object
 * @throws {Error} If message content is empty
 * 
 * @example
 * const message = await sendMessage({
 *   senderId: 'user1',
 *   recipientId: 'user2',
 *   content: 'Hello'
 * });
 */
export const sendMessage = async (messageData) => { }
```

### README Updates

If adding a feature, update:
1. Main README (feature list)
2. Relevant docs (API.md, ARCHITECTURE.md, etc)
3. Changelog (CHANGELOG.md)

---

## Debugging Tips

### Browser DevTools

```javascript
// Redux DevTools
import { createStore } from 'zustand';
// DevTools available in browser

// React DevTools
// Install React DevTools extension

// Network tab
// Monitor API calls, WebSocket events
```

### Backend Debugging

```javascript
// Node inspector
node --inspect src/index.js
// Open chrome://inspect

// Debugger statements
debugger; // Pauses execution in DevTools

// Logging
console.log('Debug:', variable);
console.error('Error:', error);
```

### Database Debugging

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017

# View collections
show collections

# Query
db.messages.find().limit(5)

# View indexes
db.messages.getIndexes()
```

---

## Security Review Checklist

Before submitting PR, check:

- [ ] No hardcoded API keys or passwords
- [ ] Input validation on all endpoints
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Rate limiting where appropriate
- [ ] Auth required for sensitive endpoints
- [ ] Error messages don't leak info
- [ ] No sensitive data in logs
- [ ] Dependencies up-to-date (`npm audit`)

---

## Performance Review Checklist

Before submitting PR, check:

- [ ] No unnecessary re-renders (React)
- [ ] No N+1 database queries
- [ ] Appropriate caching used
- [ ] Large lists virtualized
- [ ] Images lazy-loaded
- [ ] Bundle size not increased significantly
- [ ] Load tests pass
- [ ] No memory leaks (test 24h+)

---

## Release Process

### Versioning: Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Example: `v1.2.3`

### Release Timeline

```
develop branch
    ↓
Create PR to main
    ↓
Code review & testing
    ↓
Merge to main
    ↓
Tag release (v1.x.x)
    ↓
Build & publish
    ↓
Deploy to production
```

### Update Checklist

- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] Tests passing
- [ ] Build successful
- [ ] Staging deployment tested
- [ ] Release notes written
- [ ] Deployment plan finalized

---

<p align="center">
  <strong>Great workflows lead to great code.</strong>
</p>
