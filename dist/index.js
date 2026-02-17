// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/openai.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
var genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
async function chatWithAI(messages) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const history = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));
    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    return {
      message: result.response.text() || "Sorry, I couldn't generate a response.",
      success: true
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      message: "Sorry, I'm having trouble connecting right now. Please try again.",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function summarizeText(text) {
  const prompt = `Please summarize the following text concisely while maintaining key points:

${text}`;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return {
      message: result.response.text() || "Could not summarize the text.",
      success: true
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      message: "Sorry, I couldn't summarize the text right now.",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
async function analyzeSentiment(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a sentiment analysis expert. Analyze the sentiment of the following text and provide:
1. A rating from 1 to 5 stars (1 = very negative, 5 = very positive)  
2. A confidence score between 0 and 1 (0 = not confident, 1 = very confident)

Respond with JSON in this exact format: {"rating": number, "confidence": number}

Text to analyze: ${text}`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[^{}]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : { rating: 3, confidence: 0.5 };
    return {
      rating: Math.max(1, Math.min(5, Math.round(jsonData.rating))),
      confidence: Math.max(0, Math.min(1, jsonData.confidence)),
      success: true
    };
  } catch (error) {
    console.error("Gemini sentiment analysis error:", error);
    return {
      rating: 3,
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
          success: false,
          error: "Messages array is required"
        });
      }
      const response = await chatWithAI(messages);
      res.json(response);
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  app2.post("/api/summarize", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({
          success: false,
          error: "Text is required"
        });
      }
      const response = await summarizeText(text);
      res.json(response);
    } catch (error) {
      console.error("Summarize API error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  app2.post("/api/sentiment", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== "string") {
        return res.status(400).json({
          success: false,
          error: "Text is required"
        });
      }
      const response = await analyzeSentiment(text);
      res.json(response);
    } catch (error) {
      console.error("Sentiment API error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
import glsl from "vite-plugin-glsl";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    glsl()
    // Add GLSL shader support
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  // Add support for large models and audio files
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.mp3", "**/*.ogg", "**/*.wav"]
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
