import React from "react";
import { StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import ReelsStackNavigator from "@/navigation/ReelsStackNavigator";
import LibraryStackNavigator from "@/navigation/LibraryStackNavigator";
import PDFUploadStackNavigator from "@/navigation/PDFUploadStackNavigator";
import StatisticsStackNavigator from "@/navigation/StatisticsStackNavigator";
import { Colors } from "@/constants/theme";

export type MainTabParamList = {
  ReelsTab: undefined;
  LibraryTab: undefined;
  PDFUploadTab: undefined;
  StatisticsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="ReelsTab"
      screenOptions={{
        tabBarActiveTintColor: Colors.dark.primary,
        tabBarInactiveTintColor: Colors.dark.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: Colors.dark.backgroundRoot,
            web: Colors.dark.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.select({ ios: 88, android: 70, web: 70 }),
          paddingBottom: Platform.select({ ios: 28, android: 10, web: 10 }),
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ReelsTab"
        component={ReelsStackNavigator}
        options={{
          title: "Reels",
          tabBarIcon: ({ color, size }) => (
            <Feather name="zap" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LibraryTab"
        component={LibraryStackNavigator}
        options={{
          title: "Kütüphane",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PDFUploadTab"
        component={PDFUploadStackNavigator}
        options={{
          title: "PDF Yükle",
          tabBarIcon: ({ color, size }) => (
            <Feather name="upload" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StatisticsTab"
        component={StatisticsStackNavigator}
        options={{
          title: "İstatistikler",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
