import React, { useRef, useState } from "react";
import { Download, Play, Pause, RotateCcw, Maximize2, Sparkles, Image as ImageIcon, Video, Check, Repeat } from "lucide-react";
import { GeneratedVideoItem } from "../types";

interface VideoPlayerCardProps {
  item: GeneratedVideoItem;
  onAnimateAnother: () => void;
  onReanimatePrompt: (prompt: string) => void;
}

export const VideoPlayerCard: React.FC<VideoPlayerCardProps> = ({
  item,
  onAnimateAnother,
  onReanimatePrompt,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLooping, setIsLooping] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeTab, setActiveTab] = useState<"video" | "compare" | "photo">("video");
  const [hasCopied, setHasCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleLoop = () => {
    if (!videoRef.current) return;
    const nextLoop = !isLooping;
    videoRef.current.loop = nextLoop;
    setIsLooping(nextLoop);
  };

  const changeSpeed = (speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleDownload = async () => {
    if (!item.videoUrl) return;
    try {
      setIsDownloading(true);
      let blobUrl = item.videoUrl;

      // Ensure we have a valid blob URL
      if (!blobUrl.startsWith("blob:")) {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        blobUrl = URL.createObjectURL(blob);
      }

      const a = document.createElement("a");
      a.href = blobUrl;
      const cleanAspect = item.aspectRatio ? item.aspectRatio.replace(":", "-") : "16-9";
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = `veo-video-${cleanAspect}-${timestamp}.mp4`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (error) {
      console.error("Failed to download video file:", error);
      // Fallback direct download
      const a = document.createElement("a");
      a.href = item.videoUrl;
      a.download = `veo-video-${item.aspectRatio?.replace(":", "-") || "16-9"}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyPrompt = () => {
    if (item.prompt) {
      navigator.clipboard.writeText(item.prompt);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const isPortrait = item.aspectRatio === "9:16";

  return (
    <div
      id="video-player-card"
      className="rounded-3xl border border-[#27272a] bg-[#18181b] p-6 sm:p-7 shadow-2xl space-y-6"
    >
      {/* Top bar with metadata and View Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#27272a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
            <h3 className="text-base font-semibold text-[#fafafa]">
              Generated Veo Animation
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#3b82f620] text-[#3b82f6] border border-[#3b82f630]">
              {item.aspectRatio}
            </span>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Rendered with <code className="text-[#fafafa] font-mono">{item.model}</code>
          </p>
        </div>

        {/* View Mode Switcher and Quick Download */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#09090b] border border-[#27272a]">
            <button
              type="button"
              onClick={() => setActiveTab("video")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "video"
                  ? "bg-[#3b82f6] text-white font-semibold shadow-md shadow-blue-500/20"
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Video
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("compare")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "compare"
                  ? "bg-[#3b82f6] text-white font-semibold shadow-md shadow-blue-500/20"
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Side by Side
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("photo")}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "photo"
                  ? "bg-[#3b82f6] text-white font-semibold shadow-md shadow-blue-500/20"
                  : "text-[#a1a1aa] hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Original
            </button>
          </div>

          <button
            type="button"
            id="quick-download-btn"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3.5 py-2 rounded-2xl bg-[#3b82f620] hover:bg-[#3b82f630] text-[#3b82f6] border border-[#3b82f640] text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 active:scale-[0.98] cursor-pointer"
            title="Download MP4 video using blob URL"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Saved</span>
              </>
            ) : (
              <>
                <Download className={`w-3.5 h-3.5 ${isDownloading ? "animate-bounce" : ""}`} />
                <span>Download</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Media Canvas Area */}
      <div className="relative rounded-2xl overflow-hidden bg-[#09090b] border border-[#27272a] flex items-center justify-center min-h-[340px] max-h-[560px]">
        {/* Video Only View */}
        {activeTab === "video" && (
          <div className={`relative flex items-center justify-center w-full h-full p-2 ${isPortrait ? "max-w-sm mx-auto" : ""}`}>
            <video
              id="veo-output-video"
              ref={videoRef}
              src={item.videoUrl}
              autoPlay
              loop={isLooping}
              playsInline
              controls
              className="w-full h-auto max-h-[520px] rounded-xl object-contain shadow-2xl"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        )}

        {/* Side by Side Comparison View */}
        {activeTab === "compare" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full p-4 h-full">
            {/* Left: Original photo */}
            <div className="space-y-2 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-[#a1a1aa] self-start flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#a1a1aa]" />
                Original Photo Keyframe
              </span>
              <div className="relative rounded-xl overflow-hidden border border-[#27272a] bg-[#18181b] w-full flex items-center justify-center max-h-[440px]">
                <img
                  src={item.originalImage}
                  alt="Original keyframe"
                  className="w-full h-auto max-h-[440px] object-contain rounded-lg"
                />
              </div>
            </div>

            {/* Right: Generated Video */}
            <div className="space-y-2 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-[#3b82f6] self-start flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-[#3b82f6]" />
                Veo 3.1 Motion Output ({item.aspectRatio})
              </span>
              <div className="relative rounded-xl overflow-hidden border border-[#3b82f6]/40 bg-[#18181b] w-full flex items-center justify-center max-h-[440px]">
                <video
                  src={item.videoUrl}
                  autoPlay
                  loop
                  playsInline
                  controls
                  className="w-full h-auto max-h-[440px] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Photo Only View */}
        {activeTab === "photo" && (
          <div className="relative flex items-center justify-center w-full h-full p-4">
            <img
              src={item.originalImage}
              alt="Original still photo"
              className="w-full h-auto max-h-[500px] object-contain rounded-xl shadow-xl"
            />
          </div>
        )}
      </div>

      {/* Video Control Bar & Speeds (only in video tab) */}
      {activeTab === "video" && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#27272a] text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-play-pause-video"
              onClick={togglePlay}
              className="p-2 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] transition-colors border border-[#3f3f46]"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              type="button"
              id="btn-loop-video"
              onClick={toggleLoop}
              className={`px-3 py-2 rounded-xl border transition-colors flex items-center gap-1.5 font-medium ${
                isLooping
                  ? "bg-[#3b82f620] border-[#3b82f640] text-[#3b82f6]"
                  : "bg-[#27272a] border-[#3f3f46] text-[#a1a1aa]"
              }`}
              title="Toggle continuous loop"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Loop: {isLooping ? "On" : "Off"}</span>
            </button>

            <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
              {[0.5, 1, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => changeSpeed(rate)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                    playbackRate === rate
                      ? "bg-[#27272a] text-[#fafafa] font-semibold"
                      : "text-[#a1a1aa] hover:text-[#fafafa]"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="player-control-download-btn"
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa] transition-colors flex items-center gap-1.5 border border-[#3f3f46] cursor-pointer"
              title="Download MP4 video"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? "animate-bounce text-[#3b82f6]" : ""}`} />
              <span className="text-[11px] font-medium hidden sm:inline">Download</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-[#a1a1aa] hover:text-[#fafafa] transition-colors flex items-center gap-1.5 border border-[#3f3f46]"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen</span>
            </button>
          </div>
        </div>
      )}

      {/* Prompt summary if provided */}
      {item.prompt && (
        <div className="rounded-2xl bg-[#09090b] border border-[#27272a] p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#3b82f6]" />
              Motion Direction Prompt
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyPrompt}
                className="text-[11px] text-[#a1a1aa] hover:text-white transition-colors"
              >
                {hasCopied ? "Copied!" : "Copy prompt"}
              </button>
              <button
                type="button"
                onClick={() => onReanimatePrompt(item.prompt)}
                className="text-[11px] text-[#3b82f6] hover:text-blue-400 font-medium transition-colors"
              >
                Reuse
              </button>
            </div>
          </div>
          <p className="text-xs text-[#fafafa] leading-relaxed italic">
            "{item.prompt}"
          </p>
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          id="download-btn"
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2.5 active:scale-[0.99] cursor-pointer disabled:opacity-75"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Saved MP4 to Device!</span>
            </>
          ) : isDownloading ? (
            <>
              <Download className="w-4 h-4 animate-bounce" />
              <span>Downloading MP4...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Download</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            id="btn-animate-another"
            onClick={onAnimateAnother}
            className="flex-1 sm:flex-initial px-5 py-3.5 rounded-2xl bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-[#3f3f46]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Animate Another Photo
          </button>
        </div>
      </div>
    </div>
  );
};
