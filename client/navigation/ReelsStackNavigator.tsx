import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ReelsScreen from "@/screens/ReelsScreen";
import { Colors } from "@/constants/theme";

export type ReelsStackParamList = {
  Reels: undefined;
};

const Stack = createNativeStackNavigator<ReelsStackParamList>();

export default function ReelsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors.dark.backgroundRoot,
        },
      }}
    >
      <Stack.Screen name="Reels" component={ReelsScreen} />
    </Stack.Navigator>
  );
}
