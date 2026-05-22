export type PaymentProofImage = {
  uri: string;
  fileName: string;
  mimeType: string;
};

export type BookingPackageSummary = {
  id: string;
  title: string;
  thumbnail: string;
  location: string;
  duration: string;
  price: number;
  availableSlot: number;
  bookable: boolean;
};

export type CreateBookingInput = {
  packageId: string;
  seats: number;
  message: string;
  paymentProofImage: PaymentProofImage;
};

export type BookingResult = {
  bookingId: string;
  bookingCode: string;
  bookingStatus: string;
  paymentStatus: string;
  totalPrice: number | null;
  message: string;
};
