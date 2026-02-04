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
    const startTime = Date.now();
    
    try {
      if (!req.file) {
        console.error("❌ No PDF file in request");
        return res.status(400).json({
          success: false,
          error: "PDF dosyası bulunamadı",
        });
      }

      console.log(`📤 Processing PDF: ${req.file.originalname} (${req.file.size} bytes)`);
      
      const result = await processPDF(req.file.buffer);
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`⏱️  Processing completed in ${duration}s`);
      
      if (!result.success) {
        console.error(`❌ Processing failed: ${result.error}`);
        return res.status(400).json(result);
      }
      
      console.log(`✅ Success: ${result.questionsAdded} questions added`);
      return res.json(result);
    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`❌ Error after ${duration}s:`, error);
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
