#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';

/**
 * YKS Soru Text Dosyasını JSON Formatına Dönüştürücü
 * 
 * Kullanım:
 *   npx tsx scripts/converters/textToJson.ts <input-file> <output-file> [options]
 * 
 * Seçenekler:
 *   --package-name <name>    Soru paketi adı
 *   --exam-type <type>       Sınav tipi (TYT/AYT)
 *   --year <year>            Sınav yılı
 *   --category <category>    Kategori (Matematik, Fizik, vb.)
 *   --description <desc>     Paket açıklaması
 */

interface Question {
  content: string;
  options: string[];
  correctAnswer: string;
  solution?: string;
  category?: string;
  subject?: string;
}

interface QuestionPackage {
  packageName: string;
  examType: string;
  year?: number;
  description?: string;
  questions: Question[];
}

interface ParseOptions {
  packageName?: string;
  examType?: string;
  year?: number;
  category?: string;
  description?: string;
}

/**
 * Text dosyasından soruları parse eder
 * Desteklenen formatlar:
 * 
 * Format 1: Standart YKS Format
 * 1. Soru metni burada...
 * A) Şık 1
 * B) Şık 2
 * C) Şık 3
 * D) Şık 4
 * E) Şık 5
 * Cevap: C
 * Çözüm: Çözüm açıklaması...
 * 
 * Format 2: Kompakt Format
 * Soru: Soru metni...
 * A) Şık 1 B) Şık 2 C) Şık 3 D) Şık 4 E) Şık 5
 * Doğru: C
 */
function parseTextFile(content: string, options: ParseOptions): QuestionPackage {
  const questions: Question[] = [];
  
  // Satırlara böl ve temizle
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentQuestion: Partial<Question> | null = null;
  let questionNumber = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Soru numarası tespiti (örn: "1.", "Soru 1:", "1-")
    const questionMatch = line.match(/^(\d+)[.):\-]\s*(.*)/) || line.match(/^Soru\s*(\d+)[:\-]?\s*(.*)/i);
    if (questionMatch) {
      // Önceki soruyu kaydet
      if (currentQuestion && currentQuestion.content && currentQuestion.options && currentQuestion.correctAnswer) {
        questions.push(currentQuestion as Question);
      }
      
      questionNumber++;
      currentQuestion = {
        content: questionMatch[2] || '',
        options: [],
        category: options.category,
      };
      continue;
    }
    
    // "Soru:" ile başlayan format
    if (line.match(/^Soru:\s*/i)) {
      if (currentQuestion && currentQuestion.content && currentQuestion.options && currentQuestion.correctAnswer) {
        questions.push(currentQuestion as Question);
      }
      currentQuestion = {
        content: line.replace(/^Soru:\s*/i, ''),
        options: [],
        category: options.category,
      };
      continue;
    }
    
    // Şık tespiti (A), B), C), D), E))
    const optionMatch = line.match(/^([A-E])[)]\s*(.+)/);
    if (optionMatch && currentQuestion) {
      const optionLetter = optionMatch[1];
      const optionText = optionMatch[2];
      
      if (!currentQuestion.options) {
        currentQuestion.options = [];
      }
      currentQuestion.options.push(optionText);
      continue;
    }
    
    // Çoklu şık tek satırda (örn: "A) Şık1 B) Şık2 C) Şık3 D) Şık4 E) Şık5")
    const multiOptionMatch = line.match(/A\)\s*([^B]+)\s*B\)\s*([^C]+)\s*C\)\s*([^D]+)\s*D\)\s*([^E]+)\s*E\)\s*(.+)/);
    if (multiOptionMatch && currentQuestion) {
      currentQuestion.options = [
        multiOptionMatch[1].trim(),
        multiOptionMatch[2].trim(),
        multiOptionMatch[3].trim(),
        multiOptionMatch[4].trim(),
        multiOptionMatch[5].trim(),
      ];
      continue;
    }
    
    // Cevap tespiti (Cevap: C, Doğru: C, Doğru Cevap: C, CEVAP:C)
    const answerMatch = line.match(/(?:Cevap|Doğru(?:\s+Cevap)?|CEVAP):\s*([A-E])/i);
    if (answerMatch && currentQuestion) {
      currentQuestion.correctAnswer = answerMatch[1];
      continue;
    }
    
    // Çözüm tespiti (Çözüm:, Açıklama:, Solution:)
    const solutionMatch = line.match(/^(?:Çözüm|Açıklama|Solution):\s*(.+)/i);
    if (solutionMatch && currentQuestion) {
      currentQuestion.solution = solutionMatch[1];
      continue;
    }
    
    // Konu tespiti (Konu:, Subject:)
    const subjectMatch = line.match(/^(?:Konu|Subject):\s*(.+)/i);
    if (subjectMatch && currentQuestion) {
      currentQuestion.subject = subjectMatch[1];
      continue;
    }
    
    // Eğer currentQuestion varsa ve içerik boş değilse, satırı içeriğe ekle
    if (currentQuestion && currentQuestion.content !== undefined) {
      // Şık veya cevap değilse, soru metnine ekle
      if (!line.match(/^[A-E][):]/) && !line.match(/(?:Cevap|Doğru|Çözüm|Konu):/i)) {
        currentQuestion.content += ' ' + line;
      }
    }
  }
  
  // Son soruyu kaydet
  if (currentQuestion && currentQuestion.content && currentQuestion.options && currentQuestion.correctAnswer) {
    questions.push(currentQuestion as Question);
  }
  
  // Varsayılan değerler
  const packageName = options.packageName || 'YKS Soru Paketi';
  const examType = options.examType || 'TYT';
  
  return {
    packageName,
    examType,
    year: options.year,
    description: options.description,
    questions,
  };
}

/**
 * Komut satırı argümanlarını parse eder
 */
function parseArgs(): { inputFile: string; outputFile: string; options: ParseOptions } {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Kullanım: npx tsx scripts/converters/textToJson.ts <input-file> <output-file> [options]');
    console.error('\nSeçenekler:');
    console.error('  --package-name <name>    Soru paketi adı');
    console.error('  --exam-type <type>       Sınav tipi (TYT/AYT)');
    console.error('  --year <year>            Sınav yılı');
    console.error('  --category <category>    Kategori (Matematik, Fizik, Türkçe, vb.)');
    console.error('  --description <desc>     Paket açıklaması');
    console.error('\nÖrnek:');
    console.error('  npx tsx scripts/converters/textToJson.ts input.txt output.json --package-name "TYT 2026 Tarih" --exam-type TYT --year 2026 --category Tarih');
    process.exit(1);
  }
  
  const inputFile = args[0];
  const outputFile = args[1];
  const options: ParseOptions = {};
  
  for (let i = 2; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    // Validate that value exists
    if (!value || value.startsWith('--')) {
      console.error(`❌ Hata: ${key} parametresi için değer belirtilmedi`);
      process.exit(1);
    }
    
    switch (key) {
      case '--package-name':
        options.packageName = value;
        break;
      case '--exam-type':
        options.examType = value;
        break;
      case '--year':
        const yearValue = parseInt(value, 10);
        if (isNaN(yearValue)) {
          console.error(`❌ Hata: Geçersiz yıl değeri: ${value}`);
          process.exit(1);
        }
        options.year = yearValue;
        break;
      case '--category':
        options.category = value;
        break;
      case '--description':
        options.description = value;
        break;
    }
  }
  
  return { inputFile, outputFile, options };
}

/**
 * Ana fonksiyon
 */
function main() {
  try {
    const { inputFile, outputFile, options } = parseArgs();
    
    console.log(`📖 Text dosyası okunuyor: ${inputFile}`);
    
    // Input dosyasını oku
    if (!fs.existsSync(inputFile)) {
      console.error(`❌ Hata: Dosya bulunamadı: ${inputFile}`);
      process.exit(1);
    }
    
    const content = fs.readFileSync(inputFile, 'utf-8');
    
    console.log('🔄 Sorular parse ediliyor...');
    const packageData = parseTextFile(content, options);
    
    console.log(`✅ ${packageData.questions.length} soru başarıyla parse edildi`);
    
    // Validasyon
    const invalidQuestions = packageData.questions.filter(q => 
      !q.content || !q.options || q.options.length !== 5 || !q.correctAnswer
    );
    
    if (invalidQuestions.length > 0) {
      console.warn(`⚠️  Uyarı: ${invalidQuestions.length} soru eksik bilgi içeriyor`);
    }
    
    // Output dizinini oluştur
    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // JSON dosyasına yaz
    fs.writeFileSync(outputFile, JSON.stringify(packageData, null, 2), 'utf-8');
    
    console.log(`💾 JSON dosyası oluşturuldu: ${outputFile}`);
    console.log('\n📊 Özet:');
    console.log(`   Paket Adı: ${packageData.packageName}`);
    console.log(`   Sınav Tipi: ${packageData.examType}`);
    console.log(`   Yıl: ${packageData.year || 'Belirtilmemiş'}`);
    console.log(`   Toplam Soru: ${packageData.questions.length}`);
    
    const withSolution = packageData.questions.filter(q => q.solution).length;
    console.log(`   Çözümlü Soru: ${withSolution}`);
    
  } catch (error) {
    console.error('❌ Hata:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Script çalıştır
if (require.main === module) {
  main();
}

export { parseTextFile, Question, QuestionPackage, ParseOptions };
