# PDF Upload Fix - Testing Guide

## Overview
This document describes how to test the PDF upload fix to ensure it's working correctly.

## What Was Fixed

### Critical Issues Resolved:
1. ❌ **Content-Type Header Bug** - Client was manually setting `multipart/form-data` without boundary
   - ✅ Fixed: Let fetch/browser handle Content-Type automatically
   
2. ❌ **Missing Environment Variable Validation** - EXPO_PUBLIC_DOMAIN wasn't validated
   - ✅ Fixed: Added validation with user-friendly error messages
   
3. ❌ **Insufficient Logging** - Impossible to debug issues
   - ✅ Fixed: Comprehensive logging at every step
   
4. ❌ **Limited MIME Type Support** - Only accepted `application/pdf`
   - ✅ Fixed: Now accepts `application/pdf`, `application/x-pdf`, and `application/octet-stream` (with .pdf extension verification)
   
5. ❌ **Poor Error Handling** - Errors weren't caught or displayed properly
   - ✅ Fixed: All errors logged and user gets actionable messages

## Pre-Testing Checklist

### Environment Setup:
1. ✅ Ensure `.env` or environment has `EXPO_PUBLIC_DOMAIN` set
   - For Replit: Should be auto-set to `$REPLIT_DEV_DOMAIN:5000`
   - For local: Set to `localhost:5000` or your server URL
   
2. ✅ Optional: Set `GEMINI_API_KEY` for AI-powered question parsing
   - If not set, fallback pattern-based parser will be used
   
3. ✅ Server must be running on port 5000 (or configured port)

## Test Scenarios

### Test 1: Valid PDF Upload (Success Case)
**Steps:**
1. Start the server: `npm run server:dev`
2. Start Expo: `npm run expo:dev`
3. Navigate to PDF Upload screen
4. Click "PDF Seç" button
5. Select a valid PDF with YKS questions
6. Click "Soruları Ekle" button

**Expected Console Output (Client):**
```
📤 Starting upload: your-file.pdf
📄 File URI: file://...
🌐 API URL: https://your-domain.replit.dev:5000
📡 Upload URL: https://your-domain.replit.dev:5000/api/upload-pdf
📦 FormData prepared
🚀 Sending POST request...
📥 Response status: 200
📥 Response headers: [...]
📥 Response body: {"success":true,"questionsAdded":10}
✅ Upload successful: {...}
✅ 10 questions added
```

**Expected Console Output (Server):**
```
📨 Received PDF upload request
Headers: {"content-type":"multipart/form-data; boundary=..."}
📋 File filter - checking file:
  - originalname: your-file.pdf
  - mimetype: application/pdf
  - fieldname: pdf
✅ File accepted as PDF
📄 File received:
  - originalname: your-file.pdf
  - mimetype: application/pdf
  - size: 12345 bytes
  - buffer length: 12345
📤 Processing PDF: your-file.pdf (12345 bytes)
🔄 Starting PDF processing...
📄 Step 1: Extracting text from PDF...
✅ Text extracted: 1234 characters
🤖 Step 2: Parsing questions with AI...
🤖 Calling Gemini API...
⏳ Waiting for Gemini API response (max 30s)...
✅ Gemini API responded successfully
📄 AI Response length: 567 characters
📦 Parsing JSON response...
📊 Received 10 questions from AI
✅ Validated 10 out of 10 questions
💾 Step 3: Saving questions to database...
✅ Saved 10 out of 10 questions to database
✅ PDF processing completed successfully: 10 questions added
⏱️  Processing completed in 3.45s
✅ Success: 10 questions added
```

**Expected UI:**
- Progress bar should animate from 0% to 100%
- Processing states should update: "📄 PDF dosyası yükleniyor..." → "🤖 AI soruları algılıyor..." → "💾 Sorular kaydediliyor..." → "✅ Tamamlandı!"
- Success alert: "Başarılı! 🎉 - 10 soru başarıyla eklendi!"
- Questions should appear in Reels tab

### Test 2: Missing EXPO_PUBLIC_DOMAIN
**Steps:**
1. Unset EXPO_PUBLIC_DOMAIN environment variable
2. Try to upload a PDF

**Expected:**
- Alert: "Konfigürasyon Hatası - API domain ayarlanmamış..."
- Console: "❌ EXPO_PUBLIC_DOMAIN is not set!"

### Test 3: Invalid File Type
**Steps:**
1. Try to upload a .txt or .docx file

**Expected Console (Server):**
```
📋 File filter - checking file:
  - originalname: document.txt
  - mimetype: text/plain
  - fieldname: pdf
❌ Invalid file type: text/plain with extension: document.txt
```

**Expected:**
- Error alert explaining only PDF files are allowed

### Test 4: Network Timeout
**Steps:**
1. Stop the server
2. Try to upload a PDF
3. Wait 60 seconds

**Expected:**
- After 60s: Alert "Zaman Aşımı - İşlem zaman aşımına uğradı (60 saniye)..."
- Console: "⏰ Upload timeout triggered (60s)"

### Test 5: Empty PDF
**Steps:**
1. Upload a PDF with no text content

**Expected Console (Server):**
```
❌ No text extracted from PDF
```

**Expected:**
- Error message: "PDF'den metin çıkarılamadı. Dosya boş olabilir."

### Test 6: iOS/Android Compatibility
**Steps:**
1. Test on actual iOS device
2. Test on actual Android device
3. Upload same PDF on both platforms

**Expected:**
- iOS may send `application/octet-stream` MIME type
- Server should accept it if filename ends with .pdf
- Both platforms should work identically

## Debugging Tips

### If upload fails silently:
1. Check client console for "📤 Starting upload" - if missing, button click handler isn't firing
2. Check for EXPO_PUBLIC_DOMAIN validation error
3. Check network tab for actual request being sent

### If server doesn't receive file:
1. Check Content-Type header in request - should be `multipart/form-data; boundary=...`
2. Check if CORS is allowing the request
3. Verify multer middleware is receiving the file

### If parsing fails:
1. Check if GEMINI_API_KEY is set (optional)
2. Review fallback parser logs
3. Check PDF text extraction output

### If questions aren't saved:
1. Check database connection
2. Review validation errors in logs
3. Verify question format matches schema

## Success Criteria

✅ All test scenarios pass
✅ Console logs are comprehensive and helpful
✅ User gets clear feedback at every step
✅ Errors are caught and handled gracefully
✅ Works on iOS, Android, and web
✅ Questions appear in Reels tab after upload
✅ No security vulnerabilities (CodeQL passed)

## Known Limitations

1. Maximum file size: 10MB (configurable in multer)
2. Timeout: 60 seconds for entire upload+processing
3. AI timeout: 30 seconds for Gemini API
4. Fallback parser is less accurate than AI parser
5. Only Turkish questions are well-supported by prompts

## Rollback Plan

If issues occur:
1. Check logs for specific error
2. Verify environment variables are set
3. Restart server and client
4. If persistent, revert to previous commit: `git revert HEAD`
