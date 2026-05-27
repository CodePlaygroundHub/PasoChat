# 🚀 Production Deployment Guide

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Containerization (Docker)](#containerization-docker)
4. [Database Setup](#database-setup)
5. [Redis Configuration](#redis-configuration)
6. [Backend Deployment](#backend-deployment)
7. [Frontend Deployment](#frontend-deployment)
8. [ML Service Deployment](#ml-service-deployment)
9. [Monitoring & Logging](#monitoring--logging)
10. [Security Hardening](#security-hardening)
11. [Post-Deployment Verification](#post-deployment-verification)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Zero ESLint errors (`npm run lint`)
- [ ] No console.log statements in production code
- [ ] Error handling comprehensive
- [ ] Security vulnerabilities checked (`npm audit`)

### Configuration
- [ ] All environment variables documented
- [ ] Database migrations tested
- [ ] API keys rotated
- [ ] CORS configured correctly
- [ ] Rate limiting configured

### Infrastructure
- [ ] SSL/TLS certificates ready
- [ ] Database backups scheduled
- [ ] Redis persistence enabled
- [ ] Load balancer configured
- [ ] CDN configured

### Documentation
- [ ] Deployment runbook created
- [ ] Rollback procedure documented
- [ ] Incident response plan ready
- [ ] Team trained on deployment

---

## Environment Configuration

### Required Environment Variables

#### Backend (.env)

```env
# Server
NODE_ENV=production
PORT=5001
LOG_LEVEL=info

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/paso?retryWrites=true&w=majority
MONGODB_REPLICA_SET=rs0

# Cache & Real-time
REDIS_HOST=redis.internal.example.com
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_DB=0

# Authentication
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=7d
REFRESH_TOKEN_EXPIRE=30d
COOKIES_SECURE=true
COOKIES_SAME_SITE=Strict

# API Keys & External Services
GROQ_API_KEY=${GROQ_API_KEY}
CLOUDINARY_NAME=${CLOUDINARY_NAME}
CLOUDINARY_KEY=${CLOUDINARY_KEY}
CLOUDINARY_SECRET=${CLOUDINARY_SECRET}

# Email Service
BREVO_API_KEY=${BREVO_API_KEY}
SMTP_FROM_EMAIL=noreply@ejemplo.com

# ML Service
ML_SERVICE_URL=http://ml-service:5000
ML_SERVICE_TIMEOUT=5000

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://ejemplo.com,https://www.ejemplo.com
CORS_CREDENTIALS=true

# Monitoring
SENTRY_DSN=${SENTRY_DSN}
LOG_TRANSPORT=syslog

# Optional: Call Service
ZEGOCLOUD_APP_ID=${ZEGOCLOUD_APP_ID}
ZEGOCLOUD_SERVER_SECRET=${ZEGOCLOUD_SERVER_SECRET}
```

#### Frontend (.env)

```env
VITE_API_URL=https://api.ejemplo.com
VITE_WS_URL=wss://api.ejemplo.com
VITE_APP_NAME=PASO
VITE_ENABLE_ANALYTICS=true
```

#### ML Service (.env)

```env
FLASK_ENV=production
ML_MODEL_PATH=/app/models
LOG_LEVEL=INFO
WORKER_TIMEOUT=30
```

### Secrets Management

**Using Environment Variable Secrets**:

```bash
# Store in secure vault (never commit)
export REDIS_PASSWORD="complex-password-123"
export JWT_SECRET="jwt-secret-key-123"
export GROQ_API_KEY="groq-api-key"

# Or use Docker secrets (Kubernetes/Swarm)
echo "complex-password-123" | docker secret create redis_password -
```

---

## Containerization (Docker)

### Backend Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy from builder
COPY --from=builder /build/node_modules ./node_modules

# Copy application
COPY . .

# Create non-root user
RUN addgroup -g 1000 node && \
    adduser -D -u 1000 -G node node
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 5001

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]
CMD ["node", "src/index.js"]
```

### Frontend Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /build

COPY package*.json ./
RUN npm ci

COPY . .

# Build with optimizations
RUN npm run build

# Production stage - Nginx
FROM nginx:alpine

# Copy build artifacts
COPY --from=builder /build/dist /usr/share/nginx/html

# Custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf for Frontend

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    server {
        listen 80;
        server_name _;

        # Security headers
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # React Router SPA fallback
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            
            # Cache index.html with validation
            location = /index.html {
                add_header Cache-Control "public, max-age=0, must-revalidate";
            }
        }

        # Cache static assets
        location /assets {
            root /usr/share/nginx/html;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
        }
    }
}
```

### ML Service Dockerfile

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN useradd -m -u 1000 mlservice
USER mlservice

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:5000/health', timeout=2)"

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
```

### Docker Compose (Production-like)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: paso-backend
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongo:27017/paso
      REDIS_HOST: redis
      JWT_SECRET: ${JWT_SECRET}
      GROQ_API_KEY: ${GROQ_API_KEY}
    ports:
      - "5001:5001"
    depends_on:
      - mongo
      - redis
      - ml-service
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: paso-frontend
    restart: always
    ports:
      - "80:80"
    environment:
      VITE_API_URL: http://backend:5001
    depends_on:
      - backend

  ml-service:
    build:
      context: ./ml-service
      dockerfile: Dockerfile
    container_name: paso-ml
    restart: always
    ports:
      - "5000:5000"
    environment:
      LOG_LEVEL: INFO

  redis:
    image: redis:7-alpine
    container_name: paso-redis
    restart: always
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  mongo:
    image: mongo:7
    container_name: paso-mongo
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: paso
    volumes:
      - mongo_data:/data/db
    command: mongod --auth --replSet rs0 --bind_ip_all

volumes:
  redis_data:
  mongo_data:
```

---

## Database Setup

### MongoDB Atlas (Recommended for Production)

**Steps**:

1. Create cluster on MongoDB Atlas
2. Set up IP whitelist
3. Create database user
4. Get connection string
5. Configure replica set (for transactions)

```javascript
// Verify connection
const conn = await mongoose.connect(process.env.MONGODB_URI);
console.log("✅ MongoDB connected");
```

### MongoDB Local Replication

```bash
# Initialize replica set
mongosh --eval "rs.initiate({
  _id: 'rs0',
  members: [
    { _id: 0, host: 'mongo-1:27017' },
    { _id: 1, host: 'mongo-2:27017' },
    { _id: 2, host: 'mongo-3:27017' }
  ]
})"
```

### Database Indexes

```javascript
// backend/src/lib/db.js - Create indexes on startup
const createIndexes = async () => {
  // Messages indexes
  await Message.collection.createIndex({ chatId: 1, createdAt: -1 });
  await Message.collection.createIndex({ senderId: 1, createdAt: -1 });
  await Message.collection.createIndex({ status: 1 });
  
  // Users indexes
  await User.collection.createIndex({ email: 1 }, { unique: true });
  await User.collection.createIndex({ username: 1 }, { unique: true });
  
  // Groups indexes
  await Group.collection.createIndex({ _id: 1, createdAt: -1 });
  await Group.collection.createIndex({ members: 1 });
  
  console.log("✅ Database indexes created");
};

// Call on server start
await createIndexes();
```

---

## Redis Configuration

### Redis Cloud (Recommended)

1. Create Redis Cloud account
2. Set up database with:
   - High availability (3 replicas)
   - Persistence (AOF)
   - 16GB memory minimum
3. Copy connection URI

### Self-Hosted Redis

```bash
# Install Redis
curl -fsSL https://download.redis.io/install.sh | sh

# Configure redis.conf
maxmemory 16gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
```

---

## Backend Deployment

### AWS EC2 / Heroku / Railway

**Using PM2 (Process Manager)**:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "paso-backend",
    script: "./src/index.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production"
    },
    error_file: "./logs/error.log",
    out_file: "./logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    max_memory_restart: "1G",
    max_restarts: 10,
    min_uptime: "10s"
  }]
};
```

```bash
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Logs
pm2 logs paso-backend
```

### Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace paso

# Deploy backend
kubectl apply -f k8s/backend-deployment.yaml -n paso

# Check status
kubectl get pods -n paso
kubectl describe pod <pod-name> -n paso

# Logs
kubectl logs <pod-name> -n paso
```

---

## Frontend Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy --prod

# Set environment variables
vercel env add VITE_API_URL
```

### Alternative: AWS S3 + CloudFront

```bash
# Build
npm run build

# Deploy to S3
aws s3 sync dist/ s3://paso-frontend-bucket/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E123456789 \
  --paths "/*"
```

---

## ML Service Deployment

### Docker + Kubernetes

```bash
# Build image
docker build -t paso-ml:v1.0 ./ml-service

# Push to registry
docker tag paso-ml:v1.0 registry.example.com/paso-ml:v1.0
docker push registry.example.com/paso-ml:v1.0

# Deploy to Kubernetes
kubectl apply -f k8s/ml-service-deployment.yaml
```

---

## Monitoring & Logging

### Logging Setup (Sentry)

```javascript
// backend/src/index.js
import Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Metrics (Prometheus)

Already configured in [SCALING.md](./SCALING.md#monitoring--observability)

---

## Security Hardening

### SSL/TLS Certificate

```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone \
  -d api.ejemplo.com \
  -d www.ejemplo.com

# Renewal (automatic with certbot)
sudo certbot renew
```

### NGINX SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name api.ejemplo.com;

    ssl_certificate /etc/letsencrypt/live/api.ejemplo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.ejemplo.com/privkey.pem;

    # Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

### Firewall Rules

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw enable
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Backend API
curl https://api.ejemplo.com/health

# Frontend
curl https://ejemplo.com/

# ML Service
curl https://api.ejemplo.com/ml/health
```

### Functional Tests

```bash
# Run smoke tests
npm run test:smoke

# Test messaging flow
curl -X POST https://api.ejemplo.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Verify WebSocket connection
npx ws wss://api.ejemplo.com
```

### Performance Verification

```bash
# Load test
npm run load-test

# Expected metrics
# - P95 latency: <100ms
# - Error rate: <0.1%
# - Throughput: 10K+ req/sec
```

---

## Rollback Procedure

**If deployment fails**:

```bash
# Kubernetes
kubectl rollout undo deployment/paso-backend -n paso

# Docker Compose
docker-compose down
docker-compose up -d
```

**Data Recovery**:
- MongoDB automatic backup (Atlas)
- Redis persistence (AOF)
- Frontend version on CDN (immutable)

---

<p align="center">
  <strong>PASO is now production-ready and can handle millions of users.</strong>
</p>
