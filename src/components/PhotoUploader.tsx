import React, { useRef, useState } from "react";
import { UploadCloud, Image as ImageIcon, X, Sparkles, Check, RefreshCw } from "lucide-react";
import { UploadedImage, SamplePhoto, AspectRatio } from "../types";
import { SAMPLE_PHOTOS } from "../data/samplePhotos";

interface PhotoUploaderProps {
  currentImage: UploadedImage | null;
  onImageSelected: (image: UploadedImage, suggestedAspect?: AspectRatio, suggestedPrompt?: string) => void;
  onClearImage: () => void;
  disabled?: boolean;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  currentImage,
  onImageSelected,
  onClearImage,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const aspect = img.width >= img.height ? "16:9" : "9:16";
        onImageSelected(
          {
            dataUrl,
            name: file.name,
            size: file.size,
            type: file.type || "image/jpeg",
            width: img.width,
            height: img.height,
          },
          aspect
        );
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleSelectSample = async (sample: SamplePhoto) => {
    if (disabled) return;
    setIsLoadingSample(sample.id);

    try {
      // Fetch the sample image and convert to dataUrl
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          onImageSelected(
            {
              dataUrl,
              name: `${sample.title}.jpg`,
              size: blob.size,
              type: blob.type || "image/jpeg",
              width: img.width,
              height: img.height,
            },
            sample.recommendedAspect,
            sample.suggestedPrompt
          );
          setIsLoadingSample(null);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to load sample image", err);
      setIsLoadingSample(null);
    }
  };

  return (
    <div id="photo-uploader-section" className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#fafafa] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#3b82f6]" />
          <span>Source Photo</span>
        </label>
        {currentImage && (
          <span className="text-xs text-[#a1a1aa] font-mono">
            {currentImage.width} × {currentImage.height}px (
            {(currentImage.size / (1024 * 1024)).toFixed(2)} MB)
          </span>
        )}
      </div>

      {!currentImage ? (
        <div
          id="dropzone-container"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer text-center group flex flex-col items-center justify-center min-h-[240px] ${
            isDragging
              ? "border-[#3b82f6] bg-[#3b82f620] scale-[1.01]"
              : "border-[#27272a] hover:border-[#3b82f6]/60 bg-[#09090b]/60 hover:bg-[#09090b]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input
            id="file-upload-input"
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="w-14 h-14 rounded-2xl bg-[#27272a] group-hover:bg-[#3b82f620] border border-[#3f3f46] group-hover:border-[#3b82f6]/40 flex items-center justify-center mb-4 transition-colors">
            <UploadCloud className="w-7 h-7 text-[#71717a] group-hover:text-[#3b82f6] transition-colors" />
          </div>

          <h3 className="text-base font-medium text-[#fafafa] mb-1">
            Click to upload or drag &amp; drop
          </h3>
          <p className="text-xs text-[#a1a1aa] max-w-sm mb-3">
            Upload any still photo (JPEG, PNG, WebP) to bring it to life with Veo 3.1 video synthesis.
          </p>

          <div className="flex items-center gap-2 text-[11px] text-[#71717a] font-medium">
            <span className="px-2 py-0.5 rounded bg-[#27272a] text-[#fafafa]">Landscape (16:9)</span>
            <span>or</span>
            <span className="px-2 py-0.5 rounded bg-[#27272a] text-[#fafafa]">Portrait (9:16)</span>
          </div>
        </div>
      ) : (
        <div
          id="image-preview-card"
          className="relative rounded-2xl overflow-hidden border border-[#27272a] bg-[#09090b] p-4 shadow-xl"
        >
          <div className="relative group/preview rounded-xl overflow-hidden bg-[#09090b] flex items-center justify-center max-h-[360px]">
            <img
              src={currentImage.dataUrl}
              alt={currentImage.name}
              className="w-full h-auto max-h-[360px] object-contain rounded-lg"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-end justify-between p-4">
              <span className="text-xs text-white font-medium truncate max-w-[200px]">
                {currentImage.name}
              </span>
              <button
                type="button"
                id="btn-replace-photo"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="px-3 py-1.5 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-xs font-medium text-white shadow transition-colors flex items-center gap-1.5 border border-[#3f3f46]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#3b82f6]" />
                Change Photo
              </button>
            </div>

            <button
              type="button"
              id="btn-clear-photo"
              onClick={(e) => {
                e.stopPropagation();
                onClearImage();
              }}
              disabled={disabled}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-[#18181b]/90 hover:bg-rose-600 text-[#a1a1aa] hover:text-white border border-[#27272a] transition-colors shadow-lg"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />
        </div>
      )}

      {/* Sample photo quick picks */}
      <div id="sample-photos-selector" className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#a1a1aa] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#3b82f6]" />
            Quick Test Photos:
          </span>
          <span className="text-[11px] text-[#71717a]">1-click demo</span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {SAMPLE_PHOTOS.map((sample) => {
            const isSelected = currentImage?.name === `${sample.title}.jpg`;
            const isLoading = isLoadingSample === sample.id;

            return (
              <button
                key={sample.id}
                id={`sample-btn-${sample.id}`}
                type="button"
                onClick={() => handleSelectSample(sample)}
                disabled={disabled || isLoading}
                className={`group relative rounded-xl overflow-hidden aspect-[4/3] border transition-all text-left ${
                  isSelected
                    ? "border-[#3b82f6] ring-2 ring-[#3b82f6]/40"
                    : "border-[#27272a] hover:border-[#3f3f46] hover:scale-[1.02]"
                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                title={`${sample.title} (${sample.recommendedAspect})`}
              >
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-medium text-[#fafafa] truncate">
                  {sample.title}
                </span>

                <span className="absolute top-1 right-1 px-1 py-0.5 rounded text-[9px] font-mono bg-black/80 text-[#a1a1aa] border border-white/10">
                  {sample.recommendedAspect}
                </span>

                {isSelected && (
                  <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#3b82f6] flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-[#3b82f6] animate-spin" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
