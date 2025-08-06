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
  timeout: 30000, // 30 seconds - longer timeout for mobile GPS
  maximumAge: 30000, // 30 seconds - allow cached location within 30s
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

    console.log('📍 Starting location request...');
    setLoading(true);
    setError(null);

    const successCallback = (position: GeolocationPosition) => {
      const now = Date.now();
      const timeSinceLastUpdate = location ? now - (location.timestamp || 0) : Infinity;
      
      console.log('✅ Location obtained:', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toLocaleString(),
        timeSinceLastUpdate: `${Math.round(timeSinceLastUpdate / 1000)}s ago`
      });
      
      // Only update if it's been at least 10 seconds since last update
      if (!location || timeSinceLastUpdate > 10000) {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setLocation(locationData);
      } else {
        console.log('⏭️ Skipping location update (too frequent)');
      }
      setLoading(false);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      console.error('❌ Location error:', {
        code: error.code,
        message: error.message
      });
      
      const locationError: LocationError = {
        code: error.code,
        message: error.message,
      };
      setError(locationError);
      setLoading(false);
    };

    if (mergedOptions.watch) {
      console.log('🔄 Starting location watch...');
      const watchId = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        mergedOptions
      );

      // Return cleanup function for watch mode
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.log('📍 Getting current position...');
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