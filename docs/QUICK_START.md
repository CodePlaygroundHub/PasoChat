# ⚡ Quick Start Guide (5 Minutes)

Get PASO running locally in minutes.

---

## Prerequisites

- **Node.js 18+**
- **npm 9+**
- **MongoDB** (or MongoDB Atlas cloud)
- **Redis** (or Redis Cloud)

---

## 1. Clone & Navigate

```bash
git clone https://github.com/CodePlaygroundHub/paso-chat-app.git
cd paso-chat-app
```

---

## 2. Backend Setup (2 min)

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Start backend (leaves terminal running)
npm run dev
```

**Expected output**:
```
✅ Backend running on http://localhost:5001
✅ MongoDB connected
✅ Redis connected
✅ Socket.IO server ready
```

---

## 3. Frontend Setup (2 min)

**New terminal**:

```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env

# Start frontend
npm run dev
```

**Expected output**:
```
✅ Frontend ready on http://localhost:5173
  ➜  Local:   http://localhost:5173/
  ➜  Network: [accessible from network]
```

---

## 4. Open Application

Open in browser: **http://localhost:5173**

---

## 5. Create Test Account

```
Email: test@test.com
Password: Test@1234
Name: Test User
```

✅ **Success!** You should see the chat interface.

---

## 6. Send Your First Message

1. Sign up with the credentials above
2. Go to sidebar → "New Chat"
3. Create a new chat or group
4. Type a message and press send
5. Watch the message appear in real-time! 🎉

---

## Quick Commands

```bash
# Run tests
npm test

# Check code style
npm run lint

# Build for production
npm run build

# View logs
npm run logs
```

---

## Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Install MongoDB locally
brew install mongodb-community  # macOS
# Or use Docker
docker run -d -p 27017:27017 mongo:7
```

### "Cannot connect to Redis"
```bash
# Install Redis locally
brew install redis  # macOS
# Or use Docker
docker run -d -p 6379:6379 redis:7-alpine

# Start Redis
redis-server
```

### "Port 5001 already in use"
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9  # macOS/Linux

# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F
```

### Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## Next Steps

After successful setup:

1. 📖 **Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Understand how PASO works
2. 👨‍💻 **Read [CONTRIBUTOR_ONBOARDING.md](./docs/CONTRIBUTOR_ONBOARDING.md)** — Start contributing
3. 🚀 **Read [DEPLOYMENT.md](./docs/DEPLOYMENT.md)** — Deploy to production
4. 🔐 **Read [SECURITY_BEST_PRACTICES.md](./docs/SECURITY_BEST_PRACTICES.md)** — Secure your setup

---

<p align="center">
  <strong>Ready to explore? 🚀</strong><br/>
  See [README.md](./README.md) for more information.
</p>
