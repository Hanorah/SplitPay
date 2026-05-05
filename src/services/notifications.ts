import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

const isExpoGo =
  Constants.appOwnership === "expo" || Constants.executionEnvironment === "storeClient";

if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export const registerForPushNotifications = async () => {
  // Expo Go (SDK 53+) no longer supports remote push registration.
  if (isExpoGo) {
    return null;
  }

  const perms = await Notifications.getPermissionsAsync();
  if (!perms.granted) {
    const ask = await Notifications.requestPermissionsAsync();
    if (!ask.granted) return null;
  }
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
};

export const scheduleSplitReminderNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 5,
    },
  });
};

export const scheduleContributionNotification = async (groupName: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Contribution reminder",
      body: `Your ${groupName} contribution is due.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
    },
  });
};

export const scheduleDueDateNotification = async (
  title: string,
  body: string,
  triggerDate: Date
) => {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
};
