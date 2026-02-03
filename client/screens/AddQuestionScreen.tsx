import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Tag } from "@/components/Tag";
import { Button } from "@/components/Button";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

const SUBJECTS = [
  "Matematik",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Türkçe",
  "Tarih",
  "Coğrafya",
  "Felsefe",
  "Din Kültürü",
  "İngilizce",
];

const EXAM_TYPES = ["TYT", "AYT"];

export default function AddQuestionScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();

  const [questionText, setQuestionText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string>("TYT");

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("İzin Gerekli", "Galeri erişim izni vermeniz gerekiyor.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Bilgi", "Kamera özelliği için Expo Go uygulamasını kullanın.");
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("İzin Gerekli", "Kamera erişim izni vermeniz gerekiyor.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectSubject = (subject: string) => {
    setSelectedSubject(subject === selectedSubject ? null : subject);
    Haptics.selectionAsync();
  };

  const handleSelectExamType = (type: string) => {
    setSelectedExamType(type);
    Haptics.selectionAsync();
  };

  const handleSubmit = () => {
    if (!questionText.trim() && !selectedImage) {
      Alert.alert("Hata", "Lütfen bir soru yazın veya görsel ekleyin.");
      return;
    }
    if (!selectedSubject) {
      Alert.alert("Hata", "Lütfen bir ders seçin.");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Başarılı", "Sorunuz paylaşıldı!", [
      { text: "Tamam", onPress: () => navigation.goBack() },
    ]);
  };

  const isValid =
    (questionText.trim().length > 0 || selectedImage) && selectedSubject;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Soru</ThemedText>
        <TextInput
          style={styles.textInput}
          placeholder="Sorunuzu buraya yazın..."
          placeholderTextColor={Colors.dark.textSecondary}
          value={questionText}
          onChangeText={setQuestionText}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Görsel Ekle</ThemedText>

        {selectedImage ? (
          <Animated.View entering={FadeIn} style={styles.imagePreview}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
              contentFit="cover"
            />
            <Pressable style={styles.removeImageButton} onPress={handleRemoveImage}>
              <Feather name="x" size={20} color={Colors.dark.text} />
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.imageButtons}>
            <Pressable style={styles.imageButton} onPress={handlePickImage}>
              <Feather name="image" size={24} color={Colors.dark.primary} />
              <ThemedText style={styles.imageButtonText}>Galeriden Seç</ThemedText>
            </Pressable>
            <Pressable style={styles.imageButton} onPress={handleTakePhoto}>
              <Feather name="camera" size={24} color={Colors.dark.primary} />
              <ThemedText style={styles.imageButtonText}>Fotoğraf Çek</ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Sınav Türü</ThemedText>
        <View style={styles.tagsContainer}>
          {EXAM_TYPES.map((type) => (
            <Tag
              key={type}
              label={type}
              variant={type === "TYT" ? "primary" : "secondary"}
              selected={selectedExamType === type}
              onPress={() => handleSelectExamType(type)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Ders</ThemedText>
        <View style={styles.tagsContainer}>
          {SUBJECTS.map((subject) => (
            <Tag
              key={subject}
              label={subject}
              variant="primary"
              selected={selectedSubject === subject}
              onPress={() => handleSelectSubject(subject)}
            />
          ))}
        </View>
      </View>

      <Button
        onPress={handleSubmit}
        disabled={!isValid}
        style={styles.submitButton}
      >
        Paylaş
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  textInput: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    color: Colors.dark.text,
    fontSize: 16,
    minHeight: 150,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  imageButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  imageButton: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderStyle: "dashed",
  },
  imageButtonText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  imagePreview: {
    position: "relative",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
  },
  removeImageButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.lg,
  },
});
