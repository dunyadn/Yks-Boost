import { PDFParse } from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import type { InsertQuestion } from "@shared/schema";

interface ParsedQuestion {
  content: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

// Constants
const MAX_STACK_TRACE_LENGTH = 500;

// Initialize Gemini client (will be null if no API key)
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  console.log("📄 Step 1: Extracting text from PDF...");
  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();
    console.log(`✅ Text extracted: ${result.text.length} characters`);
    console.log(`Preview: ${result.text.substring(0, 200)}...`);
    return result.text;
  } catch (error) {
    console.error("❌ Error extracting text from PDF:", error);
    throw new Error("PDF dosyası okunamadı. Lütfen geçerli bir PDF dosyası yükleyin.");
  }
}

/**
 * Parse questions from text using Gemini AI
 */
export async function parseQuestionsWithAI(text: string): Promise<ParsedQuestion[]> {
  console.log("🤖 Step 2: Parsing questions with AI...");
  console.log(`📝 Text length: ${text.length} characters`);
  
  if (!genAI) {
    console.warn("⚠️ GEMINI_API_KEY not configured, using fallback parser");
    return parsePatternsWithFallback(text);
  }

  try {
    console.log("🤖 Calling Gemini API...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Sen bir Türk sınav sorusu ayıklama asistanısın. Aşağıdaki metinden tüm çoktan seçmeli soruları çıkar ve JSON formatında döndür.

Her soru için şu bilgileri çıkar:
- content: Soru metni
- options: Şıklar dizisi (A, B, C, D, E şıkları)
- correctAnswer: Doğru cevap (A, B, C, D veya E harfi)
- category: Konu/kategori (Matematik, Fizik, Kimya, Biyoloji, Türkçe, Tarih, Coğrafya, vb.)

Farklı formatları destekle:
1. "1. Soru metni? A) ... B) ... Cevap: A"
2. "Soru: ... Şıklar: A) ... B) ... Doğru Cevap: ..."
3. Numarasız sorular
4. Sadece metinli sorular

SADECE geçerli JSON array döndür, başka metin ekleme:

Metin:
${text}

JSON çıktı formatı:
[
  {
    "content": "Soru metni buraya",
    "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
    "correctAnswer": "A",
    "category": "Matematik"
  }
]`;

    console.log("⏳ Waiting for Gemini API response (max 30s)...");
    
    // Timeout protection
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => {
        console.error("⏰ Gemini API timeout reached (30s)");
        reject(new Error("Gemini API timeout (30s)"));
      }, 30000)
    );
    
    const apiPromise = model.generateContent(prompt);
    
    const result = await Promise.race([apiPromise, timeoutPromise]);
    console.log("✅ Gemini API responded successfully");
    
    const response = await result.response;
    const content = response.text();
    console.log(`📄 AI Response length: ${content.length} characters`);
    console.log(`📄 AI Response preview: ${content.substring(0, 200)}...`);
    
    if (!content) {
      console.error("❌ AI returned empty response");
      throw new Error("AI yanıt vermedi");
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      console.log("🔧 Removing ```json markers");
      cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      console.log("🔧 Removing ``` markers");
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    console.log("📦 Parsing JSON response...");
    const questions = JSON.parse(cleanContent);
    
    if (!Array.isArray(questions)) {
      console.error("❌ AI response is not an array");
      throw new Error("Invalid response format - expected array");
    }

    console.log(`📊 Received ${questions.length} questions from AI`);

    // Validate and clean questions
    const validQuestions = questions
      .filter((q: any) => {
        const isValid = (
          q.content &&
          Array.isArray(q.options) &&
          q.options.length >= 2 &&
          q.correctAnswer
        );
        
        if (!isValid) {
          console.warn("⚠️ Skipping invalid question:", {
            hasContent: !!q.content,
            hasOptions: Array.isArray(q.options),
            optionsLength: q.options?.length,
            hasCorrectAnswer: !!q.correctAnswer,
          });
        }
        
        return isValid;
      })
      .map((q: any) => ({
        content: String(q.content).trim(),
        options: q.options.map((opt: any) => String(opt).trim()),
        correctAnswer: String(q.correctAnswer).trim().toUpperCase(),
        category: q.category ? String(q.category).trim() : "Genel",
      }));
    
    console.log(`✅ Validated ${validQuestions.length} out of ${questions.length} questions`);
    return validQuestions;
  } catch (error) {
    console.error("❌ Error in Gemini API:", error);
    
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack?.substring(0, MAX_STACK_TRACE_LENGTH),
      });
    }
    
    console.log("⚠️ Falling back to pattern-based parser");
    return parsePatternsWithFallback(text);
  }
}

/**
 * Fallback parser using regex patterns
 */
function parsePatternsWithFallback(text: string): ParsedQuestion[] {
  console.log("🔍 Using fallback pattern-based parser");
  const questions: ParsedQuestion[] = [];
  
  // Split text into potential question blocks
  const lines = text.split("\n");
  let currentQuestion: Partial<ParsedQuestion> = {};
  let options: string[] = [];
  
  console.log(`📄 Processing ${lines.length} lines`);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Check if line starts with a number (potential question)
    if (/^\d+\./.test(trimmed)) {
      // Save previous question if exists
      if (currentQuestion.content && options.length > 0) {
        const questionContent = currentQuestion.content;
        questions.push({
          content: questionContent,
          options: options,
          correctAnswer: currentQuestion.correctAnswer || "A",
          category: currentQuestion.category || "Genel",
        });
        console.log(`✅ Found question ${questions.length}: ${questionContent.substring(0, 50)}...`);
      }
      
      // Start new question
      currentQuestion = {
        content: trimmed.replace(/^\d+\.\s*/, ""),
        category: detectCategory(trimmed),
      };
      options = [];
    }
    // Check if line is an option (A), B), etc.)
    else if (/^[AaBbCcDdEe]\s*[\):]/.test(trimmed)) {
      const optionText = trimmed.replace(/^[AaBbCcDdEe]\s*[\):]\s*/, "");
      options.push(optionText);
    }
    // Check for answer
    else if (/cevap|doğru|answer/i.test(trimmed)) {
      const match = trimmed.match(/[AaBbCcDdEe]/);
      if (match) {
        currentQuestion.correctAnswer = match[0].toUpperCase();
      }
    }
  }
  
  // Save last question
  if (currentQuestion.content && options.length > 0) {
    const questionContent = currentQuestion.content;
    questions.push({
      content: questionContent,
      options: options,
      correctAnswer: currentQuestion.correctAnswer || "A",
      category: currentQuestion.category || "Genel",
    });
    console.log(`✅ Found question ${questions.length}: ${questionContent.substring(0, 50)}...`);
  }
  
  console.log(`✅ Fallback parser found ${questions.length} questions`);
  return questions;
}

/**
 * Detect category from question text
 */
function detectCategory(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (
    /matematik|türev|integral|trigonometri|geometri|sayılar/i.test(text)
  ) {
    return "Matematik";
  }
  if (/fizik|kuvvet|enerji|hareket|elektrik|manyetik/i.test(text)) {
    return "Fizik";
  }
  if (/kimya|element|molekül|reaksiyon|asit|baz/i.test(text)) {
    return "Kimya";
  }
  if (/biyoloji|hücre|doku|organ|gen|protein/i.test(text)) {
    return "Biyoloji";
  }
  if (/türkçe|dilbilgisi|edebiyat|sözcük|cümle/i.test(text)) {
    return "Türkçe";
  }
  if (/tarih|osmanlı|cumhuriyet|savaş|antlaşma/i.test(text)) {
    return "Tarih";
  }
  if (/coğrafya|iklim|harita|kıta|ülke/i.test(text)) {
    return "Coğrafya";
  }
  
  return "Genel";
}

/**
 * Save questions to database
 */
export async function saveQuestionsToDatabase(
  questions: ParsedQuestion[]
): Promise<number> {
  console.log("💾 Step 3: Saving questions to database...");
  let savedCount = 0;
  
  for (const question of questions) {
    try {
      const insertQuestion: InsertQuestion = {
        content: question.content,
        options: question.options,
        correctAnswer: question.correctAnswer,
        category: question.category,
      };
      
      await storage.createQuestion(insertQuestion);
      savedCount++;
    } catch (error) {
      console.error("Error saving question:", error);
      // Continue with other questions even if one fails
    }
  }
  
  console.log(`✅ Saved ${savedCount} out of ${questions.length} questions to database`);
  return savedCount;
}

/**
 * Process PDF end-to-end
 */
export async function processPDF(pdfBuffer: Buffer): Promise<{ 
  success: boolean;
  questionsAdded: number;
  error?: string;
}> {
  try {
    console.log("🔄 Starting PDF processing...");
    
    // Step 1: Extract text
    const text = await extractTextFromPDF(pdfBuffer);
    
    if (!text || text.trim().length === 0) {
      console.error("❌ No text extracted from PDF");
      return {
        success: false,
        questionsAdded: 0,
        error: "PDF'den metin çıkarılamadı. Dosya boş olabilir.",
      };
    }
    
    // Step 2: Parse questions
    const questions = await parseQuestionsWithAI(text);
    
    if (questions.length === 0) {
      console.error("❌ No questions found in PDF");
      return {
        success: false,
        questionsAdded: 0,
        error: "PDF'de soru bulunamadı. Lütfen geçerli bir sınav sorusu PDF'i yükleyin.",
      };
    }
    
    // Step 3: Save to database
    const savedCount = await saveQuestionsToDatabase(questions);
    
    console.log(`✅ PDF processing completed successfully: ${savedCount} questions added`);
    
    return {
      success: true,
      questionsAdded: savedCount,
    };
  } catch (error) {
    console.error("❌ Error processing PDF:", error);
    return {
      success: false,
      questionsAdded: 0,
      error: error instanceof Error ? error.message : "PDF işlenirken bir hata oluştu",
    };
  }
}