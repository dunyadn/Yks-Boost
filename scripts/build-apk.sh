#!/bin/bash
# YKS Reels - Android APK Build Script
# Bu script, YKS Reels uygulamasının Android APK dosyasını oluşturur.

set -e

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           YKS Reels - Android APK Build Script               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Gerekli araçları kontrol et
check_requirements() {
    echo -e "${YELLOW}📋 Gereksinimler kontrol ediliyor...${NC}"
    
    # Node.js kontrolü
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js bulunamadı. Lütfen Node.js'i yükleyin.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js: $(node --version)${NC}"
    
    # npm kontrolü
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm bulunamadı.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ npm: $(npm --version)${NC}"
    
    # EAS CLI kontrolü
    if ! command -v eas &> /dev/null; then
        echo -e "${YELLOW}⚠️ EAS CLI bulunamadı. Yükleniyor...${NC}"
        npm install -g eas-cli
    fi
    echo -e "${GREEN}✓ EAS CLI yüklü${NC}"
    
    echo ""
}

# EAS Build ile APK oluştur
build_with_eas() {
    echo -e "${BLUE}🔨 EAS Build ile APK oluşturuluyor...${NC}"
    echo ""
    
    # EAS login kontrolü
    if ! eas whoami &> /dev/null; then
        echo -e "${YELLOW}📝 EAS'a giriş yapmanız gerekiyor...${NC}"
        eas login
    fi
    
    # Build başlat
    echo -e "${BLUE}🚀 Build başlatılıyor...${NC}"
    eas build --platform android --profile preview --non-interactive
    
    echo ""
    echo -e "${GREEN}✅ Build tamamlandı!${NC}"
    echo -e "${YELLOW}📥 APK dosyasını expo.dev'den indirebilirsiniz.${NC}"
}

# Lokal build ile APK oluştur
build_local() {
    echo -e "${BLUE}🔨 Lokal build ile APK oluşturuluyor...${NC}"
    echo ""
    
    # ANDROID_HOME kontrolü
    if [ -z "$ANDROID_HOME" ]; then
        echo -e "${RED}❌ ANDROID_HOME ortam değişkeni ayarlanmamış.${NC}"
        echo -e "${YELLOW}Lütfen Android SDK yolunu ayarlayın:${NC}"
        echo "export ANDROID_HOME=\$HOME/Android/Sdk"
        exit 1
    fi
    echo -e "${GREEN}✓ Android SDK: $ANDROID_HOME${NC}"
    
    # Android projesi oluştur
    echo -e "${BLUE}📦 Android projesi oluşturuluyor...${NC}"
    npx expo prebuild --platform android --clean
    
    # APK derle
    echo -e "${BLUE}🔧 Release APK derleniyor...${NC}"
    cd android
    ./gradlew assembleRelease
    
    # APK dosyasını bul ve kopyala
    APK_PATH=$(find . -name "*.apk" -type f | head -1)
    if [ -n "$APK_PATH" ]; then
        cp "$APK_PATH" ../yksreels.apk
        echo -e "${GREEN}✅ APK oluşturuldu: yksreels.apk${NC}"
    else
        echo -e "${RED}❌ APK dosyası bulunamadı.${NC}"
        exit 1
    fi
    
    cd ..
}

# Ana menü
main() {
    check_requirements
    
    echo -e "${YELLOW}Build yöntemi seçin:${NC}"
    echo "1) EAS Build (Bulut tabanlı - önerilen)"
    echo "2) Lokal Build (Android SDK gerektirir)"
    echo ""
    read -p "Seçiminiz (1/2): " choice
    
    case $choice in
        1)
            build_with_eas
            ;;
        2)
            build_local
            ;;
        *)
            echo -e "${RED}Geçersiz seçim.${NC}"
            exit 1
            ;;
    esac
}

# Bağımlılıkları yükle
echo -e "${BLUE}📦 Bağımlılıklar kontrol ediliyor...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⏳ npm install çalıştırılıyor...${NC}"
    npm install
fi
echo ""

main
