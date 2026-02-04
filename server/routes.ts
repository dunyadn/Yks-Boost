import type { Express } from "express";
import { createServer, type Server } from "node:http";
import multer from "multer";
import { storage } from "./storage";
import { processPDF } from "./pdfProcessor";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/questions", async (_req, res) => {
    const questions = await storage.getQuestions();
    res.json(questions);
  });

  app.post("/api/questions", async (req, res) => {
    const question = await storage.createQuestion(req.body);
    res.json(question);
  });

  app.delete("/api/questions/:id", async (req, res) => {
    await storage.deleteQuestion(req.params.id);
    res.sendStatus(200);
  });

  app.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.post("/api/stats", async (req, res) => {
    const { correct } = req.body;
    const stats = await storage.updateStats(correct);
    res.json(stats);
  });

  // PDF upload endpoint
  app.post("/api/upload-pdf", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "PDF dosyası bulunamadı",
        });
      }

      console.log("Processing PDF:", req.file.originalname);
      
      const result = await processPDF(req.file.buffer);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.json(result);
    } catch (error) {
      console.error("Error in PDF upload endpoint:", error);
      return res.status(500).json({
        success: false,
        questionsAdded: 0,
        error: error instanceof Error ? error.message : "Sunucu hatası",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
