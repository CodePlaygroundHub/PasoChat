const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }}></span>
      <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-typing-dot" style={{ animationDelay: '150ms' }}></span>
      <span className="w-1.5 h-1.5 bg-base-content/40 rounded-full animate-typing-dot" style={{ animationDelay: '300ms' }}></span>
    </div>
  );
};

export default TypingIndicator;
