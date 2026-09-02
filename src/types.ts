export type AspectRatio = "16:9" | "9:16";

export interface UploadedImage {
  dataUrl: string;
  name: string;
  size: number;
  type: string;
  width?: number;
  height?: number;
}

export type GenerationStatus = "idle" | "uploading" | "starting" | "processing" | "completed" | "error";

export interface GeneratedVideoItem {
  id: string;
  operationName: string;
  videoUrl: string;
  videoBlob?: Blob;
  originalImage: string;
  originalName: string;
  prompt: string;
  aspectRatio: AspectRatio;
  createdAt: number;
  durationSeconds?: number;
  model: string;
}

export interface PromptPreset {
  id: string;
  title: string;
  prompt: string;
  iconName: string;
  description: string;
}

export interface SamplePhoto {
  id: string;
  title: string;
  category: string;
  url: string;
  recommendedAspect: AspectRatio;
  suggestedPrompt: string;
}
