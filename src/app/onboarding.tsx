import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  spacing,
} from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { markOnboardingComplete } from '@/utils/storage';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const slides = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fm=jpg',
    title: 'Discover the World',
    subtitle: 'Explore breathtaking destinations near and far',
    accent: colors.accent.teal,
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80&fm=jpg',
    title: 'Book with Ease',
    subtitle: 'Secure your dream trip in just a few taps',
    accent: colors.accent.blue,
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fm=jpg',
    title: 'AI Travel Assistant',
    subtitle: 'Get instant travel advice powered by Gemini AI',
    accent: colors.accent.teal,
  },
];

function useFadeUpActiveAnimation(isActive: boolean, delay: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    if (isActive) {
      opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
      translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(20, { duration: 150 });
    }
  }, [isActive, delay, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

type SlideItemProps = {
  slide: typeof slides[0];
  isActive: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onGuest: () => void;
};

function SlideItem({ slide, isActive, onLogin, onRegister, onGuest }: SlideItemProps) {
  const pillStyle = useFadeUpActiveAnimation(isActive, 100);
  const titleStyle = useFadeUpActiveAnimation(isActive, 200);
  const subtitleStyle = useFadeUpActiveAnimation(isActive, 350);

  if (slide.image) {
    return (
      <View style={styles.slideContainer}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.primary }]}>
          <Image
            source={{ uri: slide.image }}
            style={styles.backgroundImage}
            resizeMode="cover"
            onError={() => console.log('Image failed to load')}
          />
        </View>
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(10,26,68,0.7)', 'rgba(10,26,68,0.95)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.contentContainer}>
          <Animated.View
            style={[
              styles.pill,
              {
                backgroundColor: slide.accent + '33',
                borderColor: slide.accent,
              },
              pillStyle,
            ]}
          >
            <Text style={[styles.pillText, { color: slide.accent }]}>
              TripFusion
            </Text>
          </Animated.View>

          <Animated.Text style={[styles.title, titleStyle]}>
            {slide.title}
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            {slide.subtitle}
          </Animated.Text>

          {slide.id === '3' && (
            <Animated.View style={[styles.ctaContainer, subtitleStyle]}>
              <Pressable onPress={onGuest} style={styles.ctaButtonPressable}>
                <LinearGradient
                  colors={gradients.tealAccent.colors}
                  start={gradients.tealAccent.start}
                  end={gradients.tealAccent.end}
                  style={styles.ctaButton}
                >
                  <Text style={styles.ctaButtonText}>Get Started</Text>
                </LinearGradient>
              </Pressable>

              <View style={styles.ctaRow}>
                <Pressable onPress={onLogin}>
                  <Text style={styles.ctaLinkText}>Login</Text>
                </Pressable>
                <Text style={styles.ctaSeparator}>•</Text>
                <Pressable onPress={onRegister}>
                  <Text style={styles.ctaLinkText}>Register</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
    );
  }

  return null;
}

function Dot({ index, currentIndex }: { index: number; currentIndex: number }) {
  const isActive = index === currentIndex;
  const width = useSharedValue(isActive ? 24 : 8);

  useEffect(() => {
    width.value = withSpring(isActive ? 24 : 8, { damping: 15 });
  }, [isActive, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: isActive ? 1 : 0.4,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < slides.length) {
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * screenWidth,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }
  };

  const onSkip = () => {
    flatListRef.current?.scrollToOffset({
      offset: 2 * screenWidth,
      animated: true,
    });
    setCurrentIndex(2);
  };

  const handleLogin = async () => {
    try {
      await markOnboardingComplete(true);
      router.push('/(auth)/login');
    } catch (e) {
      router.push('/(auth)/login');
    }
  };

  const handleRegister = async () => {
    try {
      await markOnboardingComplete(true);
      router.push('/(auth)/register');
    } catch (e) {
      router.push('/(auth)/register');
    }
  };

  const handleGuest = async () => {
    try {
      await markOnboardingComplete(false);
      useAuthStore.getState().setGuestMode(true);
      router.push('/(tabs)/');
    } catch (e) {
      router.push('/(tabs)/');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / screenWidth
          );
          setCurrentIndex(index);
        }}
        renderItem={({ item, index }) => (
          <SlideItem
            slide={item}
            isActive={currentIndex === index}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onGuest={handleGuest}
          />
        )}
      />

      <View style={styles.controlsContainer}>
        {currentIndex < 2 && (
          <Pressable onPress={onSkip} style={styles.skipButton} hitSlop={spacing.md}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}

        <View style={styles.dotsRow}>
          {slides.map((_, i) => (
            <Dot key={i.toString()} index={i} currentIndex={currentIndex} />
          ))}
        </View>

        {currentIndex < 2 && (
          <Pressable onPress={onNext} style={styles.nextButton}>
            <LinearGradient
              colors={gradients.tealAccent.colors}
              start={gradients.tealAccent.start}
              end={gradients.tealAccent.end}
              style={styles.nextGradient}
            >
              <Ionicons name="arrow-forward" size={22} color={colors.text.light} />
            </LinearGradient>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  slideContainer: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'flex-end',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    paddingHorizontal: spacing.xxxl,
    paddingBottom: 120,
  },
  pill: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  pillText: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  title: {
    color: colors.text.light,
    fontSize: fontSizes.jumbo,
    fontWeight: '700',
    lineHeight: 52,
    marginBottom: spacing.md,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSizes.lg,
    lineHeight: 26,
  },
  ctaContainer: {
    paddingHorizontal: spacing.xxxl,
    marginTop: spacing.xxl,
    width: '100%',
    alignSelf: 'center',
  },
  ctaButtonPressable: {
    width: '100%',
    marginBottom: spacing.md,
  },
  ctaButton: {
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: colors.text.light,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  ctaLinkText: {
    color: colors.text.light,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  ctaSeparator: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: fontSizes.sm,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
  },
  skipButton: {
    position: 'absolute',
    left: spacing.xxl,
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: fontSizes.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.text.light,
  },
  nextButton: {
    position: 'absolute',
    right: spacing.xxl,
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  nextGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
