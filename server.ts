import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase body parser limit for base64 photo uploads (up to 50MB)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Helper to get GoogleGenAI client
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please configure it in AI Studio Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper to format GenAI / Veo errors cleanly
function parseGenAIError(err: unknown): { message: string; isQuotaExceeded: boolean; status: number } {
  const raw = err instanceof Error ? err.message : String(err);
  const isQuota = raw.includes("429") || raw.includes("RESOURCE_EXHAUSTED") || raw.toLowerCase().includes("quota");

  if (isQuota) {
    return {
      message: "You exceeded your current quota. Google Veo video generation requires an active Gemini API key with billing enabled. Please select or attach a billing-enabled API key in AI Studio Settings > Secrets.",
      isQuotaExceeded: true,
      status: 429,
    };
  }

  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        return {
          message: parsed.error.message,
          isQuotaExceeded: parsed.error.code === 429 || parsed.error.status === "RESOURCE_EXHAUSTED",
          status: parsed.error.code === 429 ? 429 : 500,
        };
      }
    }
  } catch {
    // ignore json parse error
  }

  return {
    message: raw.replace(/^ApiError:\s*/, ""),
    isQuotaExceeded: false,
    status: 500,
  };
}

// Health & Status check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: "veo-3.1-lite-generate-preview",
  });
});

// 1. Start Video Generation (POST /api/generate-video)
app.post("/api/generate-video", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", prompt, aspectRatio = "16:9" } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing image data. Please upload a photo to animate." });
    }

    // Clean base64 string if it contains data URL prefix
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, "");

    // Validate aspect ratio
    const validAspectRatio = aspectRatio === "9:16" ? "9:16" : "16:9";

    const ai = getGenAI();

    console.log(`[Veo] Starting generation with model: veo-3.1-lite-generate-preview, aspect: ${validAspectRatio}`);

    const operation = await ai.models.generateVideos({
      model: "veo-3.1-lite-generate-preview",
      prompt: prompt && prompt.trim().length > 0 ? prompt.trim() : undefined,
      image: {
        imageBytes: cleanBase64,
        mimeType: mimeType || "image/jpeg",
      },
      config: {
        numberOfVideos: 1,
        resolution: "720p",
        aspectRatio: validAspectRatio,
      },
    });

    console.log(`[Veo] Operation created: ${operation.name}`);
    return res.json({
      operationName: operation.name,
      aspectRatio: validAspectRatio,
      model: "veo-3.1-lite-generate-preview",
    });
  } catch (err: unknown) {
    console.error("[Veo] Generation error:", err);
    const { message, isQuotaExceeded, status } = parseGenAIError(err);
    return res.status(status).json({
      error: message,
      isQuotaExceeded,
    });
  }
});

// 2. Poll Video Generation Status (POST /api/video-status)
app.post("/api/video-status", async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName || typeof operationName !== "string") {
      return res.status(400).json({ error: "Missing operationName parameter." });
    }

    const ai = getGenAI();

    // Reconstruct operation
    let op: GenerateVideosOperation;
    try {
      op = new GenerateVideosOperation();
      op.name = operationName;
    } catch {
      op = { name: operationName } as GenerateVideosOperation;
    }

    const updated = await ai.operations.getVideosOperation({ operation: op });

    const isDone = Boolean(updated.done);
    const errorMessage = updated.error
      ? parseGenAIError(updated.error.message || updated.error).message
      : null;

    return res.json({
      done: isDone,
      error: errorMessage,
      metadata: updated.metadata || null,
    });
  } catch (err: unknown) {
    console.error("[Veo] Status polling error:", err);
    const { message, status } = parseGenAIError(err);
    return res.status(status).json({ error: message });
  }
});

// 3. Download / Stream Video (POST or GET /api/video-download)
const handleVideoDownload = async (req: Request, res: Response) => {
  try {
    const operationName = (req.body?.operationName || req.query?.operationName) as string;
    if (!operationName) {
      return res.status(400).json({ error: "Missing operationName parameter." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server GEMINI_API_KEY is not configured." });
    }

    const ai = getGenAI();
    let op: GenerateVideosOperation;
    try {
      op = new GenerateVideosOperation();
      op.name = operationName;
    } catch {
      op = { name: operationName } as GenerateVideosOperation;
    }

    const updated = await ai.operations.getVideosOperation({ operation: op });

    if (!updated.done) {
      return res.status(202).json({ error: "Video generation is still processing." });
    }

    if (updated.error) {
      const { message } = parseGenAIError(updated.error.message || updated.error);
      return res.status(500).json({ error: message || "Video generation failed." });
    }

    const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) {
      return res.status(404).json({ error: "No video found in completed operation." });
    }

    // Fetch video using API key header
    const videoRes = await fetch(videoUri, {
      headers: {
        "x-goog-api-key": apiKey,
      },
    });

    if (!videoRes.ok) {
      return res.status(videoRes.status).json({
        error: `Failed to download video from Google servers: ${videoRes.statusText}`,
      });
    }

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", 'inline; filename="veo-animated-video.mp4"');

    // Buffer and send or stream
    const arrayBuffer = await videoRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader("Content-Length", buffer.length.toString());
    return res.end(buffer);
  } catch (err: unknown) {
    console.error("[Veo] Video download error:", err);
    const { message, status } = parseGenAIError(err);
    return res.status(status).json({ error: message });
  }
};

app.post("/api/video-download", handleVideoDownload);
app.get("/api/video-download", handleVideoDownload);

// Start Server with Vite middleware for dev / static for prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Photo to Video Animator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
