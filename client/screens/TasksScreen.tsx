import React, { useState, useCallback } from "react";
import { StyleSheet, View, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { TaskCard } from "@/components/TaskCard";
import { EmptyState } from "@/components/EmptyState";
import { Colors, BorderRadius, Spacing } from "@/constants/theme";

interface Task {
  id: string;
  title: string;
  subject: string;
  progress: number;
  completed: boolean;
}

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Türev Konu Tekrarı",
    subject: "Matematik",
    progress: 75,
    completed: false,
  },
  {
    id: "2",
    title: "İsim Tamlamaları Çalış",
    subject: "Türkçe",
    progress: 100,
    completed: true,
  },
  {
    id: "3",
    title: "Optik Soru Çöz (25 Soru)",
    subject: "Fizik",
    progress: 40,
    completed: false,
  },
  {
    id: "4",
    title: "Organik Kimya Formülleri",
    subject: "Kimya",
    progress: 60,
    completed: false,
  },
  {
    id: "5",
    title: "Osmanlı Dönemi Tekrar",
    subject: "Tarih",
    progress: 20,
    completed: false,
  },
];

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();

  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const handleToggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
              progress: !task.completed ? 100 : task.progress,
            }
          : task
      )
    );
  }, []);

  const handleAddTask = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTask: Task = {
      id: Date.now().toString(),
      title: "Yeni Görev",
      subject: "Genel",
      progress: 0,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Task; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <TaskCard
          task={item}
          onToggle={() => handleToggleTask(item.id)}
          onPress={() => {}}
        />
      </Animated.View>
    ),
    [handleToggleTask]
  );

  const renderEmpty = useCallback(
    () => (
      <EmptyState
        image={require("../../assets/images/empty-tasks.png")}
        title="Henüz Görev Yok"
        message="Çalışma hedeflerini belirle ve günlük görevlerini takip et."
        actionLabel="Görev Ekle"
        onAction={handleAddTask}
      />
    ),
    []
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={renderEmpty}
      />

      {tasks.length > 0 ? (
        <Pressable
          style={[styles.fab, { bottom: tabBarHeight + Spacing.xl }]}
          onPress={handleAddTask}
        >
          <Feather name="plus" size={24} color={Colors.dark.backgroundRoot} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
