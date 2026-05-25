# 👨‍💻 Contributor Onboarding & Development Guide

Welcome to PASO! This guide gets you set up for productive contribution in minutes.

---

## Prerequisites

- **Node.js 18+** and npm
- **Python 3.10+** for ML service development
- **Git** and GitHub account
- **Docker** (optional, for containerized setup)
- **A code editor**

---

## Quick Setup (5 Minutes)

### 1. Fork & Clone

```bash
# Fork on GitHub (click Fork button)

# Clone your fork
git clone https://github.com/YOUR_USERNAME/paso-chat-app.git
cd paso-chat-app

# Add upstream remote for syncing
git remote add upstream https://github.com/CodePlaygroundHub/paso-chat-app.git
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# ML Service
cd ../ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Return to root
cd ..
```

### 3. Environment Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with test values (no real keys needed for local dev)

# Frontend
cd ../frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:5001

cd ..
```

### 4. Start Services

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# Runs on http://localhost:5001
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Terminal 3 - ML Service**:
```bash
cd ml-service
python app.py
# Runs on http://localhost:5000
```

✅ **Ready!** Open http://localhost:5173 to test

---

## Development Workflow

### Creating a Feature Branch

```bash
# Sync with upstream
git fetch upstream
git rebase upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Branch naming convention
# feature/description   - New feature
# fix/description       - Bug fix
# docs/description      - Documentation
# refactor/description  - Code refactor
```

### Making Changes

**Follow these practices**:

1. **One feature per branch**
2. **Meaningful commit messages**:
   ```
   # Good commit message
   git commit -m "feat: Add typing indicators to group messages"
   git commit -m "fix: Fix Socket.IO disconnect race condition"
   git commit -m "docs: Update API documentation"
   
   # Bad
   git commit -m "Update files"
   git commit -m "Fix stuff"
   ```

3. **Keep commits atomic**:
   ```
   # Instead of one big commit with multiple changes,
   # make separate commits for separate concerns
   
   git commit -m "feat: Add typing indicator event"
   git commit -m "feat: Implement typing UI component"
   git commit -m "test: Add typing indicator tests"
   ```

### Code Style

**ESLint is configured** - Code must pass linting:

```bash
# Check style
npm run lint

# Auto-fix style issues
npm run lint -- --fix
```

**Code format** (Prettier):
```bash
# Format all files
npm run format

# Format specific file
npx prettier --write src/utils.js
```

### Testing Your Changes

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.js

# Watch mode (re-run on change)
npm test -- --watch

# Coverage report
npm test -- --coverage
```

**Before submitting PR**:
- ✅ All tests pass
- ✅ No ESLint errors
- ✅ Manual testing on localhost
- ✅ Updated relevant documentation

### Pushing Changes

```bash
# Push to your fork
git push origin feature/your-feature-name

# Go to GitHub and create Pull Request
```

---

## Directory Structure for Developers

### Backend (`backend/`)

```
src/
├── controllers/     # Handle API requests
│   └── message.controller.js
├── models/          # MongoDB schemas
│   └── message.model.js
├── routes/          # Express route definitions
│   └── message.route.js
├── middleware/      # Authentication, validation, etc
│   └── auth.middleware.js
├── services/        # Business logic
│   └── message.service.js
├── lib/             # Utilities & integrations
│   ├── socket.js    # Socket.IO setup
│   ├── db.js        # Database connection
│   └── redis.js     # Redis client
└── index.js         # Server entry point

test/               # Tests
├── setup.js         # Test database setup
└── auth/
    └── login.test.js
```

**Adding a new endpoint**:

1. Create controller function:
```javascript
// src/controllers/newfeature.controller.js
export const getFeatureData = async (req, res) => {
  try {
    const data = await FeatureModel.findById(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

2. Create route:
```javascript
// src/routes/newfeature.routes.js
import express from 'express';
import { getFeatureData } from '../controllers/newfeature.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
router.get('/:id', authMiddleware, getFeatureData);
export default router;
```

3. Register in main app:
```javascript
// src/index.js
import newFeatureRoutes from './routes/newfeature.routes.js';
app.use('/api/newfeature', newFeatureRoutes);
```

### Frontend (`frontend/`)

```
src/
├── components/      # Reusable React components
│   ├── ChatContainer.jsx
│   ├── MessageBubble.jsx
│   └── Sidebar.jsx
├── pages/          # Route-level pages
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   └── ProfilePage.jsx
├── store/          # Zustand state management
│   ├── authStore.js
│   ├── chatStore.js
│   └── groupStore.js
├── lib/
│   ├── axios.js    # API client config
│   └── utils.js    # Utility functions
├── constants/      # App constants
│   └── index.js
├── App.jsx         # Main component
└── main.jsx        # Entry point

public/             # Static assets
```

**Adding a new component**:

```javascript
// src/components/NewFeature.jsx
import React from 'react';

const NewFeature = ({ prop1, prop2 }) => {
  return (
    <div className="p-4 bg-white rounded">
      <h2>{prop1}</h2>
      <p>{prop2}</p>
    </div>
  );
};

export default NewFeature;
```

### ML Service (`ml-service/`)

```
app.py              # Main FastAPI app
requirements.txt    # Python dependencies
models/             # Trained ML models
├── toxic_model.pkl
└── spam_model.pkl
```

**Adding a new ML endpoint**:

```python
# app.py
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TextRequest(BaseModel):
    text: str

@app.post("/predict_sentiment")
async def predict_sentiment(request: TextRequest):
    """New ML prediction endpoint"""
    # Load model
    model = joblib.load('models/sentiment_model.pkl')
    
    # Vectorize
    X = vectorizer.transform([request.text])
    
    # Predict
    prediction = model.predict(X)[0]
    
    return {
        "text": request.text,
        "sentiment": prediction,
        "confidence": float(model.predict_proba(X)[0].max())
    }
```

---

## Common Development Tasks

### Adding Database Migration

```javascript
// Modify model in src/models/
// MongoDB uses migrations through schema changes

// For major changes, create migration script:
// src/migrations/2024-add-new-field.js
import User from '../models/user.model.js';

export async function up() {
  await User.updateMany(
    {},
    { $set: { newField: defaultValue } }
  );
}

export async function down() {
  await User.updateMany(
    {},
    { $unset: { newField: 1 } }
  );
}
```

### Adding API Endpoint

See [Backend Structure](#backend-) section above

### Adding React Component

See [Frontend Structure](#frontend-) section above

### Adding Socket.IO Event

```javascript
// backend/src/lib/socket.js
io.on('connection', (socket) => {
  // New event handler
  socket.on('custom-event', (data) => {
    // Process data
    socket.broadcast.emit('custom-response', result);
  });
});
```

### Running Load Tests

```bash
cd backend
npm run load-test

# Or with custom parameters
artillery run load-test.yml --target http://localhost:5001
```

---

## Getting Help

- 📖 **Documentation**: Read [docs/](./docs/) folder
- 🤔 **Questions**: Open [GitHub Discussion](https://github.com/CodePlaygroundHub/paso-chat-app/discussions)
- 🐛 **Bugs**: Report on [GitHub Issues](https://github.com/CodePlaygroundHub/paso-chat-app/issues)
- 💬 **Chat**: Discord (coming soon)

---

## PR Review Checklist

Before submitting, ensure:

- [ ] Code follows project style (ESLint, Prettier)
- [ ] All tests pass and new tests added
- [ ] No console.log statements
- [ ] Commit messages are clear
- [ ] Documentation updated if needed
- [ ] No hardcoded secrets
- [ ] Feature works on localhost
- [ ] Doesn't break existing functionality

---

## Code Review Tips

**Be open to feedback**:
- Maintainers may suggest changes
- This improves overall code quality
- Ask questions if feedback unclear

**Request review strategically**:
- Start with smaller PRs (easier to review)
- Include tests with your code
- Write clear PR description

---

## Common Issues & Solutions

### "Cannot find module" error

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
# Kill process using port
lsof -ti:5001 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5001    # Windows (find PID, then taskkill /PID)
```

### MongoDB connection error

```bash
# Ensure MongoDB is running
# If using local MongoDB:
mongod --dbpath /path/to/data

# If using Docker:
docker run -d -p 27017:27017 mongo:7
```

### Module resolution errors

```bash
# Clear cache
rm -rf node_modules/.cache
npm cache clean --force
npm install
```

---

## Debugging Tips

### Backend Debugging

```javascript
// Add debug logs
console.log('🐛 Debug:', variable);

// Use debugger
debugger; // Then run with: node --inspect src/index.js

// Or use IDE debugger (VS Code integrated)
```

### Frontend Debugging

```javascript
// Browser DevTools (Ctrl+Shift+I or Cmd+Option+I)
// - Inspect elements
// - Console for errors
// - Network tab for API calls
// - React DevTools extension

// Add console logs
console.log('🐛 Debug:', state);
```

### Database Debugging

```bash
# Connect to MongoDB shell
mongosh mongodb://localhost:27017

# List databases
show databases

# Use database
use paso

# Query
db.messages.find().limit(5)
```

---

## Git Workflow Commands Cheat Sheet

```bash
# Fetch latest changes from upstream
git fetch upstream

# Rebase on main
git rebase upstream/main

# View branch status
git status

# Stage changes
git add .

# Commit changes
git commit -m "commit message"

# Push to your fork
git push origin feature/branch-name

# Sync fork with upstream
git rebase upstream/main
git push origin feature/branch-name --force-with-lease

# Delete branch after merge
git branch -d feature/branch-name
```

---

## Contribution Ideas

**Good for first-time contributors**:
- 🐛 Fix typos in documentation
- 📚 Improve README sections
- ✨ Add code comments
- 🧪 Write test cases
- 🎨 Improve UI styling

**Medium difficulty**:
- 🔧 Refactor utility functions
- 📝 Add new API documentation
- 🧬 Add new component features
- 📊 Improve error messages

**Advanced**:
- 🚀 Optimize performance
- 🔐 Improve security
- 🏗️ Add new features
- 📦 Infrastructure improvements

---

## Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [React Docs](https://react.dev/)
- [Socket.IO Guide](https://socket.io/docs/)
- [Jest Testing](https://jestjs.io/)

---

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) for community standards.

**Summary**: Be respectful, inclusive, and constructive in all interactions.

---

<p align="center">
  <strong>Thank you for contributing to PASO! 🎉</strong><br/>
  Together we're building something amazing.
</p>
