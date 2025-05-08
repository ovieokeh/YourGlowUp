import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Switch, useColorScheme, View } from "react-native";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemePreference, useAppTheme } from "@/hooks/theme/context";

const NOTIF_ENABLED_KEY = "settings.notifications.enabled";

const requestPermissions = async () => {
  if (Device.isDevice) {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Enable notifications in system settings.");
    }
  }
};

export default function AppSettingsView() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { theme, setTheme } = useAppTheme();

  useEffect(() => {
    const loadSettings = async () => {
      const enabled = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
      if (enabled !== null) setNotificationsEnabled(enabled === "true");
    };

    loadSettings();
  }, []);

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    if (newValue) await requestPermissions();
    if (!newValue) {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } else {
      const time = new Date();
      time.setHours(9, 0, 0); // Set to 9 AM
    }
    setNotificationsEnabled(newValue);
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, String(newValue));
  };

  const deviceTheme = useColorScheme() === "dark" ? "dark" : "light";
  const onThemeChange = (newTheme: ThemePreference) => {
    if (newTheme === "system") {
      setTheme(deviceTheme);
    } else {
      setTheme(newTheme);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Manage your experience</ThemedText>

        <View style={styles.section}>
          <ThemedText type="subtitle">Theme</ThemedText>
          <View style={styles.themeRow}>
            {["light", "dark", "system"].map((val) => (
              <ThemedButton
                key={val}
                title={val.charAt(0).toUpperCase() + val.slice(1)}
                onPress={() => onThemeChange(val as ThemePreference)}
                variant={theme === val ? "solid" : "outline"}
                icon={val === "light" ? "sun.max" : val === "dark" ? "moon.fill" : "arrow.uturn.down"}
                iconPlacement="left"
                disabled={theme === val}
                style={{ flex: 1 }}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Notifications</ThemedText>
          <View style={styles.row}>
            <ThemedText>Daily Reminders</ThemedText>
            <Switch value={notificationsEnabled} onValueChange={toggleNotifications} />
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  section: {
    marginTop: 20,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  themeRow: {
    flexDirection: "row",
    gap: 12,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  themeOptionActive: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  themeOptionLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
});
