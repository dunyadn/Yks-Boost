import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import type { InsertQuestion, InsertQuestionPackage } from "@shared/schema";

// Interface for incoming question data from JSON import
interface ImportQuestionData {
  content?: string;
  soru?: string;
  question?: string;
  options?: string[];
  secenekler?: string[];
  siklar?: string[];
  correctAnswer?: string;
  dogruCevap?: string;
  cevap?: string;
  solution?: string;
  cozum?: string;
  aciklama?: string;
  category?: string;
  ders?: string;
  konu?: string;
  subject?: string;
  altKonu?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Questions
  app.get("/api/questions", async (_req, res) => {
    const questions = await storage.getQuestions();
    res.json(questions);
  });

  app.get("/api/questions/package/:packageId", async (req, res) => {
    const questions = await storage.getQuestionsByPackage(req.params.packageId);
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

  // Question Packages
  app.get("/api/packages", async (_req, res) => {
    const packages = await storage.getPackages();
    res.json(packages);
  });

  app.get("/api/packages/:id", async (req, res) => {
    const pkg = await storage.getPackage(req.params.id);
    if (!pkg) {
      return res.status(404).json({ error: "Paket bulunamadı" });
    }
    res.json(pkg);
  });

  app.post("/api/packages", async (req, res) => {
    const pkg = await storage.createPackage(req.body as InsertQuestionPackage);
    res.json(pkg);
  });

  app.delete("/api/packages/:id", async (req, res) => {
    await storage.deletePackage(req.params.id);
    res.sendStatus(200);
  });

  // Bulk import questions via JSON
  app.post("/api/import-questions", async (req, res) => {
    try {
      const { packageName, examType, year, description, questions } = req.body;

      if (
        !packageName ||
        !examType ||
        !questions ||
        !Array.isArray(questions)
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Geçersiz JSON formatı. packageName, examType ve questions gereklidir.",
        });
      }

      // Create the package first
      const pkg = await storage.createPackage({
        name: packageName,
        examType,
        year: year || null,
        description: description || null,
      } as InsertQuestionPackage);

      // Add questions with package reference
      const insertQuestions: InsertQuestion[] = questions.map(
        (q: ImportQuestionData) => ({
          content: q.content || q.soru || q.question || "",
          options: q.options || q.secenekler || q.siklar || [],
          correctAnswer: q.correctAnswer || q.dogruCevap || q.cevap || "A",
          solution: q.solution || q.cozum || q.aciklama || null,
          category: q.category || q.ders || q.konu || "Genel",
          subject: q.subject || q.altKonu || null,
          packageId: pkg.id,
          examType: examType,
        }),
      );

      const createdQuestions =
        await storage.createManyQuestions(insertQuestions);

      console.log(
        `✅ Imported ${createdQuestions.length} questions to package: ${packageName}`,
      );

      return res.json({
        success: true,
        packageId: pkg.id,
        packageName: pkg.name,
        questionsAdded: createdQuestions.length,
      });
    } catch (error) {
      console.error("❌ Error importing questions:", error);
      return res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Sorular eklenirken hata oluştu",
      });
    }
  });

  // Stats
  app.get("/api/stats", async (_req, res) => {
    const stats = await storage.getStats();
    const topicStats = await storage.getTopicStats();
    const worstTopics = await storage.getWorstTopics(5);
    const avgSolvingTime =
      stats.totalAnswered && stats.totalSolvingTimeMs
        ? Math.round(stats.totalSolvingTimeMs / stats.totalAnswered)
        : 0;

    res.json({
      ...stats,
      avgSolvingTimeMs: avgSolvingTime,
      worstTopics,
      topicStats,
    });
  });

  app.post("/api/stats", async (req, res) => {
    const { correct, solvingTimeMs, category, subject, packageId } = req.body;
    const stats = await storage.updateStats(
      correct,
      solvingTimeMs,
      category,
      subject,
    );

    // Update package stats if packageId provided
    if (packageId) {
      await storage.updatePackageStats(packageId, correct, solvingTimeMs);
    }

    res.json(stats);
  });

  // Package Stats
  app.get("/api/package-stats", async (_req, res) => {
    const stats = await storage.getAllPackageStats();
    const packages = await storage.getPackages();

    // Combine package info with stats
    const result = packages.map((pkg) => {
      const pkgStats = stats.find((s) => s.packageId === pkg.id);
      const totalAnswered = pkgStats?.totalAnswered || 0;
      const correctAnswers = pkgStats?.correctAnswers || 0;
      const successRate =
        totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;
      const avgTime =
        totalAnswered > 0 && pkgStats?.totalSolvingTimeMs
          ? Math.round(pkgStats.totalSolvingTimeMs / totalAnswered)
          : 0;

      return {
        ...pkg,
        stats: {
          totalAnswered,
          correctAnswers,
          successRate: Math.round(successRate * 10) / 10,
          avgSolvingTimeMs: avgTime,
        },
      };
    });

    res.json(result);
  });

  app.get("/api/package-stats/:packageId", async (req, res) => {
    const stats = await storage.getPackageStats(req.params.packageId);
    const pkg = await storage.getPackage(req.params.packageId);

    if (!pkg) {
      return res.status(404).json({ error: "Paket bulunamadı" });
    }

    const totalAnswered = stats?.totalAnswered || 0;
    const correctAnswers = stats?.correctAnswers || 0;
    const successRate =
      totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

    res.json({
      ...pkg,
      stats: {
        totalAnswered,
        correctAnswers,
        successRate: Math.round(successRate * 10) / 10,
        avgSolvingTimeMs:
          totalAnswered > 0 && stats?.totalSolvingTimeMs
            ? Math.round(stats.totalSolvingTimeMs / totalAnswered)
            : 0,
      },
    });
  });

  // Topic Stats (Worst performing topics)
  app.get("/api/topic-stats", async (_req, res) => {
    const stats = await storage.getTopicStats();
    res.json(stats);
  });

  app.get("/api/worst-topics", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const worstTopics = await storage.getWorstTopics(limit);
    res.json(worstTopics);
  });

  const httpServer = createServer(app);
  return httpServer;
}
