import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const AudioMessage = ({ audioUrl, isMe }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => setDuration(audio.duration);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time = 0) => {
    if (!Number.isFinite(time) || time < 0) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div
      className={`flex w-60 items-center gap-2.5 rounded-lg border px-2.5 py-2 ${
        isMe
          ? "border-white/15 dark:border-zinc-950/15 bg-white/10 dark:bg-zinc-950/10 text-white dark:text-zinc-950"
          : "border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-100"
      }`}
    >
      <button
        type="button"
        onClick={togglePlay}
        aria-label={isPlaying ? "Pause voice message" : "Play voice message"}
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors cursor-pointer ${
          isMe
            ? "border-white/20 dark:border-zinc-950/20 bg-white/10 dark:bg-zinc-950/10 text-white dark:text-zinc-950 hover:bg-white/20 dark:hover:bg-zinc-950/20"
            : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        }`}
      >
        {isPlaying ? (
          <Pause className="h-3.5 w-3.5 stroke-[1.75]" />
        ) : (
          <Play className="h-3.5 w-3.5 stroke-[1.75]" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className={`h-1 w-full overflow-hidden rounded-full ${
            isMe
              ? "bg-white/20 dark:bg-zinc-950/20"
              : "bg-zinc-200 dark:bg-zinc-800"
          }`}
        >
          <div
            className={`h-full transition-all duration-100 ${
              isMe
                ? "bg-white dark:bg-zinc-950"
                : "bg-zinc-700 dark:bg-zinc-300"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div
          className={`mt-1 flex justify-between text-[10px] tabular-nums ${
            isMe
              ? "text-white/70 dark:text-zinc-950/70"
              : "text-zinc-500 dark:text-zinc-400"
          }`}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
};

export default AudioMessage;