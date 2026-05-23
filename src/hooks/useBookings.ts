import { useCallback, useEffect, useState } from 'react';

import {
  cancelBooking as cancelBookingRequest,
  getMyBookings,
  getUpcomingBookings,
  type Booking,
} from '@/services/bookingService';

export function useBookings() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllBookings = useCallback(async () => {
    setIsLoadingAll(true);
    setError(null);
    try {
      const bookings = await getMyBookings();
      setAllBookings(bookings);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load bookings';
      setError(message);
      setAllBookings([]);
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  const fetchUpcomingBookings = useCallback(async () => {
    setIsLoadingUpcoming(true);
    try {
      const bookings = await getUpcomingBookings();
      setUpcomingBookings(bookings);
    } catch {
      setUpcomingBookings([]);
    } finally {
      setIsLoadingUpcoming(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([fetchAllBookings(), fetchUpcomingBookings()]);
  }, [fetchAllBookings, fetchUpcomingBookings]);

  const cancelBooking = useCallback(
    async (id: string, reason: string) => {
      await cancelBookingRequest(id, reason);
      await fetchAllBookings();
      await fetchUpcomingBookings();
    },
    [fetchAllBookings, fetchUpcomingBookings],
  );

  useEffect(() => {
    void fetchAllBookings();
    void fetchUpcomingBookings();
  }, [fetchAllBookings, fetchUpcomingBookings]);

  return {
    allBookings,
    upcomingBookings,
    isLoadingAll,
    isLoadingUpcoming,
    error,
    fetchAllBookings,
    fetchUpcomingBookings,
    cancelBooking,
    refresh,
  };
}
