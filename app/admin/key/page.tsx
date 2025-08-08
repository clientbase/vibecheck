"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getStoredAdminKey, setStoredAdminKey, clearStoredAdminKey } from '@/lib/admin-client';

export default function AdminKeyPage() {
  const [key, setKey] = useState('');

  useEffect(() => {
    const existing = getStoredAdminKey();
    if (existing) setKey(existing);
  }, []);

  const handleSave = () => {
    if (!key) {
      toast.error('Please enter a key');
      return;
    }
    setStoredAdminKey(key);
    toast.success('Admin key saved');
  };

  const handleClear = () => {
    clearStoredAdminKey();
    setKey('');
    toast.success('Admin key cleared');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Admin API Key</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminkey">Enter your admin API key</Label>
              <Input id="adminkey" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="••••••••" />
              <p className="text-xs text-muted-foreground">Stored only in your browser&rsquo;s local storage.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="secondary" type="button" onClick={handleClear}>Clear</Button>
              <Button type="button" onClick={handleSave}>Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


