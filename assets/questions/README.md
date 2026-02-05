# Question Packages Directory

This directory contains JSON files with pre-loaded question packages that are automatically imported into the app on first launch.

## Automatic Loading

Questions in this directory are automatically loaded into AsyncStorage when the app starts for the first time. The initialization is handled by `client/lib/initQuestions.ts`.

### How it works:

1. On app startup, `initializeQuestions()` checks if questions have been loaded before
2. If not loaded, it reads all JSON files from this directory
3. Creates a package for each JSON file using `savePackage()`
4. Saves all questions for each package using `saveQuestions()`
5. Sets a flag `@yks_boost:initial_data_loaded` to prevent re-loading

## Current Question Packages

### Generated Question Banks (2020-2025)
**1188 total questions** across **42 packages** covering 6 years (2020-2025):

#### Matematik (240 questions)
- tyt-matematik-2020.json through tyt-matematik-2025.json (40 questions each × 6 years)

#### Fizik (240 questions)
- tyt-fizik-2020.json through tyt-fizik-2025.json (40 questions each × 6 years)

#### Kimya (240 questions)
- tyt-kimya-2020.json through tyt-kimya-2025.json (40 questions each × 6 years)

#### Biyoloji (180 questions)
- tyt-biyoloji-2020.json through tyt-biyoloji-2025.json (30 questions each × 6 years)

#### Tarih (120 questions)
- tyt-tarih-2020.json through tyt-tarih-2025.json (20 questions each × 6 years)

#### Coğrafya (120 questions)
- tyt-cografya-2020.json through tyt-cografya-2025.json (20 questions each × 6 years)

#### Legacy Packages (48 questions)
- tyt-tarih-2026.json, tyt-matematik-2026.json, tyt-fizik-2026.json (Basic)
- tyt-tarih-complete-2026.json, tyt-matematik-complete-2026.json, tyt-fizik-complete-2026.json (Complete)

**Grand Total: 1188 questions across 42 packages**

## JSON Format

Each JSON file must follow this structure:

```json
{
  "packageName": "TYT 2026 Tarih - Package Name",
  "examType": "TYT",
  "year": 2026,
  "description": "Package description (optional)",
  "questions": [
    {
      "content": "Question text here...",
      "options": [
        "Option A text",
        "Option B text",
        "Option C text",
        "Option D text",
        "Option E text"
      ],
      "correctAnswer": "B",
      "solution": "Solution explanation (optional)",
      "category": "Tarih",
      "subject": "Sub-topic (optional)"
    }
  ]
}
```

### Required Fields

**Package level:**
- `packageName` (string) - Display name of the package
- `examType` (string) - "TYT" or "AYT"
- `questions` (array) - Array of question objects

**Question level:**
- `content` (string) - The question text
- `options` (array[5]) - Array of 5 option strings
- `correctAnswer` (string) - One of "A", "B", "C", "D", or "E"
- `category` (string) - Subject category (e.g., "Tarih", "Matematik", "Fizik")

### Optional Fields

- `year` (number) - Exam year
- `description` (string) - Package description
- `solution` (string) - Explanation of the correct answer
- `subject` (string) - Sub-topic within the category

## Adding New Question Packages

### Option 1: Convert from Text Files

If you have questions in text format, use the converter script:

```bash
npm run convert-questions input.txt assets/questions/output.json -- \
  --package-name "TYT 2026 Biology" \
  --exam-type TYT \
  --year 2026 \
  --category Biology \
  --description "TYT Biology Questions"
```

### Option 2: Create JSON Manually

1. Create a new `.json` file in this directory
2. Follow the JSON format above
3. Add the file path to `client/lib/initQuestions.ts` in the `questionPackages` array

Example:
```typescript
const questionPackages = [
  require("../../assets/questions/tyt-tarih-2026.json"),
  require("../../assets/questions/tyt-matematik-2026.json"),
  require("../../assets/questions/tyt-fizik-2026.json"),
  require("../../assets/questions/your-new-package.json"), // Add here
];
```

## Testing

After adding new packages:

1. Clear the app data (to reset the initialization flag)
2. Restart the app
3. Check the Reels screen to verify questions are loaded
4. Check console logs for initialization messages

## Resetting Initialization

For testing purposes, you can reset the initialization flag:

```typescript
import { resetInitialization } from "@/lib/initQuestions";
await resetInitialization();
```

This will cause questions to be reloaded on the next app start.

## Storage Location

Questions are stored in AsyncStorage at:
- Packages: `@yks_boost:packages`
- Questions: `@yks_boost:questions`
- Init flag: `@yks_boost:initial_data_loaded`
