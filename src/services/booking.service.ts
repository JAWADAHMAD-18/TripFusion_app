import { isAxiosError } from 'axios';

import { getPackageById } from '@/services/package.service';
import type { PackageDetail } from '@/types/package';
import type {
  BookingPackageSummary,
  BookingResult,
  CreateBookingInput,
} from '@/types/booking';
import api from '@/services/api';

type ApiRecord = Record<string, unknown>;

export function toBookingPackageSummary(detail: PackageDetail): BookingPackageSummary {
  const location = [detail.city, detail.location].filter(Boolean).join(', ');
  return {
    id: detail.id,
    title: detail.title,
    thumbnail: detail.coverImage || detail.image || detail.carouselImages[0] || '',
    location,
    duration: detail.duration,
    price: detail.price,
    availableSlot: detail.availableSlot,
    bookable: detail.bookable,
  };
}

export async function fetchBookingPackageSummary(
  packageId: string,
): Promise<BookingPackageSummary> {
  const detail = await getPackageById(packageId);
  return toBookingPackageSummary(detail);
}

function extractBookingData(data: unknown): ApiRecord | null {
  if (!data || typeof data !== 'object') return null;
  const payload = data as ApiRecord;
  if (payload.bookingId || payload.bookingCode) return payload;
  if (payload.data && typeof payload.data === 'object') {
    return payload.data as ApiRecord;
  }
  return null;
}

export function normalizeBookingResult(data: unknown): BookingResult {
  const raw = extractBookingData(data);
  if (!raw) {
    throw new Error('Invalid booking response.');
  }

  const bookingId =
    (typeof raw.bookingId === 'string' && raw.bookingId) ||
    (typeof raw._id === 'string' && raw._id) ||
    '';

  return {
    bookingId,
    bookingCode:
      (typeof raw.bookingCode === 'string' && raw.bookingCode) || '',
    bookingStatus:
      (typeof raw.bookingStatus === 'string' && raw.bookingStatus) || 'Pending',
    paymentStatus:
      (typeof raw.paymentStatus === 'string' && raw.paymentStatus) ||
      (typeof raw.payment_status === 'string' && raw.payment_status) ||
      'pending_payment',
    totalPrice:
      typeof raw.totalPrice === 'number'
        ? raw.totalPrice
        : typeof raw.total_price === 'number'
          ? raw.total_price
          : null,
    message:
      (typeof raw.message === 'string' && raw.message) ||
      'Booking created successfully',
  };
}

/**
 * Creates a booking with multipart payment proof.
 * Maps UI fields to backend: package, numPeople, notes, paymentProof.
 */
export async function createBooking(
  input: CreateBookingInput,
): Promise<BookingResult> {
  const formData = new FormData();
  formData.append('package', input.packageId);
  formData.append('numPeople', String(input.seats));

  const trimmedMessage = input.message.trim();
  if (trimmedMessage) {
    formData.append('notes', trimmedMessage);
  }

  formData.append('paymentProof', {
    uri: input.paymentProofImage.uri,
    name: input.paymentProofImage.fileName,
    type: input.paymentProofImage.mimeType,
  } as unknown as Blob);

  const { data } = await api.post('/bookings', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return normalizeBookingResult(data);
}

export function getBookingServiceErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message ?? data?.error ?? 'Unable to complete booking.';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Unable to complete booking.';
}
