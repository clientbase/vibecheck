"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import type { Venue } from "@/lib/types";
import { DialogClose } from "@/components/ui/dialog";

export type VenueFormMode = "create" | "edit";

export interface VenueFormProps {
  mode: VenueFormMode;
  initial?: Partial<Venue> & { coverPhotoUrl?: string };
  onSuccess?: (venue: Venue) => void;
  onCancel?: () => void;
}

export function VenueForm({ mode, initial, onSuccess, onCancel }: VenueFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [categories, setCategories] = useState<string>((initial?.categories ?? []).join(", "));
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initial?.isFeatured));
  const [coverImageUrl, setCoverImageUrl] = useState<string>(initial?.coverPhotoUrl ?? "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? "");
      setSlug(initial.slug ?? "");
      setAddress(initial.address ?? "");
      setCategories((initial.categories ?? []).join(", "));
      setIsFeatured(Boolean(initial.isFeatured));
      setCoverImageUrl(initial.coverPhotoUrl ?? "");
    }
  }, [initial]);

  const submitLabel = useMemo(() => (mode === "create" ? "Create Venue" : "Update Venue"), [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/venues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug: slug || undefined,
            address,
            categories: categories
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean),
            isFeatured,
            coverImageUrl: coverImageUrl || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create venue");
        toast.success("Venue created", { description: `${data.name} has been created.` });
        onSuccess?.(data as Venue);
      } else {
        if (!initial?.slug) throw new Error("Missing venue identifier for update");
        const res = await fetch(`/api/venues/${initial.slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug: slug || initial.slug,
            address,
            categories: categories
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean),
            isFeatured,
            coverImageUrl: coverImageUrl || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update venue");
        toast.success("Venue updated", { description: `${data.name} has been updated.` });
        onSuccess?.(data as Venue);
      }
    } catch (err) {
      toast.error(mode === "create" ? "Create failed" : "Update failed", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Venue details" : `Edit venue: ${initial?.name}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={mode === "create" ? "auto-generated if empty" : undefined} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, State" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categories (comma separated)</Label>
            <Input id="categories" value={categories} onChange={(e) => setCategories(e.target.value)} placeholder="hip-hop, rooftop" />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="featured"
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <Label htmlFor="featured">Featured</Label>
          </div>

          <div className="space-y-3">
            <Label>Cover Image</Label>
            <p className="text-xs text-muted-foreground">Upload/take a photo or provide a remote image URL. If both are provided, the uploaded image will be used.</p>
            <ImageUpload
              onImageUploaded={(url) => setCoverImageUrl(url)}
              onImageRemoved={() => setCoverImageUrl("")}
              currentImageUrl={coverImageUrl}
            />
            <div className="space-y-2">
              <Label htmlFor="cover-url">Image URL (optional)</Label>
              <Input id="cover-url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {onCancel && (
              <DialogClose asChild>
                <Button type="button" variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
              </DialogClose>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? (mode === "create" ? "Creating..." : "Saving...") : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


