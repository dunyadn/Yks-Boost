import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import StatisticsScreen from "@/screens/StatisticsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors } from "@/constants/theme";

export type StatisticsStackParamList = {
  Statistics: undefined;
};

const Stack = createNativeStackNavigator<StatisticsStackParamList>();

export default function StatisticsStackNavigator() {
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
