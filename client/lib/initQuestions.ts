import AsyncStorage from "@react-native-async-storage/async-storage";
import { savePackage, saveQuestions } from "./localStorage";
import type { InsertQuestion } from "@shared/schema";

// Storage key for initialization flag
const INIT_FLAG_KEY = "@yks_boost:initial_data_loaded";
// Version key to track data version - increment this when adding new questions
const DATA_VERSION_KEY = "@yks_boost:data_version";
const CURRENT_DATA_VERSION = "2"; // Version 2 includes 1188 questions in 42 packages

// Import question packages
const questionPackages = [
  require("../../assets/questions/tyt-biyoloji-2020.json"),
  require("../../assets/questions/tyt-biyoloji-2021.json"),
  require("../../assets/questions/tyt-biyoloji-2022.json"),
  require("../../assets/questions/tyt-biyoloji-2023.json"),
  require("../../assets/questions/tyt-biyoloji-2024.json"),
  require("../../assets/questions/tyt-biyoloji-2025.json"),
  require("../../assets/questions/tyt-cografya-2020.json"),
  require("../../assets/questions/tyt-cografya-2021.json"),
  require("../../assets/questions/tyt-cografya-2022.json"),
  require("../../assets/questions/tyt-cografya-2023.json"),
  require("../../assets/questions/tyt-cografya-2024.json"),
  require("../../assets/questions/tyt-cografya-2025.json"),
  require("../../assets/questions/tyt-fizik-2020.json"),
  require("../../assets/questions/tyt-fizik-2021.json"),
  require("../../assets/questions/tyt-fizik-2022.json"),
  require("../../assets/questions/tyt-fizik-2023.json"),
  require("../../assets/questions/tyt-fizik-2024.json"),
  require("../../assets/questions/tyt-fizik-2025.json"),
  require("../../assets/questions/tyt-fizik-2026.json"),
  require("../../assets/questions/tyt-fizik-complete-2026.json"),
  require("../../assets/questions/tyt-kimya-2020.json"),
  require("../../assets/questions/tyt-kimya-2021.json"),
  require("../../assets/questions/tyt-kimya-2022.json"),
  require("../../assets/questions/tyt-kimya-2023.json"),
  require("../../assets/questions/tyt-kimya-2024.json"),
  require("../../assets/questions/tyt-kimya-2025.json"),
  require("../../assets/questions/tyt-matematik-2020.json"),
  require("../../assets/questions/tyt-matematik-2021.json"),
  require("../../assets/questions/tyt-matematik-2022.json"),
  require("../../assets/questions/tyt-matematik-2023.json"),
  require("../../assets/questions/tyt-matematik-2024.json"),
  require("../../assets/questions/tyt-matematik-2025.json"),
  require("../../assets/questions/tyt-matematik-2026.json"),
  require("../../assets/questions/tyt-matematik-complete-2026.json"),
  require("../../assets/questions/tyt-tarih-2020.json"),
  require("../../assets/questions/tyt-tarih-2021.json"),
  require("../../assets/questions/tyt-tarih-2022.json"),
  require("../../assets/questions/tyt-tarih-2023.json"),
  require("../../assets/questions/tyt-tarih-2024.json"),
  require("../../assets/questions/tyt-tarih-2025.json"),
  require("../../assets/questions/tyt-tarih-2026.json"),
  require("../../assets/questions/tyt-tarih-complete-2026.json"),
];

interface QuestionData {
  content: string;
  options: string[];
  correctAnswer: string;
  solution?: string;
  category?: string;
  subject?: string;
}

interface PackageData {
  packageName: string;
  examType: string;
  year?: number;
  description?: string;
  questions: QuestionData[];
}

/**
 * Load initial question packages into AsyncStorage
 * Checks data version and re-initializes if version has changed (new questions added)
 */
export async function initializeQuestions(): Promise<void> {
  try {
    // Check current data version
    const storedVersion = await AsyncStorage.getItem(DATA_VERSION_KEY);

    if (storedVersion === CURRENT_DATA_VERSION) {
      console.log(
        `✅ Questions up to date (version ${CURRENT_DATA_VERSION}), skipping initialization`,
      );
      return;
    }

    if (storedVersion) {
      console.log(
        `🔄 Data version changed (${storedVersion} -> ${CURRENT_DATA_VERSION}), reloading questions...`,
      );
    } else {
      console.log("🔄 Loading initial question packages...");
    }

    let totalQuestionsLoaded = 0;
    let totalPackagesLoaded = 0;

    // Load each package
    for (const packageData of questionPackages as PackageData[]) {
      try {
        // Validate package data
        if (
          !packageData.packageName ||
          !packageData.examType ||
          !packageData.questions ||
          !Array.isArray(packageData.questions) ||
          packageData.questions.length === 0
        ) {
          console.warn(`⚠️  Skipping invalid package:`, packageData);
          continue;
        }

        // Create the package
        const newPackage = await savePackage({
          name: packageData.packageName,
          examType: packageData.examType,
          year: packageData.year || null,
          description: packageData.description || null,
        });

        console.log(
          `📦 Created package: ${newPackage.name} (${newPackage.id})`,
        );

        // Prepare questions with package ID
        const questionsToSave: InsertQuestion[] = packageData.questions.map(
          (q) => ({
            content: q.content,
            options: q.options,
            correctAnswer: q.correctAnswer,
            solution: q.solution || null,
            category: q.category || "general",
            subject: q.subject || null,
            packageId: newPackage.id,
            examType: packageData.examType,
          }),
        );

        // Save all questions for this package
        await saveQuestions(questionsToSave);

        totalQuestionsLoaded += questionsToSave.length;
        totalPackagesLoaded++;

        console.log(`  ✅ Loaded ${questionsToSave.length} questions`);
      } catch (error) {
        console.error(
          `❌ Error loading package ${packageData.packageName}:`,
          error,
        );
      }
    }

    // Set the initialization flag and data version
    await AsyncStorage.setItem(INIT_FLAG_KEY, "true");
    await AsyncStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);

    console.log(`✅ Successfully loaded version ${CURRENT_DATA_VERSION}`);
    console.log(`   📦 Packages loaded: ${totalPackagesLoaded}`);
    console.log(`   📝 Total questions: ${totalQuestionsLoaded}`);
  } catch (error) {
    console.error("❌ Error during question initialization:", error);
  }
}

/**
 * Reset initialization flag (for testing/debugging)
 * WARNING: This will cause questions to be reloaded on next app start
 */
export async function resetInitialization(): Promise<void> {
  await AsyncStorage.removeItem(INIT_FLAG_KEY);
  await AsyncStorage.removeItem(DATA_VERSION_KEY);
  console.log("🔄 Initialization flag and data version reset");
}

/**
 * Check if initial questions have been loaded
 */
export async function isInitialized(): Promise<boolean> {
  const isLoaded = await AsyncStorage.getItem(INIT_FLAG_KEY);
  return isLoaded === "true";
}
