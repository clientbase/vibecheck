# Location Hook Documentation

This custom hook provides easy access to user location data throughout your React application.

## Features

- ✅ TypeScript support with full type safety
- ✅ Error handling for all geolocation scenarios
- ✅ Loading states for better UX
- ✅ Configurable options (accuracy, timeout, etc.)
- ✅ Watch mode for real-time location updates
- ✅ Manual trigger and clear functions
- ✅ Convenience hooks for common use cases

## Basic Usage

```tsx
import { useLocation } from '@/lib/useLocation';

function MyComponent() {
  const { location, error, loading, getLocation, clearLocation } = useLocation();

  return (
    <div>
      <button onClick={getLocation} disabled={loading}>
        {loading ? 'Getting Location...' : 'Get Location'}
      </button>
      
      {location && (
        <div>
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
          <p>Accuracy: {location.accuracy}m</p>
        </div>
      )}
      
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

## Available Hooks

### `useLocation(options?)`
Main hook with full functionality.

### `useLocationOnce(options?)`
Convenience hook for one-time location fetch.

### `useLocationWatch(options?)`
Convenience hook for watching location changes.

## Options

```tsx
interface UseLocationOptions {
  enableHighAccuracy?: boolean; // Default: true
  timeout?: number;             // Default: 10000ms
  maximumAge?: number;          // Default: 60000ms (1 minute)
  watch?: boolean;              // Default: false
}
```

## Return Values

```tsx
interface UseLocationReturn {
  location: LocationData | null;
  error: LocationError | null;
  loading: boolean;
  getLocation: () => void;
  clearLocation: () => void;
}
```

## Location Data

```tsx
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;    // in meters
  timestamp?: number;   // Unix timestamp
}
```

## Error Handling

The hook handles various geolocation errors:

- **PERMISSION_DENIED (1)**: User denied location access
- **POSITION_UNAVAILABLE (2)**: Location unavailable
- **TIMEOUT (3)**: Request timed out
- **Custom (0)**: Browser doesn't support geolocation

## Examples

### One-time Location Fetch
```tsx
const { location, error, loading, getLocation } = useLocationOnce();
```

### Watch Location Changes
```tsx
const { location, error, loading } = useLocationWatch();
```

### Custom Options
```tsx
const { location, error, loading, getLocation } = useLocation({
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 300000, // 5 minutes
});
```

## Browser Compatibility

- ✅ Chrome 5+
- ✅ Firefox 3.5+
- ✅ Safari 5+
- ✅ Edge 12+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile, etc.)

## Privacy Considerations

- Always request location permission explicitly
- Provide clear UI feedback about location usage
- Handle permission denied gracefully
- Consider fallback options for users who deny location access 