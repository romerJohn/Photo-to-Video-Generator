import { SamplePhoto, PromptPreset } from "../types";

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  {
    id: "mountain-mist",
    title: "Misty Alpine Lake",
    category: "Landscape",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    recommendedAspect: "16:9",
    suggestedPrompt: "Slow cinematic drone flight forward across the crystal lake, mist swirling softly around pine trees in gentle morning light.",
  },
  {
    id: "cyber-street",
    title: "Neon City Rain",
    category: "Cyberpunk",
    url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80",
    recommendedAspect: "16:9",
    suggestedPrompt: "Cinematic camera drift along wet asphalt, neon sign reflections flickering gently with soft rain falling.",
  },
  {
    id: "portrait-light",
    title: "Golden Hour Portrait",
    category: "Portrait",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    recommendedAspect: "9:16",
    suggestedPrompt: "Subtle natural blinking, gentle wind tossing strands of hair, warm sun flare shifting smoothly across the background.",
  },
  {
    id: "cozy-coffee",
    title: "Steaming Artisan Cafe",
    category: "Still Life",
    url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
    recommendedAspect: "16:9",
    suggestedPrompt: "Slow macro zoom in, delicate curls of aromatic steam rising gently from the cup, soft bokeh lights pulsing warmly.",
  },
  {
    id: "ocean-waves",
    title: "Emerald Coastline",
    category: "Nature",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    recommendedAspect: "9:16",
    suggestedPrompt: "Gentle rolling turquoise waves breaking with white foam onto golden sand, warm breeze swaying coastal palm shadows.",
  },
];

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: "cinematic-push",
    title: "Cinematic Push-In",
    prompt: "Smooth, slow cinematic dolly zoom in with natural environmental depth, subtle atmospheric lighting shift.",
    iconName: "ZoomIn",
    description: "Elegant slow zoom revealing fine details",
  },
  {
    id: "ambient-breeze",
    title: "Ambient Breeze & Light",
    prompt: "Gentle natural wind motion, elements swaying softly, shimmering sunlight and realistic organic movement.",
    iconName: "Wind",
    description: "Soft environmental motion and ripples",
  },
  {
    id: "drone-flythrough",
    title: "Aerial Glide",
    prompt: "Sweeping aerial cinematic flight with wide panoramic horizon, realistic depth parallax and smooth stabilized motion.",
    iconName: "Compass",
    description: "Grand landscape drone motion",
  },
  {
    id: "living-portrait",
    title: "Living Portrait",
    prompt: "Subtle lifelike micro-expressions, gentle blinking, soft hair movement in breeze, shallow depth of field bokeh.",
    iconName: "User",
    description: "Natural micro-movements for people & pets",
  },
  {
    id: "time-lapse",
    title: "Golden Time-Lapse",
    prompt: "Accelerated golden hour lighting change, clouds gliding gracefully across the sky, shifting shadows across the scene.",
    iconName: "Clock",
    description: "Dramatic light shift and moving clouds",
  },
];

export const REASSURANCE_MESSAGES = [
  {
    step: "Analyzing Source Keyframe",
    detail: "Decoding image dimensions, subject depth map, and lighting vectors...",
  },
  {
    step: "Veo 3.1 Fast Neural Synthesis",
    detail: "Generating temporally consistent motion frames with diffusion priors...",
  },
  {
    step: "Simulating Physics & Camera Trajectory",
    detail: "Synthesizing coherent optical flow and background parallax...",
  },
  {
    step: "Temporal De-noising & Artifact Reduction",
    detail: "Refining video smoothness, high-frequency details, and fluid motion...",
  },
  {
    step: "Encoding MP4 Stream",
    detail: "Finalizing 720p H.264 video container and preparing download buffer...",
  },
];
