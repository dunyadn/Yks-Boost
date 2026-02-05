/**
 * Data validation schemas using Zod
 * Ensures type safety and runtime validation
 */

import { z } from "zod";

// Question validation schema
export const QuestionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  content: z.string().min(1, "Question content is required"),
  options: z
    .array(z.string())
    .min(2, "At least 2 options required")
    .max(5, "Maximum 5 options allowed"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  solution: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  packageId: z.string().nullable().optional(),
  examType: z.string().nullable().optional(),
  likes: z.number().default(0),
  comments: z.number().default(0),
  saved: z.boolean().default(false),
  liked: z.boolean().default(false),
});

// User stats schema
export const StatsSchema = z.object({
  totalAnswered: z.number().min(0).default(0),
  correctAnswers: z.number().min(0).default(0),
  incorrectAnswers: z.number().min(0).default(0),
  streak: z.number().min(0).default(0),
  lastStudyDate: z.string().nullable().optional(),
  categoryStats: z
    .record(
      z.object({
        total: z.number().min(0),
        correct: z.number().min(0),
        incorrect: z.number().min(0),
      }),
    )
    .optional(),
});

// Package schema
export const PackageSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Package name is required"),
  description: z.string().optional(),
  examType: z.enum(["TYT", "AYT", "YDT", "Other"]).default("TYT"),
  questionCount: z.number().min(0).default(0),
  completedCount: z.number().min(0).default(0),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional(),
});

// Task schema
export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  targetCount: z.number().min(1, "Target must be at least 1"),
  currentCount: z.number().min(0).default(0),
  completed: z.boolean().default(false),
  dueDate: z.string().nullable().optional(),
  createdAt: z.string().or(z.date()),
});

// Environment variables schema
export const EnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().or(z.number()).optional(),
});

// Export types inferred from schemas
export type Question = z.infer<typeof QuestionSchema>;
export type Stats = z.infer<typeof StatsSchema>;
export type Package = z.infer<typeof PackageSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type Env = z.infer<typeof EnvSchema>;

/**
 * Validate data against a schema and return typed result
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Validate data and return result with error handling
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Validate partial data (useful for updates)
 */
export function validatePartial<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): Partial<T> {
  return schema.partial().parse(data);
}
