# 🔐 Security Best Practices & Hardening Guide

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Data Protection](#data-protection)
3. [API Security](#api-security)
4. [Infrastructure Security](#infrastructure-security)
5. [Secure Secrets Management](#secure-secrets-management)
6. [Vulnerability Scanning](#vulnerability-scanning)
7. [Compliance & Privacy](#compliance--privacy)
8. [Security Incident Response](#security-incident-response)

---

## Authentication & Authorization

### JWT Security

**Best Practices**:

```javascript
// ✅ CORRECT: Use strong secrets and short expiry for access tokens
const accessTokenSecret = process.env.JWT_SECRET; // 32+ char string
const accessTokenExpiry = '15m'; // Short-lived

const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const refreshTokenExpiry = '7d'; // Longer expiry

// Sign token
const token = jwt.sign(
  { userId, email, role },
  accessTokenSecret,
  { expiresIn: accessTokenExpiry }
);

// ❌ INCORRECT: Long-lived access tokens
// const accessTokenExpiry = '30d'; // ❌ Security risk!

// Verify token
try {
  const decoded = jwt.verify(token, accessTokenSecret);
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    // Return 401, client must use refresh token
  }
}
```

**Refresh Token Rotation**:

```javascript
// Issue new access token using refresh token
export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Validate refresh token still active in database
    const user = await User.findById(decoded.userId);
    if (!user.isRefreshTokenValid(refreshToken)) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Issue new access token
    const newAccessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};
```

### Password Security

```javascript
// ✅ Secure password hashing
import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12); // Cost factor of 12
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Password requirements
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
// Requires: lowercase, uppercase, digit, special char, 8+ chars
```

### Role-Based Access Control

```javascript
// Middleware for role checking
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Route protection
app.delete('/api/users/:id', 
  authMiddleware,
  requireRole('admin'),
  deleteUser
);

// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user'
};
```

---

## Data Protection

### Input Validation & Sanitization

```javascript
// ✅ Validate all inputs
import { body, validationResult } from 'express-validator';

export const validateSignup = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .toLowerCase(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .escape() // Remove HTML characters
];

// Middleware to check validation
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Usage
app.post('/api/auth/signup',
  validateSignup,
  handleValidationErrors,
  signup
);
```

### SQL Injection Prevention

```javascript
// ✅ Use Mongoose (object mapping prevents injection)
const user = await User.findOne({ email: email }); // ✅ Safe

// ❌ Raw queries vulnerable to injection
// const user = await User.findOne({ email: req.body.email }); // ❌ if unsanitized
```

### XSS Protection

```javascript
// ✅ React escapes by default
const message = '<img onerror="alert(1)" src=x />'; // Safe
return <div>{message}</div>; // HTML-encoded automatically

// ✅ Sanitize if rendering HTML
import DOMPurify from 'dompurify';
const cleanHTML = DOMPurify.sanitize(userInput);

// ❌ NEVER use dangerouslySetInnerHTML without sanitization
// <div dangerouslySetInnerHTML={{ __html: unsanitizedInput }} /> // ❌
```

### CSRF Protection

```javascript
// ✅ CSRF token middleware
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: false });

app.post('/api/messages/send/:id',
  csrfProtection,
  authMiddleware,
  (req, res) => {
    // Token validated automatically
  }
);

// Frontend: Include CSRF token in requests
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

fetch('/api/messages/send/user2', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ content: 'Hello' })
});
```

---

## API Security

### Rate Limiting

```javascript
// ✅ Comprehensive rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later',
  standardHeaders: true, // Return rate limit info in header
  skipSuccessfulRequests: true, // Don't count successful requests
  store: new RedisStore({
    client: redis,
    prefix: 'rl:' // rate-limit prefix
  })
});

// Strict rate limiting for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts
  skipSuccessfulRequests: false
});

app.post('/api/auth/login', authLimiter, login);
app.use('/api/', limiter);
```

### CORS Configuration

```javascript
// ✅ Strict CORS setup
import cors from 'cors';

app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));

// ❌ INSECURE: Allow all origins
// app.use(cors()); // ❌
```

### HTTPS Enforcement

```javascript
// ✅ Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// ✅ Strict-Transport-Security header
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### Security Headers

```javascript
// ✅ Add comprehensive security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Prevent MIME sniffing
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Prevent clickjacking
  res.setHeader('X-XSS-Protection', '1; mode=block'); // XSS protection
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=()');
  next();
});
```

---

## Infrastructure Security

### Environment Variable Security

```bash
# ✅ CORRECT: Use .env.example without secrets
# .env.example (committed to repo)
JWT_SECRET=<your-secret-here>
MONGODB_URI=<connection-string>

# ✅ CORRECT: Actual secrets in .env (NEVER committed)
# .env (in .gitignore)
JWT_SECRET=aksh7h2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/paso
```

**Vault Storage** (Production):

```bash
# Use HashiCorp Vault or AWS Secrets Manager
vault kv put secret/paso/production \
  jwt_secret="..." \
  mongo_uri="..." \
  redis_password="..."

# Fetch at runtime
const secret = await vaultClient.read('secret/paso/production');
```

### Database Security

```javascript
// ✅ Use connection pooling and SSL
const dbOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  ssl: true,
  sslValidate: true,
  retryWrites: true,
  w: 'majority' // Write to majority
};

await mongoose.connect(process.env.MONGODB_URI, dbOptions);
```

### Network Segmentation

```
Internet
    ↓
Firewall (Allow: 80, 443)
    ↓
API Server (5001)
    ↓
Internal Network (Private IP)
    ├─ MongoDB (27017) - Only from API
    ├─ Redis (6379) - Only from API
    └─ ML Service (5000) - Only from API
```

---

## Secure Secrets Management

### Using Environment Variables

```javascript
// ✅ Safe secret access
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not configured');
}

// ✅ Validate on startup
const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'REDIS_HOST',
  'NODE_ENV'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

### Docker Secrets

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    image: paso-backend
    secrets:
      - jwt_secret
      - mongo_password
    environment:
      JWT_SECRET_FILE: /run/secrets/jwt_secret

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
  mongo_password:
    file: ./secrets/mongo_password.txt
```

---

## Vulnerability Scanning

### Dependency Scanning

```bash
# Check for known vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Generate report
npm audit --json > audit-report.json

# GitHub Dependabot
# Automatically creates PRs for security updates
```

### OWASP Checks

```bash
# Using OWASP ZAP for penetration testing
zaproxy -cmd -quickurl http://localhost:5001 -quickout report.html
```

### Code Scanning

```bash
# Using npm audit
npm audit

# Using snyk
snyk test

# Using SAST tool
sonarqube-scanner
```

---

## Compliance & Privacy

### GDPR Compliance

```javascript
// ✅ User data export
export const exportUserData = async (req, res) => {
  const user = await User.findById(req.user.id);
  
  const userData = {
    profile: user.toJSON(),
    messages: await Message.find({ senderId: req.user.id }),
    groups: await Group.find({ members: req.user.id })
  };

  res.json(userData);
};

// ✅ Right to be forgotten
export const deleteUserAccount = async (req, res) => {
  const userId = req.user.id;

  // Delete all user data
  await User.findByIdAndDelete(userId);
  await Message.deleteMany({ senderId: userId });
  // Keep deleted account record for audit purposes
  await AuditLog.create({
    event: 'USER_DELETED',
    userId,
    timestamp: new Date()
  });

  res.json({ message: 'Account deleted' });
};
```

### Data Encryption

```javascript
// ✅ Encrypt sensitive data at rest
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

export const encrypt = (text, encryptionKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
};

export const decrypt = (encryptedText, encryptionKey) => {
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const authTag = Buffer.from(parts[2], 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
```

### Audit Logging

```javascript
// ✅ Log all sensitive operations
export const auditLog = async (action, userId, details) => {
  await AuditLog.create({
    action,
    userId,
    details,
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    timestamp: new Date()
  });
};

// Usage
await auditLog('USER_LOGIN', userId, { method: 'password' });
await auditLog('PASSWORD_CHANGED', userId, { timestamp: new Date() });
await auditLog('ADMIN_ACTION', adminId, { action: 'user_suspended', targetUserId });
```

---

## Security Incident Response

### Incident Response Plan

1. **Detection**: Security monitoring alerts
2. **Containment**: Disable compromised accounts, rotate secrets
3. **Investigation**: Review audit logs, analyze attack vectors
4. **Recovery**: Restore from backups, apply patches
5. **Communication**: Notify affected users, regulatory bodies if needed
6. **Post-Mortem**: Root cause analysis, process improvements

### Emergency Secret Rotation

```bash
# If JWT secret compromised:
# 1. Invalidate all active tokens in Redis
redis-cli FLUSHDB 1  # Clear session database

# 2. Issue new JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# 3. Rotate refresh tokens in database
db.users.updateMany({}, { $set: { refreshTokens: [] } })

# 4. Force re-authentication for all users
# 5. Update deployment with new secret
```

---

## Security Checklist

### Development
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use ORM)
- [ ] XSS protection enabled
- [ ] CSRF tokens on state-changing operations
- [ ] Secure password hashing (bcrypt)
- [ ] Sensitive data not logged

### Testing
- [ ] Run `npm audit` before each release
- [ ] Check for hardcoded secrets
- [ ] Test with invalid/malicious input
- [ ] OWASP vulnerability scan
- [ ] Penetration testing

### Deployment
- [ ] SSL/TLS certificates valid
- [ ] Environment variables secured
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] Security headers added
- [ ] Database backups scheduled

### Operations
- [ ] Monitor for suspicious activity
- [ ] Review audit logs regularly
- [ ] Keep dependencies updated
- [ ] Update security patches immediately
- [ ] Incident response plan tested

---

<p align="center">
  <strong>Security is not a feature—it's a responsibility.</strong>
</p>
