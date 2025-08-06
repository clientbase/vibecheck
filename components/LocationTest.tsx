'use client';

import { useLocation } from '@/lib/useLocation';
import { useState } from 'react';

export function LocationTest() {
  const { location, error, loading, getLocation, clearLocation } = useLocation();
  const [renderCount, setRenderCount] = useState(0);

  const forceRender = () => setRenderCount(prev => prev + 1);

  return (
    <div className="p-4 border rounded-lg bg-white text-black">
      <h3 className="text-lg font-semibold mb-4 text-black">Minimal Location Test</h3>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => {
              console.log('🔘 Test getLocation clicked');
              getLocation();
            }}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Getting...' : 'Get Location'}
          </button>
          <button
            onClick={clearLocation}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear
          </button>
          <button
            onClick={forceRender}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Force Render ({renderCount})
          </button>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-black">
            <strong>Loading:</strong> {loading ? 'true' : 'false'}
          </div>
          <div className="text-sm text-black">
            <strong>Location exists:</strong> {location ? 'YES' : 'NO'}
          </div>
          <div className="text-sm text-black">
            <strong>Error exists:</strong> {error ? 'YES' : 'NO'}
          </div>
        </div>

        {location && (
          <div className="bg-green-50 p-3 rounded border">
            <h4 className="font-semibold mb-2 text-black">✅ Location Data:</h4>
            <div className="space-y-1 text-sm text-black">
              <div><strong>Latitude:</strong> {location.latitude}</div>
              <div><strong>Longitude:</strong> {location.longitude}</div>
              <div><strong>Accuracy:</strong> {location.accuracy}m</div>
              <div><strong>Timestamp:</strong> {location.timestamp ? new Date(location.timestamp).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-3 rounded border">
            <h4 className="font-semibold mb-2 text-red-900">❌ Error:</h4>
            <div className="space-y-1 text-sm text-red-900">
              <div><strong>Message:</strong> {error.message}</div>
              <div><strong>Code:</strong> {error.code}</div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded text-xs">
          <strong className="text-black">Raw location object:</strong>
          <pre className="mt-1 text-black">{JSON.stringify(location, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
} 