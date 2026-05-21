import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { AUTH_BACKGROUND_IMAGE_URI } from '@/constants/auth';
import { gradients } from '@/constants/theme';

type AuthScreenBackgroundProps = {
  children: ReactNode;
};

export function AuthScreenBackground({ children }: AuthScreenBackgroundProps) {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: AUTH_BACKGROUND_IMAGE_URI }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={gradients.authMountain.colors}
        locations={[...gradients.authMountain.locations]}
        start={gradients.authMountain.start}
        end={gradients.authMountain.end}
        style={styles.overlay}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
