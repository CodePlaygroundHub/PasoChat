import { useState } from "react";

const UseCaseQuiz = () => {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  const goals = [
    { id: "internal", icon: "🚀", title: "Internal Collaboration", desc: "Connecting remote or hybrid teams" },
    { id: "support", icon: "⚡", title: "Customer Support", desc: "Real-time live chat with users" },
    { id: "community", icon: "🎓", title: "Community Building", desc: "Large scale public groups & forums" },
    { id: "curiosity", icon: "✨", title: "Pure Curiosity", desc: "Exploring the WebRTC & AI tech" }
  ];

  const sizes = ["1–10", "11–50", "51–250", "250+"];

  const isComplete = selectedGoal && selectedSize;

  return (
    <section id="quiz" className="py-24 px-4 md:px-8 relative">
      <div 
        aria-hidden="true" 
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(116,128,255,0.07) 0%, transparent 70%)' }}
      />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <span className="text-primary text-[10px] font-semibold uppercase tracking-[0.25em] block mb-3">
            Personalize Your Path
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-base-content font-semibold leading-tight mb-4">
            What’s Your <span className="italic font-light opacity-70">Primary Goal?</span>
          </h2>
          <p className="text-base-content/50 text-sm max-w-md mx-auto">
            Tell us why you’re here and we’ll highlight the infrastructure built for your situation.
          </p>
        </div>

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`rounded-xl p-5 text-left transition-all border ${
                  selectedGoal === goal.id 
                    ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(116,128,255,0.2)]' 
                    : 'border-base-300 bg-base-200/50 hover:border-primary/50 hover:bg-base-200'
                }`}
              >
                <div className="text-2xl mb-3">{goal.icon}</div>
                <div className="text-base-content font-medium text-sm mb-1">{goal.title}</div>
                <div className="text-base-content/50 text-xs">{goal.desc}</div>
              </button>
            ))}
          </div>

          <div className="rounded-xl p-5 mb-8 border border-base-300 bg-base-200/50">
            <label className="text-base-content/60 text-xs font-medium uppercase tracking-wider block mb-3">
              How large is your organization?
            </label>
            <div className="flex gap-3 flex-wrap">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${
                    selectedSize === size
                      ? 'border-primary bg-primary text-primary-content shadow-[0_0_10px_rgba(116,128,255,0.4)]'
                      : 'border-base-300 text-base-content/60 hover:text-base-content hover:border-primary/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button 
            className={`w-full font-semibold text-sm py-4 rounded-full transition-all ${
              isComplete 
                ? 'bg-primary text-slate-900 shadow-[0_0_20px_rgba(116,128,255,0.3)] hover:scale-[1.02] hover:bg-primary-focus' 
                : 'bg-base-300 text-base-content/40 cursor-not-allowed'
            }`}
            disabled={!isComplete}
            onClick={() => document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Show My Recommendation →
          </button>
        </div>
      </div>
    </section>
  );
};

export default UseCaseQuiz;
