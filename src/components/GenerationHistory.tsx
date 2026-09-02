import React from "react";
import { History, Play, Download, Trash2, Film, Sparkles } from "lucide-react";
import { GeneratedVideoItem } from "../types";

interface GenerationHistoryProps {
  items: GeneratedVideoItem[];
  activeId: string | null;
  onSelectItem: (item: GeneratedVideoItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const GenerationHistory: React.FC<GenerationHistoryProps> = ({
  items,
  activeId,
  onSelectItem,
  onDeleteItem,
  onClearAll,
}) => {
  if (items.length === 0) return null;

  return (
    <div id="generation-history-section" className="rounded-3xl border border-[#27272a] bg-[#18181b] p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#3b82f620] text-[#3b82f6] flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#fafafa]">
              Animation Gallery ({items.length})
            </h3>
            <p className="text-[11px] text-[#a1a1aa]">Previously synthesized animations in this session</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearAll}
          className="text-xs text-[#a1a1aa] hover:text-rose-400 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#09090b] border border-[#27272a] hover:border-rose-500/40"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear gallery</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => {
          const isActive = item.id === activeId;
          const dateStr = new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              id={`history-card-${item.id}`}
              onClick={() => onSelectItem(item)}
              className={`group relative rounded-2xl border p-3.5 cursor-pointer transition-all ${
                isActive
                  ? "border-[#3b82f6] bg-[#3b82f615] ring-1 ring-[#3b82f6]/40 shadow-lg shadow-blue-500/5"
                  : "border-[#27272a] bg-[#09090b] hover:border-[#3f3f46] hover:bg-[#18181b]"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#18181b] shrink-0 border border-[#27272a] flex items-center justify-center">
                  <img
                    src={item.originalImage}
                    alt={item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 text-white fill-white" />
                  </div>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/80 text-[#3b82f6] border border-[#27272a]">
                    {item.aspectRatio}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-[#fafafa] truncate">
                      {item.originalName || "Animated Photo"}
                    </span>
                    <span className="text-[10px] text-[#a1a1aa] font-mono shrink-0">
                      {dateStr}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#a1a1aa] line-clamp-2 mt-1 italic">
                    {item.prompt ? `"${item.prompt}"` : "Default ambient motion"}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#27272a]">
                    <span className="text-[10px] font-mono text-[#a1a1aa] flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#3b82f6]" />
                      Veo 3.1
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={item.videoUrl}
                        download={`veo-video-${item.aspectRatio.replace(":", "-")}.mp4`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-[#a1a1aa] hover:text-[#22c55e] transition-colors"
                        title="Download MP4"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="p-1 text-[#a1a1aa] hover:text-rose-400 transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
