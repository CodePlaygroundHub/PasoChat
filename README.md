![Banner](./assets/banneer.png)

<br/>

![License](https://img.shields.io/badge/license-MIT-green)
![Frontend CI](https://github.com/CodePlaygroundHub/paso-chat-app/actions/workflows/frontend-ci.yml/badge.svg)
![Backend CI](https://github.com/CodePlaygroundHub/paso-chat-app/actions/workflows/backend-ci.yml/badge.svg)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![GitHub issues](https://img.shields.io/github/issues/CodePlaygroundHub/paso-chat-app)
![GitHub contributors](https://img.shields.io/github/contributors/CodePlaygroundHub/paso-chat-app)
![GitHub last commit](https://img.shields.io/github/last-commit/CodePlaygroundHub/paso-chat-app)
![GitHub repo size](https://img.shields.io/github/repo-size/CodePlaygroundHub/paso-chat-app)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)

# PASO – AI-Powered Real-Time Chat App (React + Node.js + Socket.io + ML Integration)

PASO is a production-level real-time communication platform inspired by WhatsApp, enhanced with **Machine Learning capabilities**, **AI automation**, and full multimedia support. It integrates messaging, voice/video communication, intelligent moderation, and admin analytics into a complete chat ecosystem.

---

## Architecture

The application follows a scalable decoupled architecture designed to efficiently manage real-time communication, AI services, and ML-based moderation.
```mermaid
graph TD

%% ================= FRONTEND =================
subgraph FRONTEND [Frontend Layer]
A1[React Application]
A2[Zustand State Management]
A3[Tailwind CSS + DaisyUI]
A4[React Router]
A5[Socket.io Client]
A6[AI Chat Interface]
A7[Voice & Video Call UI]
A8[Message Search UI]
A9[Admin Dashboard UI]
end

%% ================= BACKEND =================
subgraph BACKEND [Backend Layer]
B1[Express Server]
B2[REST API Controllers]
B3[Authentication Service]
B4[JWT Middleware]

B5[Socket.io Server Instance 1]
B6[Socket.io Server Instance 2]

B7[Message Service]
B8[Group Service]
B9[User Service]
B10[Admin Service]
B11[Report Service]
B12[AI Service]
end

%% ================= REDIS =================
subgraph REDIS [Realtime Scaling Layer]
R1[(Redis Server)]
R2[Socket.io Redis Adapter]
R3[Pub/Sub Synchronization]
end

%% ================= DATABASE =================
subgraph DATABASE [Database Layer]
C1[(MongoDB)]

C2[Users Collection]
C3[Messages Collection]
C4[Groups Collection]
C5[Reports Collection]
C6[Status Collection]
end

%% ================= ML SERVICE =================
subgraph ML [ML Moderation Service]
D1[FastAPI Server]
D2[ML Text Processing]
D3[Toxicity Detection]
D4[Spam Detection]
D5[Smart Reply Suggestions]
end

%% ================= EXTERNAL SERVICES =================
subgraph EXTERNAL [External Services]
E1[Groq API]
E2[ZegoCloud]
E3[Cloudinary]
E4[Brevo Email Service]
end

%% ================= TESTING =================
subgraph TESTING [Backend Testing Infrastructure]
T1[Jest]
T2[Supertest]
T3[MongoDB Memory Server]
T4[Socket.io Client Testing]
T5[Integration Testing]
T6[Authentication Tests]
T7[Message API Tests]
T8[Realtime Socket Tests]
end

%% ================= DEVOPS =================
subgraph DEVOPS [CI/CD Pipeline]
F1[GitHub Actions]

F2[Frontend CI Pipeline]
F3[Backend CI Pipeline]

F4[ESLint Validation]
F5[Production Build Validation]

F6[Jest Integration Testing]
F7[Socket.IO Test Validation]
F8[Pull Request Validation]
F9[npm ci Deterministic Install]
end

%% ================= FRONTEND FLOW =================
A1 -->|REST API| B1
A5 -->|WebSocket| B5
A5 -->|WebSocket| B6

A6 -->|AI Requests| B12
A7 -->|Call Initialization| E2
A8 -->|Search Requests| B7
A9 -->|Admin Controls| B10

%% ================= BACKEND FLOW =================
B1 --> B2

B2 --> B3
B3 --> B4

B2 --> B7
B2 --> B8
B2 --> B9
B2 --> B10
B2 --> B11
B2 --> B12

%% ================= SOCKET FLOW =================
B5 --> B7
B6 --> B7

%% ================= REDIS SCALING =================
B5 --> R2
B6 --> R2

R2 --> R1
R1 --> R3

%% ================= DATABASE FLOW =================
B7 --> C3
B7 --> C6

B8 --> C4
B9 --> C2
B10 --> C5

C1 --> C2
C1 --> C3
C1 --> C4
C1 --> C5
C1 --> C6

%% ================= ML FLOW =================
B7 -->|Analyze Message| D1

D1 --> D2
D2 --> D3
D2 --> D4
D2 --> D5

%% ================= EXTERNAL SERVICES FLOW =================
B12 --> E1
B7 --> E2
B7 --> E3
B3 --> E4

%% ================= MEDIA FLOW =================
A1 -->|Upload Media| B7
B7 --> E3

%% ================= EMAIL FLOW =================
B3 -->|Send Emails| E4

%% ================= TESTING FLOW =================
T1 --> T5
T2 --> T5
T3 --> T5
T4 --> T8

T5 --> T6
T5 --> T7

%% ================= DEVOPS FLOW =================
F1 --> F2
F1 --> F3

F2 --> F4
F2 --> F5

F3 --> F4
F3 --> F6
F3 --> F7
F3 --> F9

F8 --> F2
F8 --> F3

%% ================= DEPLOYMENT FLOW =================
F2 --> A1
F3 --> B1

%% ================= TEST VALIDATION =================
F6 --> T1
F6 --> T2
F6 --> T3

F7 --> T4
```

## Screenshots

## Chat Interface
<p align="center">
    <!-- <img src="https://github.com/user-attachments/assets/f7412938-9575-40c8-a01d-e90540db73ec" width="90%"/> </p>  -->
    <p align="center"><img src="https://github.com/user-attachments/assets/a0a6e650-b7e7-46d5-8187-e2f6aa83e5ab" width="90%"/> </p>
    <p align="center"><img src="https://github.com/user-attachments/assets/56dea4bf-8551-4d2e-adb2-9e4120ec58e7" width="90%"/> </p>
    <!-- <p align="center"><img src="https://github.com/user-attachments/assets/9da9c528-4690-43d3-a7bd-0924278725e0" width="90%"/> </p> -->

See full gallery → docs/SCREENSHOTS.md

## Features

### Authentication & Security
- Secure signup and login
- Email/password authentication
- 3-level security question verification
- Forgot password with identity verification
- Email notifications via Brevo

---

### Messaging System
- One-to-one real-time chat
- Group chat with admin roles
- Message status (single/double/blue tick)
- Reactions and emoji support
- Reply to messages
- Pin messages
- Copy messages
- Delete for me / everyone
- Chat wallpapers and themes

---

### AI Integration
- AI chatbot powered by Groq API
- AI-assisted conversations
- Smart interaction flow

---

### Moderation & Reporting
- Message reporting system
- ML-based toxicity detection
- Spam detection
- Admin moderation pipeline

---

### Search Features
- Global message search
- Highlighted search results

---

### Calling Features
- Voice calling
- Video calling
- ZegoCloud integration

---

### Scalability & Infrastructure
- Redis-powered Socket.IO scaling
- Distributed realtime event synchronization
- Load testing support for socket infrastructure

---

### Admin Dashboard
- User management
- Analytics dashboard
- Report management
- CSV export support

---

### UI & Customization
- Built with React + Tailwind CSS + DaisyUI
- Dynamic themes
- Responsive design
- Modern chat interface


##  Machine Learning Service

Run Locally : 
```bash
cd ml-service
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## ML Features
- Toxic Message Detection (ML-based)
- Spam Detection (ML-based)

See [ML_MODEL.md](./ML_MODEL.md) for detailed implementation.

## Tech Stack

## Frontend:

- React.js
- Tailwind CSS
- DaisyUI

Backend:

- Node.js
- Express.js
- Socket.io
- Redis
- @socket.io/redis-adapter

Database:

- MongoDB

Services:

- Cloudinary
- Brevo
- Groq API
- ZegoCloud
- FastAPI (ML service)

## Deployment

- Frontend: Vercel

- Backend: Render

- ml-service: Render

## CI/CD Pipeline

- GitHub Actions powered CI workflows
- Automated frontend lint + production build validation
- Automated backend lint validation
- Automated backend integration testing with Jest
- Socket.IO realtime connection testing
- MongoDB in-memory test environment
- Pull request validation before merge
- npm ci based deterministic installs

## Backend Testing

PASO includes production-style backend testing infrastructure using:

- Jest
- Supertest
- MongoDB Memory Server
- Socket.IO Client Testing

### Covered Tests

- Authentication API testing
- Protected route testing
- Message API integration testing
- Socket.IO realtime connection testing
- Validation and error handling tests

### Run Backend Tests

```bash
cd backend
npm test
```

## Environment Variables

Backend

```bash
MONGODB_URI=
PORT=5001
JWT_SECRET=
NODE_ENV=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GROQ_API_KEY=

ZEGO_APP_ID=
ZEGO_SERVER_SECRET=

CLIENT_URL=https://chat-app-sooty-mu.vercel.app
BREVO_API_KEY=xxx-xxx-xxx

ML_SERVICE_URL=https://chat-app-1-bj8j.onrender.com/analyze

BASE_URL=http://localhost:5000

VITE_ZEGO_APP_ID=
VITE_ZEGO_SERVER_SECRET=
VITE_BACKEND_URL=http://localhost:5001
```

Frontend

```bash
VITE_ZEGO_APP_ID= (put it in frontend also if not work through backend)
VITE_ZEGO_SERVER_SECRET= (put it in frontend also if not work through backend)
# VITE_BACKEND_URL=https://chat-app-xsng.onrender.com
VITE_BACKEND_URL=http://localhost:5001
```

# Local Development Setup

## Prerequisites

Before running the project locally, make sure you have installed:

- Node.js
- MongoDB Atlas account or local MongoDB
- Docker Desktop (required for Redis)
- Python (for ML service)

---

# 1. Clone Repository

```bash
git clone https://github.com/CodePlaygroundHub/paso-chat-app.git
cd paso-chat-app
```

---

# 2. Start Redis Server (Required)

This project uses Redis for realtime pub/sub communication.

Make sure Docker Desktop is installed and running locally before executing the command below.

Run Redis using Docker:

```bash
docker run --name redis -p 6379:6379 redis
```

Keep this terminal running.

---

# 3. Configure Environment Variables

Create `.env` files inside:

```bash
/backend
/frontend
```

Use the provided `.env.example` files as reference.

Important:
- Add your MongoDB Atlas URI
- Add your Groq API key
- Add your Cloudinary credentials
- Add your ZegoCloud credentials

---

# 4. Allow MongoDB Atlas Network Access

If using MongoDB Atlas:

Go to:

Security → Network Access

Add:

```txt
0.0.0.0/0
```

or whitelist your current IP address.

---

# 5. Start Backend Server

Open a new terminal:

```bash
cd backend
npm install
npm run dev
```

Expected output:

```bash
✅ Redis connected
✅ MongoDB connected
Server running on port 5001
```

---

# 6. Start Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

---

# 7. Start ML Service (Optional but Recommended)

Open another terminal:

```bash
cd ml-service
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

---

# Application URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5001 |
| ML Service | http://localhost:8000 |


## Documentation

Detailed project documentation is available inside the `docs/` directory.

| Document | Description |
|---|---|
| `docs/ARCHITECTURE.md` | Complete system architecture |
| `docs/BACKEND.md` | Backend structure and workflow |
| `docs/FRONTEND.md` | Frontend architecture and state management |
| `docs/API.md` | REST API documentation |
| `docs/SOCKETS.md` | Socket.io realtime architecture |
| `docs/ML_SERVICE.md` | Machine learning moderation service |
| `docs/SETUP.md` | Local development setup guide |

## Project Highlights

- Real-time chat with Socket.io
- AI chatbot integration
- ML-based moderation system
- Full admin analytics panel
- Voice and video communication
- Scalable architecture
- Open-source contribution ready

## Contributing

- Check Issues
- Pick a task
- Submit a Pull Request

## Future Improvements
- Advanced ML moderation
- Notifications system
- Mobile optimization
- UI/UX improvements

## 🤝 Contributing
Contributions are welcome!  
See [CONTRIBUTING.md](./CONTRIBUTING.md)

Author

Akash Santra

---

## Community Guidelines

- Code of Conduct: [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Security Policy: [SECURITY.md](./SECURITY.md)
