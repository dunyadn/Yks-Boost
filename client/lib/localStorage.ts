import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  Question,
  QuestionPackage,
  InsertQuestion,
  InsertQuestionPackage,
  Statistic,
  PackageStatistic,
  TopicStatistic,
} from "@shared/schema";

const STORAGE_KEYS = {
  QUESTIONS: "@yks_boost:questions",
  PACKAGES: "@yks_boost:packages",
  STATS: "@yks_boost:stats",
  PACKAGE_STATS: "@yks_boost:package_stats",
  TOPIC_STATS: "@yks_boost:topic_stats",
  SAVED_QUESTIONS: "@yks_boost:saved_questions",
  SOLVED_QUESTIONS: "@yks_boost:solved_questions",
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Question Storage
export async function getQuestions(): Promise<Question[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // Validate and filter out invalid questions
    return parsed.filter(
      (q): q is Question =>
        q &&
        typeof q === "object" &&
        typeof q.id === "string" &&
        (typeof q.content === "string" ||
          q.content === null ||
          q.content === undefined),
    );
  } catch (error) {
    console.error("Error loading questions:", error);
    return [];
  }
}

/**
 * Get all questions including both manual questions and package questions
 * Deduplicates by question ID
 */
export async function getAllQuestionsIncludingPackages(): Promise<Question[]> {
  try {
    // Get manual questions
    const manualQuestions = await getQuestions();

    // Get all questions (which includes package questions)
    // Since package questions are also stored in STORAGE_KEYS.QUESTIONS
    // with their packageId set, we just need to return all questions
    // The getQuestions() function already returns all questions including packages
    
    // Create a Map to deduplicate by ID (in case there are duplicates)
    const questionMap = new Map<string, Question>();
    
    for (const question of manualQuestions) {
      if (!questionMap.has(question.id)) {
        questionMap.set(question.id, question);
      }
    }

    // Convert map back to array
    return Array.from(questionMap.values());
  } catch (error) {
    console.error("Error loading all questions including packages:", error);
    return [];
  }
}

export async function saveQuestion(
  question: InsertQuestion,
): Promise<Question> {
  const questions = await getQuestions();
  const newQuestion: Question = {
    ...question,
    id: generateId(),
    createdAt: new Date(),
    category: question.category || "general",
    subject: question.subject || null,
    packageId: question.packageId || null,
    examType: question.examType || "TYT",
    solution: question.solution || null,
  };
  questions.push(newQuestion);
  await AsyncStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));

  // Update package question count
  if (newQuestion.packageId) {
    const packages = await getPackages();
    const pkg = packages.find((p) => p.id === newQuestion.packageId);
    if (pkg) {
      pkg.totalQuestions = (pkg.totalQuestions || 0) + 1;
      await AsyncStorage.setItem(
        STORAGE_KEYS.PACKAGES,
        JSON.stringify(packages),
      );
    }
  }

  return newQuestion;
}

export async function saveQuestions(
  insertQuestions: InsertQuestion[],
): Promise<Question[]> {
  const questions = await getQuestions();
  const newQuestions: Question[] = insertQuestions.map((q) => ({
    ...q,
    id: generateId(),
    createdAt: new Date(),
    category: q.category || "general",
    subject: q.subject || null,
    packageId: q.packageId || null,
    examType: q.examType || "TYT",
    solution: q.solution || null,
  }));

  const allQuestions = [...questions, ...newQuestions];
  await AsyncStorage.setItem(
    STORAGE_KEYS.QUESTIONS,
    JSON.stringify(allQuestions),
  );

  // Update package question counts for each unique package
  const packageIds = new Set(
    newQuestions.map((q) => q.packageId).filter(Boolean),
  );
  if (packageIds.size > 0) {
    const packages = await getPackages();
    let packagesUpdated = false;

    for (const packageId of packageIds) {
      const pkg = packages.find((p) => p.id === packageId);
      if (pkg) {
        const questionsInPackage = newQuestions.filter(
          (q) => q.packageId === packageId,
        ).length;
        pkg.totalQuestions = (pkg.totalQuestions || 0) + questionsInPackage;
        packagesUpdated = true;
      }
    }

    if (packagesUpdated) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PACKAGES,
        JSON.stringify(packages),
      );
    }
  }

  return newQuestions;
}

export async function deleteQuestion(id: string): Promise<void> {
  const questions = await getQuestions();
  const filtered = questions.filter((q) => q.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(filtered));
}

// Package Storage
export async function getPackages(): Promise<QuestionPackage[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PACKAGES);
    if (!data) return [];
    const parsed = JSON.parse(data);

    const isPackageObject = (pkg: unknown): pkg is QuestionPackage => {
      if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) {
        return false;
      }
      const candidate = pkg as { id?: unknown; name?: unknown };
      return (
        typeof candidate.id === "string" && typeof candidate.name === "string"
      );
    };

    if (Array.isArray(parsed)) {
      return parsed.filter(isPackageObject);
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { packages?: QuestionPackage[] }).packages)
    ) {
      return (parsed as { packages: QuestionPackage[] }).packages.filter(
        isPackageObject,
      );
    }
    return [];
  } catch (error) {
    console.error("Error loading packages:", error);
    return [];
  }
}

export async function savePackage(
  pkg: InsertQuestionPackage,
): Promise<QuestionPackage> {
  const packages = await getPackages();
  const newPackage: QuestionPackage = {
    ...pkg,
    id: generateId(),
    totalQuestions: 0,
    createdAt: new Date(),
    year: pkg.year || null,
    description: pkg.description || null,
  };
  packages.push(newPackage);
  await AsyncStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
  return newPackage;
}

export async function deletePackage(id: string): Promise<void> {
  const packages = await getPackages();
  const filtered = packages.filter((p) => p.id !== id);
  await AsyncStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(filtered));

  // Delete all questions in this package
  const questions = await getQuestions();
  const filteredQuestions = questions.filter((q) => q.packageId !== id);
  await AsyncStorage.setItem(
    STORAGE_KEYS.QUESTIONS,
    JSON.stringify(filteredQuestions),
  );
}

// Statistics
export async function getStats(): Promise<Statistic> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.STATS);
    return data
      ? JSON.parse(data)
      : {
          id: "global",
          totalAnswered: 0,
          correctAnswers: 0,
          totalSolvingTimeMs: 0,
          lastUpdated: new Date(),
        };
  } catch (error) {
    console.error("Error loading stats:", error);
    return {
      id: "global",
      totalAnswered: 0,
      correctAnswers: 0,
      totalSolvingTimeMs: 0,
      lastUpdated: new Date(),
    };
  }
}

export async function updateStats(
  correct: boolean,
  solvingTimeMs?: number,
  category?: string,
  subject?: string,
): Promise<Statistic> {
  const stats = await getStats();
  stats.totalAnswered = (stats.totalAnswered || 0) + 1;
  if (correct) {
    stats.correctAnswers = (stats.correctAnswers || 0) + 1;
  }
  if (solvingTimeMs) {
    stats.totalSolvingTimeMs = (stats.totalSolvingTimeMs || 0) + solvingTimeMs;
  }
  stats.lastUpdated = new Date();
  await AsyncStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

  // Update topic stats if category provided
  if (category) {
    await updateTopicStats(category, subject, correct, solvingTimeMs);
  }

  return stats;
}

// Topic Stats
export async function getTopicStats(): Promise<TopicStatistic[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TOPIC_STATS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading topic stats:", error);
    return [];
  }
}

async function updateTopicStats(
  category: string,
  subject: string | undefined,
  correct: boolean,
  solvingTimeMs?: number,
): Promise<void> {
  const topicStats = await getTopicStats();
  // Normalize subject: empty string or undefined becomes null
  const normalizedSubject = subject && subject.trim() ? subject : null;
  let stat = topicStats.find(
    (s) => s.category === category && s.subject === normalizedSubject,
  );

  if (!stat) {
    stat = {
      id: generateId(),
      category,
      subject: normalizedSubject,
      totalAnswered: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      avgSolvingTimeMs: 0,
      lastUpdated: new Date(),
    };
    topicStats.push(stat);
  }

  const oldTotalAnswered = stat.totalAnswered || 0;
  stat.totalAnswered = oldTotalAnswered + 1;
  if (correct) {
    stat.correctAnswers = (stat.correctAnswers || 0) + 1;
  } else {
    stat.wrongAnswers = (stat.wrongAnswers || 0) + 1;
  }

  if (solvingTimeMs) {
    const oldTotal = (stat.avgSolvingTimeMs || 0) * oldTotalAnswered;
    stat.avgSolvingTimeMs = (oldTotal + solvingTimeMs) / stat.totalAnswered;
  }

  stat.lastUpdated = new Date();
  await AsyncStorage.setItem(
    STORAGE_KEYS.TOPIC_STATS,
    JSON.stringify(topicStats),
  );
}

export async function getWorstTopics(
  limit: number = 5,
): Promise<TopicStatistic[]> {
  const stats = await getTopicStats();
  return stats
    .filter((s) => (s.totalAnswered || 0) > 0)
    .sort((a, b) => {
      const ratioA = (a.wrongAnswers || 0) / (a.totalAnswered || 1);
      const ratioB = (b.wrongAnswers || 0) / (b.totalAnswered || 1);
      return ratioB - ratioA;
    })
    .slice(0, limit);
}

// Package Stats
export async function getPackageStats(): Promise<PackageStatistic[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PACKAGE_STATS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading package stats:", error);
    return [];
  }
}

export async function updatePackageStats(
  packageId: string,
  correct: boolean,
  solvingTimeMs?: number,
): Promise<PackageStatistic> {
  const packageStats = await getPackageStats();
  let stat = packageStats.find((s) => s.packageId === packageId);

  if (!stat) {
    stat = {
      id: generateId(),
      packageId,
      totalAnswered: 0,
      correctAnswers: 0,
      totalSolvingTimeMs: 0,
      lastUpdated: new Date(),
    };
    packageStats.push(stat);
  }

  stat.totalAnswered = (stat.totalAnswered || 0) + 1;
  if (correct) {
    stat.correctAnswers = (stat.correctAnswers || 0) + 1;
  }
  if (solvingTimeMs) {
    stat.totalSolvingTimeMs = (stat.totalSolvingTimeMs || 0) + solvingTimeMs;
  }
  stat.lastUpdated = new Date();

  await AsyncStorage.setItem(
    STORAGE_KEYS.PACKAGE_STATS,
    JSON.stringify(packageStats),
  );
  return stat;
}

// Saved Questions (Bookmarked/Favorited Questions)
interface SavedQuestionMeta {
  questionId: string;
  savedAt: string; // ISO timestamp
}

export async function getSavedQuestions(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_QUESTIONS);
    if (!data) return [];

    const parsed = JSON.parse(data);
    // Support legacy format (array of strings) and new format (array of objects)
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (typeof parsed[0] === "string") {
        // Legacy format - return as is
        return parsed;
      } else {
        // New format - extract IDs
        return parsed.map((item: SavedQuestionMeta) => item.questionId);
      }
    }
    return [];
  } catch (error) {
    console.error("Error loading saved questions:", error);
    return [];
  }
}

export async function getSavedQuestionsWithMeta(): Promise<
  SavedQuestionMeta[]
> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_QUESTIONS);
    if (!data) return [];

    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      if (typeof parsed[0] === "string") {
        // Legacy format - convert to new format
        return parsed
          .filter((id): id is string => typeof id === "string" && id.length > 0)
          .map((id: string) => ({
            questionId: id,
            savedAt: new Date().toISOString(),
          }));
      }
      // Validate new format items
      return parsed.filter(
        (item): item is SavedQuestionMeta =>
          item &&
          typeof item === "object" &&
          typeof item.questionId === "string" &&
          typeof item.savedAt === "string",
      );
    }
    return [];
  } catch (error) {
    console.error("Error loading saved questions metadata:", error);
    return [];
  }
}

export async function toggleSavedQuestion(
  questionId: string,
): Promise<boolean> {
  const savedMeta = await getSavedQuestionsWithMeta();
  const index = savedMeta.findIndex((item) => item.questionId === questionId);

  if (index > -1) {
    // Already saved, remove it
    savedMeta.splice(index, 1);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVED_QUESTIONS,
      JSON.stringify(savedMeta),
    );
    return false; // Not saved anymore
  } else {
    // Not saved, add it with timestamp
    savedMeta.push({
      questionId,
      savedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVED_QUESTIONS,
      JSON.stringify(savedMeta),
    );
    return true; // Now saved
  }
}

export async function isQuestionSaved(questionId: string): Promise<boolean> {
  const savedQuestions = await getSavedQuestions();
  return savedQuestions.includes(questionId);
}

// Solved Questions (for tracking question solving state)
interface SolvedQuestionData {
  selectedOption: string;
  isCorrect: boolean;
  solvedAt: number; // timestamp
  revealed: boolean;
}

interface SolvedQuestionsMap {
  [questionId: string]: SolvedQuestionData;
}

/**
 * Save a solved question state to AsyncStorage
 */
export async function saveSolvedQuestion(
  questionId: string,
  selectedOption: string,
  isCorrect: boolean,
  revealed: boolean = true,
): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SOLVED_QUESTIONS);
    const solvedQuestions: SolvedQuestionsMap = data ? JSON.parse(data) : {};

    solvedQuestions[questionId] = {
      selectedOption,
      isCorrect,
      solvedAt: Date.now(),
      revealed,
    };

    await AsyncStorage.setItem(
      STORAGE_KEYS.SOLVED_QUESTIONS,
      JSON.stringify(solvedQuestions),
    );
  } catch (error) {
    console.error("Error saving solved question:", error);
  }
}

/**
 * Get solved question state if it exists
 */
export async function getSolvedQuestion(
  questionId: string,
): Promise<SolvedQuestionData | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SOLVED_QUESTIONS);
    if (!data) return null;

    const solvedQuestions: SolvedQuestionsMap = JSON.parse(data);
    return solvedQuestions[questionId] || null;
  } catch (error) {
    console.error("Error getting solved question:", error);
    return null;
  }
}

/**
 * Clear all solved questions (reset)
 */
export async function clearSolvedQuestions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SOLVED_QUESTIONS);
  } catch (error) {
    console.error("Error clearing solved questions:", error);
  }
}
