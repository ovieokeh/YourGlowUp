import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { addLog, getAllLogs } from "@/backend/logs";
import { isMediaUploadLog, Log } from "@/backend/shared";
import { AccountBenefits } from "@/components/AccountBenefits";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { supabase } from "@/supabase";
import Toast from "react-native-toast-message";

const NOTIF_ENABLED_KEY = "settings.notifications.enabled";
const NOTIF_TIME_KEY = "settings.notifications.time";

export default function AccountView() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const border = useThemeColor({}, "border");
  const tint = useThemeColor({}, "tint");
  const muted = useThemeColor({}, "muted");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();
      setLoading(false);

      if (error) {
        Alert.alert("Error", "Could not fetch user", [
          {
            text: "OK",
            onPress: () => router.push("/auth"),
          },
        ]);
      } else if (!currentUser) {
        // no session, redirect to auth
        router.push("/auth");
      } else {
        setUser(currentUser);
        setName(currentUser.user_metadata?.full_name || "");
      }
    })();
  }, [router]);

  const handleSave = async () => {
    if (!name) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name },
    });
    setSaving(false);
    if (error) {
      Toast.show({
        type: "error",
        text1: "Save Failed",
        text2: error.message,
        position: "bottom",
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Save Successful",
        text2: "Your name has been updated.",
        position: "bottom",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} color={tint} />;
  }

  const exportData = async () => {
    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) {
      Alert.alert("Error", "No user found");
      return;
    }
    // @todo rewrite this to support new structure

    const logs = await getAllLogs(currentUser.data.user.id);

    const IMAGE_URI_BLOB_MAP: Record<string, string> = {};
    const imagesBase64Blobs = logs.filter(isMediaUploadLog).map(async (log) => {
      const uris = [log.media?.url].filter((uri) => typeof uri === "string");
      return uris.map((uri) => {
        const base64 = FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        return base64.then((base64String) => {
          IMAGE_URI_BLOB_MAP[uri] = base64String;
          return `data:image/jpg;base64,${base64String}`;
        });
      });
    });
    await Promise.allSettled(imagesBase64Blobs);
    const notificationsEnabled = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
    const notificationTimeRaw = await AsyncStorage.getItem(NOTIF_TIME_KEY);
    const notificationTime = notificationTimeRaw ? new Date(notificationTimeRaw) : new Date();
    const settingsData = {
      notificationsEnabled,
      notificationTime: notificationTime.toISOString(),
      logs,
      IMAGE_URI_BLOB_MAP,
    };
    const data = JSON.stringify(settingsData, null, 2);

    const baseDirectory = FileSystem.documentDirectory;
    const path = baseDirectory + "symmetry-export.json";
    FileSystem.writeAsStringAsync(path, data)
      .then(() => {
        Alert.alert("Export Successful", "Your data has been exported.");
      })
      .catch((error) => {
        console.error("Error exporting data:", error);
        Alert.alert("Export Failed", "An error occurred while exporting your data.");
      });
    Sharing.shareAsync(path)
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Share Successful",
          text2: "Your data has been shared.",
          position: "bottom",
        });
        FileSystem.deleteAsync(path).catch(console.error);
      })
      .catch((error) => {
        console.error("Error sharing file:", error);
        Toast.show({
          type: "error",
          text1: "Share Failed",
          text2: "An error occurred while sharing your data.",
          position: "bottom",
        });
      });
  };

  const importData = async () => {
    Alert.alert("Warning", "This will overwrite your existing data. Do you want to continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Continue",
        onPress: async () => {
          // @todo rewrite this to support new structure
          const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
          if (result.canceled) return;

          const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
          try {
            const parsed = JSON.parse(content);

            await AsyncStorage.setItem(NOTIF_ENABLED_KEY, String(parsed.notificationsEnabled));
            await AsyncStorage.setItem(NOTIF_TIME_KEY, parsed.notificationTime);

            const logs = parsed.logs as Log[];
            const IMAGE_URI_BLOB_MAP = parsed.IMAGE_URI_BLOB_MAP;
            for (const [uri, base64] of Object.entries(IMAGE_URI_BLOB_MAP)) {
              const blob = `data:image/jpg;base64,${base64}`;
              const newUri = `${FileSystem.documentDirectory}${uri.split("/").pop()}`;
              await FileSystem.writeAsStringAsync(newUri, blob, {
                encoding: FileSystem.EncodingType.Base64,
              });
              // @todo: bring back photo logs
            }

            for (const log of logs) {
              await addLog(log);
            }

            Alert.alert("Import Successful", "Your data has been imported.");
          } catch {
            Toast.show({
              type: "error",
              text1: "Import Failed",
              text2: "An error occurred while importing your data.",
              position: "bottom",
            });
          }
        },
      },
    ]);
  };

  // Anonymous user (no email)
  const isAnonymous = !user?.email;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.inner}>
          {isAnonymous ? (
            <>
              <AccountBenefits />
            </>
          ) : (
            <>
              <ThemedText style={[styles.label, { color: muted }]}>Name</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: bg, color: text, borderColor: border }]}
                placeholder="Full Name"
                placeholderTextColor={muted}
                value={name}
                onChangeText={setName}
              />

              <ThemedText style={[styles.label, { color: muted, marginTop: 16 }]}>Email</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: bg, color: text, borderColor: border }]}
                value={user.email}
                editable={false}
              />

              <ThemedButton
                title="Save"
                onPress={handleSave}
                disabled={saving || name === (user.user_metadata?.full_name || "")}
                style={{ ...styles.button }}
              />

              <ThemedButton
                title="Log Out"
                onPress={handleLogout}
                variant="outline"
                style={{ ...styles.button, marginTop: 8 }}
              />

              <View style={styles.section}>
                <ThemedText type="subtitle">Data</ThemedText>
                <ThemedButton title="Export Data" onPress={exportData} variant="outline" />
                <ThemedButton title="Import Data" onPress={importData} variant="outline" />
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,

    paddingBottom: 64,
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  section: {
    marginTop: 32,
    gap: 12,
  },
});
