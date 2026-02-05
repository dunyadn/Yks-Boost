import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  SlideInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { Toast } from "@/components/Toast";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";
import { savePackage, saveQuestions } from "@/lib/localStorage";
import {
  isSmallDevice,
  scaleFontSize,
  moderateScale,
} from "@/utils/responsive";
import type { InsertQuestion } from "@shared/schema";

// Örnek JSON formatı
const EXAMPLE_JSON = `{
  "packageName": "TYT 2026 Türkçe",
  "examType": "TYT",
  "year": 2026,
  "description": "2026 TYT Türkçe Soruları",
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
      "solution": "Doğru yazımı 'hiçbir şey' şeklindedir. 'Hiçbir' sözcüğü bitişik yazılmalıdır.",
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
      "solution": "'Sağaltıcı' sözcüğü, hastalıkları iyileştiren, tedavi eden anlamına gelir. Kökü 'sağ' olan bu kelime, sağlıklı hale getirme işlevini ifade eder.",
      "category": "Türkçe",
      "subject": "Sözcük Anlamı"
    }
  ]
}`;

export default function PDFUploadScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  useWindowDimensions(); // For reactivity on screen size changes

  // Responsive calculations
  const smallDevice = isSmallDevice();
  const horizontalPadding = smallDevice ? Spacing.md : Spacing.lg;

  const [jsonInput, setJsonInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showExample, setShowExample] = useState(true);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSubtitle, setToastSubtitle] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Button animation
  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const showToast = useCallback(
    (message: string, subtitle: string, type: "success" | "error") => {
      setToastMessage(message);
      setToastSubtitle(subtitle);
      setToastType(type);
      setToastVisible(true);
    },
    [],
  );

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  const handleImport = async () => {
    // Button press animation
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    setTimeout(() => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }, 100);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!jsonInput.trim()) {
      showToast("Hata", "Lütfen JSON formatında soru verisi girin.", "error");
      return;
    }

    // Validate JSON
    let parsedData;
    try {
      parsedData = JSON.parse(jsonInput);
    } catch {
      showToast("Geçersiz JSON", "JSON formatını kontrol edin.", "error");
      return;
    }

    if (
      !parsedData.packageName ||
      !parsedData.examType ||
      !parsedData.questions
    ) {
      showToast(
        "Eksik Alanlar",
        "packageName, examType ve questions gereklidir.",
        "error",
      );
      return;
    }

    if (
      !Array.isArray(parsedData.questions) ||
      parsedData.questions.length === 0
    ) {
      showToast("Hata", "En az bir soru eklemelisiniz.", "error");
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

      // Define type for parsed question data
      interface ParsedQuestion {
        content?: string;
        soru?: string;
        question?: string;
        options?: string[];
        secenekler?: string[];
        siklar?: string[];
        correctAnswer?: string;
        dogruCevap?: string;
        cevap?: string;
        solution?: string;
        cozum?: string;
        aciklama?: string;
        category?: string;
        ders?: string;
        konu?: string;
        subject?: string;
        altKonu?: string;
      }

      // Add questions with package reference
      const insertQuestions: InsertQuestion[] = parsedData.questions.map(
        (q: ParsedQuestion) => ({
          content: q.content || q.soru || q.question || "",
          options: q.options || q.secenekler || q.siklar || [],
          correctAnswer: q.correctAnswer || q.dogruCevap || q.cevap || "A",
          solution: q.solution || q.cozum || q.aciklama || null,
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

      // Show success toast
      showToast(
        "Sorular Eklendi! 🎉",
        `"${pkg.name}" paketine ${createdQuestions.length} soru eklendi. Reels sekmesinden görebilirsiniz.`,
        "success",
      );

      // Clear input after success
      setJsonInput("");
      setShowExample(true);
    } catch (error) {
      console.error("Error importing questions:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(
        "Hata Oluştu",
        error instanceof Error
          ? error.message
          : "Sorular eklenirken hata oluştu.",
        "error",
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

  // Responsive sizes
  const iconContainerSize = smallDevice ? 90 : moderateScale(120, 0.3);
  const iconSize = smallDevice ? 36 : moderateScale(48, 0.3);
  const titleSize = smallDevice ? 22 : scaleFontSize(28);
  const subtitleSize = smallDevice ? 14 : scaleFontSize(16);
  const infoIconSize = smallDevice ? 18 : 20;
  const infoTextSize = smallDevice ? 13 : 14;
  const exampleTitleSize = smallDevice ? 14 : 16;
  const exampleCodeSize = smallDevice ? 10 : 11;
  const inputLabelSize = smallDevice ? 14 : 16;
  const inputTextSize = smallDevice ? 12 : 13;
  const helpTitleSize = smallDevice ? 14 : 16;
  const helpFieldSize = smallDevice ? 11 : 12;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{
          paddingTop: headerHeight + (smallDevice ? Spacing.lg : Spacing.xl),
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: horizontalPadding,
        }}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeIn}
          style={[
            styles.header,
            { marginBottom: smallDevice ? Spacing.lg : Spacing.xl },
          ]}
        >
          <LinearGradient
            colors={[Colors.dark.primary, Colors.dark.secondary]}
            style={[
              styles.iconContainer,
              {
                width: iconContainerSize,
                height: iconContainerSize,
                borderRadius: iconContainerSize / 2,
              },
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather
              name="file-text"
              size={iconSize}
              color={Colors.dark.text}
            />
          </LinearGradient>
          <ThemedText style={[styles.title, { fontSize: titleSize }]}>
            JSON ile Soru Ekle
          </ThemedText>
          <ThemedText style={[styles.subtitle, { fontSize: subtitleSize }]}>
            Soru paketlerini JSON formatında ekleyin ve istatistiklerini takip
            edin!
          </ThemedText>
        </Animated.View>

        <Animated.View
          entering={SlideInUp.delay(100)}
          style={[
            styles.infoCard,
            {
              padding: smallDevice ? Spacing.md : Spacing.lg,
              marginBottom: smallDevice ? Spacing.lg : Spacing.xl,
            },
          ]}
        >
          <View style={styles.infoRow}>
            <Feather
              name="package"
              size={infoIconSize}
              color={Colors.dark.primary}
            />
            <ThemedText style={[styles.infoText, { fontSize: infoTextSize }]}>
              Soru paketleri oluşturun (örn: TYT 2026)
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Feather
              name="bar-chart-2"
              size={infoIconSize}
              color={Colors.dark.primary}
            />
            <ThemedText style={[styles.infoText, { fontSize: infoTextSize }]}>
              Paket bazlı başarı istatistikleri
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Feather
              name="clock"
              size={infoIconSize}
              color={Colors.dark.primary}
            />
            <ThemedText style={[styles.infoText, { fontSize: infoTextSize }]}>
              Çözüm süresi takibi
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Feather
              name="target"
              size={infoIconSize}
              color={Colors.dark.primary}
            />
            <ThemedText style={[styles.infoText, { fontSize: infoTextSize }]}>
              Konu bazlı yanlış analizi
            </ThemedText>
          </View>
        </Animated.View>

        {showExample && (
          <Animated.View
            entering={SlideInUp.delay(200)}
            style={[
              styles.exampleSection,
              { marginBottom: smallDevice ? Spacing.lg : Spacing.xl },
            ]}
          >
            <View style={styles.exampleHeader}>
              <ThemedText
                style={[styles.exampleTitle, { fontSize: exampleTitleSize }]}
              >
                📋 Örnek JSON Formatı
              </ThemedText>
              <Pressable
                onPress={handleUseExample}
                style={[
                  styles.useExampleBtn,
                  smallDevice && {
                    paddingHorizontal: Spacing.sm,
                    paddingVertical: Spacing.xs - 1,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.useExampleText,
                    { fontSize: smallDevice ? 12 : 13 },
                  ]}
                >
                  Kullan
                </ThemedText>
              </Pressable>
            </View>
            <ScrollView
              style={[
                styles.exampleBox,
                {
                  maxHeight: smallDevice ? 150 : 200,
                  padding: smallDevice ? Spacing.sm : Spacing.md,
                },
              ]}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <ThemedText
                style={[
                  styles.exampleCode,
                  {
                    fontSize: exampleCodeSize,
                    lineHeight: exampleCodeSize * 1.5,
                  },
                ]}
              >
                {EXAMPLE_JSON}
              </ThemedText>
            </ScrollView>
          </Animated.View>
        )}

        <Animated.View
          entering={SlideInUp.delay(300)}
          style={[
            styles.inputSection,
            { marginBottom: smallDevice ? Spacing.md : Spacing.lg },
          ]}
        >
          <View style={styles.inputHeader}>
            <ThemedText
              style={[styles.inputLabel, { fontSize: inputLabelSize }]}
            >
              JSON Verisi
            </ThemedText>
            {jsonInput.length > 0 && (
              <Pressable onPress={handleClearInput}>
                <Feather
                  name="x-circle"
                  size={smallDevice ? 18 : 20}
                  color={Colors.dark.textSecondary}
                />
              </Pressable>
            )}
          </View>
          <TextInput
            style={[
              styles.textInput,
              { fontSize: inputTextSize, minHeight: smallDevice ? 150 : 200 },
            ]}
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
            <ThemedText
              style={[styles.progressText, { fontSize: smallDevice ? 14 : 16 }]}
            >
              Sorular ekleniyor...
            </ThemedText>
          </Animated.View>
        )}

        <View
          style={[
            styles.buttonContainer,
            {
              marginTop: smallDevice ? Spacing.md : Spacing.lg,
              marginBottom: smallDevice ? Spacing.lg : Spacing.xl,
            },
          ]}
        >
          <Pressable
            onPress={handleImport}
            disabled={!jsonInput.trim() || uploading}
          >
            <Animated.View
              style={[
                styles.submitButton,
                {
                  opacity: !jsonInput.trim() || uploading ? 0.5 : 1,
                  height: smallDevice ? 46 : Spacing.buttonHeight,
                },
                buttonAnimatedStyle,
              ]}
            >
              {uploading ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.dark.backgroundRoot}
                />
              ) : (
                <Feather
                  name="upload"
                  size={smallDevice ? 18 : 20}
                  color={Colors.dark.backgroundRoot}
                />
              )}
              <ThemedText
                style={[
                  styles.submitButtonText,
                  { fontSize: smallDevice ? 14 : 16 },
                ]}
              >
                {uploading ? "Ekleniyor..." : "Soruları Ekle"}
              </ThemedText>
            </Animated.View>
          </Pressable>
        </View>

        <Animated.View
          entering={FadeIn.delay(400)}
          style={[
            styles.helpSection,
            { padding: smallDevice ? Spacing.md : Spacing.lg },
          ]}
        >
          <ThemedText style={[styles.helpTitle, { fontSize: helpTitleSize }]}>
            📌 JSON Alanları
          </ThemedText>
          <View style={styles.helpItem}>
            <ThemedText
              style={[
                styles.helpField,
                { fontSize: helpFieldSize, minWidth: smallDevice ? 85 : 100 },
              ]}
            >
              packageName
            </ThemedText>
            <ThemedText style={[styles.helpDesc, { fontSize: helpFieldSize }]}>
              Paket adı (zorunlu)
            </ThemedText>
          </View>
          <View style={styles.helpItem}>
            <ThemedText
              style={[
                styles.helpField,
                { fontSize: helpFieldSize, minWidth: smallDevice ? 85 : 100 },
              ]}
            >
              examType
            </ThemedText>
            <ThemedText style={[styles.helpDesc, { fontSize: helpFieldSize }]}>
              TYT veya AYT (zorunlu)
            </ThemedText>
          </View>
          <View style={styles.helpItem}>
            <ThemedText
              style={[
                styles.helpField,
                { fontSize: helpFieldSize, minWidth: smallDevice ? 85 : 100 },
              ]}
            >
              year
            </ThemedText>
            <ThemedText style={[styles.helpDesc, { fontSize: helpFieldSize }]}>
              Sınav yılı (opsiyonel)
            </ThemedText>
          </View>
          <View style={styles.helpItem}>
            <ThemedText
              style={[
                styles.helpField,
                { fontSize: helpFieldSize, minWidth: smallDevice ? 85 : 100 },
              ]}
            >
              description
            </ThemedText>
            <ThemedText style={[styles.helpDesc, { fontSize: helpFieldSize }]}>
              Açıklama (opsiyonel)
            </ThemedText>
          </View>
          <View style={styles.helpItem}>
            <ThemedText
              style={[
                styles.helpField,
                { fontSize: helpFieldSize, minWidth: smallDevice ? 85 : 100 },
              ]}
            >
              questions
            </ThemedText>
            <ThemedText style={[styles.helpDesc, { fontSize: helpFieldSize }]}>
              Soru dizisi (zorunlu)
            </ThemedText>
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
            <ThemedText style={styles.helpField}>solution</ThemedText>
            <ThemedText style={styles.helpDesc}>
              Çözüm açıklaması (opsiyonel)
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

      {/* Toast notification */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        subtitle={toastSubtitle}
        type={toastType}
        duration={4000}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
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
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    height: Spacing.buttonHeight,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.backgroundRoot,
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
