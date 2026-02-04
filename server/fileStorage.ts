import {
  type User,
  type InsertUser,
  type Question,
  type InsertQuestion,
  type Statistic,
  type QuestionPackage,
  type InsertQuestionPackage,
  type PackageStatistic,
  type TopicStatistic,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { join } from "path";
import type { IStorage } from "./storage";

interface StorageData {
  users: Record<string, User>;
  questions: Record<string, Question>;
  packages: Record<string, QuestionPackage>;
  stats: Statistic;
  packageStats: Record<string, PackageStatistic>;
  topicStats: Record<string, TopicStatistic>;
}

export class FileStorage implements IStorage {
  private filePath: string;
  private data: StorageData;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor(filePath?: string) {
    this.filePath = filePath || join(process.cwd(), "data", "storage.json");
    this.data = {
      users: {},
      questions: {},
      packages: {},
      stats: {
        id: "global",
        totalAnswered: 0,
        correctAnswers: 0,
        totalSolvingTimeMs: 0,
        lastUpdated: new Date(),
      },
      packageStats: {},
      topicStats: {},
    };
  }

  async init(): Promise<void> {
    try {
      // Ensure data directory exists
      const dir = join(process.cwd(), "data");
      await fs.mkdir(dir, { recursive: true });

      // Try to load existing data
      try {
        const fileContent = await fs.readFile(this.filePath, "utf-8");
        const loadedData = JSON.parse(fileContent);
        
        // Convert date strings back to Date objects
        if (loadedData.stats?.lastUpdated) {
          loadedData.stats.lastUpdated = new Date(loadedData.stats.lastUpdated);
        }
        
        Object.values(loadedData.questions || {}).forEach((q: any) => {
          if (q.createdAt) q.createdAt = new Date(q.createdAt);
        });
        
        Object.values(loadedData.packages || {}).forEach((p: any) => {
          if (p.createdAt) p.createdAt = new Date(p.createdAt);
        });
        
        Object.values(loadedData.packageStats || {}).forEach((s: any) => {
          if (s.lastUpdated) s.lastUpdated = new Date(s.lastUpdated);
        });
        
        Object.values(loadedData.topicStats || {}).forEach((s: any) => {
          if (s.lastUpdated) s.lastUpdated = new Date(s.lastUpdated);
        });

        this.data = loadedData;
        console.log(`✅ Loaded storage from ${this.filePath}`);
        console.log(`   - ${Object.keys(this.data.questions).length} questions`);
        console.log(`   - ${Object.keys(this.data.packages).length} packages`);
      } catch (error: any) {
        if (error.code === "ENOENT") {
          console.log(`📝 Creating new storage file at ${this.filePath}`);
          await this.save();
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("❌ Error initializing file storage:", error);
      throw error;
    }
  }

  private async save(): Promise<void> {
    // Debounce saves to avoid excessive I/O
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      try {
        await fs.writeFile(
          this.filePath,
          JSON.stringify(this.data, null, 2),
          "utf-8"
        );
        console.log(`💾 Storage saved to ${this.filePath}`);
      } catch (error) {
        console.error("❌ Error saving storage:", error);
      }
    }, 100);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.data.users[id];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Object.values(this.data.users).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.data.users[id] = user;
    await this.save();
    return user;
  }

  async getQuestions(): Promise<Question[]> {
    return Object.values(this.data.questions);
  }

  async getQuestionsByPackage(packageId: string): Promise<Question[]> {
    return Object.values(this.data.questions).filter(
      (q) => q.packageId === packageId,
    );
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const question: Question = {
      ...insertQuestion,
      id,
      createdAt: new Date(),
      category: insertQuestion.category || "general",
      subject: insertQuestion.subject || null,
      packageId: insertQuestion.packageId || null,
      examType: insertQuestion.examType || "TYT",
    };
    this.data.questions[id] = question;

    // Update package question count
    if (question.packageId && this.data.packages[question.packageId]) {
      const pkg = this.data.packages[question.packageId];
      pkg.totalQuestions = (pkg.totalQuestions || 0) + 1;
    }

    await this.save();
    return question;
  }

  async createManyQuestions(questions: InsertQuestion[]): Promise<Question[]> {
    const created: Question[] = [];
    for (const q of questions) {
      const id = randomUUID();
      const question: Question = {
        ...q,
        id,
        createdAt: new Date(),
        category: q.category || "general",
        subject: q.subject || null,
        packageId: q.packageId || null,
        examType: q.examType || "TYT",
      };
      this.data.questions[id] = question;
      created.push(question);

      // Update package question count
      if (question.packageId && this.data.packages[question.packageId]) {
        const pkg = this.data.packages[question.packageId];
        pkg.totalQuestions = (pkg.totalQuestions || 0) + 1;
      }
    }
    await this.save();
    return created;
  }

  async deleteQuestion(id: string): Promise<void> {
    const question = this.data.questions[id];
    if (question?.packageId && this.data.packages[question.packageId]) {
      const pkg = this.data.packages[question.packageId];
      if (pkg.totalQuestions) {
        pkg.totalQuestions = Math.max(0, pkg.totalQuestions - 1);
      }
    }
    delete this.data.questions[id];
    await this.save();
  }

  // Question Packages
  async getPackages(): Promise<QuestionPackage[]> {
    return Object.values(this.data.packages);
  }

  async getPackage(id: string): Promise<QuestionPackage | undefined> {
    return this.data.packages[id];
  }

  async createPackage(
    insertPackage: InsertQuestionPackage,
  ): Promise<QuestionPackage> {
    const id = randomUUID();
    const pkg: QuestionPackage = {
      ...insertPackage,
      id,
      totalQuestions: 0,
      createdAt: new Date(),
      year: insertPackage.year || null,
      description: insertPackage.description || null,
    };
    this.data.packages[id] = pkg;
    await this.save();
    return pkg;
  }

  async deletePackage(id: string): Promise<void> {
    // Delete all questions in this package
    Object.keys(this.data.questions).forEach((qId) => {
      if (this.data.questions[qId].packageId === id) {
        delete this.data.questions[qId];
      }
    });
    delete this.data.packages[id];
    delete this.data.packageStats[id];
    await this.save();
  }

  async getStats(): Promise<Statistic> {
    return this.data.stats;
  }

  async updateStats(
    correct: boolean,
    solvingTimeMs?: number,
    category?: string,
    subject?: string,
  ): Promise<Statistic> {
    this.data.stats.totalAnswered = (this.data.stats.totalAnswered || 0) + 1;
    if (correct) {
      this.data.stats.correctAnswers = (this.data.stats.correctAnswers || 0) + 1;
    }
    if (solvingTimeMs) {
      this.data.stats.totalSolvingTimeMs =
        (this.data.stats.totalSolvingTimeMs || 0) + solvingTimeMs;
    }
    this.data.stats.lastUpdated = new Date();

    // Update topic statistics if category provided
    if (category) {
      await this.updateTopicStats(
        category,
        subject || undefined,
        correct,
        solvingTimeMs,
      );
    }

    await this.save();
    return this.data.stats;
  }

  private async updateTopicStats(
    category: string,
    subject: string | undefined,
    correct: boolean,
    solvingTimeMs?: number,
  ): Promise<void> {
    const key = subject ? `${category}:${subject}` : category;
    let topicStat = this.data.topicStats[key];

    if (!topicStat) {
      topicStat = {
        id: randomUUID(),
        category,
        subject: subject || null,
        totalAnswered: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        avgSolvingTimeMs: 0,
        lastUpdated: new Date(),
      };
    }

    topicStat.totalAnswered = (topicStat.totalAnswered || 0) + 1;
    if (correct) {
      topicStat.correctAnswers = (topicStat.correctAnswers || 0) + 1;
    } else {
      topicStat.wrongAnswers = (topicStat.wrongAnswers || 0) + 1;
    }

    if (solvingTimeMs) {
      const oldTotal =
        (topicStat.avgSolvingTimeMs || 0) * (topicStat.totalAnswered - 1);
      topicStat.avgSolvingTimeMs =
        (oldTotal + solvingTimeMs) / topicStat.totalAnswered;
    }

    topicStat.lastUpdated = new Date();
    this.data.topicStats[key] = topicStat;
  }

  // Package Stats
  async getPackageStats(
    packageId: string,
  ): Promise<PackageStatistic | undefined> {
    return this.data.packageStats[packageId];
  }

  async getAllPackageStats(): Promise<PackageStatistic[]> {
    return Object.values(this.data.packageStats);
  }

  async updatePackageStats(
    packageId: string,
    correct: boolean,
    solvingTimeMs?: number,
  ): Promise<PackageStatistic> {
    let stats = this.data.packageStats[packageId];

    if (!stats) {
      stats = {
        id: randomUUID(),
        packageId,
        totalAnswered: 0,
        correctAnswers: 0,
        totalSolvingTimeMs: 0,
        lastUpdated: new Date(),
      };
    }

    stats.totalAnswered = (stats.totalAnswered || 0) + 1;
    if (correct) {
      stats.correctAnswers = (stats.correctAnswers || 0) + 1;
    }
    if (solvingTimeMs) {
      stats.totalSolvingTimeMs =
        (stats.totalSolvingTimeMs || 0) + solvingTimeMs;
    }
    stats.lastUpdated = new Date();

    this.data.packageStats[packageId] = stats;
    await this.save();
    return stats;
  }

  // Topic Stats
  async getTopicStats(): Promise<TopicStatistic[]> {
    return Object.values(this.data.topicStats);
  }

  async getWorstTopics(limit: number = 5): Promise<TopicStatistic[]> {
    const stats = Object.values(this.data.topicStats);
    // Sort by wrong answer ratio (highest first)
    return stats
      .filter((s) => (s.totalAnswered || 0) > 0)
      .sort((a, b) => {
        const ratioA = (a.wrongAnswers || 0) / (a.totalAnswered || 1);
        const ratioB = (b.wrongAnswers || 0) / (b.totalAnswered || 1);
        return ratioB - ratioA;
      })
      .slice(0, limit);
  }
}
