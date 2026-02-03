import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LibraryScreen from "@/screens/LibraryScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors } from "@/constants/theme";

export type LibraryStackParamList = {
  Library: undefined;
};

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export default function LibraryStackNavigator() {
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
        name="Library"
        component={LibraryScreen}
        options={{
          headerTitle: "Kütüphane",
          headerTintColor: Colors.dark.text,
        }}
      />
    </Stack.Navigator>
  );
}
