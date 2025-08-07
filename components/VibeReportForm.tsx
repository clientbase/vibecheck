"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitVibeReport } from "@/lib/api";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ImageUpload";
import { VibeLevel, QueueLength } from "@/lib/constants";

interface VibeReportFormProps {
  venueSlug: string;
  venueName: string;
}

export function VibeReportForm({ venueSlug, venueName }: VibeReportFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vibeLevel: "",
    queueLength: "",
    coverCharge: "",
    musicGenre: "",
    notes: "",
    imageUrl: "",
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vibeLevel) {
      toast.error("Missing Information", {
        description: "Please select a vibe level.",
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await submitVibeReport(venueSlug, {
        vibeLevel: formData.vibeLevel as keyof typeof VibeLevel,
        queueLength: formData.queueLength as keyof typeof QueueLength,
        coverCharge: formData.coverCharge ? parseInt(formData.coverCharge) : undefined,
        musicGenre: formData.musicGenre,
        notes: formData.notes || undefined,
        imageUrl: formData.imageUrl || undefined,
      });

      toast.success("Vibe Report Submitted!", {
        description: `Your report for ${venueName} has been submitted successfully.`,
      });

      // Reset form and close drawer
      setFormData({
        vibeLevel: "",
        queueLength: "",
        coverCharge: "",
        musicGenre: "",
        notes: "",
        imageUrl: "",
      });
      setOpen(false);
      
      // Optionally refresh the page to show the new report
      window.location.reload();
      
    } catch (error) {
      console.error('Error submitting vibe report:', error);
      toast.error("Submission Failed", {
        description: error instanceof Error ? error.message : "Failed to submit vibe report. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl,
    }));
  };

  const handleImageRemoved = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: "",
    }));
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full sm:w-auto">
          Submit Vibe Report
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-screen">
        <div className="mx-auto w-full max-w-md h-full overflow-y-auto pb-safe">
          <DrawerHeader>
            <DrawerTitle>Submit Vibe Report</DrawerTitle>
            <DrawerDescription>
              Share your experience at {venueName}. Your report helps others know what to expect.
            </DrawerDescription>
          </DrawerHeader>
          
          <form onSubmit={handleSubmit} className="space-y-3 px-4">
            <div className="space-y-2">
              <Label htmlFor="vibeLevel">Vibe Level *</Label>
              <Select 
                value={formData.vibeLevel} 
                onValueChange={(value) => handleInputChange("vibeLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How was the vibe?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={VibeLevel.DEAD}>💀 DEAD - No energy</SelectItem>
                  <SelectItem value={VibeLevel.MID}>😐 MID - Okay vibes</SelectItem>
                  <SelectItem value={VibeLevel.LIT}>🔥 LIT - Great energy</SelectItem>
                  <SelectItem value={VibeLevel.CHAOTIC}>🤪 CHAOTIC - Wild night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Comment</Label>
              <Textarea
                id="notes"
                placeholder="Share your experience..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="queueLength">Queue Length</Label>
              <Select 
                value={formData.queueLength} 
                onValueChange={(value) => handleInputChange("queueLength", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How long was the line? (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QueueLength.NONE}>✅ NONE - No line</SelectItem>
                  <SelectItem value={QueueLength.SHORT}>⏳ SHORT - Quick wait</SelectItem>
                  <SelectItem value={QueueLength.LONG}>😤 LONG - Long wait</SelectItem>
                  <SelectItem value={QueueLength.INSANE}>😱 INSANE - Massive line</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverCharge">Cover Charge ($)</Label>
              <Input
                id="coverCharge"
                type="number"
                min="0"
                placeholder="0 (optional)"
                value={formData.coverCharge}
                onChange={(e) => handleInputChange("coverCharge", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="musicGenre">Music Genre</Label>
              <Input
                id="musicGenre"
                placeholder="e.g., Hip-Hop, House, Latin (optional)"
                value={formData.musicGenre}
                onChange={(e) => handleInputChange("musicGenre", e.target.value)}
              />
            </div>

            <ImageUpload
              onImageUploaded={handleImageUploaded}
              onImageRemoved={handleImageRemoved}
              currentImageUrl={formData.imageUrl}
            />
          </form>

          <DrawerFooter className="pb-safe">
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
} 