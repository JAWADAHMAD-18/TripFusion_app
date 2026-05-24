import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { gradients, shadows } from '@/constants/theme';

interface FloatingChatButtonProps {
  onPress: () => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onPress,
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.touchable}
      >
        <LinearGradient
          colors={gradients.tealAccent.colors as [string, string, ...string[]]}
          start={gradients.tealAccent.start}
          end={gradients.tealAccent.end}
          style={styles.gradient}
        >
          <Ionicons name="chatbubble-ellipses" color="#ffffff" size={24} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 999,
    width: 56,
    height: 56,
    borderRadius: 28,
    ...shadows.floatingTeal,
  },
  touchable: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
