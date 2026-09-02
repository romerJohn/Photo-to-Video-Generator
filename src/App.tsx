import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { PhotoUploader } from "./components/PhotoUploader";
import { GenerationControls } from "./components/GenerationControls";
import { GenerationProgress } from "./components/GenerationProgress";
import { VideoPlayerCard } from "./components/VideoPlayerCard";
import { GenerationHistory } from "./components/GenerationHistory";
import { AspectRatio, UploadedImage, GeneratedVideoItem, GenerationStatus } from "./types";
import { Sparkles, Film, HelpCircle } from "lucide-react";

export default function App() {
  const [currentImage, setCurrentImage] = useState<UploadedImage | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeOperationName, setActiveOperationName] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [activeVideoItem, setActiveVideoItem] = useState<GeneratedVideoItem | null>(null);
  const [history, setHistory] = useState<GeneratedVideoItem[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  const timerRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<number | null>(null);

  // Check health on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.hasApiKey === "boolean") {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch((err) => {
        console.warn("Failed to reach server health check:", err);
      });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleImageSelected = (
    image: UploadedImage,
    suggestedAspect?: AspectRatio,
    suggestedPrompt?: string
  ) => {
    setCurrentImage(image);
    setErrorMessage(null);
    if (suggestedAspect) {
      setAspectRatio(suggestedAspect);
    }
    if (suggestedPrompt) {
      setPrompt(suggestedPrompt);
    }
  };

  const handleClearImage = () => {
    setCurrentImage(null);
    setErrorMessage(null);
  };

  const startTimer = () => {
    setElapsedSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const handleGenerateVideo = async () => {
    if (!currentImage) {
      setErrorMessage("Please select or upload a photo to animate.");
      return;
    }

    setErrorMessage(null);
    setStatus("starting");
    startTimer();

    try {
      // Step 1: Request video generation
      const genResponse = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: currentImage.dataUrl,
          mimeType: currentImage.type,
          prompt: prompt.trim() || undefined,
          aspectRatio,
        }),
      });

      if (!genResponse.ok) {
        const errorData = await genResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with HTTP ${genResponse.status}`);
      }

      const { operationName } = await genResponse.json();
      setActiveOperationName(operationName);
      setStatus("processing");

      // Step 2: Poll status
      pollIntervalRef.current = window.setInterval(async () => {
        try {
          const statusRes = await fetch("/api/video-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ operationName }),
          });

          if (!statusRes.ok) {
            console.warn("Status polling error:", statusRes.status);
            return;
          }

          const statusData = await statusRes.json();

          if (statusData.error) {
            stopPolling();
            stopTimer();
            setStatus("error");
            setErrorMessage(statusData.error);
            return;
          }

          if (statusData.done) {
            stopPolling();

            // Step 3: Fetch the generated MP4 stream
            const downloadRes = await fetch("/api/video-download", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ operationName }),
            });

            if (!downloadRes.ok) {
              const errData = await downloadRes.json().catch(() => ({}));
              throw new Error(errData.error || "Failed to download generated video");
            }

            const videoBlob = await downloadRes.blob();
            const videoUrl = URL.createObjectURL(videoBlob);

            stopTimer();

            const newItem: GeneratedVideoItem = {
              id: crypto.randomUUID(),
              operationName,
              videoUrl,
              videoBlob,
              originalImage: currentImage.dataUrl,
              originalName: currentImage.name,
              prompt: prompt.trim(),
              aspectRatio,
              createdAt: Date.now(),
              model: "veo-3.1-lite-generate-preview",
            };

            setActiveVideoItem(newItem);
            setHistory((prev) => [newItem, ...prev]);
            setStatus("completed");
          }
        } catch (pollErr: unknown) {
          console.error("Polling loop exception:", pollErr);
        }
      }, 4000);
    } catch (err: unknown) {
      stopTimer();
      stopPolling();
      setStatus("error");
      const message = err instanceof Error ? err.message : "Failed to start generation";
      setErrorMessage(message);
    }
  };

  const isGenerating = status === "starting" || status === "processing";

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans antialiased flex flex-col selection:bg-[#3b82f6] selection:text-white">
      <Header hasApiKey={hasApiKey} historyCount={history.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Intro Hero Bento Card */}
        <div id="hero-banner" className="relative rounded-3xl border border-[#27272a] bg-[#18181b] p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#a855f7]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#3b82f620] text-[#3b82f6] border border-[#3b82f6]/30">
                <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span>Veo Video Generations</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fafafa]">
                Animate Still Photos into High-Quality Videos
              </h2>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">
                Upload your favorite photo, choose <strong className="text-[#fafafa]">16:9</strong> (landscape) or <strong className="text-[#fafafa]">9:16</strong> (portrait), optionally describe the camera trajectory or ambient movement, and let Google's <code className="text-[#3b82f6] font-mono text-xs px-1.5 py-0.5 rounded bg-[#09090b] border border-[#27272a]">veo-3.1-lite-generate-preview</code> bring your picture into fluid motion.
              </p>
            </div>

            {/* Bento Quick Specs Widget */}
            <div className="grid grid-cols-2 gap-2.5 shrink-0 self-stretch sm:self-auto min-w-[240px]">
              <div className="p-3 rounded-2xl bg-[#09090b] border border-[#27272a] space-y-1">
                <div className="text-[11px] text-[#71717a] uppercase font-semibold tracking-wider">Aspect Formats</div>
                <div className="text-sm font-semibold text-[#fafafa] flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-[#27272a] text-[#3b82f6] text-xs font-mono">16:9</span>
                  <span className="text-[#71717a]">•</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#27272a] text-[#3b82f6] text-xs font-mono">9:16</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#09090b] border border-[#27272a] space-y-1">
                <div className="text-[11px] text-[#71717a] uppercase font-semibold tracking-wider">Output Resolution</div>
                <div className="text-sm font-semibold text-[#fafafa] font-mono">720p HD MP4</div>
              </div>

              <div className="col-span-2 p-3 rounded-2xl bg-[#09090b] border border-[#27272a] flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[11px] text-[#71717a] uppercase font-semibold tracking-wider">AI Model Engine</div>
                  <div className="text-xs font-mono text-[#fafafa]">veo-3.1-lite</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Active Generation Progress or Result Player */}
        {isGenerating && currentImage && (
          <div className="space-y-4">
            <GenerationProgress
              aspectRatio={aspectRatio}
              prompt={prompt}
              sourceImagePreview={currentImage.dataUrl}
              operationName={activeOperationName}
              elapsedSeconds={elapsedSeconds}
            />
          </div>
        )}

        {/* Completed Video Player */}
        {status === "completed" && activeVideoItem && !isGenerating && (
          <div className="space-y-4">
            <VideoPlayerCard
              item={activeVideoItem}
              onAnimateAnother={() => {
                setStatus("idle");
                window.scrollTo({ top: 350, behavior: "smooth" });
              }}
              onReanimatePrompt={(savedPrompt) => {
                setPrompt(savedPrompt);
                setStatus("idle");
                window.scrollTo({ top: 350, behavior: "smooth" });
              }}
            />
          </div>
        )}

        {/* Workspace: Bento Grid (Photo Uploader & Generation Settings) */}
        <div id="animation-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Bento Column: Photo Upload & Preview */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-[#27272a] bg-[#18181b] p-6 sm:p-7 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3.5">
                <h3 className="text-sm font-semibold text-[#fafafa] flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#3b82f6]" />
                  <span>Step 1: Upload Source Photo</span>
                </h3>
                <span className="text-xs text-[#a1a1aa] font-mono">PNG / JPEG / WebP</span>
              </div>

              <PhotoUploader
                currentImage={currentImage}
                onImageSelected={handleImageSelected}
                onClearImage={handleClearImage}
                disabled={isGenerating}
              />
            </div>
          </div>

          {/* Right Bento Column: Generation Settings & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-[#27272a] bg-[#18181b] p-6 sm:p-7 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3.5">
                <h3 className="text-sm font-semibold text-[#fafafa] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#3b82f6]" />
                  <span>Step 2: Video Settings &amp; Direction</span>
                </h3>
                <span className="text-xs text-[#a1a1aa] font-mono">Veo 3.1 Fast</span>
              </div>

              <GenerationControls
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                prompt={prompt}
                onPromptChange={setPrompt}
                onGenerate={handleGenerateVideo}
                isGenerating={isGenerating}
                hasPhoto={Boolean(currentImage)}
                errorMessage={errorMessage}
              />
            </div>
          </div>
        </div>

        {/* Generation History Gallery Bento Card */}
        <GenerationHistory
          items={history}
          activeId={activeVideoItem?.id || null}
          onSelectItem={(item) => {
            setActiveVideoItem(item);
            setStatus("completed");
            window.scrollTo({ top: 200, behavior: "smooth" });
          }}
          onDeleteItem={(id) => {
            setHistory((prev) => prev.filter((item) => item.id !== id));
            if (activeVideoItem?.id === id) {
              setActiveVideoItem(null);
              setStatus("idle");
            }
          }}
          onClearAll={() => {
            setHistory([]);
            setActiveVideoItem(null);
            setStatus("idle");
          }}
        />

        {/* Tips & Guidance Bento Card */}
        <div id="veo-guidance-card" className="rounded-3xl border border-[#27272a] bg-[#18181b] p-6 text-xs text-[#a1a1aa] space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-[#fafafa] font-semibold text-sm">
            <div className="w-6 h-6 rounded-lg bg-[#3b82f620] text-[#3b82f6] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span>Pro Tips for Veo Photo Animation:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-[#27272a] bg-[#09090b] p-4 space-y-1.5">
              <strong className="text-[#fafafa] block text-xs">Aspect Ratio Selection</strong>
              <p className="text-[#a1a1aa] leading-relaxed text-xs">
                Choose <strong>16:9</strong> for horizontal landscapes and wide scenes, or <strong>9:16</strong> for portraits, mobile displays, and vertical reels.
              </p>
            </div>
            <div className="rounded-2xl border border-[#27272a] bg-[#09090b] p-4 space-y-1.5">
              <strong className="text-[#fafafa] block text-xs">Camera Motion Directions</strong>
              <p className="text-[#a1a1aa] leading-relaxed text-xs">
                Describing specific camera moves (e.g. <em>"slow cinematic push-in"</em> or <em>"gentle drone pan"</em>) yields high visual coherence.
              </p>
            </div>
            <div className="rounded-2xl border border-[#27272a] bg-[#09090b] p-4 space-y-1.5">
              <strong className="text-[#fafafa] block text-xs">Natural Ambient Motion</strong>
              <p className="text-[#a1a1aa] leading-relaxed text-xs">
                Specifying environmental movements like gentle breeze, flowing ripples, or sunlight shifts guides the diffusion model to preserve subject fidelity.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#27272a] py-6 text-center text-xs text-[#71717a]">
        <p>Photo to Video Animator • Powered by Google DeepMind Veo (<code className="font-mono text-[#a1a1aa]">veo-3.1-lite-generate-preview</code>)</p>
      </footer>
    </div>
  );
}
