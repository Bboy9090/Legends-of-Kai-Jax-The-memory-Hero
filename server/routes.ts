import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { chatWithAI, summarizeText, analyzeSentiment, type ChatMessage } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // AI Assistant chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ 
          success: false, 
          error: "Messages array is required" 
        });
      }

      const response = await chatWithAI(messages);
      res.json(response);
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  // Text summarization endpoint
  app.post("/api/summarize", async (req, res) => {
    try {
      const { text } = req.body as { text: string };
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: "Text is required" 
        });
      }

      const response = await summarizeText(text);
      res.json(response);
    } catch (error) {
      console.error('Summarize API error:', error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  // Sentiment analysis endpoint
  app.post("/api/sentiment", async (req, res) => {
    try {
      const { text } = req.body as { text: string };
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: "Text is required" 
        });
      }

      const response = await analyzeSentiment(text);
      res.json(response);
    } catch (error) {
      console.error('Sentiment API error:', error);
      res.status(500).json({ 
        success: false, 
        error: "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
