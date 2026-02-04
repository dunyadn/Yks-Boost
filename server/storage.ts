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

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Questions
  getQuestions(): Promise<Question[]>;
  getQuestionsByPackage(packageId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  createManyQuestions(questions: InsertQuestion[]): Promise<Question[]>;
  deleteQuestion(id: string): Promise<void>;

  // Question Packages
  getPackages(): Promise<QuestionPackage[]>;
  getPackage(id: string): Promise<QuestionPackage | undefined>;
  createPackage(pkg: InsertQuestionPackage): Promise<QuestionPackage>;
  deletePackage(id: string): Promise<void>;

  // Stats
  getStats(): Promise<Statistic>;
  updateStats(
    correct: boolean,
    solvingTimeMs?: number,
    category?: string,
    subject?: string,
  ): Promise<Statistic>;

  // Package Stats
  getPackageStats(packageId: string): Promise<PackageStatistic | undefined>;
  getAllPackageStats(): Promise<PackageStatistic[]>;
  updatePackageStats(
    packageId: string,
    correct: boolean,
    solvingTimeMs?: number,
  ): Promise<PackageStatistic>;

  // Topic Stats
  getTopicStats(): Promise<TopicStatistic[]>;
  getWorstTopics(limit?: number): Promise<TopicStatistic[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private questions: Map<string, Question>;
  private packages: Map<string, QuestionPackage>;
  private stats: Statistic;
  private packageStats: Map<string, PackageStatistic>;
  private topicStats: Map<string, TopicStatistic>;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.packages = new Map();
    this.stats = {
      id: "global",
      totalAnswered: 0,
      correctAnswers: 0,
      totalSolvingTimeMs: 0,
      lastUpdated: new Date(),
    };
    this.packageStats = new Map();
    this.topicStats = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestionsByPackage(packageId: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
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
    this.questions.set(id, question);

    // Update package question count
    if (question.packageId) {
      const pkg = this.packages.get(question.packageId);
      if (pkg) {
        pkg.totalQuestions = (pkg.totalQuestions || 0) + 1;
      }
    }

    return question;
  }

  async createManyQuestions(questions: InsertQuestion[]): Promise<Question[]> {
    const created: Question[] = [];
    for (const q of questions) {
      const question = await this.createQuestion(q);
      created.push(question);
    }
    return created;
  }

  async deleteQuestion(id: string): Promise<void> {
    const question = this.questions.get(id);
    if (question?.packageId) {
      const pkg = this.packages.get(question.packageId);
      if (pkg && pkg.totalQuestions) {
        pkg.totalQuestions = Math.max(0, pkg.totalQuestions - 1);
      }
    }
    this.questions.delete(id);
  }

  // Question Packages
  async getPackages(): Promise<QuestionPackage[]> {
    return Array.from(this.packages.values());
  }

  async getPackage(id: string): Promise<QuestionPackage | undefined> {
    return this.packages.get(id);
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
    this.packages.set(id, pkg);
    return pkg;
  }

  async deletePackage(id: string): Promise<void> {
    // Delete all questions in this package
    const questions = await this.getQuestionsByPackage(id);
    for (const q of questions) {
      this.questions.delete(q.id);
    }
    this.packages.delete(id);
    this.packageStats.delete(id);
  }

  async getStats(): Promise<Statistic> {
    return this.stats;
  }

  async updateStats(
    correct: boolean,
    solvingTimeMs?: number,
    category?: string,
    subject?: string,
  ): Promise<Statistic> {
    this.stats.totalAnswered = (this.stats.totalAnswered || 0) + 1;
    if (correct) {
      this.stats.correctAnswers = (this.stats.correctAnswers || 0) + 1;
    }
    if (solvingTimeMs) {
      this.stats.totalSolvingTimeMs =
        (this.stats.totalSolvingTimeMs || 0) + solvingTimeMs;
    }
    this.stats.lastUpdated = new Date();

    // Update topic statistics if category provided
    if (category) {
      await this.updateTopicStats(
        category,
        subject || undefined,
        correct,
        solvingTimeMs,
      );
    }

    return this.stats;
  }

  private async updateTopicStats(
    category: string,
    subject: string | undefined,
    correct: boolean,
    solvingTimeMs?: number,
  ): Promise<void> {
    const key = subject ? `${category}:${subject}` : category;
    let topicStat = this.topicStats.get(key);

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
    this.topicStats.set(key, topicStat);
  }

  // Package Stats
  async getPackageStats(
    packageId: string,
  ): Promise<PackageStatistic | undefined> {
    return this.packageStats.get(packageId);
  }

  async getAllPackageStats(): Promise<PackageStatistic[]> {
    return Array.from(this.packageStats.values());
  }

  async updatePackageStats(
    packageId: string,
    correct: boolean,
    solvingTimeMs?: number,
  ): Promise<PackageStatistic> {
    let stats = this.packageStats.get(packageId);

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

    this.packageStats.set(packageId, stats);
    return stats;
  }

  // Topic Stats
  async getTopicStats(): Promise<TopicStatistic[]> {
    return Array.from(this.topicStats.values());
  }

  async getWorstTopics(limit: number = 5): Promise<TopicStatistic[]> {
    const stats = Array.from(this.topicStats.values());
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

export const storage = new MemStorage();
