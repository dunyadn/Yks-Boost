import PDFParse from "pdf-parse";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import type { InsertQuestion } from "@shared/schema";

interface ParsedQuestion {
  content: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

// Initialize Google Gemini client
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Extract text from PDF buffer
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await PDFParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("PDF dosyası okunamadı. Lütfen geçerli bir PDF dosyası yükleyin.");
  }
}

/**
 * Parse questions from text using Google Gemini AI
 */
export async function parseQuestionsWithAI(text: string): Promise<ParsedQuestion[]> {
  if (!genAI) {
    console.warn("Gemini API key not configured, using fallback parser");
    return parseQuestionsWithFallback(text);
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

SADECE geçerli JSON array döndür, başka metin ekleme.

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
      throw new Error("Gemini API'den yanıt alınamadı");
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn("Valid JSON not found in Gemini response, using fallback");
      return parseQuestionsWithFallback(text);
    }

    const questions: ParsedQuestion[] = JSON.parse(jsonMatch[0]);
    
    // Validate questions
    const validQuestions = questions.filter(q => 
      q.content && 
      Array.isArray(q.options) && 
      q.options.length >= 2 &&
      q.correctAnswer &&
      q.category
    );

    if (validQuestions.length === 0) {
      console.warn("No valid questions found, using fallback");
      return parseQuestionsWithFallback(text);
    }

    console.log(`Parsed ${validQuestions.length} questions with Gemini AI`);
    return validQuestions;

  } catch (error) {
    console.error("Error parsing with Gemini AI:", error);
    console.log("Falling back to pattern-based parser");
    return parseQuestionsWithFallback(text);
  }
}

/**
 * Fallback parser using regex patterns
 */
function parseQuestionsWithFallback(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  // Pattern 1: "1. Soru? A) ... B) ... Cevap: A"
  const pattern1 = /(\d+)\.\s*(.+?)\s*A\)(.*?)B\)(.*?)(?:C\)(.*?))?(?:D\)(.*?))?(?:E\)(.*?))?\s*(?:Cevap|Doğru Cevap|Yanıt):\s*([A-E])/gi;
  
  let match;
  while ((match = pattern1.exec(text)) !== null) {
    const options = [
      match[3]?.trim(),
      match[4]?.trim(),
      match[5]?.trim(),
      match[6]?.trim(),
      match[7]?.trim(),
    ].filter(Boolean);

    if (options.length >= 2) {
      questions.push({
        content: match[2].trim(),
        options,
        correctAnswer: match[8].toUpperCase(),
        category: detectCategory(match[2]),
      });
    }
  }

  if (questions.length === 0) {
    console.warn("No questions found with pattern matching");
  } else {
    console.log(`Parsed ${questions.length} questions with fallback parser`);
  }

  return questions;
}

/**
 * Detect question category from content
 */
function detectCategory(content: string): string {
  const keywords = {
    "Matematik": ["türev", "integral", "limit", "fonksiyon", "denklem", "sayı"],
    "Fizik": ["kuvvet", "hız", "ivme", "enerji", "optik", "elektrik"],
    "Kimya": ["molekül", "atom", "element", "reaksiyon", "bileşik"],
    "Biyoloji": ["hücre", "doku", "organ", "genetik", "DNA"],
    "Türkçe": ["kelime", "cümle", "anlam", "dil bilgisi", "edebiyat"],
    "Tarih": ["Osmanlı", "devlet", "savaş", "dönem", "tarih"],
    "Coğrafya": ["bölge", "iklim", "harita", "nüfus", "şehir"],
  };

  const lowerContent = content.toLowerCase();
  
  for (const [category, words] of Object.entries(keywords)) {
    if (words.some(word => lowerContent.includes(word))) {
      return category;
    }
  }

  return "Genel";
}

/**
 * Main PDF processing function
 */
export async function processPDF(pdfBuffer: Buffer): Promise<{ success: boolean; questionsAdded: number; error?: string; }> {
  try {
    console.log("Starting PDF processing...");
    
    // Step 1: Extract text
    const text = await extractTextFromPDF(pdfBuffer);
    console.log(`Extracted ${text.length} characters from PDF`);

    if (text.length < 50) {
      throw new Error("PDF çok kısa veya boş görünüyor");
    }

    // Step 2: Parse questions with AI
    const questions = await parseQuestionsWithAI(text);

    if (questions.length === 0) {
      throw new Error("PDF'te soru bulunamadı. Lütfen geçerli bir sınav PDF'i yükleyin.");
    }

    // Step 3: Save to database
    let savedCount = 0;
    for (const question of questions) {
      try {
        await storage.createQuestion({
          content: question.content,
          options: question.options,
          correctAnswer: question.correctAnswer,
          category: question.category,
        } as InsertQuestion);
        savedCount++;
      } catch (error) {
        console.error("Error saving question:", error);
      }
    }

    console.log(`Successfully saved ${savedCount}/${questions.length} questions`);

    return {
      success: true,
      questionsAdded: savedCount,
    };

  } catch (error) {
    console.error("Error processing PDF:", error);
    return {
      success: false,
      questionsAdded: 0,
      error: error instanceof Error ? error.message : "Bilinmeyen hata",
    };
  }
}