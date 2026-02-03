import { type User, type InsertUser, type Question, type InsertQuestion, type Statistic } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Questions
  getQuestions(): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;
  
  // Stats
  getStats(): Promise<Statistic>;
  updateStats(correct: boolean): Promise<Statistic>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private questions: Map<string, Question>;
  private stats: Statistic;

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.stats = {
      id: "global",
      totalAnswered: 0,
      correctAnswers: 0,
      lastUpdated: new Date()
    };
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

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = randomUUID();
    const question: Question = { ...insertQuestion, id, createdAt: new Date(), category: insertQuestion.category || "general" };
    this.questions.set(id, question);
    return question;
  }

  async deleteQuestion(id: string): Promise<void> {
    this.questions.delete(id);
  }

  async getStats(): Promise<Statistic> {
    return this.stats;
  }

  async updateStats(correct: boolean): Promise<Statistic> {
    this.stats.totalAnswered = (this.stats.totalAnswered || 0) + 1;
    if (correct) {
      this.stats.correctAnswers = (this.stats.correctAnswers || 0) + 1;
    }
    this.stats.lastUpdated = new Date();
    return this.stats;
  }
}

export const storage = new MemStorage();
