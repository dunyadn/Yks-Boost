#!/usr/bin/env node
/**
 * YKS Question Generator
 * Generates realistic YKS questions for TYT and AYT exams
 * Covers multiple subjects and years (2020-2025)
 */

import * as fs from "fs";
import * as path from "path";

interface Question {
  content: string;
  options: string[];
  correctAnswer: string;
  solution: string;
  category: string;
  subject: string;
}

interface QuestionPackage {
  packageName: string;
  examType: string;
  year: number;
  description: string;
  questions: Question[];
}

// Question templates for different subjects
const questionTemplates = {
  matematik: [
    {
      generate: (idx: number) => {
        const a = 2 + (idx % 8);
        const b = 3 + (idx % 18);
        const ans = 7 + (idx % 5);
        return {
          content: `${a}x - ${b} = ${a * ans - b} denkleminin çözüm kümesi aşağıdakilerden hangisidir?`,
          options: [
            `{${ans - 2}}`,
            `{${ans - 1}}`,
            `{${ans}}`,
            `{${ans + 1}}`,
            `{${ans + 2}}`,
          ],
          correctIndex: 2,
          solution: `${a}x - ${b} = ${a * ans - b} denkleminde ${b}'i sağa atarsak: ${a}x = ${a * ans - b} + ${b} → ${a}x = ${a * ans} → x = ${ans} bulunur.`,
          subject: "Denklemler",
        };
      },
    },
    {
      generate: (idx: number) => {
        const a = 2 + (idx % 4);
        const w = 10 + (idx % 11);
        const ans = w * a * w;
        return {
          content: `Bir dikdörtgenin uzun kenarı kısa kenarının ${a} katıdır. Çevresi ${2 * w * (a + 1)} cm ise, alanı kaç cm²'dir?`,
          options: [
            `${ans - 54}`,
            `${ans}`,
            `${ans + 50}`,
            `${ans + 100}`,
            `${ans + 150}`,
          ],
          correctIndex: 1,
          solution: `Kısa kenar = x = ${w} cm, uzun kenar = ${a}x = ${a * w} cm. Çevre = 2(x + ${a}x) = ${2 * (a + 1)}x = ${2 * w * (a + 1)} → x = ${w} cm. Alan = ${w} × ${a * w} = ${ans} cm²`,
          subject: "Geometri",
        };
      },
    },
    {
      generate: (idx: number) => {
        const a = 2 + (idx % 6);
        const b = 5 + (idx % 16);
        const x = Math.floor(b / a) + 1;
        const ans = a * x + b;
        return {
          content: `f(x) = ${a}x + ${b} fonksiyonu için f(${x}) değeri kaçtır?`,
          options: [
            `${ans - 4}`,
            `${ans - 2}`,
            `${ans}`,
            `${ans + 2}`,
            `${ans + 4}`,
          ],
          correctIndex: 2,
          solution: `f(${x}) = ${a}(${x}) + ${b} = ${a * x} + ${b} = ${ans}`,
          subject: "Fonksiyonlar",
        };
      },
    },
    {
      generate: (idx: number) => {
        const num1 = 5 + (idx % 8);
        const num2 = 5 + ((idx + 3) % 8);
        const ans = num1 + num2;
        return {
          content: `√${num1 * num1} + √${num2 * num2} işleminin sonucu kaçtır?`,
          options: [
            `${ans - 5}`,
            `${ans - 2}`,
            `${ans}`,
            `${ans + 2}`,
            `${ans + 5}`,
          ],
          correctIndex: 2,
          solution: `√${num1 * num1} = ${num1} ve √${num2 * num2} = ${num2} olduğundan, ${num1} + ${num2} = ${ans} bulunur.`,
          subject: "Kökler",
        };
      },
    },
    {
      generate: (idx: number) => {
        const base = 2;
        const exp1 = 3 + (idx % 6);
        const exp2 = 2 + (idx % 5);
        const ansExp = exp1 + exp2;
        return {
          content: `${base}^${exp1} × ${base}^${exp2} işleminin sonucu kaçtır?`,
          options: [
            `${base}^${ansExp - 2}`,
            `${base}^${ansExp - 1}`,
            `${base}^${ansExp}`,
            `${base}^${ansExp + 1}`,
            `${Math.pow(base, ansExp)}`,
          ],
          correctIndex: 2,
          solution: `Üslü sayıların çarpımında tabanlar aynı ise üsler toplanır: ${base}^${exp1} × ${base}^${exp2} = ${base}^(${exp1}+${exp2}) = ${base}^${ansExp}`,
          subject: "Üslü Sayılar",
        };
      },
    },
    {
      generate: (idx: number) => {
        const percent = 20 + (idx % 6) * 5;
        const result = 40 + (idx % 11) * 10;
        const whole = Math.floor((result * 100) / percent);
        return {
          content: `Bir sayının %${percent}'i ${result} ise, bu sayı kaçtır?`,
          options: [
            `${whole - 50}`,
            `${whole - 20}`,
            `${whole}`,
            `${whole + 20}`,
            `${whole + 50}`,
          ],
          correctIndex: 2,
          solution: `x × ${percent}/100 = ${result} → x × ${percent / 100} = ${result} → x = ${result}/${percent / 100} = ${whole}`,
          subject: "Yüzdeler",
        };
      },
    },
  ],
  fizik: [
    {
      generate: (idx: number) => {
        const v0 = 10 + (idx % 21);
        const t = 3 + (idx % 6);
        const a = 3 + (idx % 5);
        const v = v0 + a * t;
        return {
          content: `Bir cisim ${v0} m/s hızla atıldığında ${t} saniye sonra hızı ${v} m/s oluyor. İvmesi kaç m/s²'dir?`,
          options: [`${a - 2}`, `${a - 1}`, `${a}`, `${a + 1}`, `${a + 2}`],
          correctIndex: 2,
          solution: `a = (v - v₀) / t = (${v} - ${v0}) / ${t} = ${v - v0} / ${t} = ${a} m/s²`,
          subject: "Hareket",
        };
      },
    },
    {
      generate: (idx: number) => {
        const m = 2 + (idx % 9);
        const a = 3 + (idx % 6);
        const F = m * a;
        return {
          content: `${F} N kuvvet uygulanan ${m} kg kütleli cisme etki eden ivme kaç m/s²'dir?`,
          options: [`${a - 2}`, `${a - 1}`, `${a}`, `${a + 1}`, `${a + 2}`],
          correctIndex: 2,
          solution: `Newton'un 2. yasasından F = m × a → ${F} = ${m} × a → a = ${F}/${m} = ${a} m/s²`,
          subject: "Dinamik",
        };
      },
    },
    {
      generate: (idx: number) => {
        const I = 2 + (idx % 5);
        const R = 5 + (idx % 11);
        const V = I * R;
        return {
          content: `${V} V gerilim altında ${I} A akım çeken bir direncin değeri kaç Ω'dur?`,
          options: [`${R - 5}`, `${R - 2}`, `${R}`, `${R + 2}`, `${R + 5}`],
          correctIndex: 2,
          solution: `Ohm yasasından V = I × R → ${V} = ${I} × R → R = ${V}/${I} = ${R} Ω`,
          subject: "Elektrik",
        };
      },
    },
    {
      generate: (idx: number) => {
        const m = 2 + (idx % 9);
        const v = 5 + (idx % 11);
        const Ek = Math.floor((m * v * v) / 2);
        return {
          content: `${m} kg kütleli ${v} m/s hızla hareket eden cismin kinetik enerjisi kaç J'dür?`,
          options: [
            `${Ek - 50}`,
            `${Ek - 25}`,
            `${Ek}`,
            `${Ek + 25}`,
            `${Ek + 50}`,
          ],
          correctIndex: 2,
          solution: `Ek = (1/2) × m × v² = (1/2) × ${m} × ${v}² = (1/2) × ${m} × ${v * v} = ${Ek} J`,
          subject: "Enerji",
        };
      },
    },
  ],
  kimya: [
    {
      generate: (idx: number) => {
        const n = 1 + (idx % 5);
        const vol = n * 22.4;
        return {
          content: `${n} mol ideal gazın STP koşullarında hacmi kaç L'dir?`,
          options: [
            `${vol - 22.4}`,
            `${vol - 11.2}`,
            `${vol}`,
            `${vol + 11.2}`,
            `${vol + 22.4}`,
          ],
          correctIndex: 2,
          solution: `STP koşullarında 1 mol gaz 22.4 L hacim kaplar. ${n} mol gaz ${n} × 22.4 = ${vol} L hacim kaplar.`,
          subject: "Gazlar",
        };
      },
    },
    {
      generate: (idx: number) => {
        const molarMasses = [18, 44, 32, 64];
        const names = ["su (H₂O)", "CO₂", "O₂", "SO₂"];
        const molarIdx = idx % molarMasses.length;
        const molarMass = molarMasses[molarIdx];
        const name = names[molarIdx];
        const mols = 2 + (idx % 4);
        const mass = molarMass * mols;
        return {
          content: `${mass} gram ${name} kaç moldür? (MA: ${molarMass} g/mol)`,
          options: [
            `${mols - 1}`,
            `${mols - 0.5}`,
            `${mols}`,
            `${mols + 0.5}`,
            `${mols + 1}`,
          ],
          correctIndex: 2,
          solution: `n = kütle / molar kütle = ${mass} / ${molarMass} = ${mols} mol`,
          subject: "Mol Kavramı",
        };
      },
    },
    {
      generate: (idx: number) => {
        const pH = 2 + (idx % 11);
        return {
          content: `pH = ${pH} olan bir çözeltinin [H⁺] derişimi kaç M'dır?`,
          options: [
            `10⁻${pH - 2}`,
            `10⁻${pH - 1}`,
            `10⁻${pH}`,
            `10⁻${pH + 1}`,
            `10⁻${pH + 2}`,
          ],
          correctIndex: 2,
          solution: `pH = -log[H⁺] → ${pH} = -log[H⁺] → [H⁺] = 10⁻${pH} M`,
          subject: "Asit-Baz",
        };
      },
    },
  ],
  biyoloji: [
    {
      generate: (idx: number) => {
        const topics = [
          {
            content:
              "Hücre zarının temel yapı birimi aşağıdakilerden hangisidir?",
            options: [
              "Protein",
              "Fosfolipid",
              "Karbonhidrat",
              "Nükleik asit",
              "Vitamin",
            ],
            correctIndex: 1,
            solution:
              "Hücre zarı fosfolipid çift tabakasından oluşur. Fosfolipidler amfifilik moleküllerdir ve hücre zarının temel yapı birimidir.",
            subject: "Hücre Biyolojisi",
          },
          {
            content:
              "Fotosentezin ışık bağımlı tepkimeleri hücrenin hangi bölümünde gerçekleşir?",
            options: [
              "Sitoplazma",
              "Mitokondri",
              "Tilakoid",
              "Stroma",
              "Çekirdek",
            ],
            correctIndex: 2,
            solution:
              "Fotosentezin ışık bağımlı tepkimeleri kloroplastların tilakoid zarlarında gerçekleşir. Burada ATP ve NADPH üretilir.",
            subject: "Fotosentez",
          },
          {
            content:
              "DNA'nın replikasyonu hangi enzim tarafından gerçekleştirilir?",
            options: [
              "RNA polimeraz",
              "DNA polimeraz",
              "Ligaz",
              "Helikaz",
              "Primaz",
            ],
            correctIndex: 1,
            solution:
              "DNA replikasyonu DNA polimeraz enzimi tarafından gerçekleştirilir. Bu enzim yeni nükleotidleri ekleyerek DNA zincirini sentezler.",
            subject: "Genetik",
          },
          {
            content: "Hücre solunumunun ilk aşaması hangisidir?",
            options: [
              "Glikoliz",
              "Krebs döngüsü",
              "Elektron taşıma sistemi",
              "Fermantasyon",
              "Oksidasyon",
            ],
            correctIndex: 0,
            solution:
              "Hücre solunumunun ilk aşaması glikolizdir. Sitoplazmada gerçekleşir ve glikoz 2 pirüvata parçalanır.",
            subject: "Hücre Solunumu",
          },
          {
            content: "Mitoz bölünmede kromozom sayısı nasıl değişir?",
            options: [
              "Yarıya iner",
              "İki katına çıkar",
              "Değişmez",
              "Üç katına çıkar",
              "Dörtte birine iner",
            ],
            correctIndex: 2,
            solution:
              "Mitoz bölünmede kromozom sayısı değişmez. Ana hücre ile oluşan hücreler eşit sayıda kromozoma sahiptir (2n → 2n).",
            subject: "Hücre Bölünmesi",
          },
        ];
        const topic = topics[idx % topics.length];
        return topic;
      },
    },
  ],
  tarih: [
    {
      generate: (idx: number) => {
        const topics = [
          {
            content:
              "Osmanlı Devleti'nin kuruluş yılı aşağıdakilerden hangisidir?",
            options: ["1071", "1299", "1453", "1520", "1923"],
            correctIndex: 1,
            solution:
              "Osmanlı Devleti 1299 yılında Osman Bey tarafından kurulmuştur. 1071 Malazgirt Savaşı, 1453 İstanbul'un Fethi yıllarıdır.",
            subject: "Osmanlı Tarihi",
          },
          {
            content: "Türkiye Cumhuriyeti'nin ilk cumhurbaşkanı kimdir?",
            options: [
              "İsmet İnönü",
              "Mustafa Kemal Atatürk",
              "Celal Bayar",
              "Cemal Gürsel",
              "Cevdet Sunay",
            ],
            correctIndex: 1,
            solution:
              "Mustafa Kemal Atatürk, 29 Ekim 1923'te Türkiye Cumhuriyeti'nin ilk cumhurbaşkanı olmuştur ve 1938'e kadar bu görevde kalmıştır.",
            subject: "Türkiye Cumhuriyeti Tarihi",
          },
          {
            content: "I. Dünya Savaşı hangi yıllar arasında gerçekleşmiştir?",
            options: [
              "1912-1913",
              "1914-1918",
              "1919-1922",
              "1939-1945",
              "1950-1953",
            ],
            correctIndex: 1,
            solution:
              "I. Dünya Savaşı 1914-1918 yılları arasında gerçekleşmiştir. 28 Haziran 1914'te başlamış, 11 Kasım 1918'de sona ermiştir.",
            subject: "Dünya Tarihi",
          },
          {
            content: "İstanbul'un fethi hangi yılda gerçekleşmiştir?",
            options: ["1402", "1444", "1453", "1514", "1520"],
            correctIndex: 2,
            solution:
              "İstanbul'un fethi 29 Mayıs 1453'te II. Mehmet (Fatih Sultan Mehmet) tarafından gerçekleştirilmiştir.",
            subject: "Osmanlı Tarihi",
          },
          {
            content: "Lozan Antlaşması hangi tarihte imzalanmıştır?",
            options: [
              "30 Ekim 1918",
              "11 Kasım 1918",
              "24 Temmuz 1923",
              "29 Ekim 1923",
              "1 Kasım 1922",
            ],
            correctIndex: 2,
            solution:
              "Lozan Antlaşması 24 Temmuz 1923 tarihinde imzalanmıştır. Bu antlaşma ile Türkiye'nin bağımsızlığı uluslararası alanda tanınmıştır.",
            subject: "Türkiye Cumhuriyeti Tarihi",
          },
        ];
        const topic = topics[idx % topics.length];
        return topic;
      },
    },
  ],
  cografya: [
    {
      generate: (idx: number) => {
        const topics = [
          {
            content: "Dünya'nın en büyük okyanusu hangisidir?",
            options: [
              "Atlas Okyanusu",
              "Pasifik Okyanusu",
              "Hint Okyanusu",
              "Kuzey Buz Denizi",
              "Güney Okyanusu",
            ],
            correctIndex: 1,
            solution:
              "Pasifik Okyanusu, yaklaşık 165 milyon km² yüzölçümü ile Dünya'nın en büyük okyanusudur. Tüm kara parçalarını kapsayabilecek büyüklüktedir.",
            subject: "Fiziki Coğrafya",
          },
          {
            content: "Ekvatora en yakın iklim kuşağı hangisidir?",
            options: [
              "Kutup iklimi",
              "Ilıman iklim",
              "Ekvatoral iklim",
              "Akdeniz iklimi",
              "Karasal iklim",
            ],
            correctIndex: 2,
            solution:
              "Ekvatora en yakın bölgede ekvatoral iklim görülür. Bu iklim kuşağında yıl boyunca sıcaklık yüksek ve yağış boldur.",
            subject: "İklim",
          },
          {
            content: "Türkiye'nin en uzun nehri hangisidir?",
            options: ["Sakarya", "Kızılırmak", "Fırat", "Dicle", "Yeşilırmak"],
            correctIndex: 1,
            solution:
              "Kızılırmak, 1355 km uzunluğu ile Türkiye'nin en uzun nehridir ve tümüyle Türkiye sınırları içinde akar.",
            subject: "Türkiye Coğrafyası",
          },
          {
            content: "Dünya'da en fazla nüfusa sahip ülke hangisidir?",
            options: ["Hindistan", "Çin", "ABD", "Endonezya", "Brezilya"],
            correctIndex: 1,
            solution:
              "Çin, yaklaşık 1.4 milyar nüfusu ile dünyanın en kalabalık ülkesidir. (Not: 2023 itibariyle Hindistan geçmiş olabilir)",
            subject: "Beşeri Coğrafya",
          },
        ];
        const topic = topics[idx % topics.length];
        return topic;
      },
    },
  ],
};

function capitalizeSubject(subject: string): string {
  const map: Record<string, string> = {
    matematik: "Matematik",
    fizik: "Fizik",
    kimya: "Kimya",
    biyoloji: "Biyoloji",
    tarih: "Tarih",
    cografya: "Coğrafya",
  };
  return map[subject] || subject;
}

function generatePackage(
  subject: string,
  year: number,
  questionCount: number,
  examType: string = "TYT",
): QuestionPackage {
  const questions: Question[] = [];
  const templates =
    questionTemplates[subject as keyof typeof questionTemplates];

  if (!templates || templates.length === 0) {
    throw new Error(`No templates for subject: ${subject}`);
  }

  for (let i = 0; i < questionCount; i++) {
    const template = templates[i % templates.length];
    const qdata = template.generate(i);

    const correctAnswerLetter = ["A", "B", "C", "D", "E"][qdata.correctIndex];

    const question: Question = {
      content: qdata.content,
      options: qdata.options,
      correctAnswer: correctAnswerLetter,
      solution: qdata.solution,
      category: capitalizeSubject(subject),
      subject: qdata.subject,
    };

    questions.push(question);
  }

  return {
    packageName: `${examType} ${year} ${capitalizeSubject(subject)}`,
    examType,
    year,
    description: `${examType} ${year} ${capitalizeSubject(subject)} Soruları - ${questionCount} Soru`,
    questions,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const outputDir = args[0] || "./generated-questions";

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("🎯 YKS Question Generator");
  console.log("━".repeat(60));

  const config = [
    {
      subject: "matematik",
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      questionsPerYear: 40,
    },
    {
      subject: "fizik",
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      questionsPerYear: 40,
    },
    {
      subject: "kimya",
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      questionsPerYear: 40,
    },
    {
      subject: "biyoloji",
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      questionsPerYear: 30,
    },
    {
      subject: "tarih",
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      questionsPerYear: 20,
    },
    {
      subject: "cografya",
      years: [2020, 2021, 2022, 2023, 2024, 2025],
      questionsPerYear: 20,
    },
  ];

  let totalGenerated = 0;
  const allPackages: string[] = [];

  for (const item of config) {
    console.log(`\n📚 ${capitalizeSubject(item.subject)}:`);

    for (const year of item.years) {
      try {
        const pkg = generatePackage(item.subject, year, item.questionsPerYear);
        const filename = path.join(
          outputDir,
          `tyt-${item.subject}-${year}.json`,
        );

        fs.writeFileSync(filename, JSON.stringify(pkg, null, 2));

        totalGenerated += pkg.questions.length;
        allPackages.push(`tyt-${item.subject}-${year}.json`);
        console.log(
          `  ✅ ${year}: ${pkg.questions.length} soru → ${path.basename(filename)}`,
        );
      } catch (error) {
        console.error(
          `  ❌ ${year}: Hata -`,
          error instanceof Error ? error.message : error,
        );
      }
    }
  }

  console.log("\n" + "━".repeat(60));
  console.log(`🎉 Tamamlandı!`);
  console.log(`   Toplam: ${totalGenerated} soru oluşturuldu`);
  console.log(`   Paket sayısı: ${allPackages.length}`);
  console.log(`   Dizin: ${outputDir}`);
  console.log("\n📋 Oluşturulan paketler:");
  allPackages.forEach((p) => console.log(`   - ${p}`));
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { generatePackage };
