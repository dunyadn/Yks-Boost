import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TasksScreen from "@/screens/TasksScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors } from "@/constants/theme";

export type TasksStackParamList = {
  Tasks: undefined;
};

const Stack = createNativeStackNavigator<TasksStackParamList>();

export default function TasksStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator
      screenOptions={{
        ...screenOptions,
        contentStyle: {
          backgroundColor: Colors.dark.backgroundRoot,
        },
      }}
    >
      <Stack.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          headerTitle: "Görevlerim",
          headerTintColor: Colors.dark.text,
        }}
      />
    </Stack.Navigator>
  );
}
