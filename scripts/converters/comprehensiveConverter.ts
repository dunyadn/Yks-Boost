#!/usr/bin/env node
/**
 * Comprehensive PDF/TXT to JSON Converter for YKS Questions
 * 
 * This converter handles:
 * - PDF files (with text extraction)
 * - TXT files
 * - Recursive directory scanning
 * - Detailed solution generation using AI
 * - Complete validation
 * 
 * Usage:
 *   npx tsx scripts/converters/comprehensiveConverter.ts <source-dir> <output-dir>
 */

import * as fs from 'fs';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';
import { generateDetailedSolution } from './aiSolutionGenerator.js';

interface Question {
  id: number;
  content: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: string;
  solution: string;
}

interface QuestionPackage {
  packageName: string;
  examType: string;
  year: number;
  lesson: string;
  sourceFile: string;
  totalQuestions: number;
  questions: Question[];
}

interface ParsedQuestion {
  content: string;
  options: string[];
  correctAnswer: string;
  solution?: string;
}

/**
 * Extract text from PDF file
 */
async function extractPdfText(filePath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await (pdfParse as any)(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`❌ PDF okuma hatası: ${filePath}`, error);
    throw new Error(`PDF dosyası okunamadı: ${filePath}`);
  }
}

/**
 * Extract text from TXT file
 */
function extractTxtText(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`❌ TXT okuma hatası: ${filePath}`, error);
    throw new Error(`TXT dosyası okunamadı: ${filePath}`);
  }
}

/**
 * Parse package metadata from filename
 * Examples:
 *   "msu_2025.pdf" -> { examType: "MSÜ", year: 2025, lesson: "Genel" }
 *   "tyt_2024_turkce.txt" -> { examType: "TYT", year: 2024, lesson: "Türkçe" }
 *   "ayt-matematik-2023.pdf" -> { examType: "AYT", year: 2023, lesson: "Matematik" }
 */
function parseFilenameMetadata(filename: string): { examType: string; year: number; lesson: string } {
  const nameWithoutExt = path.basename(filename, path.extname(filename));
  
  // Extract year (4 digits)
  const yearMatch = nameWithoutExt.match(/(\d{4})/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
  
  // Extract exam type (MSÜ, TYT, AYT, YKS, etc.)
  const examTypeMatch = nameWithoutExt.match(/(?:^|[_\-\s])(MSÜ|TYT|AYT|YKS|MEBI|Mebi)(?:[_\-\s]|$)/i);
  const examType = examTypeMatch ? examTypeMatch[1].toUpperCase() : 'TYT';
  
  // Extract lesson/subject
  const lessonKeywords = ['matematik', 'fizik', 'kimya', 'biyoloji', 'tarih', 'coğrafya', 'felsefe', 'türkçe', 'edebiyat', 'geometri', 'İngilizce', 'din'];
  let lesson = 'Genel';
  
  for (const keyword of lessonKeywords) {
    if (nameWithoutExt.toLowerCase().includes(keyword.toLowerCase())) {
      lesson = keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase();
      break;
    }
  }
  
  return { examType, year, lesson };
}

/**
 * Generate package name from metadata
 */
function generatePackageName(examType: string, year: number, lesson: string): string {
  if (lesson === 'Genel') {
    return `${examType} ${year}`;
  }
  return `${examType} ${year} ${lesson}`;
}

/**
 * Parse questions from text content
 */
function parseQuestions(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const lines = content.split('\n').map(line => line.trim());
  
  let currentQuestion: Partial<ParsedQuestion> | null = null;
  let collectingSolution = false;
  let solutionLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (!line) {
      continue;
    }
    
    // Detect question start (e.g., "1.", "Soru 1:", "1-")
    const questionMatch = line.match(/^(\d+)[.):\-]\s*(.*)/) || line.match(/^Soru\s*(\d+)[:\-]?\s*(.*)/i);
    if (questionMatch) {
      // Save previous question
      if (currentQuestion && currentQuestion.content && currentQuestion.options && currentQuestion.correctAnswer) {
        if (solutionLines.length > 0) {
          currentQuestion.solution = solutionLines.join(' ').trim();
        }
        questions.push(currentQuestion as ParsedQuestion);
      }
      
      currentQuestion = {
        content: questionMatch[2] || '',
        options: [],
      };
      collectingSolution = false;
      solutionLines = [];
      continue;
    }
    
    // Detect "Soru:" prefix
    if (line.match(/^Soru:\s*/i)) {
      if (currentQuestion && currentQuestion.content && currentQuestion.options && currentQuestion.correctAnswer) {
        if (solutionLines.length > 0) {
          currentQuestion.solution = solutionLines.join(' ').trim();
        }
        questions.push(currentQuestion as ParsedQuestion);
      }
      currentQuestion = {
        content: line.replace(/^Soru:\s*/i, ''),
        options: [],
      };
      collectingSolution = false;
      solutionLines = [];
      continue;
    }
    
    if (!currentQuestion) {
      continue;
    }
    
    // Detect options (A), B), C), D), E))
    const optionMatch = line.match(/^([A-E])[)]\s*(.+)/);
    if (optionMatch) {
      if (!currentQuestion.options) {
        currentQuestion.options = [];
      }
      currentQuestion.options.push(optionMatch[2]);
      collectingSolution = false;
      continue;
    }
    
    // Detect multi-option in one line
    const multiOptionMatch = line.match(/A\)\s*([^B]+)\s*B\)\s*([^C]+)\s*C\)\s*([^D]+)\s*D\)\s*([^E]+)\s*E\)\s*(.+)/);
    if (multiOptionMatch) {
      currentQuestion.options = [
        multiOptionMatch[1].trim(),
        multiOptionMatch[2].trim(),
        multiOptionMatch[3].trim(),
        multiOptionMatch[4].trim(),
        multiOptionMatch[5].trim(),
      ];
      collectingSolution = false;
      continue;
    }
    
    // Detect correct answer
    const answerMatch = line.match(/(?:Cevap|Doğru(?:\s+Cevap)?|CEVAP):\s*([A-E])/i);
    if (answerMatch) {
      currentQuestion.correctAnswer = answerMatch[1];
      collectingSolution = false;
      continue;
    }
    
    // Detect solution start
    const solutionMatch = line.match(/^(?:Çözüm|Açıklama|Solution):\s*(.+)/i);
    if (solutionMatch) {
      collectingSolution = true;
      solutionLines = [solutionMatch[1]];
      continue;
    }
    
    // Collect solution lines
    if (collectingSolution && !line.match(/^(?:Konu|Subject):/i) && !line.match(/^\d+[.):\-]/)) {
      solutionLines.push(line);
      continue;
    }
    
    // Skip topic/subject lines
    if (line.match(/^(?:Konu|Subject):/i)) {
      collectingSolution = false;
      continue;
    }
    
    // Add to question content if not option or answer
    if (currentQuestion.content !== undefined && !line.match(/^[A-E][):]/) && !collectingSolution) {
      currentQuestion.content += ' ' + line;
    }
  }
  
  // Save last question
  if (currentQuestion && currentQuestion.content && currentQuestion.options && currentQuestion.correctAnswer) {
    if (solutionLines.length > 0) {
      currentQuestion.solution = solutionLines.join(' ').trim();
    }
    questions.push(currentQuestion as ParsedQuestion);
  }
  
  return questions;
}

/**
 * Generate detailed solution wrapper
 */
async function generateSolution(question: ParsedQuestion, lesson: string, apiKey?: string): Promise<string> {
  return await generateDetailedSolution(
    {
      content: question.content,
      options: question.options,
      correctAnswer: question.correctAnswer,
      existingSolution: question.solution,
    },
    lesson,
    apiKey
  );
}

/**
 * Convert parsed questions to package format
 */
async function convertToPackageFormat(
  parsedQuestions: ParsedQuestion[],
  metadata: { examType: string; year: number; lesson: string },
  sourceFile: string,
  apiKey?: string
): Promise<QuestionPackage> {
  console.log('  🤖 Detaylı çözümler oluşturuluyor...');
  
  const questions: Question[] = [];
  for (let i = 0; i < parsedQuestions.length; i++) {
    const q = parsedQuestions[i];
    const solution = await generateSolution(q, metadata.lesson, apiKey);
    
    questions.push({
      id: i + 1,
      content: q.content.trim(),
      options: {
        A: q.options[0] || '',
        B: q.options[1] || '',
        C: q.options[2] || '',
        D: q.options[3] || '',
        E: q.options[4] || '',
      },
      correctAnswer: q.correctAnswer,
      solution,
    });
    
    // Progress indicator
    if ((i + 1) % 5 === 0 || i === parsedQuestions.length - 1) {
      console.log(`     ${i + 1}/${parsedQuestions.length} çözüm hazırlandı`);
    }
    
    // Rate limiting for AI calls
    if (apiKey && i < parsedQuestions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return {
    packageName: generatePackageName(metadata.examType, metadata.year, metadata.lesson),
    examType: metadata.examType,
    year: metadata.year,
    lesson: metadata.lesson,
    sourceFile: path.basename(sourceFile),
    totalQuestions: questions.length,
    questions,
  };
}

/**
 * Validate package
 */
function validatePackage(pkg: QuestionPackage): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check total questions
  if (pkg.totalQuestions !== pkg.questions.length) {
    errors.push(`Soru sayısı uyumsuz: totalQuestions=${pkg.totalQuestions}, questions.length=${pkg.questions.length}`);
  }
  
  // Check each question
  pkg.questions.forEach((q, index) => {
    if (!q.content || q.content.trim().length === 0) {
      errors.push(`Soru ${index + 1}: İçerik boş`);
    }
    
    if (!q.options.A || !q.options.B || !q.options.C || !q.options.D || !q.options.E) {
      errors.push(`Soru ${index + 1}: Eksik şıklar`);
    }
    
    if (!q.correctAnswer || !['A', 'B', 'C', 'D', 'E'].includes(q.correctAnswer)) {
      errors.push(`Soru ${index + 1}: Geçersiz doğru cevap`);
    }
    
    if (!q.solution || q.solution.trim().length === 0) {
      errors.push(`Soru ${index + 1}: Çözüm eksik`);
    } else if (q.solution.length < 50) {
      errors.push(`Soru ${index + 1}: Çözüm çok kısa (en az 50 karakter olmalı)`);
    }
    
    if (q.id !== index + 1) {
      errors.push(`Soru ${index + 1}: ID uyumsuz`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Process a single file
 */
async function processFile(filePath: string, outputDir: string, apiKey?: string): Promise<void> {
  console.log(`\n📄 İşleniyor: ${path.basename(filePath)}`);
  
  try {
    // Extract text based on file type
    const ext = path.extname(filePath).toLowerCase();
    let textContent: string;
    
    if (ext === '.pdf') {
      console.log('  📖 PDF metni çıkarılıyor...');
      textContent = await extractPdfText(filePath);
    } else if (ext === '.txt') {
      console.log('  📖 TXT dosyası okunuyor...');
      textContent = extractTxtText(filePath);
    } else {
      console.log(`  ⏭️  Desteklenmeyen dosya tipi: ${ext}`);
      return;
    }
    
    if (!textContent || textContent.trim().length === 0) {
      throw new Error('Dosyadan metin çıkarılamadı');
    }
    
    console.log(`  ✓ ${textContent.length} karakter metin çıkarıldı`);
    
    // Parse questions
    console.log('  🔄 Sorular parse ediliyor...');
    const parsedQuestions = parseQuestions(textContent);
    
    if (parsedQuestions.length === 0) {
      throw new Error('Hiç soru bulunamadı');
    }
    
    console.log(`  ✓ ${parsedQuestions.length} soru bulundu`);
    
    // Extract metadata
    const metadata = parseFilenameMetadata(filePath);
    console.log(`  📊 Metadata: ${metadata.examType} ${metadata.year} ${metadata.lesson}`);
    
    // Convert to package format (with AI solutions)
    console.log('  🔄 JSON paketi oluşturuluyor...');
    const pkg = await convertToPackageFormat(parsedQuestions, metadata, filePath, apiKey);
    
    // Validate
    console.log('  ✓ Validasyon yapılıyor...');
    const validation = validatePackage(pkg);
    
    if (!validation.valid) {
      console.log('  ⚠️  Validasyon hataları:');
      validation.errors.forEach(err => console.log(`     - ${err}`));
      throw new Error('Paket validasyonu başarısız');
    }
    
    console.log('  ✅ Validasyon başarılı');
    
    // Save to file
    const outputFileName = `${path.basename(filePath, ext)}.json`;
    const outputPath = path.join(outputDir, outputFileName);
    
    fs.writeFileSync(outputPath, JSON.stringify(pkg, null, 2), 'utf-8');
    console.log(`  💾 Kaydedildi: ${outputFileName}`);
    console.log(`  📊 ${pkg.totalQuestions} soru, ${pkg.packageName}`);
    
  } catch (error) {
    console.error(`  ❌ Hata: ${error instanceof Error ? error.message : error}`);
    throw error;
  }
}

/**
 * Scan directory recursively for PDF and TXT files
 */
function scanDirectory(dir: string): string[] {
  const files: string[] = [];
  
  function scan(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip hidden directories and node_modules
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scan(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.pdf' || ext === '.txt') {
          files.push(fullPath);
        }
      }
    }
  }
  
  scan(dir);
  return files;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Kullanım: npx tsx scripts/converters/comprehensiveConverter.ts <source-dir> <output-dir> [--api-key <key>]');
    console.error('\nÖrnek:');
    console.error('  npx tsx scripts/converters/comprehensiveConverter.ts ./data/text-files ./data/questions');
    console.error('  npx tsx scripts/converters/comprehensiveConverter.ts ./data/text-files ./data/questions --api-key YOUR_GEMINI_API_KEY');
    process.exit(1);
  }
  
  const sourceDir = path.resolve(args[0]);
  const outputDir = path.resolve(args[1]);
  
  // Check for API key
  let apiKey: string | undefined;
  const apiKeyIndex = args.indexOf('--api-key');
  if (apiKeyIndex !== -1 && args[apiKeyIndex + 1]) {
    apiKey = args[apiKeyIndex + 1];
    console.log('🤖 AI destekli çözüm oluşturma aktif');
  } else {
    console.log('📝 Şablon tabanlı çözüm oluşturma aktif (daha detaylı çözümler için --api-key kullanın)');
  }
  
  console.log('🚀 YKS Soru Dönüştürücü Başlatıldı\n');
  console.log(`📂 Kaynak: ${sourceDir}`);
  console.log(`📁 Hedef: ${outputDir}`);
  
  // Check source directory
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Kaynak dizin bulunamadı: ${sourceDir}`);
    process.exit(1);
  }
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✓ Hedef dizin oluşturuldu: ${outputDir}`);
  }
  
  // Scan for files
  console.log('\n🔍 Dosyalar taranıyor...');
  const files = scanDirectory(sourceDir);
  
  console.log(`\n📋 ${files.length} dosya bulundu:\n`);
  files.forEach(file => console.log(`  - ${path.basename(file)}`));
  
  if (files.length === 0) {
    console.log('\n⚠️  İşlenecek dosya bulunamadı');
    process.exit(0);
  }
  
  // Process each file
  console.log('\n🔄 Dosyalar işleniyor...');
  
  let successCount = 0;
  let failCount = 0;
  const errors: { file: string; error: string }[] = [];
  
  for (const file of files) {
    try {
      await processFile(file, outputDir, apiKey);
      successCount++;
    } catch (error) {
      failCount++;
      errors.push({
        file: path.basename(file),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 İŞLEM ÖZETİ');
  console.log('='.repeat(60));
  console.log(`✅ Başarılı: ${successCount}`);
  console.log(`❌ Başarısız: ${failCount}`);
  console.log(`📦 Toplam: ${files.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ HATALAR:');
    errors.forEach(({ file, error }) => {
      console.log(`  ${file}: ${error}`);
    });
  }
  
  if (failCount > 0) {
    console.log('\n⚠️  Bazı dosyalar işlenemedi. Lütfen hataları kontrol edin.');
    process.exit(1);
  } else {
    console.log('\n🎉 Tüm dosyalar başarıyla işlendi!');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Kritik Hata:', error);
    process.exit(1);
  });
}

export { processFile, scanDirectory, parseQuestions, validatePackage };
