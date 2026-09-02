import React from "react";
import { Film, Sparkles, Wand2, Smartphone, Monitor, Compass, Wind, ZoomIn, User, Clock, AlertTriangle } from "lucide-react";
import { AspectRatio, PromptPreset } from "../types";
import { PROMPT_PRESETS } from "../data/samplePhotos";

interface GenerationControlsProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (aspect: AspectRatio) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasPhoto: boolean;
  errorMessage: string | null;
}

const PRESET_ICONS: Record<string, React.ReactNode> = {
  ZoomIn: <ZoomIn className="w-3.5 h-3.5" />,
  Wind: <Wind className="w-3.5 h-3.5" />,
  Compass: <Compass className="w-3.5 h-3.5" />,
  User: <User className="w-3.5 h-3.5" />,
  Clock: <Clock className="w-3.5 h-3.5" />,
};

export const GenerationControls: React.FC<GenerationControlsProps> = ({
  aspectRatio,
  onAspectRatioChange,
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  hasPhoto,
  errorMessage,
}) => {
  const handleSelectPreset = (preset: PromptPreset) => {
    onPromptChange(preset.prompt);
  };

  return (
    <div id="generation-controls" className="space-y-5">
      {/* Aspect Ratio Selector (Mandatory requirement: 16:9 or 9:16) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[#fafafa] flex items-center gap-2">
            <Film className="w-4 h-4 text-[#3b82f6]" />
            <span>Video Aspect Ratio</span>
          </label>
          <span className="text-xs text-[#a1a1aa]">Required: 16:9 or 9:16</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 16:9 Landscape Option */}
          <button
            type="button"
            id="aspect-ratio-16-9"
            onClick={() => onAspectRatioChange("16:9")}
            disabled={isGenerating}
            className={`relative p-4 rounded-2xl border transition-all text-left flex items-start gap-3.5 ${
              aspectRatio === "16:9"
                ? "border-[#3b82f6] bg-[#3b82f615] shadow-lg shadow-blue-500/5 ring-1 ring-[#3b82f6]/40"
                : "border-[#27272a] bg-[#09090b] hover:border-[#3f3f46] hover:bg-[#18181b]"
            }`}
          >
            <div
              className={`w-10 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                aspectRatio === "16:9"
                  ? "border-[#3b82f6]/60 bg-[#3b82f620] text-[#3b82f6]"
                  : "border-[#3f3f46] bg-[#27272a] text-[#a1a1aa]"
              }`}
            >
              <Monitor className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#fafafa]">16:9</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] font-medium">
                  Landscape
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Standard widescreen cinema, monitors &amp; YouTube
              </p>
            </div>
          </button>

          {/* 9:16 Portrait Option */}
          <button
            type="button"
            id="aspect-ratio-9-16"
            onClick={() => onAspectRatioChange("9:16")}
            disabled={isGenerating}
            className={`relative p-4 rounded-2xl border transition-all text-left flex items-start gap-3.5 ${
              aspectRatio === "9:16"
                ? "border-[#3b82f6] bg-[#3b82f615] shadow-lg shadow-blue-500/5 ring-1 ring-[#3b82f6]/40"
                : "border-[#27272a] bg-[#09090b] hover:border-[#3f3f46] hover:bg-[#18181b]"
            }`}
          >
            <div
              className={`w-7 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                aspectRatio === "9:16"
                  ? "border-[#3b82f6]/60 bg-[#3b82f620] text-[#3b82f6]"
                  : "border-[#3f3f46] bg-[#27272a] text-[#a1a1aa]"
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#fafafa]">9:16</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#27272a] text-[#a1a1aa] font-medium">
                  Portrait
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Vertical format for mobile screens, Reels &amp; Shorts
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Motion & Camera Direction Prompt */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label htmlFor="motion-prompt-input" className="text-sm font-medium text-[#fafafa] flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-[#3b82f6]" />
            <span>Motion &amp; Camera Direction</span>
            <span className="text-xs text-[#71717a] font-normal">(optional)</span>
          </label>
          {prompt && (
            <button
              type="button"
              onClick={() => onPromptChange("")}
              className="text-xs text-[#a1a1aa] hover:text-white transition-colors"
            >
              Clear prompt
            </button>
          )}
        </div>

        <div className="relative">
          <textarea
            id="motion-prompt-input"
            rows={3}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={isGenerating}
            placeholder="Describe how the photo should animate (e.g. slow cinematic dolly push in, gentle wind blowing through hair and trees, shifting soft sunlight...)"
            className="w-full rounded-2xl bg-[#09090b] border border-[#27272a] focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]/40 p-3.5 text-sm text-[#fafafa] placeholder-[#71717a] resize-none transition-colors"
          />
          <div className="absolute bottom-2.5 right-3 text-[11px] text-[#71717a]">
            {prompt.length} chars
          </div>
        </div>

        {/* Camera motion presets (styled using Bento Grid Quick Shortcuts layout) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a1a1aa] font-medium">Quick Camera Direction Presets:</span>
            <span className="text-[11px] text-[#71717a]">Auto-fills motion prompt</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROMPT_PRESETS.map((preset) => (
              <div
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => !isGenerating && handleSelectPreset(preset)}
                className="bg-[#27272a] rounded-xl p-2.5 flex items-center gap-2.5 hover:bg-[#3f3f46] cursor-pointer transition-colors border border-[#3f3f46]/30"
                title={preset.description}
              >
                <div className="w-7 h-7 rounded-lg bg-[#3b82f620] text-[#3b82f6] flex items-center justify-center shrink-0">
                  {PRESET_ICONS[preset.iconName]}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-[#fafafa] block truncate">
                    {preset.title}
                  </span>
                  <span className="text-[10px] text-[#a1a1aa] block truncate">
                    {preset.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Model Spec info */}
      <div className="rounded-2xl bg-[#09090b] border border-[#27272a] p-3.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-[#a1a1aa]">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span>Diffusion Engine:</span>
          <code className="px-2 py-0.5 rounded-lg bg-[#27272a] text-[#fafafa] font-mono text-[11px] border border-[#3f3f46]">
            veo-3.1-lite-generate-preview
          </code>
        </div>
        <div className="text-[#a1a1aa]">
          Resolution: <strong className="text-[#fafafa] font-mono">720p HD</strong>
        </div>
      </div>

      {/* Error display if any */}
      {errorMessage && (
        <div
          id="generation-error-banner"
          className={`rounded-2xl p-4 flex items-start gap-3.5 text-xs transition-all ${
            errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429")
              ? "border border-amber-500/40 bg-amber-500/10 text-amber-200"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429")
                ? "text-amber-400"
                : "text-rose-400"
            }`}
          />
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <strong className="font-semibold block text-sm">
                {errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429")
                  ? "Quota / Billing Plan Notice"
                  : "Generation Alert"}
              </strong>
              {errorMessage.toLowerCase().includes("quota") && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  HTTP 429
                </span>
              )}
            </div>
            <p className="leading-relaxed opacity-90">{errorMessage}</p>
            {(errorMessage.toLowerCase().includes("quota") || errorMessage.includes("429")) && (
              <div className="pt-1.5 border-t border-amber-500/20 text-[11px] text-amber-300/80 space-y-1">
                <p>
                  <strong>How to resolve:</strong> Open <strong>Settings &gt; Secrets</strong> panel in Google AI Studio to select or attach a project API key with billing enabled.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Action Button */}
      <button
        type="button"
        id="btn-generate-video"
        onClick={onGenerate}
        disabled={isGenerating || !hasPhoto}
        className={`w-full py-4 px-6 rounded-2xl font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2.5 ${
          !hasPhoto
            ? "bg-[#27272a] text-[#71717a] cursor-not-allowed border border-[#3f3f46]/50 shadow-none"
            : isGenerating
            ? "bg-[#3b82f6]/30 text-blue-200 cursor-wait border border-[#3b82f6]/40"
            : "bg-[#3b82f6] hover:bg-[#2563eb] text-white shadow-blue-500/20 active:scale-[0.99]"
        }`}
      >
        <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
        <span>
          {!hasPhoto
            ? "Upload or Select a Photo First"
            : isGenerating
            ? "Synthesizing Video with Veo 3.1..."
            : `Animate Photo (${aspectRatio} Video)`}
        </span>
      </button>
    </div>
  );
};
