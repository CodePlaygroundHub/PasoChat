import { Check, Minus } from "lucide-react";
import React, { useState } from "react";

const ComparisonTable = () => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (index) => {
    if (expandedRow === index) {
      setExpandedRow(null);
    } else {
      setExpandedRow(index);
    }
  };

  const features = [
    {
      category: "Core Features",
      items: [
        { name: "Real-time Messaging", desc: "Instant text delivery powered by Redis Pub/Sub.", community: "Unlimited", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "WebRTC Voice Calls", desc: "High-quality, low-latency audio rooms.", community: <Check className="w-4 h-4 mx-auto text-primary" />, pro: <Check className="w-4 h-4 mx-auto text-primary" />, enterprise: <Check className="w-4 h-4 mx-auto text-primary" /> },
        { name: "Message History", desc: "Retain and search past conversations.", community: "30 Days", pro: "Unlimited", enterprise: "Unlimited" },
        { name: "File Storage", desc: "Securely upload and share documents and media.", community: "5 GB", pro: "100 GB", enterprise: "Unlimited" }
      ]
    },
    {
      category: "Advanced & AI",
      items: [
        { name: "AI Content Moderation", desc: "Real-time toxicity and spam filtering.", community: <Minus className="w-4 h-4 mx-auto opacity-30" />, pro: <Check className="w-4 h-4 mx-auto text-primary" />, enterprise: <Check className="w-4 h-4 mx-auto text-primary" /> },
        { name: "Message Analytics", desc: "Dashboard for engagement and usage stats.", community: <Minus className="w-4 h-4 mx-auto opacity-30" />, pro: <Check className="w-4 h-4 mx-auto text-primary" />, enterprise: <Check className="w-4 h-4 mx-auto text-primary" /> },
        { name: "Custom Emojis & Reactions", desc: "Personalize your workspace expression.", community: <Minus className="w-4 h-4 mx-auto opacity-30" />, pro: <Check className="w-4 h-4 mx-auto text-primary" />, enterprise: <Check className="w-4 h-4 mx-auto text-primary" /> }
      ]
    },
    {
      category: "Security & Admin",
      items: [
        { name: "End-to-End Encryption", desc: "Military-grade encryption for all direct messages.", community: <Check className="w-4 h-4 mx-auto text-primary" />, pro: <Check className="w-4 h-4 mx-auto text-primary" />, enterprise: <Check className="w-4 h-4 mx-auto text-primary" /> },
        { name: "SSO / SAML", desc: "Integrate with Okta, Google Workspace, Azure.", community: <Minus className="w-4 h-4 mx-auto opacity-30" />, pro: <Minus className="w-4 h-4 mx-auto opacity-30" />, enterprise: <Check className="w-4 h-4 mx-auto text-primary" /> },
        { name: "Deployment", desc: "Where your data lives.", community: "Shared Cloud", pro: "Dedicated Cloud", enterprise: "On-Premise / VPC" }
      ]
    }
  ];

  let rowIndex = 0;

  return (
    <section id="comparison" className="py-24 px-4 md:px-8 relative">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <span className="text-primary text-[10px] font-semibold uppercase tracking-[0.25em] block mb-3">
            Deployment Options
          </span>
          <h2 className="font-display text-3xl md:text-5xl text-base-content font-semibold leading-tight mb-4">
            Three Environments. <span className="italic font-light opacity-70">One Infrastructure.</span>
          </h2>
          <p className="text-base-content/50 text-sm max-w-lg mx-auto leading-relaxed">
            Hover any row to read the full description. Click to expand.
          </p>
        </div>

        <div className="rounded-2xl overflow-x-auto border border-primary/10 bg-base-100/50 backdrop-blur-sm">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr>
                <th className="text-left p-5 w-[40%] bg-base-200/80">
                  <span className="text-base-content/40 text-xs uppercase tracking-widest font-medium">Feature</span>
                </th>
                <th className="text-center p-5 bg-base-200/80 border-l border-base-100 align-top">
                  <div className="font-display text-base-content font-semibold text-base block mt-6">Shared Cloud</div>
                  <div className="text-primary font-semibold text-sm mt-1">Free</div>
                  <div className="text-base-content/40 text-[10px] uppercase tracking-wider mt-0.5">Community Edition</div>
                </th>
                <th className="text-center p-5 bg-primary/10 border-l border-base-100 align-top relative">
                  <div className="flex justify-center mb-2">
                    <span className="bg-primary text-primary-content text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                      Recommended
                    </span>
                  </div>
                  <div className="font-display text-base-content font-semibold text-base block">Dedicated Cloud</div>
                  <div className="text-primary font-semibold text-sm mt-1">Managed</div>
                  <div className="text-base-content/40 text-[10px] uppercase tracking-wider mt-0.5">For Teams</div>
                </th>
                <th className="text-center p-5 bg-base-200/80 border-l border-base-100 align-top">
                  <div className="font-display text-base-content font-semibold text-base block mt-6">On-Premise</div>
                  <div className="text-primary font-semibold text-sm mt-1">Self-Hosted</div>
                  <div className="text-base-content/40 text-[10px] uppercase tracking-wider mt-0.5">For Scale & Security</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((section, sIdx) => (
                <React.Fragment key={sIdx}>
                  <tr>
                    <td colSpan="4" className="px-5 py-2 bg-base-200/40 border-t border-primary/10">
                      <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">{section.category}</span>
                    </td>
                  </tr>
                  {section.items.map((item) => {
                    const currentRowIndex = rowIndex++;
                    const isExpanded = expandedRow === currentRowIndex;
                    return (
                      <tr 
                        key={item.name} 
                        className="cursor-pointer hover:bg-base-200/20 transition-colors group"
                        onClick={() => toggleRow(currentRowIndex)}
                      >
                        <td className="px-5 py-4 border-b border-primary/5">
                          <div className="flex items-center gap-2">
                            <span className="text-base-content/80 text-sm font-medium">{item.name}</span>
                          </div>
                          <div className={`text-base-content/50 text-xs leading-relaxed mt-1 transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 group-hover:max-h-20 group-hover:opacity-100'}`}>
                            {item.desc}
                          </div>
                        </td>
                        <td className="text-center px-5 py-4 border-l border-b border-primary/5">
                          <span className="text-base-content/80 text-xs font-medium">{item.community}</span>
                        </td>
                        <td className="text-center px-5 py-4 bg-primary/5 border-l border-b border-primary/5">
                          <span className="text-base-content/80 text-xs font-medium">{item.pro}</span>
                        </td>
                        <td className="text-center px-5 py-4 border-l border-b border-primary/5">
                          <span className="text-base-content/80 text-xs font-medium">{item.enterprise}</span>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-base-200/80 border-t border-primary/10">
                <td className="p-6">
                  <span className="text-base-content/40 text-xs">PASO is fully open-source and free to use.</span>
                </td>
                <td className="p-4 text-center border-l border-base-100">
                  <a href="https://github.com/Akash504-ai/Chat-app.git" className="btn btn-sm btn-outline btn-primary rounded-full px-5">View GitHub</a>
                </td>
                <td className="p-4 text-center border-l border-base-100 bg-primary/10">
                  <a href="#cta-form" className="btn btn-sm btn-primary rounded-full px-5">Provision Cloud</a>
                </td>
                <td className="p-4 text-center border-l border-base-100">
                  <a href="#cta-form" className="btn btn-sm btn-outline btn-primary rounded-full px-5">Contact Sales</a>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
