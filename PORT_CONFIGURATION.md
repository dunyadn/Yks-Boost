# Port Yapılandırması (Port Configuration)

## Ana Port (Main Port)

**Development ortamında:**
- Backend API: Port 8000
- Frontend (Expo): Port 5000

**Production ortamında:**
- Express server (static frontend + API): Port 5000

## Port Detayları

### Development Environment

#### Backend Server (Development)
- **Internal Port**: 8000
- **External Port**: 8000
- **Açıklama**: Express API sunucusu bu portta çalışır (sadece API isteklerini işler)

#### Frontend (Expo Development Server)
- **Internal Port**: 5000
- **External Port**: 80 (HTTP)
- **Açıklama**: Expo geliştirme sunucusu bu portta çalışır ve backend'e (port 8000) bağlanır

### Production Environment

#### Express Server (Production)
- **Internal Port**: 5000
- **External Port**: 80 (HTTP)
- **Açıklama**: Express sunucusu hem statik frontend dosyalarını hem de API isteklerini tek portta sunar

### Expo Ek Portları
- **Port**: 8081
- **Açıklama**: Expo metro bundler için alternatif port
- **Ports**: 19000-19002
- **Açıklama**: Expo metro bundler ve diğer geliştirme araçları için

## Kullanım

### Development ortamında:
- **Backend API**: `http://localhost:8000` veya Replit URL ile port 8000
- **Frontend (Expo)**: `http://localhost:5000` veya Replit URL ile port 80
- Frontend, backend'e `EXPO_PUBLIC_DOMAIN` ortam değişkeni üzerinden bağlanır (port 8000)

### Production ortamında:
- **Uygulama**: Replit URL (port 80) - Express server hem static frontend hem de API'yi sunar

## Yapılandırma

Port yapılandırması `.replit` dosyasında tanımlanmıştır:
```toml
[[ports]]
localPort = 5000
externalPort = 80

[[ports]]
localPort = 8000
externalPort = 8000
```

Development workflow'ları:
- Backend: `PORT=8000 NODE_ENV=development tsx server/index.ts`
- Frontend: `EXPO_PUBLIC_DOMAIN=$REPLIT_DEV_DOMAIN:8000 npx expo start --port 5000`

Production deployment:
- Server: `NODE_ENV=production node server_dist/index.js` (PORT=5000 from env)
