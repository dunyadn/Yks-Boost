import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";
import { savePackage, saveQuestions } from "@/lib/localStorage";
import type { InsertQuestion } from "@shared/schema";

// Örnek JSON formatı
const EXAMPLE_JSON = `{
  "packageName": "TYT 2025 Türkçe",
  "examType": "TYT",
  "year": 2025,
  "description": "2025 TYT Türkçe Soruları",
  "questions": [
    {
      "content": "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",
      "options": [
        "Kitabı okumak için sabırsızlanıyordum.",
        "Bu konuda hiç bir şey bilmiyorum.",
        "Öğretmenimiz bugün gelmedi.",
        "Yarın erken kalkmalıyız.",
        "Hava bugün çok güzel."
      ],
      "correctAnswer": "B",
      "category": "Türkçe",
      "subject": "Yazım Kuralları"
    },
    {
      "content": "Paragrafta geçen 'sağaltıcı' sözcüğünün anlamı nedir?",
      "options": [
        "Tedavi edici",
        "Koruyucu",
        "Geliştirici",
        "Eğitici",
        "Yıkıcı"
      ],
      "correctAnswer": "A",
      "category": "Türkçe",
      "subject": "Sözcük Anlamı"
    }
  ]
}`;

export default function PDFUploadScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();

  const [jsonInput, setJsonInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showExample, setShowExample] = useState(true);

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      Alert.alert("Hata", "Lütfen JSON formatında soru verisi girin.");
      return;
    }

    // Validate JSON
    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch {
      Alert.alert("Hata", "Geçersiz JSON formatı. Lütfen kontrol edin.");
      return;
    }

    if (
      !parsedData.packageName ||
      !parsedData.examType ||
      !parsedData.questions
    ) {
      Alert.alert(
        "Hata",
        "JSON formatında packageName, examType ve questions alanları gereklidir.",
      );
      return;
    }

    if (
      !Array.isArray(parsedData.questions) ||
      parsedData.questions.length === 0
    ) {
      Alert.alert("Hata", "En az bir soru eklemelisiniz.");
      return;
    }

    setUploading(true);

    try {
      // Create the package
      const pkg = await savePackage({
        name: parsedData.packageName,
        examType: parsedData.examType,
        year: parsedData.year || null,
        description: parsedData.description || null,
      });

      // Add questions with package reference
      const insertQuestions: InsertQuestion[] = parsedData.questions.map(
        (q: any) => ({
          content: q.content || q.soru || q.question || "",
          options: q.options || q.secenekler || q.siklar || [],
          correctAnswer: q.correctAnswer || q.dogruCevap || q.cevap || "A",
          category: q.category || q.ders || q.konu || "Genel",
          subject: q.subject || q.altKonu || null,
          packageId: pkg.id,
          examType: parsedData.examType,
        }),
      );

      const createdQuestions = await saveQuestions(insertQuestions);

      console.log(
        `✅ Imported ${createdQuestions.length} questions to package: ${parsedData.packageName}`,
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Başarılı! 🎉",
        `"${pkg.name}" paketine ${createdQuestions.length} soru eklendi!\n\nReels sekmesinden soruları görebilirsiniz.`,
        [
          {
            text: "Tamam",
            onPress: () => {
              setJsonInput("");
            },
          },
        ],
      );
    } catch (error) {
      console.error("Error importing questions:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Hata",
        error instanceof Error
          ? error.message
          : "Sorular eklenirken hata oluştu. Lütfen JSON formatını kontrol edin.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleUseExample = () => {
    setJsonInput(EXAMPLE_JSON);
    setShowExample(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClearInput = () => {
    setJsonInput("");
    setShowExample(true);
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
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View entering={FadeIn} style={styles.header}>
        <LinearGradient
          colors={[Colors.dark.primary, Colors.dark.secondary]}
          style={styles.iconContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="file-text" size={48} color={Colors.dark.text} />
        </LinearGradient>
        <ThemedText style={styles.title}>JSON ile Soru Ekle</ThemedText>
        <ThemedText style={styles.subtitle}>
          Soru paketlerini JSON formatında ekleyin ve istatistiklerini takip
          edin!
        </ThemedText>
      </Animated.View>

      <Animated.View entering={SlideInUp.delay(100)} style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Feather name="package" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>
            Soru paketleri oluşturun (örn: TYT 2025)
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Feather name="bar-chart-2" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>
            Paket bazlı başarı istatistikleri
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Feather name="clock" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>Çözüm süresi takibi</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Feather name="target" size={20} color={Colors.dark.primary} />
          <ThemedText style={styles.infoText}>
            Konu bazlı yanlış analizi
          </ThemedText>
        </View>
      </Animated.View>

      {showExample && (
        <Animated.View
          entering={SlideInUp.delay(200)}
          style={styles.exampleSection}
        >
          <View style={styles.exampleHeader}>
            <ThemedText style={styles.exampleTitle}>
              📋 Örnek JSON Formatı
            </ThemedText>
            <Pressable onPress={handleUseExample} style={styles.useExampleBtn}>
              <ThemedText style={styles.useExampleText}>Kullan</ThemedText>
            </Pressable>
          </View>
          <ScrollView
            style={styles.exampleBox}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            <ThemedText style={styles.exampleCode}>{EXAMPLE_JSON}</ThemedText>
          </ScrollView>
        </Animated.View>
      )}

      <Animated.View
        entering={SlideInUp.delay(300)}
        style={styles.inputSection}
      >
        <View style={styles.inputHeader}>
          <ThemedText style={styles.inputLabel}>JSON Verisi</ThemedText>
          {jsonInput.length > 0 && (
            <Pressable onPress={handleClearInput}>
              <Feather
                name="x-circle"
                size={20}
                color={Colors.dark.textSecondary}
              />
            </Pressable>
          )}
        </View>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="JSON formatında soru verisi yapıştırın..."
          placeholderTextColor={Colors.dark.textSecondary}
          value={jsonInput}
          onChangeText={setJsonInput}
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Animated.View>

      {uploading && (
        <Animated.View entering={FadeIn} style={styles.progressContainer}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
          <ThemedText style={styles.progressText}>
            Sorular ekleniyor...
          </ThemedText>
        </Animated.View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleImport}
          disabled={!jsonInput.trim() || uploading}
          variant="primary"
        >
          {uploading ? "Ekleniyor..." : "Soruları Ekle"}
        </Button>
      </View>

      <Animated.View entering={FadeIn.delay(400)} style={styles.helpSection}>
        <ThemedText style={styles.helpTitle}>📌 JSON Alanları</ThemedText>
        <View style={styles.helpItem}>
          <ThemedText style={styles.helpField}>packageName</ThemedText>
          <ThemedText style={styles.helpDesc}>Paket adı (zorunlu)</ThemedText>
        </View>
        <View style={styles.helpItem}>
          <ThemedText style={styles.helpField}>examType</ThemedText>
          <ThemedText style={styles.helpDesc}>
            TYT veya AYT (zorunlu)
          </ThemedText>
        </View>
        <View style={styles.helpItem}>
          <ThemedText style={styles.helpField}>year</ThemedText>
          <ThemedText style={styles.helpDesc}>
            Sınav yılı (opsiyonel)
          </ThemedText>
        </View>
        <View style={styles.helpItem}>
          <ThemedText style={styles.helpField}>description</ThemedText>
          <ThemedText style={styles.helpDesc}>Açıklama (opsiyonel)</ThemedText>
        </View>
        <View style={styles.helpItem}>
          <ThemedText style={styles.helpField}>questions</ThemedText>
          <ThemedText style={styles.helpDesc}>Soru dizisi (zorunlu)</ThemedText>
        </View>
        <ThemedText style={styles.helpSubtitle}>Her Soru İçin:</ThemedText>
        <View style={styles.helpItem}>
          <ThemedText style={styles.helpField}>content</ThemedText>
          <ThemedText style={styles.helpDesc}>Soru metni</ThemedText>
        </View>
        <View style={styles.helpItem}>
          <ThemedText style={styles.helpField}>options</ThemedText>
          <ThemedText style={styles.helpDesc}>Şıklar dizisi (A-E)</ThemedText>
        </View>
        <View style={styles.helpItem}>
          <ThemedText style={styles.helpField}>correctAnswer</ThemedText>
          <ThemedText style={styles.helpDesc}>
            Doğru cevap (A/B/C/D/E)
          </ThemedText>
        </View>
        <View style={styles.helpItem}>
          <ThemedText style={styles.helpField}>category</ThemedText>
          <ThemedText style={styles.helpDesc}>
            Ders (Matematik, Fizik...)
          </ThemedText>
        </View>
        <View style={styles.helpItem}>
          <ThemedText style={styles.helpField}>subject</ThemedText>
          <ThemedText style={styles.helpDesc}>
            Alt konu (Türev, Paragraf...)
          </ThemedText>
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
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
  exampleSection: {
    marginBottom: Spacing.xl,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  useExampleBtn: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  useExampleText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.backgroundRoot,
  },
  exampleBox: {
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  exampleCode: {
    fontSize: 11,
    fontFamily: "monospace",
    color: Colors.dark.primary,
    lineHeight: 16,
  },
  inputSection: {
    marginBottom: Spacing.lg,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  textInput: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: Spacing.md,
    fontSize: 13,
    fontFamily: "monospace",
    color: Colors.dark.text,
    minHeight: 200,
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  progressText: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  buttonContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  helpSection: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  helpSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  helpItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  helpField: {
    fontSize: 12,
    fontFamily: "monospace",
    color: Colors.dark.secondary,
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    minWidth: 100,
  },
  helpDesc: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
});
