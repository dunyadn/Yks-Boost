# Katkıda Bulunma Rehberi

YKS Boost projesine katkıda bulunmak istediğiniz için teşekkür ederiz! Bu rehber, katkı sürecini kolaylaştırmak için hazırlanmıştır.

## 📋 İçindekiler

1. [Başlamadan Önce](#başlamadan-önce)
2. [Geliştirme Süreci](#geliştirme-süreci)
3. [Kod Standartları](#kod-standartları)
4. [Commit Mesajları](#commit-mesajları)
5. [Pull Request Süreci](#pull-request-süreci)
6. [İletişim](#iletişim)

## Başlamadan Önce

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Git
- Temel TypeScript ve React Native bilgisi

### Repo'yu Fork ve Clone Etme

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/Yks-Boost.git
cd Yks-Boost

# Add upstream remote
git remote add upstream https://github.com/dunyadn/Yks-Boost.git
```

### Yerel Ortamı Kurma

```bash
# Bağımlılıkları yükle
npm install

# Environment variables'ı ayarla
cp .env.example .env
# .env dosyasını düzenleyin

# Sunucuları başlat
npm run server:dev  # Terminal 1
npm run expo:dev    # Terminal 2
```

## Geliştirme Süreci

### 1. Issue Seçimi

- Mevcut [issues](https://github.com/dunyadn/Yks-Boost/issues)'a göz atın
- `good first issue` etiketli issue'lar başlangıç için uygundur
- Üzerinde çalışmak istediğiniz issue'ya yorum yapın

### 2. Branch Oluşturma

```bash
# upstream'den güncel kodu çek
git fetch upstream
git checkout main
git merge upstream/main

# Yeni branch oluştur
git checkout -b feature/your-feature-name
# veya
git checkout -b fix/bug-description
```

**Branch İsimlendirme**:
- `feature/`: Yeni özellikler için
- `fix/`: Bug fix'ler için
- `docs/`: Dokümantasyon güncellemeleri için
- `refactor/`: Code refactoring için
- `test/`: Test eklemeleri için

### 3. Geliştirme

**Checklist**:
- [ ] Kod standartlarına uyun
- [ ] TypeScript tip tanımlamaları ekleyin
- [ ] Unit testler yazın
- [ ] Dokümantasyonu güncelleyin
- [ ] Linter ve type checker'ı çalıştırın

```bash
# Kod kontrolü
npm run check:types
npm run lint
npm run test

# Veya tek komutla
npm run validate
```

### 4. Test Etme

```bash
# Unit testler
npm test

# Watch mode ile geliştirme
npm run test:watch

# Coverage raporu
npm test -- --coverage
```

**Test Gereksinimleri**:
- Yeni özellikler için test coverage en az %70
- Bug fix'ler için regression test
- Critical paths için %90+ coverage

## Kod Standartları

### TypeScript

```typescript
// ✅ İyi
interface QuestionProps {
  id: string;
  title: string;
  onPress: (id: string) => void;
}

function Question({ id, title, onPress }: QuestionProps): JSX.Element {
  return <Text onPress={() => onPress(id)}>{title}</Text>;
}

// ❌ Kötü
function Question({ id, title, onPress }) {
  return <Text onPress={() => onPress(id)}>{title}</Text>;
}
```

### React Patterns

```typescript
// ✅ İyi - Memoized component
const MemoizedList = React.memo(({ items }: Props) => {
  const renderItem = useCallback((item) => (
    <Item key={item.id} {...item} />
  ), []);

  return <FlatList data={items} renderItem={renderItem} />;
});

// ❌ Kötü - Unnecessary re-renders
function List({ items }) {
  return (
    <FlatList
      data={items}
      renderItem={(item) => <Item {...item} />}
    />
  );
}
```

### Naming Conventions

- **Components**: `PascalCase` - `QuestionCard.tsx`
- **Utilities**: `camelCase` - `formatDate.ts`
- **Constants**: `UPPER_SNAKE_CASE` - `API_BASE_URL`
- **Types/Interfaces**: `PascalCase` - `QuestionData`
- **Hooks**: `use` prefix - `useQuestions`

### File Organization

```typescript
// Component file structure
import React from 'react';
import { View, Text } from 'react-native';
// Other imports...

// Types
interface Props {
  // ...
}

// Component
export function MyComponent({ ...props }: Props) {
  // Hooks
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // ...
  }, []);
  
  // Handlers
  const handlePress = () => {
    // ...
  };
  
  // Render
  return (
    <View>
      {/* ... */}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  // ...
});
```

### Code Quality

```bash
# Auto-format kod
npm run format

# Linting errors'ı düzelt
npm run lint:fix

# Type check
npm run check:types
```

## Commit Mesajları

### Conventional Commits

Commit mesajları [Conventional Commits](https://www.conventionalcommits.org/) formatını kullanmalıdır:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: Yeni özellik
- `fix`: Bug fix
- `docs`: Dokümantasyon
- `style`: Code formatting (kod değişikliği yok)
- `refactor`: Code refactoring
- `test`: Test eklemeleri
- `chore`: Build, dependencies vb.

**Örnekler**:

```bash
# Yeni özellik
git commit -m "feat(reels): add swipe gesture for questions"

# Bug fix
git commit -m "fix(storage): resolve AsyncStorage race condition"

# Dokümantasyon
git commit -m "docs(api): update API documentation"

# Detaylı commit
git commit -m "feat(performance): add performance monitoring

- Add PerformanceMonitor utility
- Integrate with critical paths
- Add logging for slow operations

Closes #123"
```

### Commit Best Practices

- Küçük, focused commit'ler yapın
- Commit başına tek bir mantıksal değişiklik
- Clear ve descriptive mesajlar yazın
- İlgili issue'ları referans gösterin

## Pull Request Süreci

### 1. PR Hazırlığı

```bash
# Son değişiklikleri al
git fetch upstream
git rebase upstream/main

# Testleri çalıştır
npm run validate

# Push yap
git push origin feature/your-feature-name
```

### 2. PR Oluşturma

GitHub'da Pull Request oluştururken:

**Title**: Net ve açıklayıcı
```
feat: Add performance monitoring utilities
fix: Resolve AsyncStorage race condition
```

**Description Template**:
```markdown
## Açıklama
Bu PR'da neler değişti, kısa özet.

## Değişiklikler
- [ ] Yeni özellik eklendi
- [ ] Bug düzeltildi
- [ ] Dokümantasyon güncellendi
- [ ] Testler eklendi

## Test Edildi
- [ ] Unit testler geçti
- [ ] Manuel test yapıldı
- [ ] Mobil cihazda test edildi

## Screenshots (eğer UI değişikliği varsa)
Ekran görüntüleri ekleyin

## İlgili Issue
Closes #123

## Checklist
- [ ] Kod standartlarına uygun
- [ ] TypeScript hataları yok
- [ ] Testler yazıldı
- [ ] Dokümantasyon güncellendi
- [ ] Changelog güncellendi (major değişiklikler için)
```

### 3. Code Review

- Review feedback'leri sabırla bekleyin
- Constructive feedback'lere açık olun
- Requested changes'i yapın
- Review sonrası commit'lerinizi squash etmeyin (maintainer yapar)

### 4. Merge

PR approve edildikten sonra:
- Maintainer merge edecektir
- Commits squash edilebilir
- Branch otomatik silinecektir

## İyi Pratikler

### Performance

```typescript
// ✅ Memoization kullan
const ExpensiveComponent = React.memo(({ data }) => {
  const processed = useMemo(() => processData(data), [data]);
  const handler = useCallback(() => handleClick(), []);
  
  return <View>{/* ... */}</View>;
});

// ✅ FlatList optimization
<FlatList
  data={items}
  windowSize={10}
  removeClippedSubviews={true}
  getItemLayout={getItemLayout}
/>
```

### Error Handling

```typescript
// ✅ Proper error handling
try {
  const result = await apiClient.get('/endpoint');
  return result;
} catch (error) {
  logger.error('Failed to fetch data', error);
  if (error instanceof ApiError) {
    // Handle API errors
  }
  throw error;
}

// ✅ Error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <Component />
</ErrorBoundary>
```

### Security

```typescript
// ✅ Validation
const validated = validate(QuestionSchema, userInput);

// ✅ Environment variables
const apiKey = process.env.GEMINI_API_KEY;

// ❌ Hardcoded secrets
const apiKey = "AIzaSyCr6u1sXe..."; // NEVER!
```

## Dokümantasyon

### Code Documentation

```typescript
/**
 * Calculates the percentage score
 * @param correct - Number of correct answers
 * @param total - Total number of questions
 * @returns Percentage score (0-100)
 * @throws {Error} If total is 0
 */
function calculateScore(correct: number, total: number): number {
  if (total === 0) {
    throw new Error('Total cannot be zero');
  }
  return (correct / total) * 100;
}
```

### README Updates

Major özellikler eklendiğinde README.md'yi güncelleyin:
- Özellik listesi
- Kullanım örnekleri
- Yeni bağımlılıklar

### API Documentation

API değişiklikleri için `API_DOCUMENTATION.md`'yi güncelleyin.

## Sık Sorulan Sorular

### Q: Hangi issue'ları seçebilirim?
**A**: `good first issue` etiketli issue'lar başlangıç için uygundur. Büyük feature'lar için önce issue açın ve tartışın.

### Q: PR'ım ne kadar sürede review edilir?
**A**: Genellikle 1-3 gün içinde. Büyük PR'lar daha uzun sürebilir.

### Q: Test yazmak zorunlu mu?
**A**: Evet, yeni özellikler için test yazmak zorunludur. Bug fix'ler için regression test beklenir.

### Q: Dokümantasyon güncellemeli miyim?
**A**: Evet, özellikle API değişiklikleri, yeni özellikler ve behavior değişiklikleri için.

### Q: Branch'imi nasıl güncel tutarım?
**A**:
```bash
git fetch upstream
git rebase upstream/main
git push -f origin your-branch
```

## İletişim

- **GitHub Issues**: Bug reports ve feature requests
- **GitHub Discussions**: Sorular ve tartışmalar
- **Pull Requests**: Code contributions

## Davranış Kuralları

- Saygılı ve profesyonel olun
- Constructive feedback verin
- Farklı görüşlere açık olun
- Inclusive dil kullanın
- Başkalarının zamanına değer verin

## Lisans

Katkılarınız proje lisansı altında (özel proje) yayınlanacaktır.

---

**Teşekkürler!** 🎉

Katkılarınız YKS Boost'u daha iyi hale getiriyor. Her katkı, küçük veya büyük, değerlidir!

---

**Son Güncelleme**: 2026-02-05
