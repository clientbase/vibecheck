'use client';

import { useLocation } from '@/lib/useLocation';

export function LocationPermission() {
  const { location, error, loading, getLocation } = useLocation();

  if (location) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
        <span className="text-green-600">📍</span>
        <span className="text-sm text-green-800">Location enabled</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-red-600">⚠️</span>
        <span className="text-sm text-red-800">Location access needed</span>
        <button
          onClick={getLocation}
          className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={getLocation}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
    >
      <span>📍</span>
      <span className="text-sm">
        {loading ? 'Getting location...' : 'Enable location'}
      </span>
    </button>
  );
} 