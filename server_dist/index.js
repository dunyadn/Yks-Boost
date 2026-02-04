// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";
import multer from "multer";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  questions;
  stats;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.questions = /* @__PURE__ */ new Map();
    this.stats = {
      id: "global",
      totalAnswered: 0,
      correctAnswers: 0,
      lastUpdated: /* @__PURE__ */ new Date()
    };
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getQuestions() {
    return Array.from(this.questions.values());
  }
  async createQuestion(insertQuestion) {
    const id = randomUUID();
    const question = { ...insertQuestion, id, createdAt: /* @__PURE__ */ new Date(), category: insertQuestion.category || "general" };
    this.questions.set(id, question);
    return question;
  }
  async deleteQuestion(id) {
    this.questions.delete(id);
  }
  async getStats() {
    return this.stats;
  }
  async updateStats(correct) {
    this.stats.totalAnswered = (this.stats.totalAnswered || 0) + 1;
    if (correct) {
      this.stats.correctAnswers = (this.stats.correctAnswers || 0) + 1;
    }
    this.stats.lastUpdated = /* @__PURE__ */ new Date();
    return this.stats;
  }
};
var storage = new MemStorage();

// server/pdfProcessor.ts
import { PDFParse } from "pdf-parse";
import OpenAI from "openai";
var openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
async function extractTextFromPDF(pdfBuffer) {
  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("PDF dosyas\u0131 okunamad\u0131. L\xFCtfen ge\xE7erli bir PDF dosyas\u0131 y\xFCkleyin.");
  }
}
async function parseQuestionsWithAI(text) {
  if (!openai) {
    console.warn("OpenAI API key not configured, using fallback parser");
    return parsePatternsWithFallback(text);
  }
  try {
    const prompt = `Sen bir T\xFCrk s\u0131nav sorusu ay\u0131klama asistan\u0131s\u0131n. A\u015Fa\u011F\u0131daki metinden t\xFCm \xE7oktan se\xE7meli sorular\u0131 \xE7\u0131kar ve JSON format\u0131nda d\xF6nd\xFCr.

Her soru i\xE7in \u015Fu bilgileri \xE7\u0131kar:
- content: Soru metni
- options: \u015E\u0131klar dizisi (A, B, C, D, E \u015F\u0131klar\u0131)
- correctAnswer: Do\u011Fru cevap (A, B, C, D veya E harfi)
- category: Konu/kategori (Matematik, Fizik, Kimya, Biyoloji, T\xFCrk\xE7e, Tarih, Co\u011Frafya, vb.)

Farkl\u0131 formatlar\u0131 destekle:
1. "1. Soru metni? A) ... B) ... Cevap: A"
2. "Soru: ... \u015E\u0131klar: A) ... B) ... Do\u011Fru Cevap: ..."
3. Numaras\u0131z sorular
4. Sadece metinli sorular

SADECE ge\xE7erli JSON array d\xF6nd\xFCr, ba\u015Fka metin ekleme:

Metin:
${text}

JSON \xE7\u0131kt\u0131 format\u0131:
[
  {
    "content": "Soru metni buraya",
    "options": ["A \u015F\u0131kk\u0131", "B \u015F\u0131kk\u0131", "C \u015F\u0131kk\u0131", "D \u015F\u0131kk\u0131"],
    "correctAnswer": "A",
    "category": "Matematik"
  }
]`;
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sen bir s\u0131nav sorusu ay\u0131klama uzman\u0131s\u0131n. SADECE ge\xE7erli JSON array d\xF6nd\xFCr."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 4e3
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI yan\u0131t vermedi");
    }
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    const questions = JSON.parse(cleanContent);
    if (!Array.isArray(questions)) {
      throw new Error("Invalid response format");
    }
    return questions.filter((q) => {
      return q.content && Array.isArray(q.options) && q.options.length >= 2 && q.correctAnswer;
    }).map((q) => ({
      content: String(q.content).trim(),
      options: q.options.map((opt) => String(opt).trim()),
      correctAnswer: String(q.correctAnswer).trim().toUpperCase(),
      category: q.category ? String(q.category).trim() : "Genel"
    }));
  } catch (error) {
    console.error("Error parsing questions with AI:", error);
    return parsePatternsWithFallback(text);
  }
}
function parsePatternsWithFallback(text) {
  const questions = [];
  const pattern1 = /(\d+)\.\s*(.+?)\s*[AaBbCcDdEe]\s*\)/g;
  const lines = text.split("\n");
  let currentQuestion = {};
  let options = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\d+\./.test(trimmed)) {
      if (currentQuestion.content && options.length > 0) {
        questions.push({
          content: currentQuestion.content,
          options,
          correctAnswer: currentQuestion.correctAnswer || "A",
          category: currentQuestion.category || "Genel"
        });
      }
      currentQuestion = {
        content: trimmed.replace(/^\d+\.\s*/, ""),
        category: detectCategory(trimmed)
      };
      options = [];
    } else if (/^[AaBbCcDdEe]\s*[\):]/.test(trimmed)) {
      const optionText = trimmed.replace(/^[AaBbCcDdEe]\s*[\):]\s*/, "");
      options.push(optionText);
    } else if (/cevap|doğru|answer/i.test(trimmed)) {
      const match = trimmed.match(/[AaBbCcDdEe]/);
      if (match) {
        currentQuestion.correctAnswer = match[0].toUpperCase();
      }
    } else if (currentQuestion.content && trimmed && options.length === 0) {
      currentQuestion.content += " " + trimmed;
    }
  }
  if (currentQuestion.content && options.length > 0) {
    questions.push({
      content: currentQuestion.content,
      options,
      correctAnswer: currentQuestion.correctAnswer || "A",
      category: currentQuestion.category || "Genel"
    });
  }
  return questions;
}
function detectCategory(text) {
  const lowerText = text.toLowerCase();
  if (/matematik|türev|integral|trigonometri|geometri|sayılar/i.test(text)) {
    return "Matematik";
  }
  if (/fizik|kuvvet|enerji|hareket|elektrik|manyetik/i.test(text)) {
    return "Fizik";
  }
  if (/kimya|element|molekül|reaksiyon|asit|baz/i.test(text)) {
    return "Kimya";
  }
  if (/biyoloji|hücre|doku|organ|gen|protein/i.test(text)) {
    return "Biyoloji";
  }
  if (/türkçe|dilbilgisi|edebiyat|sözcük|cümle/i.test(text)) {
    return "T\xFCrk\xE7e";
  }
  if (/tarih|osmanlı|cumhuriyet|savaş|antlaşma/i.test(text)) {
    return "Tarih";
  }
  if (/coğrafya|iklim|harita|kıta|ülke/i.test(text)) {
    return "Co\u011Frafya";
  }
  return "Genel";
}
async function saveQuestionsToDatabase(questions) {
  let savedCount = 0;
  for (const question of questions) {
    try {
      const insertQuestion = {
        content: question.content,
        options: question.options,
        correctAnswer: question.correctAnswer,
        category: question.category
      };
      await storage.createQuestion(insertQuestion);
      savedCount++;
    } catch (error) {
      console.error("Error saving question:", error);
    }
  }
  return savedCount;
}
async function processPDF(pdfBuffer) {
  try {
    const text = await extractTextFromPDF(pdfBuffer);
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        questionsAdded: 0,
        error: "PDF'den metin \xE7\u0131kar\u0131lamad\u0131. Dosya bo\u015F olabilir."
      };
    }
    const questions = await parseQuestionsWithAI(text);
    if (questions.length === 0) {
      return {
        success: false,
        questionsAdded: 0,
        error: "PDF'de soru bulunamad\u0131. L\xFCtfen ge\xE7erli bir s\u0131nav sorusu PDF'i y\xFCkleyin."
      };
    }
    const savedCount = await saveQuestionsToDatabase(questions);
    return {
      success: true,
      questionsAdded: savedCount
    };
  } catch (error) {
    console.error("Error processing PDF:", error);
    return {
      success: false,
      questionsAdded: 0,
      error: error instanceof Error ? error.message : "PDF i\u015Flenirken bir hata olu\u015Ftu"
    };
  }
}

// server/routes.ts
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB max file size
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  }
});
async function registerRoutes(app2) {
  app2.get("/api/questions", async (_req, res) => {
    const questions = await storage.getQuestions();
    res.json(questions);
  });
  app2.post("/api/questions", async (req, res) => {
    const question = await storage.createQuestion(req.body);
    res.json(question);
  });
  app2.delete("/api/questions/:id", async (req, res) => {
    await storage.deleteQuestion(req.params.id);
    res.sendStatus(200);
  });
  app2.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });
  app2.post("/api/stats", async (req, res) => {
    const { correct } = req.body;
    const stats = await storage.updateStats(correct);
    res.json(stats);
  });
  app2.post("/api/upload-pdf", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "PDF dosyas\u0131 bulunamad\u0131"
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
        error: error instanceof Error ? error.message : "Sunucu hatas\u0131"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs from "fs";
import * as path from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
