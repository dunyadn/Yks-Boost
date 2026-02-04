import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

export default function PDFUploadScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingState, setProcessingState] = useState<string>("");

  const handlePickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile({
          name: result.assets[0].name,
          uri: result.assets[0].uri,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error picking PDF:", error);
      Alert.alert("Hata", "PDF seçilirken bir sorun oluştu.");
    }
  };

  const getApiUrl = () => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    
    if (!domain) {
      console.error("❌ EXPO_PUBLIC_DOMAIN is not set!");
      Alert.alert(
        "Konfigürasyon Hatası",
        "API domain ayarlanmamış. Lütfen .env dosyasını kontrol edin veya uygulamayı yeniden başlatın."
      );
      throw new Error("EXPO_PUBLIC_DOMAIN is not set");
    }
    
    // Preserve http:// for localhost, otherwise add https://
    let url = domain;
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      // Check if localhost or 127.0.0.1 - keep HTTP for local development
      if (domain.includes('localhost') || domain.includes('127.0.0.1')) {
        url = `http://${domain}`;
      } else {
        url = `https://${domain}`;
      }
    }
    
    console.log("🌐 API URL:", url);
    return url;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert("Hata", "Lütfen bir PDF dosyası seçin.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setProcessingState("📄 PDF dosyası hazırlanıyor...");

    // Progress simulation interval
    let progressInterval: NodeJS.Timeout | null = null;

    // Timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error("⏰ Upload timeout triggered (60s)");
      controller.abort();
    }, 60000); // 60 seconds timeout

    try {
      console.log("📤 Starting upload:", selectedFile.name);
      console.log("📄 File URI:", selectedFile.uri);
      
      // Validate API URL
      const apiUrl = getApiUrl();
      const uploadUrl = `${apiUrl}/api/upload-pdf`;
      
      console.log("📡 Upload URL:", uploadUrl);

      // Start simulated progress
      setProcessingState("📄 PDF dosyası yükleniyor...");
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) return prev;
          return Math.min(prev + Math.random() * 10, 95);
        });
      }, 500);

      // Create FormData - React Native specific format
      const formData = new FormData();
      
      // React Native FormData accepts a file object with uri, type, and name
      // Using type assertion as the RN FormData typing differs from web
      formData.append("pdf", {
        uri: selectedFile.uri,
        type: "application/pdf",
        name: selectedFile.name,
      } as any);

      console.log("📦 FormData prepared");

      // Update processing state after delays
      setTimeout(() => setProcessingState("🤖 AI soruları algılıyor..."), 2000);
      setTimeout(() => setProcessingState("💾 Sorular kaydediliyor..."), 4000);

      console.log("🚀 Sending POST request...");
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json",
          // DON'T set Content-Type for FormData - fetch will set it with boundary
        },
        signal: controller.signal,
      });

      // Clear progress interval and set to 100%
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      setUploadProgress(100);

      console.log("📥 Response status:", response.status);
      console.log("📥 Response headers:", JSON.stringify([...response.headers.entries()]));

      // Parse response
      const responseText = await response.text();
      console.log("📥 Response body:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("❌ Failed to parse response as JSON:", responseText);
        throw new Error("Sunucu geçersiz yanıt döndürdü. Lütfen tekrar deneyin.");
      }

      if (!response.ok || !data.success) {
        console.error("❌ Upload failed:", data.error || `HTTP ${response.status}`);
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log("✅ Upload successful:", data);
      console.log(`✅ ${data.questionsAdded} questions added`);
      
      setProcessingState("✅ Tamamlandı!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        "Başarılı! 🎉",
        `${data.questionsAdded} soru başarıyla eklendi!\n\nReels sekmesinden soruları görebilirsiniz.`,
        [
          {
            text: "Tamam",
            onPress: () => {
              setSelectedFile(null);
              setUploadProgress(0);
              setProcessingState("");
            },
          },
        ],
      );
    } catch (error) {
      console.error("❌ Upload error:", error);

      // Clear progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      setProcessingState("❌ Hata oluştu");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage =
        "PDF yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage =
            "İşlem zaman aşımına uğradı (60 saniye). PDF çok büyük veya sunucu yanıt vermiyor. Lütfen daha küçük bir PDF deneyin.";
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert("Hata", errorMessage);
    } finally {
      clearTimeout(timeoutId);
      
      // Delay cleanup to show final state
      setTimeout(() => {
        setUploading(false);
        if (!selectedFile) {
          setProcessingState("");
          setUploadProgress(0);
        }
      }, 2000);

      // Final cleanup for progress interval
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setProcessingState("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: tabBarHeight }}
    >
      <Animated.View entering={FadeIn} style={styles.header}>
        <LinearGradient
          colors={[Colors.dark.primary, Colors.dark.secondary]}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="upload-cloud" size={48} color={Colors.dark.text} />
        </LinearGradient>
        <ThemedText style={styles.title}>PDF&apos;ten Soru Ekle</ThemedText>
        <ThemedText style={styles.subtitle}>
          YKS soru PDF&apos;i yükleyin, sorular otomatik olarak sisteme
          eklensin!
        </ThemedText>
      </Animated.View>

      <Animated.View entering={SlideInUp.delay(100)} style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Feather name="check-circle" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>
            Farklı formatlardaki soruları otomatik tanır
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Feather name="check-circle" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>
            AI ile akıllı soru ayrıştırma
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Feather name="check-circle" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>
            Maksimum dosya boyutu: 10 MB
          </ThemedText>
        </View>
      </Animated.View>

      {!selectedFile ? (
        <Animated.View entering={SlideInUp.delay(200)}>
          <Pressable style={styles.uploadArea} onPress={handlePickPDF}>
            <Feather
              name="file-plus"
              size={64}
              color={Colors.dark.textSecondary}
            />
            <ThemedText style={styles.uploadText}>PDF Seç</ThemedText>
            <ThemedText style={styles.uploadSubtext}>
              Dokunarak PDF dosyası seçin
            </ThemedText>
          </Pressable>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn} style={styles.fileCard}>
          <View style={styles.fileInfo}>
            <Feather name="file-text" size={32} color={Colors.dark.primary} />
            <View style={styles.fileDetails}>
              <ThemedText style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </ThemedText>
              <ThemedText style={styles.fileStatus}>Hazır</ThemedText>
            </View>
          </View>
          <Pressable onPress={handleRemoveFile} hitSlop={8}>
            <Feather
              name="x-circle"
              size={24}
              color={Colors.dark.textSecondary}
            />
          </Pressable>
        </Animated.View>
      )}

      {uploading && (
        <Animated.View entering={FadeIn} style={styles.progressContainer}>
          {processingState && (
            <ThemedText style={styles.processingStateText}>
              {processingState}
            </ThemedText>
          )}
          <ThemedText style={styles.progressText}>
            PDF işleniyor... {Math.round(uploadProgress)}%
          </ThemedText>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${uploadProgress}%` }]}
            />
          </View>
          <ActivityIndicator
            size="large"
            color={Colors.dark.primary}
            style={styles.loader}
          />
        </Animated.View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleUpload}
          disabled={!selectedFile || uploading}
          variant="primary"
        >
          {uploading ? "Yükleniyor..." : "Soruları Ekle"}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  infoCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  uploadArea: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.dark.textSecondary,
    padding: Spacing.xl * 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  uploadText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
    marginTop: Spacing.lg,
  },
  uploadSubtext: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.sm,
  },
  fileCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  fileStatus: {
    fontSize: 14,
    color: Colors.dark.primary,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  processingStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.primary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  progressText: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.primary,
  },
  loader: {
    marginTop: Spacing.lg,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
  },
});
