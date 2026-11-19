import { useEffect, useRef, useState } from "react";

const StatusProgress = ({ duration = 5000, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    setProgress(0);

    let frameId;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const percent = Math.min((elapsed / duration) * 100, 100);

      setProgress(percent);

      if (percent >= 100) {
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [duration]);

  return (
    <div className="h-0.5 w-full overflow-hidden rounded-full bg-zinc-700/80">
      <div
        className="h-full bg-zinc-100 transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default StatusProgress;