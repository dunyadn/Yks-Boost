import AsyncStorage from "@react-native-async-storage/async-storage";
import { savePackage, saveQuestions } from "./localStorage";
import type { InsertQuestion } from "@shared/schema";

// Storage key for initialization flag
const INIT_FLAG_KEY = "@yks_boost:initial_data_loaded";

// Import question packages
const questionPackages = [
  require("../../assets/questions/tyt-tarih-2026.json"),
  require("../../assets/questions/tyt-matematik-2026.json"),
  require("../../assets/questions/tyt-fizik-2026.json"),
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
 * Only runs once on first app launch
 */
export async function initializeQuestions(): Promise<void> {
  try {
    // Check if data has already been loaded
    const isLoaded = await AsyncStorage.getItem(INIT_FLAG_KEY);
    
    if (isLoaded === "true") {
      console.log("✅ Initial questions already loaded, skipping initialization");
      return;
    }

    console.log("🔄 Loading initial question packages...");
    
    let totalQuestionsLoaded = 0;
    let totalPackagesLoaded = 0;

    // Load each package
    for (const packageData of questionPackages as PackageData[]) {
      try {
        // Validate package data
        if (!packageData.packageName || !packageData.examType || !packageData.questions) {
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

        console.log(`📦 Created package: ${newPackage.name} (${newPackage.id})`);

        // Prepare questions with package ID
        const questionsToSave: InsertQuestion[] = packageData.questions.map((q) => ({
          content: q.content,
          options: q.options,
          correctAnswer: q.correctAnswer,
          solution: q.solution || null,
          category: q.category || "general",
          subject: q.subject || null,
          packageId: newPackage.id,
          examType: packageData.examType,
        }));

        // Save all questions for this package
        await saveQuestions(questionsToSave);

        totalQuestionsLoaded += questionsToSave.length;
        totalPackagesLoaded++;
        
        console.log(`  ✅ Loaded ${questionsToSave.length} questions`);
      } catch (error) {
        console.error(`❌ Error loading package ${packageData.packageName}:`, error);
      }
    }

    // Set the initialization flag
    await AsyncStorage.setItem(INIT_FLAG_KEY, "true");
    
    console.log(`🎉 Initialization complete!`);
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
  console.log("🔄 Initialization flag reset");
}

/**
 * Check if initial questions have been loaded
 */
export async function isInitialized(): Promise<boolean> {
  const isLoaded = await AsyncStorage.getItem(INIT_FLAG_KEY);
  return isLoaded === "true";
}
