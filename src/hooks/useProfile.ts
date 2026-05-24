import { useCallback, useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '@/store/authStore';
import * as userService from '@/services/userService';
import type { UpdateProfilePayload } from '@/services/userService';
import * as bookingService from '@/services/bookingService';
import type { TravelSummary } from '@/services/bookingService';

export function useProfile() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [travelSummary, setTravelSummary] = useState<TravelSummary | null>(
    null,
  );

  const fetchCurrentUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const freshUser = await userService.getCurrentUser();
      if (token) {
        await setAuth(freshUser, token);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [token, setAuth]);

  const fetchTravelSummary = useCallback(async () => {
    try {
      const summary = await bookingService.getTravelSummary();
      setTravelSummary(summary);
    } catch {
      // silently fail — summary is non-critical
    }
  }, []);

  const updateProfile = useCallback(
    async (
      payload: UpdateProfilePayload,
    ): Promise<{ success: boolean }> => {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const updatedUser = await userService.updateProfile(payload);
        if (token) {
          await setAuth(updatedUser, token);
        }
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
        return { success: true };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update profile';
        setError(message);
        return { success: false };
      } finally {
        setIsSaving(false);
      }
    },
    [token, setAuth],
  );

  const pickProfileImage = useCallback(async (): Promise<{
    uri: string;
    type: string;
    name: string;
  } | null> => {
    setError(null);
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      setError('Permission required to access photos');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1] as [number, number],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    return {
      uri: result.assets[0].uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    };
  }, []);

  useEffect(() => {
    void fetchCurrentUser();
    void fetchTravelSummary();
  }, [fetchCurrentUser, fetchTravelSummary]);

  return {
    user,
    isLoading,
    isSaving,
    error,
    successMessage,
    travelSummary,
    fetchCurrentUser,
    updateProfile,
    pickProfileImage,
  };
}
