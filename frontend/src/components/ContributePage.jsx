import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";
import {
  Github,
  MessageSquare,
  Lightbulb,
  Terminal,
  Heart,
  Code2,
  Rocket,
  Share2,
  ShieldCheck,
  Network,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

// Initialize Mermaid configuration
mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "inherit",
});

const MermaidDiagram = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="mermaid flex justify-center py-4 overflow-x-auto" ref={ref}>
      {chart}
    </div>
  );
};

const ContributePage = () => {
  const navigate = useNavigate();

  const systemArchitecture = `
    graph TD
    %% ================= FRONTEND =================
    subgraph FRONTEND [Frontend Layer]
    A1[React App]
    A2[State Management]
    A3[UI: Tailwind + DaisyUI]
    A4[Routing]
    A5[Socket Client]
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
    end

    %% ================= ML SERVICE =================
    subgraph ML [ML Moderation Service]
    D1[FastAPI Server]
    D2[Text Analysis Model]
    D3[Toxicity Detection]
    end

    %% ================= EXTERNAL =================
    subgraph EXTERNAL [External Services]
    E1[Groq API - AI Chat]
    E2[ZegoCloud - Voice/Video]
    E3[Cloudinary - Media Storage]
    E4[Brevo - Email Service]
    end

    %% ================= FLOW =================
    A1 -->|HTTP Requests| B1
    A5 -->|WebSocket| B5
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B2 --> B6
    B2 --> B7
    B2 --> B8
    B2 --> B9
    B5 --> B6
    B6 --> C3
    B7 --> C4
    B8 --> C2
    B9 --> C5
    C1 --> C2
    C1 --> C3
    C1 --> C4
    C1 --> C5
    B6 -->|Analyze Message| D1
    D1 --> D2
    D2 --> D3
    B6 --> E1
    B6 --> E3
    B3 --> E4
    B6 --> E2
    A1 -->|AI Chat Request| B6
    A1 -->|Call Init| E2
    A1 -->|Upload Media| B6
  `;

  return (
    <div className="flex h-full w-full bg-base-200 overflow-hidden items-center justify-center p-0 md:p-3 lg:p-4">
      <div className="flex flex-col h-full w-full max-w-6xl bg-base-100 md:rounded-2xl shadow-xl overflow-hidden border border-base-300">
        
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Main Content Container */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-16 custom-scrollbar">
          
          {/* Back Action Bar */}
          <div className="flex items-center gap-3 border-b border-base-200 pb-4">
            <button
              onClick={() => navigate("/")}
              className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content"
              title="Back to App"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/60">
              Back to Chat
            </span>
          </div>

          {/* Hero Header */}
          <section className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="badge badge-primary badge-outline gap-2 py-4 px-6 text-sm font-bold tracking-widest uppercase rounded-full">
                <Code2 size={16} /> Open Source Initiative
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PASO Roadmap
            </h1>
            <p className="text-base md:text-lg text-base-content/60 max-w-2xl mx-auto leading-relaxed">
              From your first fork to your first production-ready Pull Request.
              Join us in building a smarter communication ecosystem.
            </p>
          </section>

          {/* System Architecture */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Network className="text-primary" /> System Architecture
                </h2>
                <p className="text-sm text-base-content/60">
                  Understand the data flow between React, Express, FastAPI, and MongoDB.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="badge badge-sm badge-outline opacity-60">Microservices</div>
                <div className="badge badge-sm badge-outline opacity-60">WebSockets</div>
                <div className="badge badge-sm badge-outline opacity-60">ML-Integrated</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative bg-base-200 border border-base-300 rounded-2xl p-4 md:p-6 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <Layers size={18} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                      Infrastructure Map v1.0
                    </span>
                  </div>
                </div>

                <div className="bg-base-100/50 rounded-xl p-2 md:p-4 overflow-x-auto custom-mermaid-container">
                  <MermaidDiagram chart={systemArchitecture} />
                </div>
              </div>
            </div>
          </section>

          {/* Steps & Quick Start */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Rocket className="text-primary" /> The Contributor's Journey
              </h2>

              <ul className="steps steps-vertical">
                <li className="step step-primary">
                  <div className="text-left ml-4 py-2">
                    <h3 className="font-bold text-base">Fork & Explore</h3>
                    <p className="text-xs text-base-content/60">
                      Create your own copy of the PASO repository and explore the microservice architecture.
                    </p>
                  </div>
                </li>
                <li className="step step-primary">
                  <div className="text-left ml-4 py-2">
                    <h3 className="font-bold text-base">Branching Strategy</h3>
                    <p className="text-xs text-base-content/60">
                      Always create a <code>feat/feature-name</code> or <code>fix/bug-name</code> branch.
                    </p>
                  </div>
                </li>
                <li className="step">
                  <div className="text-left ml-4 py-2">
                    <h3 className="font-bold text-base">Pull Request</h3>
                    <p className="text-xs text-base-content/60">
                      Submit your PR with a clear description of the problem solved.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="card bg-neutral text-neutral-content shadow-xl border border-white/5 rounded-2xl">
              <div className="card-body p-0">
                <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-error/50"></div>
                  <div className="w-3 h-3 rounded-full bg-warning/50"></div>
                  <div className="w-3 h-3 rounded-full bg-success/50"></div>
                  <span className="text-xs font-mono ml-3 opacity-40">terminal — bash</span>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-primary font-bold text-xs mb-2 uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={14} /> Quick Start
                    </p>
                    <div className="font-mono text-xs space-y-2 bg-black/40 p-4 rounded-xl">
                      <p><span className="text-success">git</span> clone https://github.com/akashsantra/paso.git</p>
                      <p><span className="text-success">cd</span> paso</p>
                      <p><span className="text-success">npm</span> install && <span className="text-success">npm</span> run dev</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Help Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bug Tracker */}
            <div className="relative bg-base-200/80 rounded-2xl p-6 border border-base-300 flex flex-col justify-between hover:border-error/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center mb-4 ring-1 ring-error/20">
                  <MessageSquare className="text-error" size={24} />
                </div>
                <h2 className="text-xl font-bold mb-2">Bug Reports</h2>
                <p className="text-xs text-base-content/60 leading-relaxed">
                  Spotted a glitch in the Socket.io flow or UI? Detail the steps to reproduce on our tracker.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <a
                  href="https://github.com/Akash504-ai/Chat-app/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-error btn-outline btn-xs rounded-full px-4"
                >
                  Open Tracker
                </a>
                <Share2 size={16} className="opacity-30" />
              </div>
            </div>

            {/* Feature Requests */}
            <div className="relative bg-base-200/80 rounded-2xl p-6 border border-base-300 flex flex-col justify-between hover:border-secondary/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 ring-1 ring-secondary/20">
                  <Lightbulb className="text-secondary" size={24} />
                </div>
                <h2 className="text-xl font-bold mb-2">Feature Requests</h2>
                <p className="text-xs text-base-content/60 leading-relaxed">
                  Have a vision for AI-driven real-time features? Pitch ideas to the community roadmap.
                </p>
              </div>
              <div className="mt-6">
                <a
                  href="https://github.com/Akash504-ai/Chat-app/discussions"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-outline btn-xs rounded-full px-4"
                >
                  Discussion Hub
                </a>
              </div>
            </div>

            {/* Security Policy */}
            <div className="relative bg-base-200/80 rounded-2xl p-6 border border-base-300 flex flex-col justify-between hover:border-accent/40 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 ring-1 ring-accent/20">
                  <ShieldCheck className="text-accent" size={24} />
                </div>
                <h2 className="text-xl font-bold mb-2">Security</h2>
                <p className="text-xs text-base-content/60 leading-relaxed">
                  Found a vulnerability? Please reach out via private channels for coordinated disclosure.
                </p>
              </div>
              <div className="mt-6">
                <a
                  href="https://github.com/Akash504-ai/Chat-app/tree/main?tab=security-ov-file"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-accent btn-outline btn-xs rounded-full px-4"
                >
                  View Policy
                </a>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center pb-6 pt-4 border-t border-base-200">
            <p className="font-medium text-sm flex items-center justify-center gap-1.5 text-base-content/70">
              Made with{" "}
              <Heart
                size={16}
                className="text-red-500 fill-red-500 animate-pulse"
              />{" "}
              by Akash Santra
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default ContributePage;