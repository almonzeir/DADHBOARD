// src/components/places/place-form-dialog.tsx

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
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Upload, X, MapPin } from 'lucide-react';
import { PLACE_CATEGORIES } from '@/lib/constants';
import type { Place, PlaceCategory, District } from '@/types';
import Image from 'next/image';

interface PlaceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Place, 'id' | 'created_at' | 'updated_at' | 'district'>, imageFile?: File) => void;
  isLoading?: boolean;
  place?: Place | null;
  mode: 'create' | 'edit';
  districts: District[];
}

export function PlaceFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  place,
  mode,
  districts,
}: PlaceFormDialogProps) {
  // Basic Info
  const [name, setName] = useState('');
  const [nameMalay, setNameMalay] = useState('');
  const [description, setDescription] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('other');
  
  // Location
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Details
  const [openingHours, setOpeningHours] = useState('');
  const [entranceFee, setEntranceFee] = useState('');
  const [averageDuration, setAverageDuration] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');
  
  // Status
  const [isActive, setIsActive] = useState(true);
  const [isHiddenGem, setIsHiddenGem] = useState(false);
  
  // Image
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or place changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && place) {
        setName(place.name || '');
        setNameMalay(place.name_ms || '');
        setDescription(place.description || '');
        setDistrictId(place.district_id || '');
        setCategory(place.category || 'other');
        setAddress(place.address || '');
        setLatitude(place.latitude?.toString() || '');
        setLongitude(place.longitude?.toString() || '');
        setOpeningHours(place.opening_hours || '');
        setEntranceFee(place.entrance_fee?.toString() || '');
        setAverageDuration(place.average_duration?.toString() || '');
        setContactPhone(place.contact_phone || '');
        setContactEmail(place.contact_email || '');
        setWebsite(place.website || '');
        setIsActive(place.is_active ?? true);
        setIsHiddenGem(place.is_hidden_gem ?? false);
        setImageUrl(place.image_url || '');
        setImagePreview(place.image_url || null);
      } else {
        resetForm();
      }
    }
  }, [open, place, mode]);

  const resetForm = () => {
    setName('');
    setNameMalay('');
    setDescription('');
    setDistrictId('');
    setCategory('other');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setOpeningHours('');
    setEntranceFee('');
    setAverageDuration('');
    setContactPhone('');
    setContactEmail('');
    setWebsite('');
    setIsActive(true);
    setIsHiddenGem(false);
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select an image file' });
        return;
      }
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
      newErrors.name = 'Place name is required';
    }

    if (!districtId) {
      newErrors.districtId = 'Please select a district';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (latitude && isNaN(parseFloat(latitude))) {
      newErrors.latitude = 'Invalid latitude';
    }

    if (longitude && isNaN(parseFloat(longitude))) {
      newErrors.longitude = 'Invalid longitude';
    }

    if (entranceFee && isNaN(parseFloat(entranceFee))) {
      newErrors.entranceFee = 'Invalid fee amount';
    }

    if (averageDuration && isNaN(parseInt(averageDuration))) {
      newErrors.averageDuration = 'Invalid duration';
    }

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const data: Omit<Place, 'id' | 'created_at' | 'updated_at' | 'district'> = {
      name: name.trim(),
      name_ms: nameMalay.trim() || null,
      description: description.trim() || null,
      district_id: districtId,
      category,
      address: address.trim() || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      opening_hours: openingHours.trim() || null,
      entrance_fee: entranceFee ? parseFloat(entranceFee) : null,
      average_duration: averageDuration ? parseInt(averageDuration) : null,
      contact_phone: contactPhone.trim() || null,
      contact_email: contactEmail.trim() || null,
      website: website.trim() || null,
      is_active: isActive,
      is_hidden_gem: isHiddenGem,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {mode === 'create' ? 'Add New Place' : 'Edit Place'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'create'
                  ? 'Add a new attraction or place of interest'
                  : 'Update place information'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Place Image</Label>
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
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload image
                    </p>
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

            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (English) *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Langkawi Sky Bridge"
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
              <div className="space-y-2">
                <Label htmlFor="nameMalay">Name (Malay)</Label>
                <Input
                  id="nameMalay"
                  placeholder="e.g., Jambatan Langit Langkawi"
                  value={nameMalay}
                  onChange={(e) => setNameMalay(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* District & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Select
                  value={districtId}
                  onValueChange={(value) => {
                    setDistrictId(value);
                    if (errors.districtId) setErrors({ ...errors, districtId: '' });
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.districtId && (
                  <p className="text-sm text-destructive">{errors.districtId}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={category}
                  onValueChange={(value) => {
                    setCategory(value as PlaceCategory);
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this place..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Status Toggles */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={isLoading}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="isHiddenGem"
                  checked={isHiddenGem}
                  onCheckedChange={setIsHiddenGem}
                  disabled={isLoading}
                />
                <Label htmlFor="isHiddenGem">Hidden Gem</Label>
              </div>
            </div>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Full address of the place"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  placeholder="e.g., 6.3699"
                  value={latitude}
                  onChange={(e) => {
                    setLatitude(e.target.value);
                    if (errors.latitude) setErrors({ ...errors, latitude: '' });
                  }}
                  disabled={isLoading}
                />
                {errors.latitude && (
                  <p className="text-sm text-destructive">{errors.latitude}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="e.g., 99.8465"
                  value={longitude}
                  onChange={(e) => {
                    setLongitude(e.target.value);
                    if (errors.longitude) setErrors({ ...errors, longitude: '' });
                  }}
                  disabled={isLoading}
                />
                {errors.longitude && (
                  <p className="text-sm text-destructive">{errors.longitude}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: You can get coordinates from Google Maps by right-clicking on a location.
            </p>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingHours">Opening Hours</Label>
                <Input
                  id="openingHours"
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entranceFee">Entrance Fee (RM)</Label>
                <Input
                  id="entranceFee"
                  placeholder="e.g., 25.00"
                  value={entranceFee}
                  onChange={(e) => {
                    setEntranceFee(e.target.value);
                    if (errors.entranceFee) setErrors({ ...errors, entranceFee: '' });
                  }}
                  disabled={isLoading}
                />
                {errors.entranceFee && (
                  <p className="text-sm text-destructive">{errors.entranceFee}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageDuration">Average Visit Duration (minutes)</Label>
              <Input
                id="averageDuration"
                placeholder="e.g., 120"
                value={averageDuration}
                onChange={(e) => {
                  setAverageDuration(e.target.value);
                  if (errors.averageDuration) setErrors({ ...errors, averageDuration: '' });
                }}
                disabled={isLoading}
              />
              {errors.averageDuration && (
                <p className="text-sm text-destructive">{errors.averageDuration}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  placeholder="e.g., +60 4-123 4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="e.g., info@place.com"
                  value={contactEmail}
                  onChange={(e) => {
                    setContactEmail(e.target.value);
                    if (errors.contactEmail) setErrors({ ...errors, contactEmail: '' });
                  }}
                  disabled={isLoading}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-destructive">{errors.contactEmail}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="e.g., https://www.place.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
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
              'Create Place'
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}