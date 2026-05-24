import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import {
  borderRadius,
  colors,
  shadows,
  spacing,
} from '@/constants/theme';
import { FloatingChatButton } from '@/components/chat/FloatingChatButton';

type IoniconName = keyof typeof Ionicons.glyphMap;

function TabBarBackground() {
  return (
    <BlurView
      experimentalBlurMethod="dimezisBlurView"
      tint="light"
      intensity={60}
      style={StyleSheet.absoluteFill}
    />
  );
}

function TabIcon({
  focused,
  color,
  activeIcon,
  inactiveIcon,
}: {
  focused: boolean;
  color: string;
  activeIcon: IoniconName;
  inactiveIcon: IoniconName;
}) {
  const icon = (
    <Ionicons
      name={focused ? activeIcon : inactiveIcon}
      size={24}
      color={color}
    />
  );

  if (!focused) {
    return icon;
  }

  return <View style={styles.iconActiveWrap}>{icon}</View>;
}

export default function TabsLayout() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: colors.accent.teal,
          tabBarInactiveTintColor: colors.surface.tabIconInactive,
          tabBarBackground: () => <TabBarBackground />,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                focused={focused}
                color={color}
                activeIcon="home"
                inactiveIcon="home-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="packages"
          options={{
            title: 'Packages',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                focused={focused}
                color={color}
                activeIcon="grid"
                inactiveIcon="grid-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{
            title: 'Bookings',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                focused={focused}
                color={color}
                activeIcon="calendar"
                inactiveIcon="calendar-outline"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon
                focused={focused}
                color={color}
                activeIcon="person"
                inactiveIcon="person-outline"
              />
            ),
          }}
        />
      </Tabs>
      <FloatingChatButton onPress={() => router.push('/chat')} />
    </View>
  );
}

const TAB_BAR_HEIGHT = spacing.xxxl * 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    bottom: spacing.xxl,
    left: spacing.xl,
    right: spacing.xl,
    height: TAB_BAR_HEIGHT,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.surface.tabBar,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: colors.surface.tabBarBorder,
    overflow: 'hidden',
    ...shadows.lg,
  },
  tabBarItem: {
    paddingVertical: spacing.sm,
  },
  iconActiveWrap: {
    backgroundColor: colors.surface.tabIconActiveGlow,
    borderRadius: borderRadius.full,
    padding: spacing.sm,
  },
});

