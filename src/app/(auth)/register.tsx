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

import { AuthScreenBackground } from '@/components/auth-screen-background';
import { AUTH_HEADER_PADDING_TOP } from '@/constants/auth';
import {
  borderRadius,
  colors,
  fontSizes,
  gradients,
  spacing,
} from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useButtonPressAnimation, useFadeUpAnimation } from '@/utils/animations';

const BUTTON_HEIGHT = spacing.xxxl + spacing.xl;
const MIN_PASSWORD_LENGTH = 6;

function validateRegisterForm(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
): string | null {
  if (!name.trim()) {
    return 'Please enter your full name.';
  }
  if (!email.trim()) {
    return 'Please enter your email.';
  }
  if (!email.includes('@')) {
    return 'Please enter a valid email address.';
  }
  if (!password) {
    return 'Please enter a password.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return 'Password must be at least 6 characters.';
  }
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const animatedStyle = useFadeUpAnimation();
  const { animatedStyle: buttonAnimatedStyle, onPressIn, onPressOut } =
    useButtonPressAnimation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRegister = async () => {
    const validationError = validateRegisterForm(
      name,
      email,
      password,
      confirmPassword,
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    const result = await register(name.trim(), email.trim(), password);
    if (result.success) {
      router.replace('/(tabs)/');
      return;
    }

    setError(result.error);
  };

  return (
    <AuthScreenBackground>
      {router.canGoBack() && (
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="white" />
        </Pressable>
      )}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.animatedContent, animatedStyle]}>
            <View style={styles.header}>
              <Text style={styles.logoEmoji}>✈️</Text>
              <Text style={styles.brandTitle}>TripFusion</Text>
              <Text style={styles.brandSubtitle}>Create your account</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View
                  style={[
                    styles.iconInputRow,
                    nameFocused && styles.inputFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={fontSizes.xl}
                    color={colors.text.onDark.faint}
                  />
                  <TextInput
                    style={styles.iconInput}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.text.onDark.placeholder}
                    autoCapitalize="words"
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, emailFocused && styles.inputFocused]}
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
                    placeholder="Create a password"
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

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View
                  style={[
                    styles.passwordRow,
                    confirmFocused && styles.inputFocused,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.text.onDark.placeholder}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => setConfirmFocused(false)}
                  />
                  <Pressable
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    hitSlop={spacing.sm}
                    accessibilityRole="button"
                    accessibilityLabel={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                  >
                    <Ionicons
                      name={
                        showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                      }
                      size={fontSizes.xl}
                      color={colors.text.onDark.faint}
                    />
                  </Pressable>
                </View>
              </View>

              <Animated.View style={buttonAnimatedStyle}>
                <Pressable
                  onPress={onRegister}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  disabled={isLoading}
                  style={styles.registerButtonPressable}
                >
                  <LinearGradient
                    colors={gradients.tealAccent.colors}
                    start={gradients.tealAccent.start}
                    end={gradients.tealAccent.end}
                    style={styles.registerButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.text.light} />
                    ) : (
                      <Text style={styles.registerButtonText}>
                        Create Account
                      </Text>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.footerLink}>Login</Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthScreenBackground>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 52,
    left: spacing.xl,
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
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
  iconInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.auth.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.auth.inputBorder,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  iconInput: {
    flex: 1,
    color: colors.text.light,
    fontSize: fontSizes.md,
    paddingVertical: spacing.sm,
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
  registerButtonPressable: {
    marginTop: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  registerButton: {
    height: BUTTON_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  registerButtonText: {
    color: colors.text.light,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error.main,
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
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
