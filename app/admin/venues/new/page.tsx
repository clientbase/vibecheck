"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";
import Link from "next/link";

export default function NewVenuePage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [address, setAddress] = useState("");
  const [categories, setCategories] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
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
      if (!res.ok) {
        throw new Error(data.error || "Failed to create venue");
      }

      setSuccess(`Created venue: ${data.name}`);
      toast.success("Venue Created", {
        description: `${data.name} has been created successfully` ,
        action: {
          label: "View",
          onClick: () => window.location.assign(`/venues/${data.slug}`)
        }
      });

      setName("");
      setSlug("");
      setAddress("");
      setCategories("");
      setIsFeatured(false);
      setCoverImageUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create venue");
      toast.error("Failed to create venue", {
        description: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Venue</h1>
        {isFeatured && <Badge className="bg-yellow-500 text-black">Featured</Badge>}
      </div>

      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-800">{error}</CardContent>
        </Card>
      )}
      {success && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardContent className="p-4 text-green-800">{success}</CardContent>
        </Card>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Venue details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-generated if empty" />
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
              <p className="text-xs text-muted-foreground">You can upload/take a photo or provide a remote image URL. If both are provided, the uploaded image will be used.</p>

              {/* Reuse ImageUpload for device/camera */}
              <ImageUpload
                onImageUploaded={(url) => setCoverImageUrl(url)}
                onImageRemoved={() => setCoverImageUrl("")}
                currentImageUrl={coverImageUrl}
              />

              {/* Or provide a URL */}
              <div className="space-y-2">
                <Label htmlFor="cover-url">Image URL (optional)</Label>
                <Input
                  id="cover-url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Venue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
