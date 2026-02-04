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
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    console.log("📋 File filter - checking file:");
    console.log("  - originalname:", file.originalname);
    console.log("  - mimetype:", file.mimetype);
    console.log("  - fieldname:", file.fieldname);
    
    // PDF mimetype check - different platforms may send different MIME types
    const validMimeTypes = [
      "application/pdf",
      "application/x-pdf",
    ];
    
    const isPdfByMimeType = validMimeTypes.includes(file.mimetype);
    const isPdfByExtension = file.originalname.toLowerCase().endsWith('.pdf');
    
    // Accept if valid MIME type OR (octet-stream AND .pdf extension)
    // This handles iOS which sometimes sends octet-stream for PDF files
    const isAcceptable = isPdfByMimeType || 
      (file.mimetype === "application/octet-stream" && isPdfByExtension);
    
    if (isAcceptable) {
      console.log("✅ File accepted as PDF");
      cb(null, true);
    } else {
      console.error("❌ Invalid file type:", file.mimetype, "with extension:", file.originalname);
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
    
    console.log("📨 Received PDF upload request");
    console.log("Headers:", JSON.stringify({
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'origin': req.headers['origin'],
    }));
    
    try {
      if (!req.file) {
        console.error("❌ No file in request");
        console.error("Request body keys:", Object.keys(req.body));
        console.error("Request files:", req.files);
        return res.status(400).json({
          success: false,
          questionsAdded: 0,
          error: "PDF dosyası bulunamadı. Lütfen bir PDF dosyası seçin.",
        });
      }

      console.log("📄 File received:");
      console.log("  - originalname:", req.file.originalname);
      console.log("  - mimetype:", req.file.mimetype);
      console.log("  - size:", req.file.size, "bytes");
      console.log("  - buffer length:", req.file.buffer.length);
      
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
      console.error(`❌ Upload endpoint error after ${duration}s:`, error);
      
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      
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
