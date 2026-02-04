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

// Initialize Gemini client (will be null if no API key)
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();
    await parser.destroy();
    return result.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("PDF dosyası okunamadı. Lütfen geçerli bir PDF dosyası yükleyin.");
  }
}

/**
 * Parse questions from text using Gemini AI
 */
export async function parseQuestionsWithAI(text: string): Promise<ParsedQuestion[]> {
  if (!genAI) {
    console.warn("Gemini API key not configured, using fallback parser");
    return parsePatternsWithFallback(text);
  }

  try {
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) {
      throw new Error("AI yanıt vermedi");
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const questions = JSON.parse(cleanContent);
    
    if (!Array.isArray(questions)) {
      throw new Error("Invalid response format");
    }

    // Validate and clean questions
    return questions
      .filter((q: any) => {
        return (
          q.content &&
          Array.isArray(q.options) &&
          q.options.length >= 2 &&
          q.correctAnswer
        );
      })
      .map((q: any) => ({
        content: String(q.content).trim(),
        options: q.options.map((opt: any) => String(opt).trim()),
        correctAnswer: String(q.correctAnswer).trim().toUpperCase(),
        category: q.category ? String(q.category).trim() : "Genel",
      }));
  } catch (error) {
    console.error("Error parsing questions with AI:", error);
    // Fallback to pattern-based parsing
    return parsePatternsWithFallback(text);
  }
}

/**
 * Fallback parser using regex patterns
 */
function parsePatternsWithFallback(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  // Split text into potential question blocks
  const lines = text.split("\n");
  let currentQuestion: Partial<ParsedQuestion> = {};
  let options: string[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Check if line starts with a number (potential question)
    if (/^\d+\./.test(trimmed)) {
      // Save previous question if exists
      if (currentQuestion.content && options.length > 0) {
        questions.push({
          content: currentQuestion.content,
          options: options,
          correctAnswer: currentQuestion.correctAnswer || "A",
          category: currentQuestion.category || "Genel",
        });
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
    questions.push({
      content: currentQuestion.content,
      options: options,
      correctAnswer: currentQuestion.correctAnswer || "A",
      category: currentQuestion.category || "Genel",
    });
  }
  
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
    // Step 1: Extract text
    const text = await extractTextFromPDF(pdfBuffer);
    
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        questionsAdded: 0,
        error: "PDF'den metin çıkarılamadı. Dosya boş olabilir.",
      };
    }
    
    // Step 2: Parse questions
    const questions = await parseQuestionsWithAI(text);
    
    if (questions.length === 0) {
      return {
        success: false,
        questionsAdded: 0,
        error: "PDF'de soru bulunamadı. Lütfen geçerli bir sınav sorusu PDF'i yükleyin.",
      };
    }
    
    // Step 3: Save to database
    const savedCount = await saveQuestionsToDatabase(questions);
    
    return {
      success: true,
      questionsAdded: savedCount,
    };
  } catch (error) {
    console.error("Error processing PDF:", error);
    return {
      success: false,
      questionsAdded: 0,
      error: error instanceof Error ? error.message : "PDF işlenirken bir hata oluştu",
    };
  }
}