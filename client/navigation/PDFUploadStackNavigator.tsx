import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import PDFUploadScreen from "@/screens/PDFUploadScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { Colors } from "@/constants/theme";

export type PDFUploadStackParamList = {
  PDFUpload: undefined;
};

const Stack = createNativeStackNavigator<PDFUploadStackParamList>();

export default function PDFUploadStackNavigator() {
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
        name="PDFUpload"
        component={PDFUploadScreen}
        options={{
          headerTitle: "Soru Ekle",
          headerTintColor: Colors.dark.text,
        }}
      />
    </Stack.Navigator>
  );
}
