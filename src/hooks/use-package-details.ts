import { useCallback, useEffect, useState } from 'react';

import {
  getPackageById,
  getPackageDetailErrorMessage,
} from '@/services/package.service';
import type { PackageDetail } from '@/types/package';

export function usePackageDetails(packageId: string | undefined) {
  const [packageDetail, setPackageDetail] = useState<PackageDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!packageId || Array.isArray(packageId)) {
      setPackageDetail(null);
      setError('Package not found.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const detail = await getPackageById(packageId);
      setPackageDetail(detail);
    } catch (err) {
      setPackageDetail(null);
      setError(getPackageDetailErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    packageDetail,
    isLoading,
    error,
    refetch: fetchDetails,
  };
}
