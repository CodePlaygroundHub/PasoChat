# ✅ Production Deployment Checklist

Use this checklist to ensure PASO is production-ready before going live.

---

## Pre-Deployment: Code Quality (Week -2)

### Testing
- [ ] Backend unit tests pass (100% coverage on critical paths)
  ```bash
  npm test -- --coverage
  ```
- [ ] Frontend tests pass
  ```bash
  npm run test
  ```
- [ ] All integration tests pass
  ```bash
  npm run test:integration
  ```
- [ ] E2E tests pass on staging
  ```bash
  npm run test:e2e --env=staging
  ```
- [ ] Load test passes (10K concurrent users)
  ```bash
  artillery run load-test.yml --target https://staging-api.example.com
  ```

### Code Quality
- [ ] No ESLint errors
  ```bash
  npm run lint
  ```
- [ ] No security vulnerabilities
  ```bash
  npm audit
  ```
- [ ] No hardcoded secrets or API keys
  ```bash
  grep -r "password\|token\|secret" src/ | grep -v ".env.example"
  ```
- [ ] Code reviewed (2+ approvals)
- [ ] CHANGELOG.md updated
- [ ] Version bumped (package.json)

### Documentation
- [ ] API documentation up-to-date
- [ ] Deployment guide complete
- [ ] Runbook for common operations
- [ ] Incident response plan documented
- [ ] Database migration docs ready

---

## Infrastructure: Setup (Week -1)

### Domain & DNS
- [ ] Domain registered
- [ ] DNS configured
  - [ ] `api.example.com` → API load balancer
  - [ ] `example.com` → CDN origin
  - [ ] `admin.example.com` → Admin dashboard
- [ ] DNS propagation verified
  ```bash
  dig api.example.com
  nslookup api.example.com
  ```

### SSL/TLS Certificates
- [ ] SSL certificate acquired (Let's Encrypt or commercial)
- [ ] Certificate chain valid
- [ ] Certificate auto-renewal configured
- [ ] Tested in staging environment
- [ ] Certificate monitoring alerts set up

### Cloud Infrastructure
- [ ] Kubernetes cluster provisioned (or Docker Swarm)
- [ ] Persistent storage configured
- [ ] Load balancer configured
- [ ] Auto-scaling policies defined
- [ ] VPC/network security groups configured

### Databases
- [ ] MongoDB Atlas cluster created (or self-hosted)
  - [ ] Replication enabled (minimum 3 nodes)
  - [ ] Automatic backups configured
  - [ ] IP whitelist configured
  - [ ] Indices created
  - [ ] Database backups tested
- [ ] Redis cluster setup
  - [ ] High availability enabled
  - [ ] Persistence configured (AOF)
  - [ ] Memory limits set
  - [ ] Monitoring enabled

### Monitoring & Observability
- [ ] Prometheus setup
  - [ ] Backend instrumented
  - [ ] Socket.IO metrics collected
  - [ ] Database metrics enabled
- [ ] Grafana dashboards created
- [ ] Alert rules configured (errors, latency, capacity)
- [ ] Log aggregation setup (ELK Stack, Datadog, Splunk)
- [ ] Sentry error tracking configured
- [ ] Uptime monitoring configured (Pingdom, UptimeRobot)

---

## Security: Hardening (Week -1)

### Secrets Management
- [ ] All secrets in vault (HashiCorp Vault, AWS Secrets Manager)
- [ ] No hardcoded secrets in code or config
- [ ] Secret rotation policy defined
- [ ] Access logs for secret access
- [ ] Environment variables documented (without values)

### Authentication & Authorization
- [ ] JWT secret rotated and strong (32+ characters)
- [ ] Refresh token expiry set (7 days)
- [ ] Access token expiry set (15 minutes)
- [ ] Password requirements enforced
  - [ ] Minimum 8 characters
  - [ ] Uppercase, lowercase, digit, special char
- [ ] 2FA configured for admin accounts
- [ ] Role-based access control tested
- [ ] API key rotation strategy

### API Security
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] CORS configured restrictively
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Security headers configured (CSP, HSTS, etc.)

### Infrastructure Security
- [ ] Firewall rules configured
  - [ ] Allow: 80, 443
  - [ ] Deny: Direct database access from internet
  - [ ] Deny: Direct Redis access from internet
- [ ] SSH key-based authentication only
- [ ] SSH port changed from 22 (optional)
- [ ] Fail2ban or equivalent configured
- [ ] DDoS protection enabled (CloudFlare, AWS Shield)
- [ ] VPC security groups properly scoped

### Database Security
- [ ] MongoDB authentication enabled
- [ ] Database user has minimum required permissions
- [ ] Connection SSL/TLS enabled
- [ ] Database backup encryption enabled
- [ ] Database access logs enabled
- [ ] Database audit logging enabled

### Compliance
- [ ] Data encryption at rest enabled
- [ ] Data encryption in transit enabled (TLS)
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance verified (if applicable)
- [ ] Data retention policy documented

---

## Configuration: Production Setup (Week -1)

### Backend Configuration
- [ ] Environment variables set
  ```
  NODE_ENV=production
  JWT_SECRET=${JWT_SECRET}
  MONGODB_URI=${MONGODB_URI}
  REDIS_HOST=${REDIS_HOST}
  ```
- [ ] Logging level set to info (not debug)
- [ ] Database connection pool optimized
- [ ] Redis connection pool optimized
- [ ] CORS whitelist configured
- [ ] Rate limiting configured
- [ ] Socket.IO origins whitelisted

### Frontend Configuration
- [ ] API URL points to production
- [ ] Analytics enabled
- [ ] Error reporting enabled
- [ ] Service worker configured
- [ ] Caching headers optimized
- [ ] Build optimizations enabled

### ML Service Configuration
- [ ] Models loaded and tested
- [ ] API endpoints responding
- [ ] Health check working
- [ ] Error handling configured
- [ ] Logging enabled

---

## Deployment: Release (Day 0)

### Pre-Deployment
- [ ] Backup all databases
- [ ] Backup all configuration
- [ ] Test rollback procedure
- [ ] Notify team of deployment window
- [ ] Deployment checklist printed (disaster recovery)

### Backend Deployment
- [ ] Docker image built
  ```bash
  docker build -t paso-backend:v1.0.0 ./backend
  ```
- [ ] Image pushed to registry
  ```bash
  docker push registry.example.com/paso-backend:v1.0.0
  ```
- [ ] Kubernetes deployment updated
  ```bash
  kubectl set image deployment/paso-backend \
    paso-backend=registry.example.com/paso-backend:v1.0.0 -n paso
  ```
- [ ] Rollout status monitored
  ```bash
  kubectl rollout status deployment/paso-backend -n paso
  ```
- [ ] Health checks passing
  ```bash
  curl https://api.example.com/health
  ```

### Database Migrations
- [ ] Backup created before migration
- [ ] Migration script tested on staging
- [ ] Migration script executed
  ```bash
  npm run migrate
  ```
- [ ] Migration verified
  ```bash
  npm run verify-migration
  ```

### Frontend Deployment
- [ ] Build optimized
  ```bash
  npm run build
  ```
- [ ] Build artifacts uploaded to CDN
- [ ] Cache headers verified
- [ ] Service worker updated
- [ ] Frontend testing on production
  ```bash
  curl https://ejemplo.com
  ```

### ML Service Deployment
- [ ] Models deployed
- [ ] Health endpoint responding
  ```bash
  curl https://api.example.com/ml/health
  ```
- [ ] Performance baseline recorded

### Monitoring Verification
- [ ] All metrics flowing to Prometheus
- [ ] Grafana dashboards showing data
- [ ] Alert rules testing
- [ ] Log aggregation working

---

## Post-Deployment: Verification (Day 0-1)

### Functional Testing
- [ ] User signup works
- [ ] User login works
- [ ] Message sending works (1:1)
- [ ] Message sending works (groups)
- [ ] Calling works (if ZegoCloud enabled)
- [ ] Status updates work
- [ ] Admin dashboard accessible
- [ ] User profile editable
- [ ] File uploads work (Cloudinary)
- [ ] Email notifications sent

### Performance Testing
- [ ] Message latency <100ms (p95)
- [ ] API response time <200ms (p95)
- [ ] Page load time <2s (p95)
- [ ] No database queries >100ms
- [ ] Memory usage normal
- [ ] CPU usage normal
- [ ] Network I/O healthy

### Security Testing
- [ ] HTTPS enforced
- [ ] Security headers present
  ```bash
  curl -I https://api.example.com | grep -i "x-frame-options\|x-content-type"
  ```
- [ ] CORS working correctly
- [ ] Rate limiting working
- [ ] SQL injection prevention verified
- [ ] XSS protection verified
- [ ] CSRF protection verified

### Scalability Testing
- [ ] Load test passes (5K concurrent users)
- [ ] No connection drops
- [ ] Socket.IO events delivered
- [ ] Redis adapter working
- [ ] Database scaling verified

### Reliability Testing
- [ ] Services restart correctly
- [ ] Connection pooling working
- [ ] No memory leaks (24-hour test)
- [ ] Database failover works
- [ ] Error handling proper

### Monitoring Testing
- [ ] Alerts firing correctly
- [ ] Dashboards updating
- [ ] Logs aggregating
- [ ] Error tracking working
- [ ] Uptime monitoring working

---

## Post-Deployment: Operations (Day 1+)

### Runbook Verification
- [ ] Incident response playbook tested
- [ ] Rollback procedure documented
- [ ] Common issues & solutions documented
- [ ] On-call team trained
- [ ] Escalation contacts documented

### Documentation
- [ ] Deployment guide complete
- [ ] Architecture diagrams updated
- [ ] Troubleshooting guide created
- [ ] Operations guide created
- [ ] API docs published

### Monitoring
- [ ] Dashboard alerts reviewed daily
- [ ] Logs reviewed for errors
- [ ] Performance metrics tracked
- [ ] Capacity planning started
- [ ] Cost monitoring enabled

### User Communication
- [ ] Launch announcement made
- [ ] Known issues documented
- [ ] Support channels active
- [ ] Feedback mechanism setup
- [ ] Beta testers thanked

---

## Long-Term Maintenance (Ongoing)

### Updates & Patches
- [ ] Security patches applied within 24 hours
- [ ] Dependency updates scheduled monthly
- [ ] Major version upgrades planned quarterly
- [ ] Database schema migrations tested before deployment

### Performance Monitoring
- [ ] Weekly performance review
- [ ] Monthly capacity planning
- [ ] Quarterly optimization review
- [ ] Annual architecture review

### Security
- [ ] Monthly security audit
- [ ] Quarterly penetration testing
- [ ] Annual third-party security review
- [ ] Secrets rotation every 90 days

### Compliance
- [ ] Privacy policy reviewed annually
- [ ] GDPR compliance audited annually
- [ ] Data retention policy enforced
- [ ] User consent tracking verified

---

## Success Criteria

✅ **Deployment Successful** When:
- [ ] Zero critical bugs in first 24 hours
- [ ] <0.1% error rate
- [ ] <100ms p95 latency
- [ ] 99%+ availability
- [ ] All security checks pass
- [ ] Users signing up successfully
- [ ] No data loss

---

## Rollback Procedure (If Needed)

```bash
# Stop new deployment
kubectl rollout undo deployment/paso-backend -n paso

# Verify previous version running
kubectl get pods -n paso
kubectl logs -f pod/paso-backend-xxx -n paso

# Verify system health
curl https://api.example.com/health

# Investigate failure (check logs)
kubectl logs -f deployment/paso-backend -n paso --previous

# Create incident ticket
# Fix issue
# Re-deploy with fix
```

---

## Post-Mortem (If Rollback Needed)

1. **What happened?**
2. **Why did it happen?**
3. **What could we have caught before deploy?**
4. **What's our fix?**
5. **What preventive measures?**

---

<p align="center">
  <strong>A successful deployment requires preparation, patience, and process.</strong>
</p>
