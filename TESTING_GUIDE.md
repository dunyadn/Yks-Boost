# Manual Testing Guide for YKS-Boost PDF Upload Feature

## Prerequisites
1. Set up OpenAI API key in `.env` file (optional, fallback parser will be used if not set)
2. Start the server: `npm run server:dev`
3. Start Expo: `npm run expo:dev`

## Test Scenarios

### 1. PDF Upload Flow ✓
**Steps:**
1. Navigate to "PDF Yükle" tab (3rd tab)
2. Click "PDF Dosyası Seç" button
3. Select a PDF file containing questions (max 10MB)
4. Verify file name and size are displayed
5. Click "İşle ve Soruları Ekle"
6. Verify progress bar shows during upload
7. Verify success message shows number of questions added

**Expected Results:**
- File picker opens correctly
- Selected file information displays
- Upload progress shows 0-100%
- Success message: "X soru başarıyla eklendi"
- Questions are added to database

**Error Cases:**
- File > 10MB: "Dosya Çok Büyük" alert
- Non-PDF file: Should be filtered out by picker
- Network error: "PDF işlenirken bir hata oluştu" alert

### 2. Question Parsing ✓
**Test with OpenAI:**
- Set `OPENAI_API_KEY` in `.env`
- Upload PDF with various question formats
- Verify AI correctly identifies:
  - Question text
  - Multiple choice options (A, B, C, D, E)
  - Correct answer
  - Category/subject

**Test without OpenAI (Fallback):**
- Leave `OPENAI_API_KEY` empty
- Upload simple formatted PDF
- Verify basic pattern matching works
- Expected: Fewer questions detected, simpler parsing

### 3. Navigation Flow ✓
**Steps:**
1. Open app
2. Verify 4 tabs appear:
   - 🎬 Reels (Tab 1)
   - 📚 Kütüphane (Tab 2)
   - 📤 PDF Yükle (Tab 3)
   - 📊 İstatistikler (Tab 4)
3. Tap each tab and verify correct screen appears
4. Verify old screens are gone:
   - No "Ana Sayfa" tab
   - No "Görevler" tab
   - No floating "+" button for manual question entry

**Expected Results:**
- All 4 tabs are visible and labeled correctly
- Navigation is smooth without errors
- No references to removed screens

### 4. Reels Screen Updates ✓
**Steps:**
1. Upload questions via PDF
2. Navigate to "Reels" tab
3. Pull down to refresh
4. Swipe through questions
5. Answer questions by selecting options
6. Verify feedback (correct/wrong) shows

**Expected Results:**
- Pull-to-refresh works (loading indicator shows)
- New questions from PDF appear
- Selecting answer triggers haptic feedback
- Correct/wrong visual feedback displays
- Stats are updated in background

### 5. Statistics Screen ✓
**Steps:**
1. Navigate to "İstatistikler" tab
2. Verify displayed statistics:
   - Toplam Soru (total answered)
   - Doğru Cevap (correct answers)
   - Başarı Oranı (success percentage)
   - Last update timestamp
3. Answer some questions in Reels
4. Return to Statistics
5. Verify stats updated

**Expected Results:**
- All stat cards display correctly
- Numbers are accurate
- Progress bars show correct percentages
- Timestamp updates after answering questions

### 6. Error Handling ✓
**Steps:**
1. Try uploading corrupted PDF
2. Try uploading without internet
3. Try uploading very large PDF (>10MB)
4. Try with invalid OpenAI API key

**Expected Results:**
- Graceful error messages in Turkish
- No app crashes
- User can retry after error

## Database Verification
```bash
# Check questions were saved
curl http://localhost:5000/api/questions

# Check stats
curl http://localhost:5000/api/stats
```

## Known Limitations
1. PDF parsing accuracy depends on PDF quality
2. OpenAI API required for best results (fallback is basic)
3. Only supports Turkish exam questions
4. Images in PDFs not yet supported (OCR not implemented)
5. Maximum 10MB file size

## Success Criteria
- ✅ All old screens removed
- ✅ PDF upload UI working
- ✅ Questions parse from PDF
- ✅ Questions save to database
- ✅ Questions appear in Reels
- ✅ Statistics update correctly
- ✅ No TypeScript errors
- ✅ No security vulnerabilities
- ✅ Navigation works smoothly
