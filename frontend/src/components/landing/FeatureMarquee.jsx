

const FeatureMarquee = () => {
  const features = [
    "Real-Time WebRTC",
    "AI Content Moderation",
    "End-to-End Encryption",
    "High Availability Redis",
    "Seamless UI",
    "Scalable Architecture",
    "Low Latency Sockets",
    "JWT Authentication",
    "Enterprise Ready"
  ];

  return (
    <section id="features" className="overflow-hidden whitespace-nowrap py-4 border-y border-primary/20 bg-base-200/40 backdrop-blur-md" aria-hidden="true">
      <div className="flex w-max animate-[marquee_30s_linear_infinite]">
        {/* We render the list twice to create an infinite scroll effect */}
        {[...Array(2)].map((_, arrayIndex) => (
          <div key={arrayIndex} className="flex flex-shrink-0 items-center">
            {features.map((feature, index) => (
              <div key={`${arrayIndex}-${index}`} className="flex items-center">
                <span className="text-xs font-medium uppercase tracking-widest px-6 text-base-content/50">
                  {feature}
                </span>
                <span className="text-xs font-medium uppercase tracking-widest px-6 text-primary">
                  ✦
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureMarquee;
