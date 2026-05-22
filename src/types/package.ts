/** UI-ready package shape returned by list/search APIs */
export type PackageListItem = {
  id: string;
  title: string;
  location: string;
  price: number;
  duration: string;
  thumbnail: string;
  tags: string[];
  quickSummary: string;
};

export type PackageItineraryDay = {
  day: number;
  title: string;
  description: string;
};

/** Full UI-ready package detail from GET /packages/:id */
export type PackageDetail = {
  id: string;
  title: string;
  price: number;
  description: string;
  duration: string;
  durationDays: number | null;
  durationNights: number | null;
  image: string;
  coverImage: string;
  images: string[];
  carouselImages: string[];
  location: string;
  city: string;
  tripType: string;
  category: string;
  startDate: string | null;
  endDate: string | null;
  availableSlot: number;
  highlights: string[];
  available: boolean;
  bookable: boolean;
  tags: string[];
  quickSummary: string;
  itinerary: PackageItineraryDay[];
};
