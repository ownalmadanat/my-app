import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Image, Animated, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { GradientBackground } from "@/components/GradientBackground";
import { AppColors, Spacing } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface CheckInSuccessProps {
  attendeeName: string;
  onDismiss: () => void;
}

const { width, height } = Dimensions.get("window");

const CONFETTI_COLORS = [AppColors.accent, AppColors.primaryLight, AppColors.success, AppColors.warning, "#FFD700"];

function Confetti() {
  const confettiPieces = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(-50),
      rotate: new Animated.Value(0),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 500,
    }))
  ).current;

  useEffect(() => {
    confettiPieces.forEach((piece) => {
      const targetX = piece.x.__getValue() + (Math.random() - 0.5) * 200;
      
      Animated.parallel([
        Animated.timing(piece.y, {
          toValue: height + 50,
          duration: 2500 + Math.random() * 1000,
          delay: piece.delay,
          useNativeDriver: true,
        }),
        Animated.timing(piece.x, {
          toValue: targetX,
          duration: 2500 + Math.random() * 1000,
          delay: piece.delay,
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotate, {
          toValue: 360 * (2 + Math.random() * 3),
          duration: 2500 + Math.random() * 1000,
          delay: piece.delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {confettiPieces.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confettiPiece,
            {
              backgroundColor: piece.color,
              transform: [
                { translateX: piece.x },
                { translateY: piece.y },
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

export function CheckInSuccess({ attendeeName, onDismiss }: CheckInSuccessProps) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GradientBackground
      colors={[AppColors.primary, AppColors.primaryLight]}
      style={styles.container}
    >
      <Confetti />
      
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <Image
            source={require("../../assets/images/celebration-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <ThemedText type="h1" style={styles.welcomeText}>
            Welcome to
          </ThemedText>
          <ThemedText type="h1" style={styles.eventName}>
            Stress Congress 2026
          </ThemedText>
          <ThemedText type="h3" style={styles.attendeeName}>
            {attendeeName}
          </ThemedText>
        </Animated.View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  logoContainer: {
    marginBottom: Spacing["3xl"],
  },
  logo: {
    width: 180,
    height: 180,
  },
  textContainer: {
    alignItems: "center",
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 28,
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  eventName: {
    color: "#FFFFFF",
    fontSize: 34,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  attendeeName: {
    color: "#FFFFFF",
    opacity: 0.9,
  },
  confettiPiece: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 2,
  },
});
