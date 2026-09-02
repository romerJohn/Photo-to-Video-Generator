import React, { useEffect, useState } from "react";
import { Film, Sparkles, Clock, CheckCircle2, Video } from "lucide-react";
import { REASSURANCE_MESSAGES } from "../data/samplePhotos";
import { AspectRatio } from "../types";

interface GenerationProgressProps {
  aspectRatio: AspectRatio;
  prompt: string;
  sourceImagePreview: string;
  operationName: string | null;
  elapsedSeconds: number;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  aspectRatio,
  prompt,
  sourceImagePreview,
  operationName,
  elapsedSeconds,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Cycle reassuring steps every 9 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % REASSURANCE_MESSAGES.length);
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  const currentMessage = REASSURANCE_MESSAGES[currentStepIndex];

  return (
    <div
      id="generation-progress-card"
      className="relative rounded-3xl border border-[#27272a] bg-[#18181b] p-6 sm:p-8 shadow-2xl overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#3b82f6]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#a855f7]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header with timer */}
        <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3b82f620] border border-[#3b82f6]/30 flex items-center justify-center text-[#3b82f6]">
              <Film className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#fafafa] flex items-center gap-2">
                Veo 3.1 Video Synthesis in Progress
                <span className="inline-block w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
              </h3>
              <p className="text-xs text-[#a1a1aa]">
                Model: <span className="font-mono text-[#fafafa]">veo-3.1-lite-generate-preview</span> • {aspectRatio}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#27272a] border border-[#3f3f46] font-mono text-xs text-[#3b82f6]">
            <Clock className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Visual Animation / Preview area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Source photo with scanline effect */}
          <div className="relative rounded-2xl overflow-hidden border border-[#27272a] bg-[#09090b] aspect-video flex items-center justify-center group">
            {sourceImagePreview ? (
              <img
                src={sourceImagePreview}
                alt="Source preview"
                className="w-full h-full object-cover opacity-60 filter blur-[0.5px]"
              />
            ) : (
              <Video className="w-12 h-12 text-[#71717a]" />
            )}

            {/* Glowing scan line */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#3b82f6]/25 to-transparent animate-[scan_3s_ease-in-out_infinite]" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-black/50 backdrop-blur-[1px]">
              <div className="w-12 h-12 rounded-full border-2 border-[#3b82f6] border-t-transparent animate-spin mb-3 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <span className="text-xs font-semibold text-[#fafafa] drop-shadow">
                Synthesizing Motion Frames...
              </span>
              <span className="text-[11px] text-[#a1a1aa] font-mono mt-1 px-2.5 py-0.5 rounded-full bg-[#09090b]/80 border border-[#27272a]">
                Target: {aspectRatio} 720p MP4
              </span>
            </div>
          </div>

          {/* Stepper and reassurance details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#3b82f6] font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Step {currentStepIndex + 1} of {REASSURANCE_MESSAGES.length}
                </span>
                <span className="text-[#a1a1aa] font-mono">
                  {Math.round(((currentStepIndex + 1) / REASSURANCE_MESSAGES.length) * 100)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[#27272a] overflow-hidden">
                <div
                  className="h-full bg-[#3b82f6] transition-all duration-700 ease-out"
                  style={{ width: `${((currentStepIndex + 1) / REASSURANCE_MESSAGES.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active stage info */}
            <div className="rounded-2xl border border-[#27272a] bg-[#09090b] p-4 space-y-1.5">
              <h4 className="text-sm font-semibold text-[#fafafa] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                {currentMessage.step}
              </h4>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                {currentMessage.detail}
              </p>
            </div>

            {prompt && (
              <div className="text-xs text-[#a1a1aa] bg-[#09090b] rounded-2xl p-3 border border-[#27272a]">
                <span className="text-[#71717a] font-medium block text-[10px] uppercase tracking-wider mb-1">
                  Active Motion Prompt
                </span>
                <p className="italic text-[#fafafa] line-clamp-2">"{prompt}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Helpful reassurance footnote */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-[#27272a] text-[11px] text-[#a1a1aa]">
          <p>
            Veo video synthesis typically takes between <strong>30 to 75 seconds</strong>. Please keep this tab open.
          </p>
          {operationName && (
            <code className="text-[10px] text-neutral-500 font-mono truncate max-w-[200px]" title={operationName}>
              Op: {operationName.split("/").pop()}
            </code>
          )}
        </div>
      </div>
    </div>
  );
};
