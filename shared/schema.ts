import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  jsonb,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Soru paketleri tablosu
export const questionPackages = pgTable("question_packages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // "TYT 2025", "AYT 2024 Matematik"
  examType: text("examType").notNull(), // "TYT", "AYT"
  year: integer("year"), // 2025, 2024
  description: text("description"),
  totalQuestions: integer("totalQuestions").default(0),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const questions = pgTable("questions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  options: jsonb("options").notNull(), // ["A", "B", "C", "D", "E"]
  correctAnswer: text("correctAnswer").notNull(),
  solution: text("solution"), // Soru çözümü/açıklaması
  category: text("category").default("general"), // "Matematik", "Fizik", "Türkçe" etc.
  subject: text("subject"), // Alt konu: "Türev", "Integral", "Paragraf"
  packageId: varchar("packageId"), // Soru paketi referansı
  examType: text("examType").default("TYT"), // "TYT", "AYT"
  createdAt: timestamp("createdAt").defaultNow(),
});

export const statistics = pgTable("statistics", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  totalAnswered: integer("totalAnswered").default(0),
  correctAnswers: integer("correctAnswers").default(0),
  totalSolvingTimeMs: integer("totalSolvingTimeMs").default(0), // Toplam çözüm süresi (ms)
  lastUpdated: timestamp("lastUpdated").defaultNow(),
});

// Soru paketi istatistikleri
export const packageStatistics = pgTable("package_statistics", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  packageId: varchar("packageId").notNull(),
  totalAnswered: integer("totalAnswered").default(0),
  correctAnswers: integer("correctAnswers").default(0),
  totalSolvingTimeMs: integer("totalSolvingTimeMs").default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow(),
});

// Konu bazlı istatistikler (yanlış yapılan konular için)
export const topicStatistics = pgTable("topic_statistics", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // "Matematik", "Fizik"
  subject: text("subject"), // "Türev", "Paragraf"
  totalAnswered: integer("totalAnswered").default(0),
  correctAnswers: integer("correctAnswers").default(0),
  wrongAnswers: integer("wrongAnswers").default(0),
  avgSolvingTimeMs: real("avgSolvingTimeMs").default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertQuestionSchema = createInsertSchema(questions);
export const insertQuestionPackageSchema = createInsertSchema(questionPackages);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type QuestionPackage = typeof questionPackages.$inferSelect;
export type InsertQuestionPackage = z.infer<typeof insertQuestionPackageSchema>;
export type Statistic = typeof statistics.$inferSelect;
export type PackageStatistic = typeof packageStatistics.$inferSelect;
export type TopicStatistic = typeof topicStatistics.$inferSelect;
