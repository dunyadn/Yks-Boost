# Replit Expo Development Setup

Bu dokuman, Replit üzerinde Expo uygulamasını çalıştırmak ve Expo Go ile test etmek için gerekli adımları açıklar.

## Port Konfigürasyonu

Aşağıdaki portlar Replit'te yapılandırılmıştır:

- **5000**: Backend API sunucusu
- **8081**: Expo Metro bundler
- **19000-19002**: Expo geliştirme sunucusu portları

## Replit'te Çalıştırma

1. Replit'te "Run" butonuna basın
2. Uygulama otomatik olarak şu servisleri başlatacak:
   - Backend server (port 5000)
   - Expo development server (port 8081)

## Expo Go ile Bağlanma

### Yöntem 1: Tunnel Kullanarak (Önerilen)

Expo development server `--tunnel` flag'i ile çalışır. Bu sayede:

1. Expo Go uygulamasını telefonunuzda açın
2. "Enter URL manually" seçeneğini seçin
3. Replit'in verdiği URL'yi girin veya QR kodu tarayın
4. Tunnel bağlantısı otomatik olarak kurulacaktır

### Yöntem 2: Manuel Bağlantı

Eğer tunnel çalışmazsa:

1. Replit'in verdiği external URL'yi kullanın
2. Format: `exp://[REPLIT_DEV_DOMAIN]:8081`

## Hata Giderme

### "The app is running, but has no external ports configured" Hatası

Bu hata çözüldü. Değişiklikler:
- Expo dev server artık `0.0.0.0` IP'sine bind oluyor (localhost yerine)
- `--tunnel` flag'i eklendi
- Portlar doğru şekilde expose ediliyor

### "Something went wrong" Expo Go Hatası

Eğer Expo Go hala bağlanamıyorsa:

1. Tunnel bağlantısının kurulduğundan emin olun
2. Expo CLI çıktısında QR kodunu kontrol edin
3. Telefonunuzun internet bağlantısını kontrol edin
4. Replit'in portlarının aktif olduğunu kontrol edin

### Port Erişimi Kontrol

Portların açık olduğunu kontrol etmek için:

```bash
# Backend sunucu kontrolü
curl https://[REPLIT_DEV_DOMAIN]:5000/api/health

# Expo dev server kontrolü (Replit webview'da)
https://[REPLIT_DEV_DOMAIN]:8081
```

## Geliştirme İpuçları

1. **Hot Reload**: Kod değişiklikleri otomatik olarak Expo Go'da yansıyacaktır
2. **Debugging**: Expo Go'da "shake" yaparak developer menüyü açabilirsiniz
3. **Network**: Hem telefon hem de Replit internet bağlantısı gereklidir

## Ek Bilgiler

- Development mode'da uygulama yavaş çalışabilir
- Production build için `npm run expo:static:build` kullanın
- Backend ve frontend paralel olarak çalışır
