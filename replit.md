# YKS Sosyal - Mobil Uygulama

## Proje Özeti
YKS öğrencileri için soru odaklı sosyal medya platformu. Video paylaşımı olmadan, soru ve çözüm paylaşımına odaklanan modern bir mobil uygulama.

## Teknoloji Yığını
- **Frontend:** React Native + Expo
- **Backend:** Express.js
- **Navigasyon:** React Navigation 7+
- **State Management:** React Query + useState
- **UI Components:** Custom components with Reanimated animations
- **Fonts:** Nunito (Google Fonts)

## Tasarım Dili
- **Tema:** Koyu (Dark mode only)
- **Arka Plan:** #0A0A0F (koyu lacivert)
- **Birincil Renk:** #00E5FF (neon mavi)
- **İkincil Renk:** #B620E0 (neon mor)
- **Vurgu Renk:** #FF006E (neon pembe/kırmızı)
- **Başarı:** #00E676 (yeşil)

## Uygulama Yapısı

### Ekranlar
1. **Ana Sayfa (HomeScreen)** - Selamlama, aksiyon kartları, son sorular, istatistikler
2. **YKS Reels (ReelsScreen)** - Dikey kaydırmalı soru akışı, tıklanabilir şıklar
3. **Soru Ekle (AddQuestionScreen)** - Modal form ile soru paylaşımı
4. **Görevlerim (TasksScreen)** - Çalışma görevleri ve ilerleme takibi
5. **Kütüphane (LibraryScreen)** - Kayıtlı sorular, filtreleme
6. **Topluluk (CommunityScreen)** - Telegram benzeri sohbet sistemi
7. **Profil (ProfileScreen)** - Kullanıcı profili, rozetler, istatistikler

### Navigasyon
- **MainTabNavigator:** 5 sekme (Ana Sayfa, Reels, +Ekle, Görevler, Kütüphane)
- **RootStackNavigator:** Ana tab navigator + Modal ekranlar

## Dosya Yapısı
```
client/
├── App.tsx                    # Ana uygulama bileşeni
├── components/
│   ├── ActionCard.tsx         # Gradient arka planlı aksiyon kartı
│   ├── Button.tsx             # Özelleştirilebilir buton
│   ├── Card.tsx               # Genel kart bileşeni
│   ├── CommunityItem.tsx      # Sohbet listesi öğesi
│   ├── EmptyState.tsx         # Boş durum gösterimi
│   ├── IconButton.tsx         # İkon buton
│   ├── QuestionCard.tsx       # Soru kartı
│   ├── ReelsActionButton.tsx  # Reels aksiyon butonu
│   ├── SectionHeader.tsx      # Bölüm başlığı
│   ├── SubjectCard.tsx        # Ders kartı
│   ├── Tag.tsx                # Etiket bileşeni
│   ├── TaskCard.tsx           # Görev kartı
│   └── ThemedText.tsx         # Temalı metin
├── constants/
│   └── theme.ts               # Renkler, boşluklar, tipografi
├── hooks/
│   ├── useScreenOptions.ts    # Ekran seçenekleri
│   └── useTheme.ts            # Tema hook'u
├── navigation/
│   ├── HomeStackNavigator.tsx
│   ├── LibraryStackNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── ProfileStackNavigator.tsx
│   ├── ReelsStackNavigator.tsx
│   ├── RootStackNavigator.tsx
│   └── TasksStackNavigator.tsx
└── screens/
    ├── AddQuestionScreen.tsx
    ├── CommunityScreen.tsx
    ├── HomeScreen.tsx
    ├── LibraryScreen.tsx
    ├── ProfileScreen.tsx
    ├── ReelsScreen.tsx
    └── TasksScreen.tsx
```

## Özellikler

### YKS Reels (Temel Özellik)
- Dikey kaydırmalı tam ekran soru kartları
- Tıklanabilir A-B-C-D-E şıkları
- Cevap seçildiğinde:
  - Doğru cevap yeşil renkte gösterilir
  - Yanlış seçim kırmızı renkte gösterilir
  - Çözüm otomatik olarak görünür
- Beğen, yorum, kaydet, paylaş aksiyonları
- Haptic geri bildirim

### Görevler
- Çalışma hedefleri oluşturma
- İlerleme takibi
- Tamamlama işaretleme

### Kütüphane
- Kayıtlı soruları görüntüleme
- Ders bazlı filtreleme

## Geliştirme

### Workflow'lar
- `Start Backend`: Express sunucusunu başlatır (port 5000)
- `Start Frontend`: Expo dev sunucusunu başlatır (port 8081)

### Test Etme
- Web: http://localhost:8081
- Mobil: Expo Go ile QR kod tarayarak

## Güncellemeler
- 2026-02-03: İlk MVP oluşturuldu
  - Tüm ana ekranlar tasarlandı
  - YKS Reels tıklanabilir şıklar eklendi
  - Koyu tema uygulandı
  - Neon renk paleti kullanıldı
