# YKS Boost - Mimari Dokümantasyon

## 📐 Mimari Genel Bakış

YKS Boost, modern bir mobil-first uygulama mimarisi kullanır. Uygulama üç ana katmandan oluşur:

1. **Presentation Layer** (Client - React Native)
2. **Business Logic Layer** (Client Utils & Hooks)
3. **Data Layer** (Server + AsyncStorage)

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Native Components & Screens)    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Business Logic Layer               │
│  (Custom Hooks, Utils, Validators)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Data Layer                    │
│  (AsyncStorage, Express API, Database)  │
└─────────────────────────────────────────┘
```

## 🏗️ Katman Yapısı

### 1. Presentation Layer

**Sorumluluklar**:
- UI renderlaması
- User interaction yönetimi
- Navigation
- Visual feedback

**Teknolojiler**:
- React Native 0.81.5
- React Navigation 7+
- Reanimated 4.1
- Expo 54

**Klasör Yapısı**:
```
client/
├── components/      # Reusable UI components
├── screens/         # Screen components
├── navigation/      # Navigation config
└── constants/       # Theme & constants
```

**Design Patterns**:
- **Component Composition**: Küçük, yeniden kullanılabilir bileşenler
- **Container/Presentational**: Logic ve UI ayrımı
- **Render Props**: Flexible component API'leri

### 2. Business Logic Layer

**Sorumluluklar**:
- Data validation
- Business rules
- API communication
- Performance monitoring
- Error handling
- Logging

**Teknolojiler**:
- React Query (server state)
- AsyncStorage (local state)
- Zod (validation)
- Custom utilities

**Klasör Yapısı**:
```
client/
├── hooks/           # Custom React hooks
├── lib/            # Core utilities
└── utils/          # Helper utilities
    ├── logger.ts
    ├── performance.ts
    ├── apiClient.ts
    └── validation.ts
```

**Design Patterns**:
- **Repository Pattern**: Data access abstraction
- **Facade Pattern**: Simplified API interfaces
- **Strategy Pattern**: Configurable behaviors
- **Singleton Pattern**: Shared instances (logger, apiClient)

### 3. Data Layer

**Sorumluluklar**:
- Data persistence
- API endpoints
- Database operations
- File storage

**Teknolojiler**:
- Express.js 5.0
- PostgreSQL 16
- Drizzle ORM
- AsyncStorage

**Klasör Yapısı**:
```
server/
├── index.ts        # Server entry point
├── routes.ts       # API routes
├── storage.ts      # Data storage
└── db/            # Database config
```

## 🔄 Data Flow

### Veri Akış Diyagramı

```
User Action
    │
    ▼
Component Event Handler
    │
    ▼
Custom Hook (useQuery/useMutation)
    │
    ├──► Cache Check (React Query)
    │    │
    │    ├──► HIT: Return cached data
    │    │
    │    └──► MISS ──┐
    │                │
    ▼                ▼
API Client ◄─────────┘
    │
    ├──► Retry Logic
    │
    ├──► Error Handling
    │
    ▼
Express Server
    │
    ├──► Validation
    │
    ├──► Business Logic
    │
    ▼
Database / AsyncStorage
    │
    ▼
Response
    │
    ▼
Update Cache
    │
    ▼
Re-render Component
```

### Örnek: Soru Yükleme

```typescript
// 1. Component
function ReelsScreen() {
  const { data, isLoading } = useQuestions();
  // ...
}

// 2. Custom Hook
function useQuestions() {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      return await getQuestions(); // localStorage'dan
    }
  });
}

// 3. Data Access
async function getQuestions(): Promise<Question[]> {
  const data = await AsyncStorage.getItem('questions');
  return JSON.parse(data || '[]');
}
```

## 🔐 Security Architecture

### Güvenlik Katmanları

1. **Input Validation**
   ```typescript
   // Zod schemas ile runtime validation
   const validData = validate(QuestionSchema, userInput);
   ```

2. **API Security**
   - CORS configuration
   - Rate limiting (önerilir)
   - Request validation
   - Error sanitization

3. **Data Protection**
   - Environment variables için .env
   - Sensitive data encryption (önerilir)
   - Secure storage patterns

4. **Code Security**
   - TypeScript strict mode
   - ESLint security rules
   - Dependency scanning

### Security Best Practices

```typescript
// ❌ YANLIŞ
const apiKey = "my-secret-key";

// ✅ DOĞRU
const apiKey = process.env.GEMINI_API_KEY;

// ❌ YANLIŞ
function unsafeQuery(userInput: string) {
  return db.query(`SELECT * FROM users WHERE name = '${userInput}'`);
}

// ✅ DOĞRU
function safeQuery(userInput: string) {
  const validated = validate(UserNameSchema, userInput);
  return db.query({ name: validated });
}
```

## ⚡ Performance Architecture

### Performance Optimization Strategies

1. **React Optimization**
   - Memoization (React.memo, useMemo, useCallback)
   - Virtual scrolling (FlatList)
   - Code splitting
   - Lazy loading

2. **Network Optimization**
   - Request caching (React Query)
   - Automatic retry
   - Request deduplication
   - Optimistic updates

3. **Asset Optimization**
   - Image caching (expo-image)
   - Lazy image loading
   - Asset preloading

4. **Bundle Optimization**
   - Tree shaking
   - Minification
   - Compression

### Performance Monitoring

```typescript
import { performanceMonitor } from '@/utils/performance';

// Track critical operations
async function loadInitialData() {
  return await performanceMonitor.measure('initial-load', async () => {
    const [questions, stats, packages] = await Promise.all([
      getQuestions(),
      getStats(),
      getPackages(),
    ]);
    return { questions, stats, packages };
  });
}
```

## 🎨 UI/UX Architecture

### Design System

**Theme Structure**:
```typescript
const Colors = {
  dark: {
    background: '#0A0A0F',
    primary: '#00E5FF',
    secondary: '#B620E0',
    accent: '#FF006E',
    success: '#00E676',
    // ...
  }
};
```

**Component Hierarchy**:
```
App
├── NavigationContainer
│   ├── RootStackNavigator
│   │   ├── MainTabNavigator
│   │   │   ├── ReelsScreen
│   │   │   ├── LibraryScreen
│   │   │   ├── ProfileScreen
│   │   │   └── ...
│   │   └── CommunityScreen
```

### Accessibility

- Semantic HTML-like components
- ARIA labels (accessibility hints)
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

## 📊 State Management

### State Kategorileri

1. **Server State** (React Query)
   - API'den gelen data
   - Cache management
   - Background updates

2. **Local State** (useState)
   - Component-specific state
   - Form inputs
   - UI state

3. **Persistent State** (AsyncStorage)
   - User preferences
   - Questions
   - Statistics
   - Saved items

4. **Navigation State** (React Navigation)
   - Current screen
   - Navigation history
   - Route params

### State Flow

```typescript
// Server State
const { data: questions } = useQuery(['questions'], fetchQuestions);

// Local State
const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

// Persistent State
const saveToStorage = async (key: string, value: unknown) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

// Navigation State
navigation.navigate('ReelsScreen', { questionId: '123' });
```

## 🧪 Testing Architecture

### Test Pyramid

```
        ┌─────────────┐
        │   E2E Tests │  (Az)
        ├─────────────┤
        │ Integration │  (Orta)
        │    Tests    │
        ├─────────────┤
        │ Unit Tests  │  (Çok)
        └─────────────┘
```

### Test Stratejisi

1. **Unit Tests**
   - Utils ve helper functions
   - Custom hooks
   - Validation logic
   - Business logic

2. **Component Tests**
   - UI components
   - User interactions
   - Rendering logic

3. **Integration Tests**
   - API integration
   - Navigation flow
   - Data flow

### Test Coverage Hedefleri

- **Critical Paths**: 90%+
- **Business Logic**: 80%+
- **UI Components**: 70%+
- **Overall**: 75%+

## 🚀 Deployment Architecture

### Build Process

```
Source Code
    │
    ▼
TypeScript Compilation
    │
    ▼
Bundling (Metro/esbuild)
    │
    ▼
Optimization
    │
    ├──► Minification
    ├──► Tree shaking
    └──► Code splitting
    │
    ▼
Static Assets
    │
    ▼
Deployment
```

### Environment Configurations

- **Development**: Debug enabled, verbose logging
- **Staging**: Production-like, limited logging
- **Production**: Optimized, error logging only

## 📈 Scalability Considerations

### Current Architecture

- AsyncStorage (single device)
- Local-first approach
- Offline capability

### Future Scalability

1. **Backend Scaling**
   - Database connection pooling
   - API rate limiting
   - CDN for assets
   - Load balancing

2. **Frontend Scaling**
   - Code splitting
   - Progressive loading
   - Service workers (web)
   - Background sync

3. **Data Scaling**
   - Pagination
   - Virtual scrolling
   - Incremental loading
   - Database indexing

## 🔧 Development Tools

### Code Quality Tools

- **TypeScript**: Type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing framework

### Monitoring Tools

- **Logger**: Centralized logging
- **Performance Monitor**: Performance tracking
- **React DevTools**: Component inspection
- **Expo DevTools**: Mobile debugging

### Build Tools

- **Metro**: React Native bundler
- **esbuild**: Server bundling
- **Drizzle Kit**: Database migrations

## 📝 Best Practices Summary

1. **Separation of Concerns**: Her katman kendi sorumluluğuna odaklanmalı
2. **Type Safety**: TypeScript strict mode kullan
3. **Error Handling**: Her seviyede uygun error handling
4. **Performance**: Memoization ve optimization stratejileri
5. **Testing**: Comprehensive test coverage
6. **Security**: Input validation ve secure practices
7. **Documentation**: Code ve architecture documentation
8. **Monitoring**: Logging ve performance tracking

## 🎯 Future Improvements

1. **Backend Migration**: AsyncStorage → PostgreSQL
2. **Real-time Updates**: WebSocket integration
3. **Advanced Caching**: Redis cache layer
4. **Microservices**: Service separation
5. **CI/CD Pipeline**: Automated testing & deployment
6. **Analytics**: User behavior tracking
7. **Error Tracking**: Sentry integration
8. **Performance Monitoring**: APM integration

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-05
