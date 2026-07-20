const TechStack = () => {
  const technologies = [
    "React", "Express", "MongoDB", "Redis", "Socket.IO", "FastAPI", "Groq AI", "Cloudinary", "ZegoCloud"
  ];

  return (
    <section className="py-12 border-y border-base-200 bg-base-100/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-base-content/60 uppercase tracking-wider">
            Powered by modern technologies
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {technologies.map((tech, index) => (
            <div 
              key={index}
              className={`px-6 py-3 bg-base-100 rounded-xl border border-base-200 text-base-content font-medium cursor-default card-anim ${index % 2 === 0 ? 'animate-soft-tilt hover-glow' : 'animate-soft-tilt-reverse hover-glow-reverse'}`}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
