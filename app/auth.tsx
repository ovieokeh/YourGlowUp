import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useBadges } from "@/providers/BadgeContext";
import { supabase } from "@/supabase";
import { useSearchParams } from "expo-router/build/hooks";
import Toast from "react-native-toast-message";

export default function AuthScreen() {
  const router = useRouter();
  const { awardBadge } = useBadges();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const redirectTo = (params.get("redirectTo") as Href) || null;

  const bg = useThemeColor({}, "background");
  const text = useThemeColor({}, "text");
  const border = useThemeColor({}, "border");
  const tint = useThemeColor({}, "tint");
  const muted = useThemeColor({}, "muted");

  const handleAuth = async () => {
    if (!email || !password) return;

    setLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Sign Up Failed",
          text2: error.message,
          position: "bottom",
        });
        return;
      }

      Toast.show({
        type: "success",
        text1: "Sign Up Successful",
        text2: "Check your email for the confirmation link.",
        position: "bottom",
      });
      setLoading(false);
      await awardBadge("new-beginnings");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      Toast.show({
        type: "error",
        text1: "Sign In Failed",
        text2: error.message,
        position: "bottom",
      });
    } else {
      if (redirectTo) {
        router.replace(redirectTo);
      } else {
        router.replace("/(tabs)");
      }
    }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInAnonymously();
    setLoading(false);
    if (error) {
      Toast.show({
        type: "error",
        text1: "Anonymous Sign In Failed",
        text2: error.message,
        position: "bottom",
      });
    } else {
      if (redirectTo) {
        router.replace(redirectTo);
      } else {
        router.replace("/(tabs)");
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.inner}>
          <View style={{ alignItems: "center", gap: Spacings.sm, marginBottom: Spacings.lg }}>
            <ThemedText type="title" style={{ marginHorizontal: "auto" }}>
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </ThemedText>
            <ThemedText type="subtitle" style={{ marginHorizontal: "auto" }}>
              {isSignUp ? "Start your symmetry journey today." : "Sign in with your email and password"}
            </ThemedText>
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: bg, color: text, borderColor: border }]}
            placeholder="Email"
            placeholderTextColor={muted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, { backgroundColor: bg, color: text, borderColor: border }]}
            placeholder="Password"
            placeholderTextColor={muted}
            secureTextEntry
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
          />

          <ThemedButton
            onPress={handleAuth}
            title={isSignUp ? "Sign Up" : "Sign In"}
            disabled={!email || !password || loading}
            loading={loading}
            style={{ ...styles.button, ...(!email || !password || loading ? styles.buttonDisabled : {}) }}
            variant="solid"
          />

          <ThemedText style={styles.or}>Or</ThemedText>

          <Pressable
            onPress={handleAnonymousSignIn}
            disabled={loading}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: border },
              pressed && { opacity: 0.85 },
              loading && styles.buttonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={text} />
            ) : (
              <ThemedText style={[styles.buttonText, { color: text }]}>Continue as Guest</ThemedText>
            )}
          </Pressable>

          <Pressable onPress={() => setIsSignUp(!isSignUp)} style={styles.toggle}>
            <ThemedText style={[styles.toggleText, { color: tint }]}>
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: Spacings.lg,
    paddingTop: Spacings.xl * 2,
    gap: Spacings.sm,
  },
  input: {
    padding: Spacings.md,
    borderRadius: BorderRadii.md,
    fontSize: 16,
    marginBottom: Spacings.md,
    borderWidth: 1,
  },
  or: {
    fontSize: 15,
    marginTop: Spacings.sm,
    textAlign: "center",
  },
  button: {
    paddingVertical: Spacings.lg,
    borderRadius: BorderRadii.md,
    alignItems: "center",
    marginTop: Spacings.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  toggle: {
    marginTop: Spacings.lg,
    alignItems: "center",
  },
  toggleText: {
    textDecorationLine: "underline",
  },
});
