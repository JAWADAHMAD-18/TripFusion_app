import api from '@/services/api';

export interface PackageSnapshot {
  title: string;
  destination: string;
  durationDays: number;
  basePrice: number;
  category: string;
  tripType: string;
  start_date: string;
  end_date: string;
  images: string[];
  includes: string[];
  excludes: string[];
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Cancelled'
  | 'Completed';

export type PaymentStatus = 'NotPaid' | 'Paid' | 'Refunded';

export interface Booking {
  _id: string;
  bookingId: string;
  bookingCode: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  payment_status: string;
  numPeople: number;
  pricePerPerson: number;
  totalPrice: number;
  savings: number;
  durationDays: number;
  durationNights: number;
  travelDate: string;
  start_date: string;
  end_date: string;
  packageSnapshot: PackageSnapshot;
  cancelReason?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface TravelSummary {
  totalSpent: number;
  fusionSavings: number;
  categoryBreakdown: { name: string; percentage: number }[];
}

function extractData<T>(response: { data: unknown }): T {
  const body = response.data as { data?: T };
  return body.data as T;
}

export async function getMyBookings(): Promise<Booking[]> {
  const response = await api.get('/bookings/me');
  const data = extractData<Booking[]>(response);
  return Array.isArray(data) ? data : [];
}

export async function getUpcomingBookings(): Promise<Booking[]> {
  const response = await api.get('/bookings/upcoming');
  const data = extractData<Booking[]>(response);
  return Array.isArray(data) ? data : [];
}

export async function getBookingById(id: string): Promise<Booking> {
  const response = await api.get(`/bookings/${id}`);
  return extractData<Booking>(response);
}

export async function cancelBooking(
  id: string,
  cancelReason: string,
): Promise<void> {
  await api.patch(`/bookings/${id}/cancel`, { cancelReason });
}

export async function getTravelSummary(): Promise<TravelSummary> {
  const response = await api.get('/bookings/summary');
  return extractData<TravelSummary>(response);
}
