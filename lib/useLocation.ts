import { useState, useEffect, useCallback, useMemo } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export interface UseLocationReturn {
  location: LocationData | null;
  error: LocationError | null;
  loading: boolean;
  getLocation: () => void;
  clearLocation: () => void;
}

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  watch?: boolean;
}

const defaultOptions: UseLocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000, // 1 minute
  watch: false,
};

export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Check permission status
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'denied') {
          setError({
            code: 1,
            message: 'Location permission denied. Please enable location access in your browser settings.',
          });
        }
      });
    }
  }, []);

  const mergedOptions = useMemo(() => ({ ...defaultOptions, ...options }), [options]);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser.',
      });
      return;
    }

    setLoading(true);
    setError(null);

    const successCallback = (position: GeolocationPosition) => {
      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
      setLocation(locationData);
      setLoading(false);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      const locationError: LocationError = {
        code: error.code,
        message: error.message,
      };
      setError(locationError);
      setLoading(false);
    };

    if (mergedOptions.watch) {
      const watchId = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        mergedOptions
      );

      // Return cleanup function for watch mode
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        mergedOptions
      );
    }
  }, [mergedOptions.enableHighAccuracy, mergedOptions.timeout, mergedOptions.maximumAge, mergedOptions.watch]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    setLoading(false);
  }, []);

  // Auto-get location on mount if watch is enabled
  useEffect(() => {
    if (mergedOptions.watch) {
      getLocation();
    }
  }, [mergedOptions.watch, getLocation]);

  return {
    location,
    error,
    loading,
    getLocation,
    clearLocation,
  };
}

// Convenience hook for one-time location fetch
export function useLocationOnce(options: Omit<UseLocationOptions, 'watch'> = {}): UseLocationReturn {
  return useLocation({ ...options, watch: false });
}

// Convenience hook for watching location changes
export function useLocationWatch(options: Omit<UseLocationOptions, 'watch'> = {}): UseLocationReturn {
  return useLocation({ ...options, watch: true });
} 