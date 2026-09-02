import React from "react";
import { Sparkles, Film, CheckCircle2, AlertCircle, Search } from "lucide-react";

interface HeaderProps {
  hasApiKey: boolean;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({ hasApiKey, historyCount }) => {
  return (
    <header id="main-header" className="border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#fafafa]">
              Photo to Video Animator
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3b82f620] text-[#3b82f6] border border-[#3b82f630]">
              <Sparkles className="w-3 h-3" />
              Veo 3.1 Fast
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-0.5">
            Transform still photos into fluid motion videos with Google DeepMind's Veo diffusion engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-[#27272a] h-9 w-56 rounded-full px-3 text-xs text-[#71717a] border border-[#3f3f46]">
            <Search className="w-3.5 h-3.5 text-[#71717a]" />
            <span className="truncate">Search camera presets...</span>
          </div>

          <div
            id="api-key-status"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              hasApiKey
                ? "bg-[#22c55e20] text-[#22c55e] border-[#22c55e30]"
                : "bg-amber-500/20 text-amber-400 border-amber-500/30"
            }`}
            title={hasApiKey ? "Gemini API Key configured" : "Checking API Key configuration"}
          >
            {hasApiKey ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
                <span className="hidden sm:inline">Engine Ready</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Checking Key</span>
              </>
            )}
          </div>

          <div
            className="w-9 h-9 rounded-full border border-[#3f3f46] overflow-hidden bg-gradient-to-tr from-[#3b82f6] to-[#a855f7] flex items-center justify-center font-bold text-xs text-white shadow-sm"
            title="Active Session"
          >
            V
          </div>
        </div>
      </div>
    </header>
  );
};

