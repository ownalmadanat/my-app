import React from "react";
import { StyleSheet, View, Image, Pressable } from "react-native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerContentComponentProps } from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";
import { AppColors, BorderRadius, Spacing } from "@/constants/theme";
import * as Haptics from "expo-haptics";

import AttendeeHomeScreen from "@/screens/attendee/AttendeeHomeScreen";
import AgendaScreen from "@/screens/attendee/AgendaScreen";
import SpeakersScreen from "@/screens/attendee/SpeakersScreen";
import MyQRCodeScreen from "@/screens/attendee/MyQRCodeScreen";
import NotificationsScreen from "@/screens/shared/NotificationsScreen";
import ProfileScreen from "@/screens/shared/ProfileScreen";
import CompaniesScreen from "@/screens/shared/CompaniesScreen";
import CompanyProfileScreen from "@/screens/shared/CompanyProfileScreen";
import SettingsScreen from "@/screens/shared/SettingsScreen";
import AboutScreen from "@/screens/shared/AboutScreen";

import StaffDashboardScreen from "@/screens/staff/StaffDashboardScreen";
import ScanQRScreen from "@/screens/staff/ScanQRScreen";
import AttendeeSearchScreen from "@/screens/staff/AttendeeSearchScreen";
import StatsScreen from "@/screens/staff/StatsScreen";

export type DrawerParamList = {
  Home: undefined;
  Agenda: undefined;
  Speakers: undefined;
  Companies: undefined;
  CompanyProfile: { companyId: string };
  MyQRCode: undefined;
  Notifications: undefined;
  Profile: undefined;
  Settings: undefined;
  About: undefined;
  Dashboard: undefined;
  ScanQR: undefined;
  AttendeeSearch: undefined;
  Stats: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

interface DrawerItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
  theme: any;
  badge?: string;
}

function DrawerItem({ icon, label, isActive, onPress, theme, badge }: DrawerItemProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        styles.drawerItem,
        {
          backgroundColor: isActive ? theme.drawerActiveBackground : "transparent",
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Feather
        name={icon}
        size={22}
        color={isActive ? theme.drawerActiveTint : theme.drawerInactiveTint}
      />
      <ThemedText
        style={[
          styles.drawerItemLabel,
          { color: isActive ? theme.drawerActiveTint : theme.drawerInactiveTint },
        ]}
      >
        {label}
      </ThemedText>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: AppColors.warning }]}>
          <ThemedText style={styles.badgeText}>{badge}</ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

function SectionDivider({ label, theme }: { label: string; theme: any }) {
  return (
    <View style={styles.sectionDivider}>
      <View style={[styles.sectionLine, { backgroundColor: theme.border }]} />
      <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { state, navigation } = props;

  const isStaff = user?.role === "staff";
  const currentRouteName = state.routes[state.index]?.name;

  const staffMainItems = [
    { name: "Dashboard", icon: "home" as const, label: "Dashboard" },
    { name: "ScanQR", icon: "camera" as const, label: "Scan QR Code" },
    { name: "AttendeeSearch", icon: "search" as const, label: "Attendee List" },
    { name: "Stats", icon: "bar-chart-2" as const, label: "Statistics" },
  ];

  const staffBrowseItems = [
    { name: "Companies", icon: "briefcase" as const, label: "Companies" },
    { name: "Notifications", icon: "bell" as const, label: "Notifications" },
  ];

  const attendeeMainItems = [
    { name: "Home", icon: "home" as const, label: "Home" },
    { name: "Agenda", icon: "calendar" as const, label: "Agenda" },
    { name: "Speakers", icon: "users" as const, label: "Speakers" },
    { name: "Companies", icon: "briefcase" as const, label: "Companies" },
    { name: "MyQRCode", icon: "grid" as const, label: "My QR Code" },
    { name: "Notifications", icon: "bell" as const, label: "Notifications" },
  ];

  const accountItems = [
    { name: "Profile", icon: "user" as const, label: "Profile" },
    { name: "Settings", icon: "settings" as const, label: "Settings" },
    { name: "About", icon: "info" as const, label: "About" },
  ];

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.drawerContent,
        { backgroundColor: theme.drawerBackground, paddingTop: insets.top + Spacing.lg },
      ]}
    >
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
        />
        <ThemedText type="h3" style={styles.appName}>
          Stress Congress 2026
        </ThemedText>
      </View>

      <View style={[styles.userCard, { backgroundColor: theme.backgroundSecondary }]}>
        <Image
          source={require("../../assets/images/default-avatar.png")}
          style={styles.userAvatar}
        />
        <View style={styles.userInfo}>
          <ThemedText type="h4" style={styles.userName} numberOfLines={1}>
            {user?.name || "User"}
          </ThemedText>
          <View style={[styles.roleBadge, { backgroundColor: isStaff ? `${AppColors.warning}20` : `${AppColors.primary}15` }]}>
            <ThemedText style={[styles.userRole, { color: isStaff ? AppColors.warning : theme.primary }]}>
              {isStaff ? "Staff" : "Attendee"}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.menuSection}>
        {isStaff ? (
          <>
            {staffMainItems.map((item) => (
              <DrawerItem
                key={item.name}
                icon={item.icon}
                label={item.label}
                isActive={currentRouteName === item.name}
                onPress={() => navigation.navigate(item.name)}
                theme={theme}
              />
            ))}
            <SectionDivider label="Browse" theme={theme} />
            {staffBrowseItems.map((item) => (
              <DrawerItem
                key={item.name}
                icon={item.icon}
                label={item.label}
                isActive={currentRouteName === item.name}
                onPress={() => navigation.navigate(item.name)}
                theme={theme}
              />
            ))}
          </>
        ) : (
          attendeeMainItems.map((item) => (
            <DrawerItem
              key={item.name}
              icon={item.icon}
              label={item.label}
              isActive={currentRouteName === item.name}
              onPress={() => navigation.navigate(item.name)}
              theme={theme}
            />
          ))
        )}

        <SectionDivider label="Account" theme={theme} />
        {accountItems.map((item) => (
          <DrawerItem
            key={item.name}
            icon={item.icon}
            label={item.label}
            isActive={currentRouteName === item.name}
            onPress={() => navigation.navigate(item.name)}
            theme={theme}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: `${AppColors.error}10`, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Feather name="log-out" size={22} color={AppColors.error} />
          <ThemedText style={[styles.logoutText, { color: AppColors.error }]}>
            Logout
          </ThemedText>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const screenOptions = useScreenOptions();

  const isStaff = user?.role === "staff";

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        ...screenOptions,
        drawerType: "front",
        drawerStyle: {
          width: 280,
          backgroundColor: theme.drawerBackground,
        },
        headerLeft: () => null,
      }}
      initialRouteName={isStaff ? "Dashboard" : "Home"}
    >
      {isStaff ? (
        <>
          <Drawer.Screen
            name="Dashboard"
            component={StaffDashboardScreen}
            options={{ headerTitle: () => <HeaderTitle title="Staff Dashboard" /> }}
          />
          <Drawer.Screen
            name="ScanQR"
            component={ScanQRScreen}
            options={{ headerTitle: "Scan QR Code", headerTransparent: false }}
          />
          <Drawer.Screen
            name="AttendeeSearch"
            component={AttendeeSearchScreen}
            options={{ headerTitle: "Attendee List" }}
          />
          <Drawer.Screen
            name="Stats"
            component={StatsScreen}
            options={{ headerTitle: "Statistics" }}
          />
          <Drawer.Screen
            name="Companies"
            component={CompaniesScreen}
            options={{ headerTitle: "Companies" }}
          />
          <Drawer.Screen
            name="CompanyProfile"
            component={CompanyProfileScreen}
            options={{ headerTitle: "Company", drawerItemStyle: { display: "none" } }}
          />
          <Drawer.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerTitle: "Notifications" }}
          />
          <Drawer.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerTitle: "Profile" }}
          />
          <Drawer.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerTitle: "Settings" }}
          />
          <Drawer.Screen
            name="About"
            component={AboutScreen}
            options={{ headerTitle: "About" }}
          />
        </>
      ) : (
        <>
          <Drawer.Screen
            name="Home"
            component={AttendeeHomeScreen}
            options={{ headerTitle: () => <HeaderTitle title="Stress Congress" /> }}
          />
          <Drawer.Screen
            name="Agenda"
            component={AgendaScreen}
            options={{ headerTitle: "Agenda" }}
          />
          <Drawer.Screen
            name="Speakers"
            component={SpeakersScreen}
            options={{ headerTitle: "Speakers" }}
          />
          <Drawer.Screen
            name="Companies"
            component={CompaniesScreen}
            options={{ headerTitle: "Companies" }}
          />
          <Drawer.Screen
            name="CompanyProfile"
            component={CompanyProfileScreen}
            options={{ headerTitle: "Company", drawerItemStyle: { display: "none" } }}
          />
          <Drawer.Screen
            name="MyQRCode"
            component={MyQRCodeScreen}
            options={{ headerTitle: "My QR Code" }}
          />
          <Drawer.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerTitle: "Notifications" }}
          />
          <Drawer.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerTitle: "Profile" }}
          />
          <Drawer.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerTitle: "Settings" }}
          />
          <Drawer.Screen
            name="About"
            component={AboutScreen}
            options={{ headerTitle: "About" }}
          />
        </>
      )}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  appName: {
    textAlign: "center",
    fontSize: 18,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  userRole: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuSection: {
    flex: 1,
  },
  sectionDivider: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  sectionLine: {
    height: 1,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  drawerItemLabel: {
    marginLeft: Spacing.lg,
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  badgeText: {
    color: AppColors.white,
    fontSize: 11,
    fontWeight: "700",
  },
  footer: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  logoutText: {
    marginLeft: Spacing.lg,
    fontSize: 16,
    fontWeight: "500",
  },
});
