/**
 * Tests for localStorage utility functions
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getQuestions,
  saveQuestion,
  deleteQuestion,
  getStats,
  updateStats,
} from "../localStorage";

describe("localStorage utilities", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  describe("getQuestions", () => {
    it("should return empty array when no questions exist", async () => {
      const questions = await getQuestions();
      expect(questions).toEqual([]);
    });

    it("should return stored questions", async () => {
      const mockQuestions = [
        {
          id: "1",
          content: "Test question",
          options: ["A", "B", "C", "D", "E"],
          correctAnswer: "A",
          category: "Math",
        },
      ];

      await AsyncStorage.setItem("questions", JSON.stringify(mockQuestions));
      const questions = await getQuestions();
      expect(questions).toEqual(mockQuestions);
    });
  });

  describe("saveQuestion", () => {
    it("should save a new question", async () => {
      const newQuestion = {
        id: "test-1",
        content: "New test question",
        options: ["A", "B", "C", "D", "E"],
        correctAnswer: "C",
        category: "Physics",
      };

      await saveQuestion(newQuestion);
      const questions = await getQuestions();
      expect(questions).toHaveLength(1);
      expect(questions[0]).toMatchObject(newQuestion);
    });
  });

  describe("getStats", () => {
    it("should return default stats when none exist", async () => {
      const stats = await getStats();
      expect(stats).toHaveProperty("totalAnswered");
      expect(stats).toHaveProperty("correctAnswers");
      expect(stats).toHaveProperty("incorrectAnswers");
    });
  });

  describe("updateStats", () => {
    it("should update statistics correctly", async () => {
      await updateStats(true);
      const stats = await getStats();
      expect(stats.totalAnswered).toBe(1);
      expect(stats.correctAnswers).toBe(1);
      expect(stats.incorrectAnswers).toBe(0);
    });

    it("should track incorrect answers", async () => {
      await updateStats(false);
      const stats = await getStats();
      expect(stats.totalAnswered).toBe(1);
      expect(stats.correctAnswers).toBe(0);
      expect(stats.incorrectAnswers).toBe(1);
    });
  });
});
