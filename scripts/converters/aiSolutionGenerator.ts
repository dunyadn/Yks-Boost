/**
 * AI-powered detailed solution generator for YKS questions
 * Uses Google Gemini API to generate comprehensive, step-by-step solutions
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

interface Question {
  content: string;
  options: string[];
  correctAnswer: string;
  existingSolution?: string;
}

/**
 * Generate a detailed solution using AI
 */
export async function generateDetailedSolution(
  question: Question,
  lesson: string,
  apiKey?: string
): Promise<string> {
  // If no API key provided, return enhanced template
  if (!apiKey || apiKey === '') {
    return generateEnhancedTemplate(question, lesson);
  }
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = buildPrompt(question, lesson);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Validate solution length (must be detailed)
    if (text.length < 200) {
      console.warn('  ⚠️  AI çözüm çok kısa, şablon kullanılıyor');
      return generateEnhancedTemplate(question, lesson);
    }
    
    return text.trim();
  } catch (error) {
    console.warn(`  ⚠️  AI çözüm hatası, şablon kullanılıyor: ${error instanceof Error ? error.message : error}`);
    return generateEnhancedTemplate(question, lesson);
  }
}

/**
 * Build prompt for AI solution generation
 */
function buildPrompt(question: Question, lesson: string): string {
  const optionsText = question.options
    .map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`)
    .join('\n');
  
  return `Sen bir ${lesson} öğretmenisin. YKS sınavına hazırlanan öğrencilere AŞIRI DETAYLI ve EĞİTİCİ çözümler yazmak zorundasın.

KURALLARA AYNEN UYACAKSIN:
1. Çözüm EN AZ 5-10 cümle olmalı (tercihen daha uzun)
2. ADIM ADIM açıklama yapacaksın
3. Her şıkkı TEK TEK inceleyecek ve NEDEN DOĞRU veya NEDEN YANLIŞ olduğunu açıklayacaksın
4. Konuyu bilmeyen bir öğrenci tek başına okuyup anlayabilmeli
5. "Buradan anlaşılır", "zaten biliniyor" gibi ifadeler KESİNLİKLE yasak
6. Matematik sorularında TÜM işlem adımlarını göstereceksin
7. Sözel sorularda metinden çıkarımları açıkça göstereceksin
8. Kavram tanımları yapacaksın
9. SADECE çözüm yaz, başlık veya ek bilgi ekleme

SORU:
${question.content}

ŞIKLAR:
${optionsText}

DOĞRU CEVAP: ${question.correctAnswer}

ŞİMDİ AŞIRI DETAYLI ÇÖZÜM YAZ (en az 200 kelime):`;
}

/**
 * Generate enhanced template solution
 */
function generateEnhancedTemplate(question: Question, lesson: string): string {
  // If existing solution is detailed enough, use it
  if (question.existingSolution && question.existingSolution.length > 200) {
    return question.existingSolution;
  }
  
  const correctIndex = question.correctAnswer.charCodeAt(0) - 65;
  const correctOption = question.options[correctIndex] || '';
  
  // Create a more detailed template
  let solution = `Bu ${lesson} sorusunu adım adım inceleyelim:\n\n`;
  
  // Add question analysis
  solution += `**Soru Analizi:**\n`;
  solution += `Bu soruda ${question.content.substring(0, 150)}... konusu ele alınmaktadır. `;
  solution += `Soruyu doğru yanıtlayabilmek için ${lesson.toLowerCase()} bilgisine ve mantıksal akıl yürütmeye ihtiyacımız var.\n\n`;
  
  // Add option-by-option analysis
  solution += `**Şıkların Değerlendirilmesi:**\n\n`;
  
  question.options.forEach((option, idx) => {
    const letter = String.fromCharCode(65 + idx);
    const isCorrect = letter === question.correctAnswer;
    
    solution += `**${letter} Şıkkı: ${option}**\n`;
    
    if (isCorrect) {
      solution += `Bu şık DOĞRUDUR. ${question.existingSolution || 'Bu seçenek sorunun gereksinimlerini tam olarak karşılamaktadır ve bilimsel/tarihsel/matematiksel gerçeklerle uyumludur.'}\n\n`;
    } else {
      solution += `Bu şık YANLIŞTIR. Bu seçenek sorunun bağlamına uymamaktadır veya yanlış bilgi içermektedir.\n\n`;
    }
  });
  
  // Add conclusion
  solution += `**Sonuç:**\n`;
  solution += `Yukarıdaki analizden de görüldüğü üzere, doğru cevap **${question.correctAnswer} şıkkıdır**. `;
  solution += `${correctOption} seçeneği sorunun doğru cevabını vermektedir.\n\n`;
  
  // Add educational note
  solution += `**Not:** Bu tür soruları çözerken her şıkkı dikkatle okumak ve sistematik olarak değerlendirmek önemlidir. `;
  solution += `${lesson} konusunda daha fazla pratik yapmak, benzer soruları daha hızlı ve doğru çözmenizi sağlayacaktır.`;
  
  return solution;
}

/**
 * Batch generate solutions for multiple questions
 */
export async function generateDetailedSolutions(
  questions: Question[],
  lesson: string,
  apiKey?: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const solutions: string[] = [];
  
  for (let i = 0; i < questions.length; i++) {
    if (onProgress) {
      onProgress(i + 1, questions.length);
    }
    
    const solution = await generateDetailedSolution(questions[i], lesson, apiKey);
    solutions.push(solution);
    
    // Rate limiting: wait 1 second between API calls
    if (apiKey && i < questions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return solutions;
}
