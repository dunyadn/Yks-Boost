import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import * as DocumentPicker from "expo-document-picker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

export default function PDFUploadScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert("Hata", "Lütfen bir PDF dosyası seçin.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("pdf", {
        uri: selectedFile.uri,
        type: "application/pdf",
        name: selectedFile.name,
      } as any);

      const response = await fetch(`${process.env.EXPO_PUBLIC_DOMAIN}/api/upload-pdf`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Yükleme başarısız");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Başarılı! 🎉",
        `${data.questionsAdded} soru başarıyla eklendi!\n\nReels sekmesinden soruları görebilirsiniz.",
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
      console.error("Upload error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Hata",
        error instanceof Error ? error.message : "PDF yüklenirken bir sorun oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
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
        <ThemedText style={styles.title}>PDF'ten Soru Ekle</ThemedText>
        <ThemedText style={styles.subtitle}>
          YKS soru PDF'i yükleyin, sorular otomatik olarak sisteme eklensin!
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
            <Feather name="file-plus" size={64} color={Colors.dark.textSecondary} />
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
            <Feather name="x-circle" size={24} color={Colors.dark.textSecondary} />
          </Pressable>
        </Animated.View>
      )}

      {uploading && (
        <Animated.View entering={FadeIn} style={styles.progressContainer}>
          <ThemedText style={styles.progressText}>
            PDF işleniyor... {Math.round(uploadProgress)}%
          </ThemedText>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${uploadProgress}%` },
              ]}
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
          title={uploading ? "Yükleniyor..." : "Soruları Ekle"}
          onPress={handleUpload}
          disabled={!selectedFile || uploading}
          variant="primary"
          icon={uploading ? undefined : "upload"}
        />
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