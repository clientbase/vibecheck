'use client';

import { useState, useEffect } from 'react';

export function LocationDebug() {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const info: string[] = [];
    
    // Check if geolocation is supported
    info.push(`Geolocation supported: ${!!navigator.geolocation}`);
    
    // Check if we're on HTTPS or localhost
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    info.push(`Secure context (HTTPS/localhost): ${isSecure}`);
    
    // Check permissions API
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        info.push(`Permission status: ${result.state}`);
        setDebugInfo([...info]);
      });
    } else {
      info.push('Permissions API not supported');
      setDebugInfo(info);
    }
    
    // Check user agent
    info.push(`Browser: ${navigator.userAgent}`);
    
    setDebugInfo(info);
  }, []);

  const testGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        alert(`Success! Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`);
      },
      (error) => {
        alert(`Error: ${error.message} (Code: ${error.code})`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <h3 className="text-lg font-semibold mb-2 text-black">🔍 Location Debug Info</h3>
      <div className="space-y-1 mb-4">
        {debugInfo.map((info, index) => (
          <div key={index} className="text-sm font-mono text-black">
            {info}
          </div>
        ))}
      </div>
      <button
        onClick={testGeolocation}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Native Geolocation
      </button>
      <div className="mt-2 text-xs text-black">
        Check the browser console for additional debug information from the hook.
      </div>
    </div>
  );
} 