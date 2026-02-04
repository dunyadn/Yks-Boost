# Port Yapılandırması (Port Configuration)

## Ana Port (Main Port)

**Port 5000** kullanmalısınız.

Bu, backend Express sunucusunun çalıştığı porttur ve uygulamanın ana giriş noktasıdır.

## Port Detayları

### Backend Server
- **Internal Port**: 5000
- **External Port**: 80 (HTTP)
- **Açıklama**: Express sunucusu bu portta çalışır ve tüm API isteklerini işler.

### Frontend (Expo Development Server)
- **Internal Port**: 8081
- **External Port**: 8081
- **Açıklama**: Expo geliştirme sunucusu (sadece geliştirme ortamı için)

### Expo Ek Portları
- **Ports**: 19000-19002
- **Açıklama**: Expo metro bundler ve diğer geliştirme araçları için

## Kullanım

Uygulamaya erişmek için:
- **Geliştirme ortamında**: `http://localhost:5000`
- **Replit üzerinde**: Replit tarafından sağlanan public URL üzerinden erişim

## Yapılandırma

Port yapılandırması `.replit` dosyasında tanımlanmıştır:
```toml
[[ports]]
localPort = 5000
externalPort = 80
```

Bu yapılandırma, dahili 5000 portunu harici 80 (HTTP) portuna yönlendirir.
