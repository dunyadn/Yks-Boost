# Visual Guide: New Features

## Feature 1: JSON Question Input

### Mode Toggle
```
┌──────────────────────────────────────┐
│  Giriş Modu                          │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  Form  │  JSON  │  JSON  │    │   │
│  │        └────────┴────────┘    │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### JSON Mode UI
```
┌─────────────────────────────────────────┐
│ JSON Formatında Soru                    │
│                                         │
│ Aşağıdaki formatta JSON girin:          │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ {                                 │   │
│ │   "content": "Soru metni buraya", │   │
│ │   "options": ["A", "B", "C"],     │   │
│ │   "correctAnswer": "A",           │   │
│ │   "category": "Matematik"         │   │
│ │ }                                 │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │                                   │   │
│ │  [JSON input area]                │   │
│ │                                   │   │
│ │                                   │   │
│ └───────────────────────────────────┘   │
│                                         │
│          [Paylaş Button]                │
└─────────────────────────────────────────┘
```

### Validation Examples

#### ✅ Success Case
```
Input:
{
  "content": "2x + 5 = 15 denkleminin çözümü nedir?",
  "options": ["x = 5", "x = 10", "x = 3", "x = 7"],
  "correctAnswer": "A",
  "category": "Matematik"
}

Result: ✓ Başarılı! Sorunuz paylaşıldı!
```

#### ❌ Error Cases

**Missing Fields:**
```
Input:
{
  "content": "Soru metni",
  "options": ["A", "B"]
}

Error: ⚠ Geçersiz JSON
JSON'da 'content', 'options', 'correctAnswer' ve 
'category' alanları zorunludur.
```

**Invalid JSON Syntax:**
```
Input:
{
  "content": "Test"
  "options": []
}

Error: ⚠ JSON Hatası
Geçersiz JSON formatı. Lütfen formatınızı kontrol edin.
[Shows example format]
```

**Empty Options:**
```
Input:
{
  "content": "Test",
  "options": [],
  "correctAnswer": "A",
  "category": "Fizik"
}

Error: ⚠ Geçersiz JSON
'options' bir dizi olmalı ve en az bir seçenek içermelidir.
```

## Feature 2: Statistics Screen

### Home Screen Statistics Widget
```
┌─────────────────────────────────────────┐
│ İstatistikler                           │
│                                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │   150    │ │   80%    │ │   120    │ │
│ │ Çözülen  │ │  Başarı  │ │  Doğru   │ │
│ │   Soru   │ │  Oranı   │ │  Sayısı  │ │
│ └──────────┘ └──────────┘ └──────────┘ │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ Detaylı İstatistikleri Gör    →  │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Full Statistics Screen

```
┌─────────────────────────────────────────┐
│ İstatistiklerim                         │
│ Son güncelleme: 3 Şubat 2026, 21:24     │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │  ✓  Toplam Soru                   │   │
│ │                                   │   │
│ │     150                           │   │
│ │     150 soru cevaplandı           │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │  ★  Doğru Cevap                   │   │
│ │                                   │   │
│ │     120                           │   │
│ │     120 doğru yanıt               │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │  ↗  Başarı Oranı                  │   │
│ │                                   │   │
│ │     80.0%                         │   │
│ │     Harika gidiyorsun!            │   │
│ └───────────────────────────────────┘   │
│                                         │
│ Detaylı Analiz                          │
│ ┌───────────────────────────────────┐   │
│ │  ✓ Doğru Cevaplar                 │   │
│ │  ████████████░░░░░  80.0%         │   │
│ │                                   │   │
│ │  ✗ Yanlış Cevaplar                │   │
│ │  ████░░░░░░░░░░░░  20.0%          │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ ℹ İstatistikleriniz her soru      │   │
│ │   çözümünde otomatik olarak       │   │
│ │   güncellenir. Devam edin ve      │   │
│ │   başarınızı artırın!             │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Navigation Flow

```
HomeScreen
    │
    ├─→ [Soru Sor] ──→ AddQuestionScreen
    │                       │
    │                       ├─→ [Form Mode]
    │                       │     └─→ Questions List
    │                       │
    │                       └─→ [JSON Mode]
    │                             └─→ Questions List
    │
    ├─→ [YKS Reels] ──→ ReelsScreen
    │                       │
    │                       └─→ (Answers update statistics)
    │
    └─→ [Detaylı İstatistikleri Gör] ──→ StatisticsScreen
```

## Color Scheme

### Statistics Screen Gradients
- **Primary** (Total Questions): `#00B4D8 → #0099CC`
- **Success** (Correct Answers): `#06D6A0 → #00CC88`
- **Accent** (Success Rate): `#FF6B9D → #FF6B9D`

### Progress Bars
- **Correct**: `#06D6A0` (Green)
- **Incorrect**: `#FF6B9D` (Pink)
- **Background**: `#242433` (Dark)

### Theme Colors Used
- Background Root: `#0A0A0F`
- Background Default: `#1A1A24`
- Text: `#FFFFFF`
- Text Secondary: `#888888`
- Border: `#2A2A34`

## Animations

### Statistics Screen
1. Header: `FadeIn` (100ms delay)
2. Stat Card 1: `SlideInRight` (150ms delay)
3. Stat Card 2: `SlideInRight` (200ms delay)
4. Stat Card 3: `SlideInRight` (250ms delay)
5. Progress Section: `FadeIn` (300ms delay)
6. Progress Bar 1: `SlideInRight` (350ms delay)
7. Progress Bar 2: `SlideInRight` (400ms delay)
8. Info Card: `FadeIn` (450ms delay)

### Add Question Screen
- Mode toggle indicator slides left/right smoothly
- Form elements fade in/out based on mode

## User Experience Flow

### Adding a Question via JSON

1. User opens AddQuestionScreen
2. Toggles to JSON mode
3. Sees example JSON format
4. Types or pastes JSON
5. Clicks "Paylaş"
6. System validates JSON:
   - ✓ Valid → Success message → Returns to previous screen
   - ✗ Invalid → Error message with explanation
7. Question appears in Reels

### Viewing Statistics

1. User sees quick stats on HomeScreen
2. Taps "Detaylı İstatistikleri Gör"
3. Navigates to StatisticsScreen with smooth animation
4. Views detailed breakdown:
   - Total questions answered
   - Correct answers count
   - Success percentage
   - Progress bars showing distribution
5. Can navigate back to continue using app
6. Stats auto-update as user answers more questions

## API Data Flow

### Adding Questions
```
AddQuestionScreen
    ↓ (JSON input)
    ↓ [Validation]
    ↓ POST /api/questions
    ↓
storage.createQuestion()
    ↓
questions Map/DB
    ↓
GET /api/questions
    ↓
ReelsScreen (displays questions)
```

### Statistics Update
```
ReelsScreen (User answers)
    ↓ POST /api/stats { correct: true/false }
    ↓
storage.updateStats()
    ↓
statistics updated
    ↓
GET /api/stats
    ↓ ┌────────────────┐
    ├─→ HomeScreen     │
    └─→ StatisticsScreen
```

## Responsive Design

All screens adapt to:
- Different screen sizes
- Safe area insets (notches, etc.)
- Tab bar height
- Header height
- Platform differences (iOS, Android, Web)

## Accessibility

- Clear visual hierarchy
- High contrast colors
- Large touch targets (min 44px)
- Descriptive text
- Error messages are clear and actionable
- Progress indicators are visual and textual
