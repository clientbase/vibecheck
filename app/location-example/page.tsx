import { LocationExample } from '@/components/LocationExample';
import { LocationDebug } from '@/components/LocationDebug';
import { LocationTest } from '@/components/LocationTest';

export default function LocationExamplePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Location Hook Demo</h1>
          <p className="text-gray-600">
            Test the location hook functionality. Make sure to allow location permissions in your browser.
          </p>
        </div>
        
        <LocationDebug />
        
        <div className="mt-6">
          <LocationTest />
        </div>
        
        <div className="mt-6">
          <LocationExample />
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">How to use the location hook:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Click "Get Location" to manually trigger location detection</li>
            <li>Use "Get Location Once" for a one-time fetch</li>
            <li>The "Watch Location Changes" section automatically tracks your position</li>
            <li>Check the browser console for any additional debugging information</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 