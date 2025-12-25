// src/components/districts/district-form-dialog.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X, MapPin } from 'lucide-react';
import type { District } from '@/types';
import Image from 'next/image';

interface DistrictFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<District, 'id' | 'created_at'>, imageFile?: File) => void;
  isLoading?: boolean;
  district?: District | null; // For edit mode
  mode: 'create' | 'edit';
}

export function DistrictFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  district,
  mode,
}: DistrictFormDialogProps) {
  const [name, setName] = useState('');
  const [nameMalay, setNameMalay] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName('');
    setNameMalay('');
    setDescription('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  // Reset form when dialog opens/closes or district changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && district) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setName(district.name || '');
        setNameMalay(district.name_ms || '');
        setDescription(district.description || '');
        setImageUrl(district.image_url || '');
        setImagePreview(district.image_url || null);
      } else {
        resetForm();
      }
    }
  }, [open, district, mode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select an image file' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image must be less than 5MB' });
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors({ ...errors, image: '' });
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (mode === 'create') {
      setImageUrl('');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'District name is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data: Omit<District, 'id' | 'created_at'> = {
      name: name.trim(),
      name_ms: nameMalay.trim() || null,
      description: description.trim(),
      image_url: imageUrl || null,
    };

    onSubmit(data, imageFile || undefined);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {mode === 'create' ? 'Add New District' : 'Edit District'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'create'
                  ? 'Add a new district to the system'
                  : 'Update district information'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>District Image</Label>
            {imagePreview ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
            {errors.image && (
              <p className="text-sm text-destructive">{errors.image}</p>
            )}
          </div>

          {/* District Name */}
          <div className="space-y-2">
            <Label htmlFor="name">District Name (English) *</Label>
            <Input
              id="name"
              placeholder="e.g., Langkawi"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* District Name (Malay) */}
          <div className="space-y-2">
            <Label htmlFor="nameMalay">District Name (Malay)</Label>
            <Input
              id="nameMalay"
              placeholder="e.g., Langkawi"
              value={nameMalay}
              onChange={(e) => setNameMalay(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe this district, its highlights, and attractions..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              disabled={isLoading}
              rows={4}
            />
            <div className="flex justify-between">
              {errors.description ? (
                <p className="text-sm text-destructive">{errors.description}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted-foreground">
                {description.length} characters
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : mode === 'create' ? (
              'Create District'
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}