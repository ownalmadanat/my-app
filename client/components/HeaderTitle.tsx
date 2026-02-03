import React from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import * as Haptics from "expo-haptics";

interface HeaderTitleProps {
  title: string;
}

export function HeaderTitle({ title }: HeaderTitleProps) {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleMenuPress} style={styles.menuButton}>
        <Feather name="menu" size={24} color={theme.text} />
      </Pressable>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <ThemedText style={styles.title}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  menuButton: {
    marginRight: Spacing.md,
    padding: Spacing.xs,
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
});
