# YKS Boost - Geliştirme Rehberi

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Kurulum](#kurulum)
3. [Geliştirme](#geliştirme)
4. [Test Yazma](#test-yazma)
5. [Kod Standartları](#kod-standartları)
6. [Güvenlik](#güvenlik)
7. [Performans](#performans)
8. [Yaygın Sorunlar](#yaygın-sorunlar)

## Genel Bakış

YKS Boost, YKS öğrencileri için tasarlanmış soru odaklı bir sosyal medya platformudur. Proje modern React Native ve Express.js teknolojileri kullanılarak geliştirilmiştir.

### Teknoloji Stack

- **Frontend**: React Native 0.81.5 + Expo 54
- **Backend**: Express.js 5.0
- **Database**: PostgreSQL 16 + Drizzle ORM
- **State Management**: React Query + AsyncStorage
- **Type Safety**: TypeScript 5.9
- **Testing**: Jest + React Native Testing Library
- **Code Quality**: ESLint + Prettier

## Kurulum

### Gereksinimler

- Node.js 18+ ve npm
- PostgreSQL 16 (production için)
- Expo Go uygulaması (mobil test için)

### Yerel Ortam Kurulumu

1. **Repository'yi klonlayın**:
   ```bash
   git clone https://github.com/dunyadn/Yks-Boost.git
   cd Yks-Boost
   ```

2. **Bağımlılıkları yükleyin**:
   ```bash
   npm install
   ```

3. **Environment variables ayarlayın**:
   ```bash
   cp .env.example .env
   # .env dosyasını düzenleyip gerekli değerleri girin
   ```

4. **Sunucuları başlatın**:
   ```bash
   # Terminal 1 - Backend
   npm run server:dev

   # Terminal 2 - Frontend
   npm run expo:dev
   ```

## Geliştirme

### Proje Yapısı

```
├── client/               # React Native uygulaması
│   ├── components/      # UI bileşenleri
│   ├── screens/         # Ekranlar
│   ├── navigation/      # Navigation yapılandırması
│   ├── lib/            # Yardımcı fonksiyonlar
│   ├── utils/          # Utility sınıfları (yeni!)
│   ├── hooks/          # Custom React hooks
│   └── constants/      # Sabitler ve tema
├── server/             # Express.js backend
│   ├── routes.ts       # API rotaları
│   ├── storage.ts      # Veri depolama
│   └── index.ts        # Server giriş noktası
├── shared/             # Paylaşılan kod
├── scripts/            # Build ve converter scriptleri
└── assets/             # Statik dosyalar

```

### Yeni Utility Modülleri

#### Logger (`client/utils/logger.ts`)
Merkezi log yönetimi:

```typescript
import { logger } from '@/utils/logger';

logger.info('Uygulama başlatıldı');
logger.error('Hata oluştu', error);

// Alt logger oluşturma
const apiLogger = logger.child('API');
apiLogger.debug('API çağrısı yapıldı');
```

#### Performance Monitor (`client/utils/performance.ts`)
Performans izleme:

```typescript
import { performanceMonitor } from '@/utils/performance';

// Manuel ölçüm
performanceMonitor.start('data-load');
await loadData();
performanceMonitor.end('data-load');

// Otomatik ölçüm
const result = await performanceMonitor.measure('api-call', async () => {
  return await apiClient.get('/endpoint');
});
```

#### API Client (`client/utils/apiClient.ts`)
Gelişmiş API client:

```typescript
import { apiClient } from '@/utils/apiClient';

// Otomatik retry ve error handling
const data = await apiClient.get('/api/questions');

// Custom config
const result = await apiClient.post('/api/submit', {
  answer: 'A'
}, {
  retries: 5,
  timeout: 10000
});
```

#### Validation (`client/utils/validation.ts`)
Zod ile veri doğrulama:

```typescript
import { QuestionSchema, validate } from '@/utils/validation';

// Veri doğrulama
const question = validate(QuestionSchema, rawData);

// Güvenli doğrulama
const result = safeValidate(QuestionSchema, rawData);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### Yeni Komponentler Oluşturma

1. **Component dosyasını oluşturun**: `client/components/MyComponent.tsx`
2. **TypeScript tip tanımlarını ekleyin**
3. **Props interface tanımlayın**
4. **Component'i export edin**

Örnek:
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

export function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

## Test Yazma

### Test Komutları

```bash
# Tüm testleri çalıştır
npm test

# Watch mode
npm run test:watch

# Coverage raporu ile
npm test -- --coverage

# CI için
npm run test:ci
```

### Test Yazma Örnekleri

#### Unit Test

```typescript
// client/lib/__tests__/myFunction.test.ts
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction(5)).toBe(10);
  });

  it('should handle edge cases', () => {
    expect(myFunction(0)).toBe(0);
  });
});
```

#### Component Test

```typescript
// client/components/__tests__/MyComponent.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <MyComponent title="Test" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## Kod Standartları

### TypeScript

- **Strict mode** kullanın
- Tüm fonksiyonlar için **return type** belirtin
- **any** kullanmaktan kaçının
- Interface ve type tanımları net olmalı

```typescript
// ✅ İyi
function calculateScore(correct: number, total: number): number {
  return (correct / total) * 100;
}

// ❌ Kötü
function calculateScore(correct, total) {
  return (correct / total) * 100;
}
```

### React Best Practices

- **Functional components** kullanın
- **Hooks** doğru sırada kullanın
- **useCallback** ve **useMemo** ile optimize edin
- **Props drilling** yerine context veya state management kullanın

```typescript
// ✅ İyi
const MemoizedComponent = React.memo(({ data }: Props) => {
  const handlePress = useCallback(() => {
    // Handle press
  }, []);

  return <View>...</View>;
});

// ❌ Kötü
function Component({ data }) {
  const handlePress = () => {
    // Her render'da yeni fonksiyon
  };

  return <View>...</View>;
}
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: camelCase (`userUtils.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Functions**: camelCase (`calculateTotal`)
- **Interfaces**: PascalCase with `I` prefix optional (`UserData` or `IUserData`)

### Code Formatting

Prettier otomatik formatting kullanıyoruz:

```bash
# Kodu formatla
npm run format

# Format kontrolü
npm run check:format
```

## Güvenlik

### API Key Yönetimi

**ASLA** API key'leri kod içinde saklamayın:

```typescript
// ❌ YANLIŞ
const API_KEY = "AIzaSyCr6u1sXeP0Itf2AcMkTIVUADVGhyfsUg0";

// ✅ DOĞRU
const API_KEY = process.env.GEMINI_API_KEY;
```

### Environment Variables

`.env` dosyası **asla** commit edilmemelidir. `.env.example` dosyasını kullanın.

### Input Validation

Tüm user input'ları validate edin:

```typescript
import { validate, QuestionSchema } from '@/utils/validation';

try {
  const validQuestion = validate(QuestionSchema, userInput);
  // Güvenli kullanım
} catch (error) {
  // Hata yönetimi
}
```

## Performans

### Optimizasyon İpuçları

1. **Image Optimization**: `expo-image` kullanın
2. **List Rendering**: `FlatList` ve `windowSize` prop'u
3. **Memoization**: `React.memo`, `useMemo`, `useCallback`
4. **Bundle Size**: Gereksiz bağımlıklardan kaçının
5. **Lazy Loading**: Ağır componentleri lazy load edin

```typescript
// FlatList optimizasyonu
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={item => item.id}
  windowSize={10}
  maxToRenderPerBatch={10}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Performance Monitoring

Performance monitor kullanın:

```typescript
import { performanceMonitor } from '@/utils/performance';

const loadQuestions = async () => {
  return await performanceMonitor.measure('load-questions', async () => {
    const questions = await getQuestions();
    return questions;
  });
};
```

## Yaygın Sorunlar

### TypeScript Hataları

**Problem**: `Cannot find module` hataları

**Çözüm**: 
```bash
# node_modules ve lock dosyasını temizle
rm -rf node_modules package-lock.json
npm install
```

### Expo Hataları

**Problem**: Metro bundler başlamıyor

**Çözüm**:
```bash
# Cache'i temizle
npx expo start -c
```

### Build Hataları

**Problem**: Production build başarısız

**Çözüm**:
```bash
# Tüm build artifacts'ı temizle
rm -rf dist server_dist static-build
npm run expo:static:build
npm run server:build
```

## Daha Fazla Bilgi

- [React Native Dokümantasyonu](https://reactnative.dev/)
- [Expo Dokümantasyonu](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Dokümantasyonu](https://jestjs.io/)

## Yardım ve Destek

Sorularınız için:
1. Mevcut dokümantasyonu kontrol edin
2. GitHub Issues'a bakın
3. Yeni bir issue açın

---

**Son Güncelleme**: 2026-02-05
