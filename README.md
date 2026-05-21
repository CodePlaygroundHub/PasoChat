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

# PASO – AI-Powered Real-Time Chat App (React + Node.js + Socket.io + ML Integration)

PASO is a production-level real-time communication platform inspired by WhatsApp, enhanced with **Machine Learning capabilities**, **AI automation**, and full multimedia support. It integrates messaging, voice/video communication, intelligent moderation, and admin analytics into a complete chat ecosystem.

---

## Architecture

The application follows a scalable decoupled architecture designed to efficiently manage real-time communication, AI services, and ML-based moderation.

```mermaid
graph TD

%% ================= FRONTEND =================
subgraph FRONTEND [Frontend Layer]
A1[React App]
A2[State Management - Zustand]
A3[UI - Tailwind CSS + DaisyUI]
A4[React Router]
A5[Socket.io Client]
A6[AI Chat Interface]
A7[Voice/Video Call UI]
end

%% ================= BACKEND =================
subgraph BACKEND [Backend Layer]
B1[Express Server]
B2[REST API Controllers]
B3[Authentication Service]
B4[JWT Middleware]
B5[Socket.io Server]
B6[Message Service]
B7[Group Service]
B8[User Service]
B9[Admin Service]
end

%% ================= DATABASE =================
subgraph DATABASE [Database Layer]
C1[(MongoDB)]
C2[User Collection]
C3[Message Collection]
C4[Group Collection]
C5[Report Collection]
C6[Status Collection]
end

%% ================= ML SERVICE =================
subgraph ML [ML Moderation Service]
D1[FastAPI Server]
D2[Text Analysis Model]
D3[Toxicity Detection]
D4[Spam Detection]
end

%% ================= EXTERNAL =================
subgraph EXTERNAL [External Services]
E1[Groq API - AI Chat]
E2[ZegoCloud - Voice/Video]
E3[Cloudinary - Media Storage]
E4[Brevo - Email Service]
end

%% ================= DEVOPS =================
subgraph DEVOPS [CI/CD Pipeline]
F1[GitHub Actions]
F2[Frontend CI]
F3[Backend CI]
F4[ESLint Validation]
F5[Production Build Validation]
F6[Pull Request Validation]
end

%% ================= FLOW =================

%% Frontend to Backend
A1 -->|HTTP Requests| B1
A5 -->|WebSocket| B5

%% Backend internal flow
B1 --> B2
B2 --> B3
B3 --> B4

B2 --> B6
B2 --> B7
B2 --> B8
B2 --> B9

%% Socket communication
B5 --> B6

%% Database connections
B6 --> C3
B6 --> C6
B7 --> C4
B8 --> C2
B9 --> C5

C1 --> C2
C1 --> C3
C1 --> C4
C1 --> C5
C1 --> C6

%% ML Service
B6 -->|Analyze Message| D1
D1 --> D2
D2 --> D3
D2 --> D4

%% External APIs
B6 --> E1
B6 --> E2
B6 --> E3
B3 --> E4

%% AI Chat
A6 -->|AI Request| B6
B6 --> E1

%% Calling Feature
A7 -->|Initialize Call| E2

%% Media Upload
A1 -->|Upload Media| B6
B6 --> E3

%% Email Flow
B3 -->|Send Email| E4

%% ================= CI/CD FLOW =================

F1 --> F2
F1 --> F3

F2 --> F4
F2 --> F5

F3 --> F4

F2 --> A1
F3 --> B1

F6 --> F2
F6 --> F3
```

## Screenshots

## Authentication
<p align="center"> 
    <img src="https://github.com/user-attachments/assets/0a79012d-8a32-4bf4-b634-411d512e1a24" width="90%" />
</p>

## Chat Interface
<p align="center">
    <img src="https://github.com/user-attachments/assets/f7412938-9575-40c8-a01d-e90540db73ec" width="90%"/> </p> 
    <p align="center"><img src="https://github.com/user-attachments/assets/a0a6e650-b7e7-46d5-8187-e2f6aa83e5ab" width="90%"/> </p>
    <p align="center"><img src="https://github.com/user-attachments/assets/56dea4bf-8551-4d2e-adb2-9e4120ec58e7" width="90%"/> </p>
    <p align="center"><img src="https://github.com/user-attachments/assets/9da9c528-4690-43d3-a7bd-0924278725e0" width="90%"/> </p>

## AI Chat
<p align="center"> <img src="https://github.com/user-attachments/assets/c262ed0c-303b-4307-9141-9159f20233cf" width="90%"/> </p>

## Calling
<p align="center"> <img src="https://github.com/user-attachments/assets/3aa8c4bb-0861-4d4b-abad-2861347ac865" width="90%"/> </p>

## Status page
<p align="center"> <img src="https://github.com/user-attachments/assets/96aea367-128d-47f1-9588-d89d3dff7b29" width="90%"/> </p>

## Admin Panel
<p align="center"> <img src="https://github.com/user-attachments/assets/8f96ed1a-fd29-4cd3-8d05-9f2c36e08492" width="90%"/> </p> 
<p align="center"> <img src="https://github.com/user-attachments/assets/a53aea78-82c0-4f40-a94a-eeba0b053eed" width="90%"/> </p> 
<p align="center"> <img src="https://github.com/user-attachments/assets/fe17f60b-a3c1-4152-9d5e-9aced6f67d4c" width="90%"/> </p>

## Features

Authentication System

- Secure sign up with full name, email, password
- Security questions (3-level verification)
- Forgot password with identity verification
- Email notifications via Brevo

UI and Customization

- Built with DaisyUI and Tailwind CSS
- Dynamic themes
- Chat wallpapers

AI Integration
- AI chatbot powered by Groq API

Messaging System

- One-to-one chat
- Group chat with admin roles

Features:

- Message status (single/double/blue tick)
- Reactions
- Pin messages
- Reply system
- Copy text
- Delete (me / everyone)


Reporting and Moderation
- Message reporting system
- ML-based moderation
- Admin review pipeline

Search System

- Global message search
- Highlighted results

Calling Features

Voice and video calls (ZegoCloud)
- Admin Panel
- Analytics dashboard
- User management
- Report management
- CSV export

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
- Pull request validation before merge
- npm ci based deterministic installs

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
