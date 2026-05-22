import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  createBooking,
  fetchBookingPackageSummary,
  getBookingServiceErrorMessage,
} from '@/services/booking.service';
import type { BookingPackageSummary, PaymentProofImage } from '@/types/booking';

const SUCCESS_REDIRECT_MS = 1800;

function buildPaymentProofAsset(
  asset: ImagePicker.ImagePickerAsset,
): PaymentProofImage {
  const uri = asset.uri;
  const fileName =
    asset.fileName ??
    `payment-proof-${Date.now()}.${asset.mimeType?.includes('png') ? 'png' : 'jpg'}`;
  const mimeType = asset.mimeType ?? 'image/jpeg';
  return { uri, fileName, mimeType };
}

export function useBooking(packageId: string | undefined) {
  const router = useRouter();
  const [packageSummary, setPackageSummary] =
    useState<BookingPackageSummary | null>(null);
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState('');
  const [paymentProof, setPaymentProof] = useState<PaymentProofImage | null>(null);
  const [isLoadingPackage, setIsLoadingPackage] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  const maxSeats = Math.max(packageSummary?.availableSlot ?? 1, 1);

  const canSubmit = useMemo(() => {
    if (!packageSummary?.bookable || !paymentProof || !packageId) return false;
    return seats >= 1 && seats <= maxSeats;
  }, [packageSummary, paymentProof, packageId, seats, maxSeats]);

  const loadPackage = useCallback(async () => {
    if (!packageId) {
      setError('Package not found.');
      setIsLoadingPackage(false);
      return;
    }

    setIsLoadingPackage(true);
    setError(null);

    try {
      const summary = await fetchBookingPackageSummary(packageId);
      if (!summary.bookable) {
        setPackageSummary(summary);
        setError('This package is sold out or no longer available for booking.');
        return;
      }
      setPackageSummary(summary);
      setSeats(1);
    } catch (err) {
      setPackageSummary(null);
      setError(getBookingServiceErrorMessage(err));
    } finally {
      setIsLoadingPackage(false);
    }
  }, [packageId]);

  useEffect(() => {
    loadPackage();
  }, [loadPackage]);

  useEffect(() => {
    if (seats > maxSeats) {
      setSeats(maxSeats);
    }
  }, [maxSeats, seats]);

  const incrementSeats = useCallback(() => {
    setSeats((prev) => Math.min(prev + 1, maxSeats));
  }, [maxSeats]);

  const decrementSeats = useCallback(() => {
    setSeats((prev) => Math.max(prev - 1, 1));
  }, []);

  const pickPaymentProof = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setSubmitError('Photo library permission is required to upload payment proof.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setPaymentProof(buildPaymentProofAsset(result.assets[0]));
      setSubmitError(null);
    }
  }, []);

  const removePaymentProof = useCallback(() => {
    setPaymentProof(null);
  }, []);

  const submitBooking = useCallback(async () => {
    if (!canSubmit || !packageId || !paymentProof) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await createBooking({
        packageId,
        seats,
        message,
        paymentProofImage: paymentProof,
      });

      setSuccessCode(result.bookingCode || null);
      setShowSuccess(true);

      setTimeout(() => {
        router.replace('/(tabs)/');
      }, SUCCESS_REDIRECT_MS);
    } catch (err) {
      setSubmitError(getBookingServiceErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, packageId, paymentProof, seats, message, router]);

  return {
    packageSummary,
    seats,
    maxSeats,
    message,
    setMessage,
    paymentProof,
    isLoadingPackage,
    isSubmitting,
    error,
    submitError,
    showSuccess,
    successCode,
    canSubmit,
    incrementSeats,
    decrementSeats,
    pickPaymentProof,
    removePaymentProof,
    submitBooking,
    refetchPackage: loadPackage,
  };
}
