import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import AddQuestionScreen from "@/screens/AddQuestionScreen";
import CommunityScreen from "@/screens/CommunityScreen";
import StatisticsScreen from "@/screens/StatisticsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors } from "@/constants/theme";

export type RootStackParamList = {
  Main: undefined;
  AddQuestion: undefined;
  Community: undefined;
  Statistics: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
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
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddQuestion"
        component={AddQuestionScreen}
        options={{
          presentation: "modal",
          headerTitle: "Yeni Soru",
          headerTintColor: Colors.dark.text,
        }}
      />
      <Stack.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          headerTitle: "Topluluk",
        }}
      />
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          headerTitle: "İstatistikler",
          headerTintColor: Colors.dark.text,
        }}
      />
    </Stack.Navigator>
  );
}
