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

type Step = "role_select" | "auth_mode" | "login_email" | "login_password" | "login_create_password" | "signup_form" | "forgot_email" | "forgot_new_password";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, setPassword, register, resetPassword } = useAuth();

  const [step, setStep] = useState<Step>("role_select");
  const [selectedRole, setSelectedRole] = useState<"attendee" | "staff">("attendee");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const clearInputs = () => {
    setEmail("");
    setName("");
    setPasswordValue("");
    setConfirmPassword("");
    setError("");
    setShowPassword(false);
  };

  const handleRoleSelect = (role: "attendee" | "staff") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedRole(role);
    setStep("auth_mode");
    clearInputs();
  };

  const handleAuthMode = (mode: "login" | "signup") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mode === "login") {
      setStep("login_email");
    } else {
      setStep("signup_form");
    }
    clearInputs();
  };

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
      setStep("login_create_password");
    } else if (result.error?.includes("not registered")) {
      setError("This email is not registered. Try signing up instead.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setStep("login_password");
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

  const handleSignup = async () => {
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }
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

    const result = await register(email.trim().toLowerCase(), name.trim(), password, selectedRole);

    setIsLoading(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setError(result.error || "Registration failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleForgotEmailSubmit = async () => {
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
    } else if (result.error?.includes("not registered")) {
      setError("No account found with this email address");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      setStep("forgot_new_password");
      setPasswordValue("");
      setConfirmPassword("");
    }
  };

  const handleResetPassword = async () => {
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

    const result = await resetPassword(email.trim().toLowerCase(), password);

    setIsLoading(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setError(result.error || "Password reset failed");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === "auth_mode") {
      setStep("role_select");
    } else if (step === "login_email" || step === "signup_form") {
      setStep("auth_mode");
    } else if (step === "login_password" || step === "login_create_password") {
      setStep("login_email");
      setPasswordValue("");
      setConfirmPassword("");
    } else if (step === "forgot_email") {
      setStep("login_password");
      setPasswordValue("");
    } else if (step === "forgot_new_password") {
      setStep("forgot_email");
      setPasswordValue("");
      setConfirmPassword("");
    }
  };

  const showBackButton = step !== "role_select";

  const roleLabel = selectedRole === "staff" ? "Staff" : "Attendee";

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
            {showBackButton ? (
              <Pressable onPress={handleBack} style={styles.backButton}>
                <Feather name="arrow-left" size={20} color={AppColors.primary} />
                <ThemedText style={styles.backText}>Back</ThemedText>
              </Pressable>
            ) : null}

            {step === "role_select" ? (
              <>
                <ThemedText type="h3" style={styles.cardTitle}>
                  Welcome
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  How are you joining the conference?
                </ThemedText>

                <Pressable
                  onPress={() => handleRoleSelect("attendee")}
                  style={({ pressed }) => [styles.roleCard, { opacity: pressed ? 0.8 : 1 }]}
                  testID="button-role-attendee"
                >
                  <View style={[styles.roleIconContainer, { backgroundColor: `${AppColors.primary}15` }]}>
                    <Feather name="user" size={28} color={AppColors.primary} />
                  </View>
                  <View style={styles.roleContent}>
                    <ThemedText type="h4" style={styles.roleTitle}>Attendee</ThemedText>
                    <ThemedText style={styles.roleDescription}>
                      Attending the conference sessions
                    </ThemedText>
                  </View>
                  <Feather name="chevron-right" size={22} color="#9CA3AF" />
                </Pressable>

                <Pressable
                  onPress={() => handleRoleSelect("staff")}
                  style={({ pressed }) => [styles.roleCard, styles.roleCardLast, { opacity: pressed ? 0.8 : 1 }]}
                  testID="button-role-staff"
                >
                  <View style={[styles.roleIconContainer, { backgroundColor: `${AppColors.warning}15` }]}>
                    <Feather name="shield" size={28} color={AppColors.warning} />
                  </View>
                  <View style={styles.roleContent}>
                    <ThemedText type="h4" style={styles.roleTitle}>Staff</ThemedText>
                    <ThemedText style={styles.roleDescription}>
                      Managing and organizing the event
                    </ThemedText>
                  </View>
                  <Feather name="chevron-right" size={22} color="#9CA3AF" />
                </Pressable>
              </>
            ) : step === "auth_mode" ? (
              <>
                <View style={[styles.roleBadge, { backgroundColor: selectedRole === "staff" ? `${AppColors.warning}15` : `${AppColors.primary}15` }]}>
                  <Feather
                    name={selectedRole === "staff" ? "shield" : "user"}
                    size={16}
                    color={selectedRole === "staff" ? AppColors.warning : AppColors.primary}
                  />
                  <ThemedText style={[styles.roleBadgeText, { color: selectedRole === "staff" ? AppColors.warning : AppColors.primary }]}>
                    {roleLabel}
                  </ThemedText>
                </View>

                <ThemedText type="h3" style={styles.cardTitle}>
                  Sign In or Sign Up
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Do you already have an account?
                </ThemedText>

                <Button onPress={() => handleAuthMode("login")} style={styles.authModeButton} testID="button-signin">
                  Sign In
                </Button>

                <Pressable
                  onPress={() => handleAuthMode("signup")}
                  style={({ pressed }) => [styles.signupButton, { opacity: pressed ? 0.8 : 1 }]}
                  testID="button-signup"
                >
                  <ThemedText style={styles.signupButtonText}>
                    Create New Account
                  </ThemedText>
                </Pressable>
              </>
            ) : step === "login_email" ? (
              <>
                <ThemedText type="h3" style={styles.cardTitle}>
                  Sign In
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Enter your registered email to continue
                </ThemedText>

                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
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
                    testID="input-email"
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={16} color={AppColors.error} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                  </View>
                ) : null}

                <Button onPress={handleEmailSubmit} disabled={isLoading} style={styles.button} testID="button-continue">
                  {isLoading ? "Checking..." : "Continue"}
                </Button>
              </>
            ) : step === "login_password" ? (
              <>
                <ThemedText type="h3" style={styles.cardTitle}>
                  Welcome Back
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Enter your password to sign in
                </ThemedText>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPasswordValue}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    testID="input-password"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                  </Pressable>
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={16} color={AppColors.error} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                  </View>
                ) : null}

                <Button onPress={handlePasswordSubmit} disabled={isLoading} style={styles.button} testID="button-signin-submit">
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                <Pressable
                  onPress={() => {
                    setError("");
                    setPasswordValue("");
                    setStep("forgot_email");
                  }}
                  style={styles.forgotPasswordButton}
                  testID="button-forgot-password"
                >
                  <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
                </Pressable>
              </>
            ) : step === "login_create_password" ? (
              <>
                <ThemedText type="h3" style={styles.cardTitle}>
                  Create Password
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Set up a password for your account
                </ThemedText>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPasswordValue}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    testID="input-new-password"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                  </Pressable>
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    testID="input-confirm-password"
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={16} color={AppColors.error} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                  </View>
                ) : null}

                <Button onPress={handleCreatePassword} disabled={isLoading} style={styles.button} testID="button-create-password">
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </>
            ) : step === "signup_form" ? (
              <>
                <View style={[styles.roleBadge, { backgroundColor: selectedRole === "staff" ? `${AppColors.warning}15` : `${AppColors.primary}15` }]}>
                  <Feather
                    name={selectedRole === "staff" ? "shield" : "user"}
                    size={16}
                    color={selectedRole === "staff" ? AppColors.warning : AppColors.primary}
                  />
                  <ThemedText style={[styles.roleBadgeText, { color: selectedRole === "staff" ? AppColors.warning : AppColors.primary }]}>
                    Signing up as {roleLabel}
                  </ThemedText>
                </View>

                <ThemedText type="h3" style={styles.cardTitle}>
                  Create Account
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Fill in your details to get started
                </ThemedText>

                <View style={styles.inputContainer}>
                  <Feather name="user" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!isLoading}
                    testID="input-name"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
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
                    testID="input-signup-email"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPasswordValue}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    testID="input-signup-password"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                  </Pressable>
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    testID="input-signup-confirm-password"
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={16} color={AppColors.error} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                  </View>
                ) : null}

                <Button onPress={handleSignup} disabled={isLoading} style={styles.button} testID="button-signup-submit">
                  {isLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </>
            ) : step === "forgot_email" ? (
              <>
                <ThemedText type="h3" style={styles.cardTitle}>
                  Forgot Password
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Enter your email to verify your account
                </ThemedText>

                <View style={styles.inputContainer}>
                  <Feather name="mail" size={20} color="#6B7280" style={styles.inputIcon} />
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
                    testID="input-forgot-email"
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={16} color={AppColors.error} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                  </View>
                ) : null}

                <Button onPress={handleForgotEmailSubmit} disabled={isLoading} style={styles.button} testID="button-forgot-continue">
                  {isLoading ? "Verifying..." : "Continue"}
                </Button>
              </>
            ) : step === "forgot_new_password" ? (
              <>
                <ThemedText type="h3" style={styles.cardTitle}>
                  Reset Password
                </ThemedText>
                <ThemedText style={styles.cardSubtitle}>
                  Create a new password for your account
                </ThemedText>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="New password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPasswordValue}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    testID="input-reset-password"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                    <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7280" />
                  </Pressable>
                </View>

                <View style={styles.inputContainer}>
                  <Feather name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9CA3AF"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    testID="input-reset-confirm-password"
                  />
                </View>

                {error ? (
                  <View style={styles.errorContainer}>
                    <Feather name="alert-circle" size={16} color={AppColors.error} />
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                  </View>
                ) : null}

                <Button onPress={handleResetPassword} disabled={isLoading} style={styles.button} testID="button-reset-submit">
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </>
            ) : null}
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
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  roleCardLast: {
    marginBottom: 0,
  },
  roleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    color: "#1F2937",
    fontSize: 17,
    marginBottom: 2,
  },
  roleDescription: {
    color: "#6B7280",
    fontSize: 13,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  authModeButton: {
    marginBottom: Spacing.md,
  },
  signupButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: AppColors.primary,
  },
  signupButtonText: {
    color: AppColors.primary,
    fontWeight: "600",
    fontSize: 16,
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
  forgotPasswordButton: {
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  forgotPasswordText: {
    color: AppColors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
});
