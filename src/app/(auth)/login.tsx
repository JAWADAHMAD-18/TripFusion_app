import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { AUTH_HEADER_PADDING_TOP } from '@/constants/auth';
import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  spacing,
} from '@/constants/theme';
import { AuthScreenBackground } from '@/components/auth-screen-background';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useButtonPressAnimation, useFadeUpAnimation } from '@/utils/animations';

const BUTTON_HEIGHT = spacing.xxxl + spacing.xl;

export default function LoginScreen() {
  const animatedStyle = useFadeUpAnimation();
  const { animatedStyle: buttonStyle, onPressIn, onPressOut } =
    useButtonPressAnimation();
  useAuthStore((state) => state.isAuthenticated);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async () => {
    const trimmedEmail = (email ?? '').trim();
    if ((trimmedEmail?.length ?? 0) === 0 || (password?.length ?? 0) === 0) {
      setError('Please enter your email and password.');
      return;
    }

    setError(null);

    const result = await login(trimmedEmail, password);
    if (result.success) {
      router.replace('/(tabs)/');
      return;
    }

    setError(result.error ?? 'Login failed. Try again.');
  };

  const onGooglePress = () => {
    console.log('Google auth');
  };

  return (
    <AuthScreenBackground>
      <Animated.View style={[styles.screenAnimated, animatedStyle]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.animatedContent}>
            <View style={styles.header}>
              <Text style={styles.logoEmoji}>✈️</Text>
              <Text style={styles.brandTitle}>TripFusion</Text>
              <Text style={styles.brandSubtitle}>Your journey starts here</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    emailFocused && styles.inputFocused,
                  ]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.text.onDark.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.passwordRow,
                    passwordFocused && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.text.onDark.placeholder}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <Pressable
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={spacing.sm}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showPassword ? 'Hide password' : 'Show password'
                    }
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={fontSizes.xl}
                      color={colors.text.onDark.faint}
                    />
                  </Pressable>
                </View>
              </View>

              <Animated.View style={buttonStyle}>
                <Pressable
                  onPress={onLogin}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  disabled={isLoading}
                  style={({ pressed }) => [
                    styles.loginButtonPressable,
                    pressed && isLoading && styles.buttonDisabled,
                  ]}
                >
                  <LinearGradient
                    colors={gradients.tealAccent.colors}
                    start={gradients.tealAccent.start}
                    end={gradients.tealAccent.end}
                    style={styles.loginButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.text.light} />
                    ) : (
                      <Text style={styles.loginButtonText}>Login</Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                onPress={onGooglePress}
                style={styles.googleButton}
                accessibilityRole="button"
              >
                <Text style={styles.googleLogo}>G</Text>
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>{"Don't have an account? "}</Text>
              <Pressable onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.footerLink}>Register</Text>
              </Pressable>
            </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </AuthScreenBackground>
  );
}

const styles = StyleSheet.create({
  screenAnimated: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  animatedContent: {
    flex: 1,
  },
  header: {
    paddingTop: AUTH_HEADER_PADDING_TOP,
    alignItems: 'center',
    paddingBottom: spacing.xxxl,
  },
  logoEmoji: {
    fontSize: fontSizes.display + spacing.md,
    textAlign: 'center',
  },
  brandTitle: {
    color: colors.text.light,
    fontSize: fontSizes.display,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  brandSubtitle: {
    color: colors.text.onDark.subtitle,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: colors.auth.card,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.auth.cardBorder,
    padding: spacing.xxl,
    marginHorizontal: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text.light,
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.auth.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.auth.inputBorder,
    padding: spacing.lg,
    color: colors.text.light,
    fontSize: fontSizes.md,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.auth.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.auth.inputBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  passwordInput: {
    flex: 1,
    color: colors.text.light,
    fontSize: fontSizes.md,
    paddingVertical: spacing.sm,
  },
  inputFocused: {
    borderColor: colors.accent.teal,
  },
  loginButtonPressable: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  loginButton: {
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  loginButtonText: {
    color: colors.text.light,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  errorText: {
    color: colors.error.main,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.auth.inputBorder,
  },
  dividerText: {
    color: colors.text.onDark.faint,
    fontSize: fontSizes.xs,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: BUTTON_HEIGHT,
    backgroundColor: colors.auth.googleButton,
    borderWidth: 1,
    borderColor: colors.auth.inputBorder,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  googleLogo: {
    color: colors.accent.blue,
    fontSize: fontSizes.lg,
    fontWeight: '700',
  },
  googleButtonText: {
    color: colors.text.light,
    fontSize: fontSizes.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    color: colors.text.onDark.muted,
    fontSize: fontSizes.sm,
  },
  footerLink: {
    color: colors.accent.teal,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
});
