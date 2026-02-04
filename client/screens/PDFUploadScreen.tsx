import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

export default function PDFUploadScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePickPDF = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (max 10MB)
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert("Dosya Çok Büyük", "Lütfen 10MB'dan küçük bir PDF dosyası seçin.");
          return;
        }
        
        setSelectedFile(file);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Error picking PDF:", error);
      Alert.alert("Hata", "PDF dosyası seçilirken bir hata oluştu.");
    }
  };

  const handleUploadAndProcess = async () => {
    if (!selectedFile) {
      Alert.alert("Dosya Seçilmedi", "Lütfen önce bir PDF dosyası seçin.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const formData = new FormData();
      
      // Create file object for upload
      const fileToUpload: any = {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || "application/pdf",
        name: selectedFile.name,
      };
      
      formData.append("pdf", fileToUpload);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 300);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_DOMAIN}/api/upload-pdf`,
        {
          method: "POST",
          body: formData,
          headers: {
            // Don't set Content-Type for FormData, let the browser set it
          },
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        "Başarılı!",
        `${data.questionsAdded || 0} soru başarıyla eklendi.`,
        [
          {
            text: "Tamam",
            onPress: () => {
              setSelectedFile(null);
              setUploadProgress(0);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error uploading PDF:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Hata",
        "PDF işlenirken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.delay(100)}>
        <ThemedText style={styles.headerTitle}>PDF'ten Soru Ekle</ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          PDF dosyanızı yükleyin ve soruları otomatik olarak ekleyin.
        </ThemedText>
      </Animated.View>

      <Animated.View entering={SlideInUp.delay(200).springify()} style={styles.section}>
        <Pressable
          style={styles.uploadButton}
          onPress={handlePickPDF}
          disabled={uploading}
        >
          <LinearGradient
            colors={[Colors.dark.primary, "#0099CC"]}
            style={styles.uploadButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather
              name="upload-cloud"
              size={48}
              color={Colors.dark.text}
              style={styles.uploadIcon}
            />
            <ThemedText style={styles.uploadButtonText}>
              {selectedFile ? "Farklı PDF Seç" : "PDF Dosyası Seç"}
            </ThemedText>
            <ThemedText style={styles.uploadButtonSubtext}>
              Maksimum dosya boyutu: 10MB
            </ThemedText>
          </LinearGradient>
        </Pressable>
      </Animated.View>

      {selectedFile && (
        <Animated.View entering={FadeIn} style={styles.section}>
          <View style={styles.fileInfoCard}>
            <View style={styles.fileIconContainer}>
              <Feather name="file-text" size={24} color={Colors.dark.primary} />
            </View>
            <View style={styles.fileInfo}>
              <ThemedText style={styles.fileName} numberOfLines={1}>
                {selectedFile.name}
              </ThemedText>
              <ThemedText style={styles.fileSize}>
                {selectedFile.size
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "Bilinmeyen boyut"}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => setSelectedFile(null)}
              disabled={uploading}
              style={styles.removeButton}
            >
              <Feather name="x" size={20} color={Colors.dark.textSecondary} />
            </Pressable>
          </View>
        </Animated.View>
      )}

      {selectedFile && (
        <Animated.View entering={SlideInUp.delay(100).springify()} style={styles.section}>
          <Pressable
            style={[styles.processButton, uploading && styles.processButtonDisabled]}
            onPress={handleUploadAndProcess}
            disabled={uploading}
          >
            <LinearGradient
              colors={
                uploading
                  ? [Colors.dark.backgroundSecondary, Colors.dark.backgroundTertiary]
                  : [Colors.dark.success, "#00CC88"]
              }
              style={styles.processButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {uploading ? (
                <>
                  <ActivityIndicator size="small" color={Colors.dark.text} />
                  <ThemedText style={styles.processButtonText}>
                    İşleniyor... {uploadProgress}%
                  </ThemedText>
                </>
              ) : (
                <>
                  <Feather name="zap" size={24} color={Colors.dark.text} />
                  <ThemedText style={styles.processButtonText}>
                    İşle ve Soruları Ekle
                  </ThemedText>
                </>
              )}
            </LinearGradient>
          </Pressable>

          {uploading && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    { width: `${uploadProgress}%` },
                  ]}
                />
              </View>
            </View>
          )}
        </Animated.View>
      )}

      <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
        <View style={styles.infoCard}>
          <Feather name="info" size={20} color={Colors.dark.primary} />
          <View style={styles.infoTextContainer}>
            <ThemedText style={styles.infoTitle}>Nasıl Çalışır?</ThemedText>
            <ThemedText style={styles.infoText}>
              • PDF dosyanızı seçin{"\n"}
              • Yapay zeka otomatik olarak soruları algılar{"\n"}
              • Sorular veritabanına eklenir{"\n"}
              • Reels bölümünde görüntülenebilir
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(350)} style={styles.section}>
        <View style={styles.tipCard}>
          <Feather name="alert-circle" size={20} color={Colors.dark.accent} />
          <View style={styles.infoTextContainer}>
            <ThemedText style={styles.tipTitle}>İpucu</ThemedText>
            <ThemedText style={styles.tipText}>
              En iyi sonuçlar için PDF'inizin net ve okunabilir olduğundan emin olun.
              Desteklenen formatlar: Çoktan seçmeli sorular.
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing["2xl"],
  },
  section: {
    marginBottom: Spacing.lg,
  },
  uploadButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  uploadButtonGradient: {
    padding: Spacing["3xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIcon: {
    marginBottom: Spacing.md,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  uploadButtonSubtext: {
    fontSize: 14,
    color: Colors.dark.text,
    opacity: 0.7,
  },
  fileInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.dark.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  fileSize: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  processButton: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  processButtonDisabled: {
    opacity: 0.7,
  },
  processButtonGradient: {
    padding: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  processButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  progressBarContainer: {
    marginTop: Spacing.md,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.dark.success,
    borderRadius: BorderRadius.full,
  },
  infoCard: {
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: Colors.dark.primary + "15",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.primary + "30",
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.dark.text,
  },
  tipCard: {
    flexDirection: "row",
    gap: Spacing.md,
    backgroundColor: Colors.dark.accent + "15",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.accent + "30",
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.dark.text,
  },
});
