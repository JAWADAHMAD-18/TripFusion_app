import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { View } from 'react-native';

export default function LoginTab() {
  const router = useRouter();
  const setGuestMode = useAuthStore((state) => state.setGuestMode);

  useEffect(() => {
    setGuestMode(false);
    router.replace('/(auth)/login');
  }, []);

  return <View />;
}
