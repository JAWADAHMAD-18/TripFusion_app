import { isAxiosError } from 'axios';

import type {
  PackageDetail,
  PackageItineraryDay,
  PackageListItem,
} from '@/types/package';
import api from '@/services/api';

type ApiPackageRecord = Record<string, unknown>;

function extractRawPackages(data: unknown): ApiPackageRecord[] {
  if (!data || typeof data !== 'object') return [];
  const payload = data as Record<string, unknown>;

  if (Array.isArray(payload.packages)) {
    return payload.packages as ApiPackageRecord[];
  }
  if (Array.isArray(payload.data)) {
    return payload.data as ApiPackageRecord[];
  }

  const nested = payload.data;
  if (nested && typeof nested === 'object') {
    const nestedObj = nested as Record<string, unknown>;
    if (Array.isArray(nestedObj.packages)) {
      return nestedObj.packages as ApiPackageRecord[];
    }
    if (Array.isArray(nestedObj.results)) {
      return nestedObj.results as ApiPackageRecord[];
    }
  }

  return [];
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

function formatDuration(raw: ApiPackageRecord): string {
  if (typeof raw.duration === 'string' && raw.duration.trim()) {
    return raw.duration;
  }
  const days = raw.durationDays;
  if (typeof days === 'number') {
    return `${days} days`;
  }
  return '';
}

function formatPrice(raw: ApiPackageRecord): number {
  if (typeof raw.price === 'number') return raw.price;
  if (typeof raw.price === 'string') {
    const parsed = Number(raw.price);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function buildQuickSummary(raw: ApiPackageRecord): string {
  if (typeof raw.quickSummary === 'string' && raw.quickSummary.trim()) {
    return raw.quickSummary;
  }
  if (typeof raw.description === 'string' && raw.description.trim()) {
    return raw.description;
  }
  if (typeof raw.highlights === 'string' && raw.highlights.trim()) {
    return raw.highlights;
  }
  return '';
}

/** Normalizes API records into UI-ready list items (service layer only). */
export function normalizePackageListItem(raw: ApiPackageRecord): PackageListItem {
  const id =
    (typeof raw.id === 'string' && raw.id) ||
    (typeof raw._id === 'string' && raw._id) ||
    '';

  const title =
    (typeof raw.title === 'string' && raw.title) ||
    (typeof raw.name === 'string' && raw.name) ||
    'Untitled package';

  const location =
    (typeof raw.location === 'string' && raw.location) ||
    (typeof raw.destination === 'string' && raw.destination) ||
    (typeof raw.city === 'string' && raw.city) ||
    '';

  const thumbnail =
    (typeof raw.thumbnail === 'string' && raw.thumbnail) ||
    (typeof raw.image === 'string' && raw.image) ||
    (typeof raw.coverImage === 'string' && raw.coverImage) ||
    (Array.isArray(raw.images) &&
      typeof raw.images[0] === 'string' &&
      raw.images[0]) ||
    '';

  return {
    id,
    title,
    location,
    price: formatPrice(raw),
    duration: formatDuration(raw),
    thumbnail,
    tags: toStringArray(raw.tags ?? raw.trip_type ?? raw.category),
    quickSummary: buildQuickSummary(raw),
  };
}

function mapPackagesResponse(data: unknown): PackageListItem[] {
  return extractRawPackages(data)
    .map(normalizePackageListItem)
    .filter((item) => item.id);
}

export async function getPackages(): Promise<PackageListItem[]> {
  const { data } = await api.get('/packages');
  return mapPackagesResponse(data);
}

export async function searchPackages(query: string): Promise<PackageListItem[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return getPackages();
  }

  try {
    const { data } = await api.get('/packages/search', {
      params: { q: trimmed, search: trimmed },
    });
    return mapPackagesResponse(data);
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      const { data } = await api.get('/packages', {
        params: { search: trimmed, q: trimmed },
      });
      return mapPackagesResponse(data);
    }
    throw error;
  }
}

function parseHighlights(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw
      .split(/[,;•\n|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseDateValue(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toISOString();
}

function parseNumber(raw: unknown): number | null {
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw;
  if (typeof raw === 'string') {
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function parseBoolean(raw: unknown, fallback = true): boolean {
  if (typeof raw === 'boolean') return raw;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return fallback;
}

function extractImageList(raw: ApiPackageRecord): string[] {
  const urls: string[] = [];
  const push = (value: unknown) => {
    if (typeof value === 'string' && value.trim() && !urls.includes(value)) {
      urls.push(value);
    }
  };

  push(raw.coverImage);
  push(raw.image);
  if (Array.isArray(raw.images)) {
    raw.images.forEach(push);
  }
  push(raw.thumbnail);

  return urls;
}

function buildCarouselImages(raw: ApiPackageRecord): string[] {
  const ordered: string[] = [];
  const add = (value: unknown) => {
    if (typeof value === 'string' && value.trim() && !ordered.includes(value)) {
      ordered.push(value);
    }
  };

  add(raw.coverImage);
  if (Array.isArray(raw.images)) {
    raw.images.forEach(add);
  }
  add(raw.image);

  return ordered;
}

function normalizeItinerary(raw: unknown): PackageItineraryDay[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null;
      const dayRecord = item as Record<string, unknown>;
      const dayNumber =
        typeof dayRecord.day === 'number'
          ? dayRecord.day
          : typeof dayRecord.dayNumber === 'number'
            ? dayRecord.dayNumber
            : index + 1;

      const title =
        (typeof dayRecord.title === 'string' && dayRecord.title) ||
        (typeof dayRecord.name === 'string' && dayRecord.name) ||
        `Day ${dayNumber}`;

      const description =
        (typeof dayRecord.description === 'string' && dayRecord.description) ||
        (typeof dayRecord.activities === 'string' && dayRecord.activities) ||
        (typeof dayRecord.summary === 'string' && dayRecord.summary) ||
        '';

      if (!description.trim()) return null;

      return { day: dayNumber, title, description };
    })
    .filter((item): item is PackageItineraryDay => item !== null);
}

function extractSinglePackage(data: unknown): ApiPackageRecord | null {
  if (!data || typeof data !== 'object') return null;
  const payload = data as Record<string, unknown>;

  if (payload._id || payload.id || payload.title) {
    return payload as ApiPackageRecord;
  }

  const nested = payload.data;
  if (nested && typeof nested === 'object') {
    return nested as ApiPackageRecord;
  }

  if (typeof payload.package === 'object' && payload.package) {
    return payload.package as ApiPackageRecord;
  }

  return null;
}

/** Normalizes API record into UI-ready package detail. */
export function normalizePackageDetail(raw: ApiPackageRecord): PackageDetail {
  const listBase = normalizePackageListItem(raw);
  const images = extractImageList(raw);
  const carouselImages = buildCarouselImages(raw);
  const itinerary = normalizeItinerary(raw.itinerary ?? raw.itineraryDays);
  const description =
    (typeof raw.description === 'string' && raw.description.trim()) ||
    listBase.quickSummary;
  const durationDays = parseNumber(raw.durationDays);
  const durationNights = parseNumber(raw.durationNights);
  const availableSlot = parseNumber(raw.available_slot) ?? 0;
  const available = parseBoolean(raw.available, true);
  const bookable = available && availableSlot > 0;
  const tripType =
    (typeof raw.trip_type === 'string' && raw.trip_type) ||
    (typeof raw.tripType === 'string' && raw.tripType) ||
    '';
  const category = (typeof raw.category === 'string' && raw.category) || '';
  const city = (typeof raw.city === 'string' && raw.city) || '';
  const coverImage =
    (typeof raw.coverImage === 'string' && raw.coverImage) ||
    (typeof raw.image === 'string' && raw.image) ||
    images[0] ||
    '';
  const image =
    (typeof raw.image === 'string' && raw.image) || coverImage || '';

  return {
    id: listBase.id,
    title: listBase.title,
    price: listBase.price,
    description,
    duration: listBase.duration,
    durationDays,
    durationNights,
    image,
    coverImage,
    images: images.length > 0 ? images : carouselImages,
    carouselImages:
      carouselImages.length > 0
        ? carouselImages
        : images.length > 0
          ? images
          : listBase.thumbnail
            ? [listBase.thumbnail]
            : [],
    location: listBase.location,
    city,
    tripType,
    category,
    startDate: parseDateValue(raw.start_date ?? raw.startDate),
    endDate: parseDateValue(raw.end_date ?? raw.endDate),
    availableSlot,
    highlights: parseHighlights(raw.highlights),
    available,
    bookable,
    tags: [
      ...new Set([
        ...listBase.tags,
        ...(tripType ? [tripType] : []),
        ...(category ? [category] : []),
      ]),
    ],
    quickSummary: description,
    itinerary,
  };
}

export async function getPackageById(packageId: string): Promise<PackageDetail> {
  const { data } = await api.get(`/packages/${packageId}`);
  const raw = extractSinglePackage(data);

  if (!raw) {
    throw new Error('Package not found.');
  }

  const detail = normalizePackageDetail(raw);
  if (!detail.id) {
    throw new Error('Package not found.');
  }

  return detail;
}

export function getPackageServiceErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message ?? data?.error ?? 'Unable to load packages.';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Unable to load packages.';
}

export function getPackageDetailErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message ?? data?.error ?? 'Unable to load package details.';
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Unable to load package details.';
}
