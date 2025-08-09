"use client";

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { withAdminHeader } from '@/lib/admin-client';
import type { VibeReport } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<VibeReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFlagged, setShowFlagged] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      query.set('limit', '100');
      if (showFlagged) query.set('flagged', 'true'); else query.set('flagged', 'false');
      const res = await fetch(`/api/reports?${query.toString()}`, withAdminHeader());
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reports');
      setReports(data.vibeReports || data.reports || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFlagged]);

  const handleSoftDelete = async (id: string) => {
    if (!confirm('Flag this report as deleted?')) return;
    try {
      const res = await fetch(`/api/reports`, withAdminHeader({ method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, flagged: true }) }));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to flag report');
      toast.success('Report flagged');
      fetchReports();
    } catch (err) {
      toast.error('Action failed', { description: err instanceof Error ? err.message : String(err) });
    }
  };

  const handleUnflag = async (id: string) => {
    try {
      const res = await fetch(`/api/reports`, withAdminHeader({ method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, flagged: false }) }));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unflag report');
      toast.success('Report restored');
      fetchReports();
    } catch (err) {
      toast.error('Action failed', { description: err instanceof Error ? err.message : String(err) });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vibe Reports</h1>
        <div className="flex gap-2">
          <Button variant={showFlagged ? 'secondary' : 'default'} onClick={() => setShowFlagged(false)}>Show Active</Button>
          <Button variant={showFlagged ? 'default' : 'secondary'} onClick={() => setShowFlagged(true)}>Show Flagged</Button>
          <Link href="/admin/key"><Button variant="outline">Set Admin Key</Button></Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{showFlagged ? 'Flagged Reports' : 'Recent Reports'}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Vibe</TableHead>
                  <TableHead>Queue</TableHead>
                  <TableHead>Cover</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {r.venue ? (
                        <Link className="underline" href={`/venues/${r.venue.slug}`}>{r.venue.name}</Link>
                      ) : (
                        r.venueId
                      )}
                    </TableCell>
                    <TableCell>
                      {r.imageUrl ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={r.imageUrl}
                                alt="report image"
                                className="h-16 w-16 rounded object-cover border group-hover:opacity-90"
                              />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Image Preview</DialogTitle>
                            </DialogHeader>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={r.imageUrl} alt="report image preview" className="max-h-[70vh] w-auto mx-auto rounded" />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{r.vibeLevel}</TableCell>
                    <TableCell>{r.queueLength ?? '-'}</TableCell>
                    <TableCell>{r.coverCharge ?? '-'}</TableCell>
                    <TableCell className="max-w-[320px] truncate" title={r.notes ?? ''}>{r.notes ?? '-'}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[240px] truncate" title={r.userAnonId ?? ''}>{r.userAnonId ?? '-'}</TableCell>
                    <TableCell>{new Date(r.submittedAt as unknown as string).toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {r.flagged ? (
                        <Button variant="secondary" onClick={() => handleUnflag(r.id)}>Restore</Button>
                      ) : (
                        <Button variant="destructive" onClick={() => handleSoftDelete(r.id)}>Delete</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



