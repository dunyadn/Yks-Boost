import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Notification permissions not granted");
      return false;
    }

    // For Android, set notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("daily-reminder", {
        name: "Günlük Hatırlatmalar",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6366F1",
        sound: "default",
      });
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Schedule daily notification at 10:00 AM
 */
export async function scheduleDailyNotification(): Promise<void> {
  try {
    // Cancel any existing daily notifications first
    await cancelDailyNotification();

    // Schedule notification for 10:00 AM daily
    const notificationContent: Notifications.NotificationContentInput = {
      title: "YKS Boost 📚",
      body: "Bugün soru çözmeye ne dersin?",
      sound: "default",
      data: { type: "daily-reminder" },
    };

    // Add Android-specific priority
    if (Platform.OS === "android") {
      notificationContent.priority =
        Notifications.AndroidNotificationPriority.HIGH;
    }

    await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 10,
        minute: 0,
      },
    });

    console.log("✅ Daily notification scheduled for 10:00 AM");
  } catch (error) {
    console.error("Error scheduling daily notification:", error);
  }
}

/**
 * Cancel daily notification
 */
export async function cancelDailyNotification(): Promise<void> {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.type === "daily-reminder") {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        );
      }
    }

    console.log("✅ Daily notifications cancelled");
  } catch (error) {
    console.error("Error cancelling daily notification:", error);
  }
}

/**
 * Initialize notifications - call this on app startup
 */
export async function initializeNotifications(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();

  if (hasPermission) {
    await scheduleDailyNotification();
  }
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === "granted";
}
