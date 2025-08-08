"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VenueForm } from "@/components/admin/VenueForm";
import type { Venue } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";
import { withAdminHeader } from "@/lib/admin-client";

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editVenue, setEditVenue] = useState<Venue | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/venues');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch venues');
      setVenues(data.venues || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm('Delete this venue? This will also delete its vibe reports.')) return;
    try {
      const res = await fetch(`/api/venues/${slug}`, withAdminHeader({ method: 'DELETE' }));
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete venue');
      toast.success('Venue deleted');
      fetchVenues();
    } catch (err) {
      toast.error('Delete failed', { description: err instanceof Error ? err.message : String(err) });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Venues</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create Venue</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Venue</DialogTitle>
            </DialogHeader>
            <VenueForm
              mode="create"
              onSuccess={() => {
                setCreateOpen(false);
                fetchVenues();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Venues</CardTitle>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">
                      <Link className="underline" href={`/venues/${v.slug}`}>{v.name}</Link>
                    </TableCell>
                    <TableCell>{v.slug}</TableCell>
                    <TableCell className="max-w-[280px] truncate" title={v.address}>{v.address}</TableCell>
                    <TableCell>{v.isFeatured ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{new Date(v.updatedAt as unknown as string).toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog onOpenChange={(open) => { if (!open) setEditVenue(null); }}>
                        <DialogTrigger asChild>
                          <Button variant="secondary" onClick={() => setEditVenue(v)}>Edit</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Venue</DialogTitle>
                          </DialogHeader>
                          <VenueForm
                            mode="edit"
                            initial={v}
                            onSuccess={() => {
                              setEditVenue(null);
                              fetchVenues();
                            }}
                            onCancel={() => setEditVenue(null)}
                          />
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" onClick={() => handleDelete(v.slug)}>Delete</Button>
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


