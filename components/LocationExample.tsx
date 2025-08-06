'use client';

import { useLocation, useLocationOnce, useLocationWatch } from '@/lib/useLocation';

export function LocationExample() {
  // Basic usage - manual trigger
  const { location, error, loading, getLocation, clearLocation } = useLocation();

  // One-time location fetch
  const { location: locationOnce, error: errorOnce, loading: loadingOnce, getLocation: getLocationOnce } = useLocationOnce();

  // Watch location changes
  const { location: locationWatch, error: errorWatch, loading: loadingWatch } = useLocationWatch();

  // Debug logging
  console.log('🔍 LocationExample render:', {
    location,
    error,
    loading,
    locationOnce,
    errorOnce,
    loadingOnce,
    locationWatch,
    errorWatch,
    loadingWatch
  });

  return (
    <div className="p-6 space-y-6 text-black">
      <h2 className="text-2xl font-bold text-black">Location Hook Examples</h2>
      
      {/* Debug Info */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="text-lg font-semibold mb-2 text-black">Debug Info</h3>
        <div className="text-sm font-mono space-y-1 text-black">
          <div>Basic Location: {location ? `Lat: ${location.latitude}, Lng: ${location.longitude}` : 'null'}</div>
          <div>Basic Loading: {loading ? 'true' : 'false'}</div>
          <div>Basic Error: {error ? error.message : 'null'}</div>
          <div>Once Location: {locationOnce ? `Lat: ${locationOnce.latitude}, Lng: ${locationOnce.longitude}` : 'null'}</div>
          <div>Watch Location: {locationWatch ? `Lat: ${locationWatch.latitude}, Lng: ${locationWatch.longitude}` : 'null'}</div>
        </div>
      </div>
      
      {/* Basic Usage */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-black">Basic Usage (Manual Trigger)</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                console.log('🔘 Manual getLocation clicked');
                getLocation();
              }}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Getting Location...' : 'Get Location'}
            </button>
            <button
              onClick={clearLocation}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear Location
            </button>
          </div>
          
          {/* Always show location data for debugging */}
          <div className="bg-yellow-50 p-3 rounded mb-2 border border-yellow-200">
            <p className="text-black"><strong>Debug - Location exists:</strong> {location ? 'YES' : 'NO'}</p>
            <p className="text-black"><strong>Debug - Location value:</strong> {JSON.stringify(location)}</p>
          </div>
          
          {location && (
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-black"><strong>Latitude:</strong> {location.latitude}</p>
              <p className="text-black"><strong>Longitude:</strong> {location.longitude}</p>
              {location.accuracy && <p className="text-black"><strong>Accuracy:</strong> {location.accuracy}m</p>}
              {location.timestamp && <p className="text-black"><strong>Timestamp:</strong> {new Date(location.timestamp).toLocaleString()}</p>}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-red-900"><strong>Error:</strong> {error.message}</p>
              <p className="text-red-900"><strong>Code:</strong> {error.code}</p>
            </div>
          )}
        </div>
      </div>

      {/* One-time Location */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-black">One-time Location Fetch</h3>
        <div className="space-y-2">
          <button
            onClick={getLocationOnce}
            disabled={loadingOnce}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loadingOnce ? 'Getting Location...' : 'Get Location Once'}
          </button>
          
          {locationOnce && (
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-black"><strong>Latitude:</strong> {locationOnce.latitude}</p>
              <p className="text-black"><strong>Longitude:</strong> {locationOnce.longitude}</p>
            </div>
          )}
          
          {errorOnce && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-red-900"><strong>Error:</strong> {errorOnce.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Watch Location */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-black">Watch Location Changes</h3>
        <div className="space-y-2">
          {loadingWatch && <p className="text-blue-600">Watching for location changes...</p>}
          
          {locationWatch && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-black"><strong>Current Location:</strong></p>
              <p className="text-black"><strong>Latitude:</strong> {locationWatch.latitude}</p>
              <p className="text-black"><strong>Longitude:</strong> {locationWatch.longitude}</p>
              {locationWatch.accuracy && <p className="text-black"><strong>Accuracy:</strong> {locationWatch.accuracy}m</p>}
            </div>
          )}
          
          {errorWatch && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-red-900"><strong>Error:</strong> {errorWatch.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 