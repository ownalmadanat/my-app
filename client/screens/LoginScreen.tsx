import React, { useState } from "react";
import { StyleSheet, View, TextInput, Image, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { GradientBackground } from "@/components/GradientBackground";
import { useAuth } from "@/contexts/AuthContext";
import { AppColors, BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type Step = "email" | "password" | "create_password";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, setPassword } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await login(email.trim().toLowerCase());

    setIsLoading(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (result.needsPassword) {
      setStep("create_password");
    } else if (result.error?.includes("not registered")) {
      setError("You are not registered for Stress Congress 2026");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setStep("password");
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await login(email.trim().toLowerCase(), password);

    setIsLoading(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setError(result.error || "Invalid password");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCreatePassword = async () => {
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await setPassword(email.trim().toLowerCase(), password);

    setIsLoading(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setError(result.error || "Failed to set password");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleBack = () => {
    setStep("email");
    setPasswordValue("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <GradientBackground colors={[AppColors.primary, AppColors.primaryLight]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText type="h2" style={styles.title}>
              Stress Congress 2026
            </ThemedText>
            <ThemedText style={styles.subtitle}>March 3, 2026</ThemedText>
          </View>

          <View style={[styles.card, Shadows.large]}>
            {step !== "email" ? (
              <Pressable onPress={handleBack} style={styles.backButton}>
                <Feather name="arrow-left" size={20} color={AppColors.primary} />
                <ThemedText style={styles.backText}>Back</ThemedText>
              </Pressable>
            ) : null}

            {step === "email" ? (
              <>
                <ThemedText type="h3" style={styles.cardTitle}>
                  Welcome
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Enter your registered email to continue
                </ThemedText>

                <View style={styles.inputContainer}>
                  <Feather
                    name="mail"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={16} color={AppColors.error} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                  </View>
                ) : null}

                <Button onPress={handleEmailSubmit} disabled={isLoading} style={styles.button}>
                  {isLoading ? "Checking..." : "Continue"}
                </Button>
              </>
            ) : step === "password" ? (
              <>
                <ThemedText type="h3" style={styles.cardTitle}>
                  Welcome Back
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Enter your password to sign in
                </ThemedText>

                <View style={styles.inputContainer}>
                  <Feather
                    name="lock"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPasswordValue}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#6B7280"
                    />
                  </Pressable>
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={16} color={AppColors.error} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                  </View>
                ) : null}

                <Button onPress={handlePasswordSubmit} disabled={isLoading} style={styles.button}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </>
            ) : (
              <>
                <ThemedText type="h3" style={styles.cardTitle}>
                  Create Password
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Set up a password for your account
                </ThemedText>

                <View style={styles.inputContainer}>
                  <Feather
                    name="lock"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Create password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPasswordValue}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color="#6B7280"
                    />
                  </Pressable>
                </View>

                <View style={styles.inputContainer}>
                  <Feather
                    name="lock"
                    size={20}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={16} color={AppColors.error} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                  </View>
                ) : null}

                <Button onPress={handleCreatePassword} disabled={isLoading} style={styles.button}>
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  title: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    marginTop: Spacing.xs,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius["2xl"],
    padding: Spacing["2xl"],
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  backText: {
    color: AppColors.primary,
    marginLeft: Spacing.xs,
    fontWeight: "500",
  },
  cardTitle: {
    color: "#1F2937",
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    color: "#6B7280",
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    height: Spacing.inputHeight,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  eyeButton: {
    padding: Spacing.xs,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: AppColors.error,
    marginLeft: Spacing.sm,
    flex: 1,
    fontSize: 14,
  },
  button: {
    marginTop: Spacing.sm,
  },
});
