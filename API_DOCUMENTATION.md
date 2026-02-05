# YKS Boost - API Dokümantasyonu

## 📡 API Genel Bakış

YKS Boost backend API'si, Express.js kullanarak RESTful endpoint'ler sağlar. Tüm endpoint'ler `/api` prefix'i ile başlar.

**Base URL**: `http://localhost:8000` (development)  
**Production URL**: `https://your-domain.repl.co` (Replit)

## 🔑 Authentication

Şu anda API authentication gerektirmemektedir. Gelecek versiyonlarda JWT authentication eklenecektir.

## 📋 Endpoint'ler

### Health Check

#### GET /

Sunucu durumunu kontrol eder.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-02-05T13:00:00.000Z"
}
```

---

### Questions

#### GET /api/questions

Tüm soruları getirir.

**Query Parameters**:
- `category` (optional): Ders kategorisine göre filtrele
- `examType` (optional): Sınav tipine göre filtrele (TYT, AYT, YDT)
- `packageId` (optional): Paket ID'sine göre filtrele
- `limit` (optional): Sonuç sayısını sınırla (default: 100)
- `offset` (optional): Pagination için offset (default: 0)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "q-1234",
      "content": "Soru metni...",
      "options": ["A) Şık 1", "B) Şık 2", "C) Şık 3", "D) Şık 4", "E) Şık 5"],
      "correctAnswer": "A",
      "solution": "Çözüm açıklaması...",
      "category": "Matematik",
      "subject": "Türev",
      "packageId": "pkg-1",
      "examType": "TYT",
      "difficulty": "medium",
      "likes": 42,
      "comments": 5,
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 100,
    "offset": 0,
    "hasMore": true
  }
}
```

#### GET /api/questions/:id

Belirli bir soruyu getirir.

**URL Parameters**:
- `id`: Question ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "q-1234",
    "content": "Soru metni...",
    "options": ["A) Şık 1", "B) Şık 2", "C) Şık 3", "D) Şık 4", "E) Şık 5"],
    "correctAnswer": "A",
    "solution": "Çözüm açıklaması...",
    "category": "Matematik",
    "subject": "Türev",
    "packageId": "pkg-1",
    "examType": "TYT"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Question not found"
}
```

#### POST /api/questions

Yeni soru ekler.

**Request Body**:
```json
{
  "content": "Soru metni...",
  "options": ["A) Şık 1", "B) Şık 2", "C) Şık 3", "D) Şık 4", "E) Şık 5"],
  "correctAnswer": "A",
  "solution": "Çözüm açıklaması (optional)",
  "category": "Matematik",
  "subject": "Türev (optional)",
  "packageId": "pkg-1 (optional)",
  "examType": "TYT"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "q-5678",
    "content": "Soru metni...",
    "options": ["A) Şık 1", "B) Şık 2", "C) Şık 3", "D) Şık 4", "E) Şık 5"],
    "correctAnswer": "A",
    "createdAt": "2026-02-05T13:00:00.000Z"
  }
}
```

**Validation Errors** (400):
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "content",
      "message": "Question content is required"
    }
  ]
}
```

#### PUT /api/questions/:id

Mevcut bir soruyu günceller.

**URL Parameters**:
- `id`: Question ID

**Request Body** (partial update):
```json
{
  "solution": "Güncellenmiş çözüm...",
  "likes": 43
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "q-1234",
    "solution": "Güncellenmiş çözüm...",
    "likes": 43,
    "updatedAt": "2026-02-05T13:00:00.000Z"
  }
}
```

#### DELETE /api/questions/:id

Bir soruyu siler.

**URL Parameters**:
- `id`: Question ID

**Response**:
```json
{
  "success": true,
  "message": "Question deleted successfully"
}
```

---

### Packages

#### GET /api/packages

Tüm paketleri getirir.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "pkg-1",
      "name": "Matematik TYT",
      "description": "TYT matematik soruları",
      "examType": "TYT",
      "questionCount": 40,
      "completedCount": 15,
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/packages/:id

Belirli bir paketi getirir.

**URL Parameters**:
- `id`: Package ID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "pkg-1",
    "name": "Matematik TYT",
    "description": "TYT matematik soruları",
    "examType": "TYT",
    "questionCount": 40,
    "questions": [
      {
        "id": "q-1",
        "content": "Soru 1...",
        "category": "Matematik"
      }
    ]
  }
}
```

#### POST /api/packages

Yeni paket oluşturur.

**Request Body**:
```json
{
  "name": "Fizik AYT",
  "description": "AYT fizik soruları",
  "examType": "AYT",
  "questionIds": ["q-1", "q-2", "q-3"]
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "pkg-2",
    "name": "Fizik AYT",
    "questionCount": 3,
    "createdAt": "2026-02-05T13:00:00.000Z"
  }
}
```

---

### Statistics

#### GET /api/stats

Kullanıcı istatistiklerini getirir.

**Response**:
```json
{
  "success": true,
  "data": {
    "totalAnswered": 150,
    "correctAnswers": 120,
    "incorrectAnswers": 30,
    "accuracy": 80.0,
    "streak": 5,
    "lastStudyDate": "2026-02-05T13:00:00.000Z",
    "categoryStats": {
      "Matematik": {
        "total": 50,
        "correct": 40,
        "incorrect": 10,
        "accuracy": 80.0
      },
      "Fizik": {
        "total": 30,
        "correct": 25,
        "incorrect": 5,
        "accuracy": 83.3
      }
    }
  }
}
```

#### POST /api/stats/answer

Bir cevabı kaydeder ve istatistikleri günceller.

**Request Body**:
```json
{
  "questionId": "q-1234",
  "userAnswer": "A",
  "correctAnswer": "A",
  "isCorrect": true,
  "category": "Matematik",
  "timeSpent": 45
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalAnswered": 151,
    "correctAnswers": 121,
    "accuracy": 80.1,
    "streak": 6
  }
}
```

---

### File Upload

#### POST /api/upload/pdf

PDF dosyasından soru çıkarır.

**Request**:
- Content-Type: `multipart/form-data`
- Field: `file` (PDF file)
- Field: `packageName` (string, optional)
- Field: `examType` (string, optional)

**Response**:
```json
{
  "success": true,
  "data": {
    "extractedQuestions": 25,
    "packageId": "pkg-auto-123",
    "questions": [
      {
        "id": "q-auto-1",
        "content": "Extracted question...",
        "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
        "correctAnswer": "A"
      }
    ]
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": "Invalid file format. Only PDF files are allowed."
}
```

---

## 🔄 Response Format

Tüm API response'ları tutarlı bir format kullanır:

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "metadata": { /* optional metadata */ }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": { /* optional error details */ }
}
```

## 📊 HTTP Status Codes

- `200 OK`: Başarılı GET, PUT, DELETE
- `201 Created`: Başarılı POST
- `400 Bad Request`: Validation error veya invalid request
- `404 Not Found`: Kaynak bulunamadı
- `500 Internal Server Error`: Sunucu hatası

## 🔒 Error Handling

API, tutarlı error response'ları döner:

```typescript
try {
  const result = await apiClient.get('/api/questions');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error [${error.statusCode}]: ${error.message}`);
    if (error.data) {
      console.error('Details:', error.data);
    }
  }
}
```

## 🚀 Rate Limiting

Şu anda rate limiting yoktur. Gelecek versiyonlarda eklenecektir:

**Planned Limits**:
- 100 requests/minute per IP
- 1000 requests/hour per IP

## 📝 Versioning

API versioning planlanmaktadır:

**Future**:
- `/api/v1/questions`
- `/api/v2/questions`

## 🧪 Testing the API

### cURL Examples

```bash
# Get all questions
curl http://localhost:8000/api/questions

# Get specific question
curl http://localhost:8000/api/questions/q-1234

# Create question
curl -X POST http://localhost:8000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test question",
    "options": ["A", "B", "C", "D", "E"],
    "correctAnswer": "A",
    "category": "Test",
    "examType": "TYT"
  }'

# Update question
curl -X PUT http://localhost:8000/api/questions/q-1234 \
  -H "Content-Type: application/json" \
  -d '{"solution": "Updated solution"}'

# Delete question
curl -X DELETE http://localhost:8000/api/questions/q-1234
```

### Using API Client

```typescript
import { apiClient } from '@/utils/apiClient';

// Get questions
const questions = await apiClient.get('/api/questions');

// Create question
const newQuestion = await apiClient.post('/api/questions', {
  content: "Test question",
  options: ["A", "B", "C", "D", "E"],
  correctAnswer: "A",
  category: "Test"
});

// Update question
const updated = await apiClient.put('/api/questions/q-1234', {
  solution: "Updated solution"
});

// Delete question
await apiClient.delete('/api/questions/q-1234');
```

## 🔄 WebSocket API (Future)

Real-time features için WebSocket desteği planlanmaktadır:

```typescript
// Future WebSocket events
ws.on('question:new', (question) => {
  // Handle new question
});

ws.on('stats:update', (stats) => {
  // Handle stats update
});

ws.emit('answer:submit', {
  questionId: 'q-1234',
  answer: 'A'
});
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-05
