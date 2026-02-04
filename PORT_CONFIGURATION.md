# Port Yapılandırması (Port Configuration)

## Ana Port (Main Port)

**Port 8000** kullanmalısınız.

Bu, backend Express sunucusunun çalıştığı porttur ve uygulamanın ana giriş noktasıdır.

## Port Detayları

### Backend Server
- **Internal Port**: 8000
- **External Port**: 8000
- **Açıklama**: Express sunucusu bu portta çalışır ve tüm API isteklerini işler.

### Frontend (Expo Development Server)
- **Internal Port**: 5000
- **External Port**: 80 (HTTP)
- **Açıklama**: Expo geliştirme sunucusu bu portta çalışır

### Expo Ek Portları
- **Port**: 8081
- **Açıklama**: Expo metro bundler için alternatif port
- **Ports**: 19000-19002
- **Açıklama**: Expo metro bundler ve diğer geliştirme araçları için

## Kullanım

Uygulamaya erişmek için:
- **Backend API**: `http://localhost:8000` veya Replit URL ile port 8000
- **Frontend (Expo)**: `http://localhost:5000` veya Replit URL ile port 80
- **Geliştirme ortamında**: Frontend, backend'e `EXPO_PUBLIC_DOMAIN` ortam değişkeni üzerinden bağlanır

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

Bu yapılandırma, dahili 5000 portunu harici 80 (HTTP) portuna, dahili 8000 portunu harici 8000 portuna yönlendirir.
