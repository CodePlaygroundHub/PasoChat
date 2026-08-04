import { useState } from "react";
import {
  MessageSquare,
  Lightbulb,
  Terminal,
  Heart,
  Code2,
  Rocket,
  ShieldCheck,
  ArrowLeft,
  Copy,
  Check,
  Server,
  Database,
  Cpu,
  Globe,
  GitBranch,
  ExternalLink,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const TECH_STACK = [
  {
    title: "Frontend Layer",
    icon: Code2,
    badge: "Client",
    color: "text-primary bg-primary/10 border-primary/20",
    techs: ["React.js", "Zustand State", "Tailwind CSS", "DaisyUI", "Socket.io Client"],
  },
  {
    title: "Backend Services",
    icon: Server,
    badge: "Core API",
    color: "text-secondary bg-secondary/10 border-secondary/20",
    techs: ["Node.js", "Express.js", "Socket.io Server", "JWT Auth", "RESTful APIs"],
  },
  {
    title: "Database Layer",
    icon: Database,
    badge: "Persistence",
    color: "text-accent bg-accent/10 border-accent/20",
    techs: ["MongoDB Atlas", "Mongoose ODM", "Schema Indexing"],
  },
  {
    title: "ML Moderation",
    icon: Cpu,
    badge: "AI Service",
    color: "text-warning bg-warning/10 border-warning/20",
    techs: ["FastAPI", "Toxicity Analysis", "Content Moderation Model"],
  },
  {
    title: "External Integrations",
    icon: Globe,
    badge: "Cloud Services",
    color: "text-info bg-info/10 border-info/20",
    techs: ["Groq AI API", "ZegoCloud Audio/Video", "Cloudinary Storage", "Brevo Mail"],
  },
];

const ContributePage = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const commandText =
    "git clone https://github.com/akashsantra/paso.git\ncd paso\nnpm install\nnpm run dev";

  const handleCopy = () => {
    navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-full bg-base-200 overflow-hidden items-center justify-center p-0 md:p-3 lg:p-4">
      <div className="flex flex-col h-full w-full max-w-6xl bg-base-100 md:rounded-2xl shadow-xl overflow-hidden border border-base-300">
        
        {/* Top Navbar */}
        <Navbar />

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 custom-scrollbar">
          
          {/* Header Action Bar */}
          <div className="flex items-center justify-between border-b border-base-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/")}
                className="btn btn-ghost btn-sm btn-circle text-base-content/70 hover:text-base-content hover:bg-base-200"
                title="Back to App"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-base-content flex items-center gap-2">
                  <GitPullRequest className="h-5 w-5 text-primary" />
                  Contributor Portal
                </h1>
                <p className="text-xs text-base-content/60">
                  Build and extend PASO with the open-source community
                </p>
              </div>
            </div>

            <a
              href="https://github.com/Akash504-ai/Chat-app"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm gap-2 rounded-xl text-xs"
            >
              <ExternalLink size={14} />
              <span>GitHub Repo</span>
            </a>
          </div>

          {/* Hero Banner */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-base-200/50 to-secondary/10 border border-base-300 p-6 sm:p-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-base-100 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase shadow-sm">
              <Code2 size={14} /> Open Source Initiative
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-base-content max-w-2xl mx-auto leading-tight">
              Build the Future of Real-Time Chat with{" "}
              <span className="bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent">
                PASO
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-base-content/70 max-w-xl mx-auto leading-relaxed">
              From fixing bug tickets to adding AI moderation features—help us craft an accessible, ultra-fast messaging app.
            </p>
          </section>

          {/* Architecture Tech Stack Grid */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                  <GitBranch className="text-primary w-5 h-5" />
                  System Architecture
                </h2>
                <p className="text-xs text-base-content/60">
                  Distributed microservice stack powering real-time chat & AI
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TECH_STACK.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="group relative p-4 rounded-2xl bg-base-200/40 border border-base-300 hover:border-primary/40 hover:bg-base-200/80 transition-all duration-300 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl border ${item.color}`}>
                          <IconComponent size={18} />
                        </div>
                        <h3 className="font-bold text-sm text-base-content">
                          {item.title}
                        </h3>
                      </div>
                      <span className="badge badge-xs badge-ghost text-[10px] opacity-60">
                        {item.badge}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.techs.map((tech, tIdx) => (
                        <span
                          key={tIdx}
                          className="badge badge-sm bg-base-100 border-base-300 text-base-content/80 text-[11px] font-medium py-2 px-2.5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Journey Steps & Quick Start Terminal */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Steps Timeline */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                <Rocket className="text-primary w-5 h-5" />
                Contributor Roadmap
              </h2>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-base-200/40 border border-base-300 flex items-start gap-3.5 hover:border-primary/30 transition-all">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-base-content">
                      Fork & Clone Repository
                    </h3>
                    <p className="text-xs text-base-content/60 leading-relaxed mt-0.5">
                      Fork the PASO repository to your GitHub account and clone it locally.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-base-200/40 border border-base-300 flex items-start gap-3.5 hover:border-primary/30 transition-all">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-base-content">
                      Branching Standard
                    </h3>
                    <p className="text-xs text-base-content/60 leading-relaxed mt-0.5">
                      Name feature branches <code className="text-primary">feat/your-feature</code> or <code className="text-primary">fix/issue-id</code>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-base-200/40 border border-base-300 flex items-start gap-3.5 hover:border-primary/30 transition-all">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-base-content">
                      Pull Request Review
                    </h3>
                    <p className="text-xs text-base-content/60 leading-relaxed mt-0.5">
                      Submit your Pull Request with clear setup steps and test verifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terminal Box */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-base-content flex items-center gap-2">
                <Terminal className="text-primary w-5 h-5" />
                Development Terminal
              </h2>

              <div className="card bg-neutral text-neutral-content shadow-xl border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-white/5 px-4 py-3 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-error/80"></div>
                    <div className="w-3 h-3 rounded-full bg-warning/80"></div>
                    <div className="w-3 h-3 rounded-full bg-success/80"></div>
                    <span className="text-xs font-mono ml-2 text-white/50">bash — paso dev</span>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="btn btn-ghost btn-xs text-white/80 hover:text-white gap-1 rounded-lg"
                    title="Copy commands"
                  >
                    {copied ? (
                      <CheckCircle2 size={14} className="text-success" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span className="text-[10px] font-mono">{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="p-5 font-mono text-xs space-y-3 bg-black/60 text-emerald-400 select-all">
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 select-none">1</span>
                    <p><span className="text-white/40">$</span> git clone https://github.com/akashsantra/paso.git</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 select-none">2</span>
                    <p><span className="text-white/40">$</span> cd paso</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 select-none">3</span>
                    <p><span className="text-white/40">$</span> npm install</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/30 select-none">4</span>
                    <p><span className="text-white/40">$</span> npm run dev</p>
                  </div>
                </div>
              </div>
            </div>

          </section>

          {/* Action Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Bug Reports */}
            <div className="group bg-base-200/40 rounded-2xl p-5 border border-base-300 flex flex-col justify-between hover:border-error/40 hover:bg-base-200/70 transition-all duration-200">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-error/10 text-error flex items-center justify-center ring-1 ring-error/20">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-base-content group-hover:text-error transition-colors">
                    Bug Reports
                  </h3>
                  <p className="text-xs text-base-content/60 leading-relaxed mt-1">
                    Spotted a issue with WebSockets, audio calls, or UI layout? Report it on GitHub.
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-2">
                <a
                  href="https://github.com/Akash504-ai/Chat-app/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-error btn-outline btn-xs rounded-xl w-full gap-2"
                >
                  <span>Open Issue Tracker</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Feature Ideas */}
            <div className="group bg-base-200/40 rounded-2xl p-5 border border-base-300 flex flex-col justify-between hover:border-secondary/40 hover:bg-base-200/70 transition-all duration-200">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center ring-1 ring-secondary/20">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-base-content group-hover:text-secondary transition-colors">
                    Feature Discussions
                  </h3>
                  <p className="text-xs text-base-content/60 leading-relaxed mt-1">
                    Have an idea for AI capabilities or custom theme extensions? Pitch ideas to the community.
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-2">
                <a
                  href="https://github.com/Akash504-ai/Chat-app/discussions"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-outline btn-xs rounded-xl w-full gap-2"
                >
                  <span>Join Discussions</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Security */}
            <div className="group bg-base-200/40 rounded-2xl p-5 border border-base-300 flex flex-col justify-between hover:border-accent/40 hover:bg-base-200/70 transition-all duration-200">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center ring-1 ring-accent/20">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-base-content group-hover:text-accent transition-colors">
                    Security Policy
                  </h3>
                  <p className="text-xs text-base-content/60 leading-relaxed mt-1">
                    Found a security vulnerability? Follow our disclosure policy for private reporting.
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-2">
                <a
                  href="https://github.com/Akash504-ai/Chat-app/tree/main?tab=security-ov-file"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-accent btn-outline btn-xs rounded-xl w-full gap-2"
                >
                  <span>View Security Policy</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

          </section>

          {/* Footer */}
          <footer className="text-center pb-4 pt-2 border-t border-base-200">
            <p className="font-medium text-xs flex items-center justify-center gap-1.5 text-base-content/60">
              Crafted with{" "}
              <Heart size={14} className="text-red-500 fill-red-500 animate-pulse" />{" "}
              by Akash Santra
            </p>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default ContributePage;