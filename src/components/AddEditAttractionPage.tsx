import { useState } from 'react';
import { ArrowLeft, Upload, MapPin, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface AddEditAttractionPageProps {
  attractionId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const categoryOptions = [
  'Nature & Adventure',
  'Culture & Heritage',
  'Entertainment',
  'Beach & Relaxation',
  'Shopping & Dining',
  'Photography',
  'Sports & Recreation',
];

export default function AddEditAttractionPage({ attractionId, onSave, onCancel }: AddEditAttractionPageProps) {
  const isEditMode = !!attractionId;
  const [selectedTags, setSelectedTags] = useState<string[]>(isEditMode ? ['Nature', 'Adventure', 'Photography'] : []);
  const [formData, setFormData] = useState({
    name: isEditMode ? 'Langkawi Sky Bridge' : '',
    category: isEditMode ? 'Nature & Adventure' : '',
    description: isEditMode 
      ? 'The Langkawi Sky Bridge is a 125-metre curved pedestrian cable-stayed bridge in Malaysia, completed in 2005. The bridge deck is located 660 metres above sea level at the peak of Gunung Machinchang on Pulau Langkawi, offering spectacular views of the surrounding islands and the Andaman Sea.' 
      : '',
    location: isEditMode ? 'Gunung Machinchang, Langkawi, Kedah' : '',
    latitude: isEditMode ? '6.3833' : '',
    longitude: isEditMode ? '99.6667' : '',
    openingHours: isEditMode ? '9:30 AM - 7:00 PM' : '',
    closingDays: isEditMode ? 'None' : '',
    priceRange: isEditMode ? 'RM 5 - RM 15' : '',
    contactNumber: isEditMode ? '+60 4-959 1225' : '',
    website: isEditMode ? 'https://panoramalangkawi.com' : '',
  });

  const handleAddTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={onCancel} className="mb-3 -ml-3">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl mb-2">{isEditMode ? 'Edit Attraction' : 'Add New Attraction'}</h1>
          <p className="text-neutral-600">{isEditMode ? 'Update attraction information' : 'Create a new attraction listing'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Attraction Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Langkawi Sky Bridge"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a detailed description of the attraction..."
                rows={5}
                required
              />
              <p className="text-xs text-neutral-500">{formData.description.length} characters</p>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} className="bg-green-100 text-green-700 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:bg-green-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add tags (press Enter)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Full address"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  placeholder="e.g., 6.3833"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  placeholder="e.g., 99.6667"
                />
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
              <MapPin className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm text-center text-neutral-600">Map preview would appear here</p>
            </div>
          </CardContent>
        </Card>

        {/* Operating Hours & Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Operating Hours & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingHours">Opening Hours</Label>
                <Input
                  id="openingHours"
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                  placeholder="e.g., 9:00 AM - 6:00 PM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closingDays">Closing Days</Label>
                <Input
                  id="closingDays"
                  value={formData.closingDays}
                  onChange={(e) => setFormData({ ...formData, closingDays: e.target.value })}
                  placeholder="e.g., Mondays, Public Holidays"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceRange">Price Range</Label>
              <Input
                id="priceRange"
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                placeholder="e.g., RM 10 - RM 50 or Free"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="+60 4-XXX XXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
              <p className="text-sm text-neutral-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-neutral-500">PNG, JPG, JPEG up to 10MB</p>
            </div>
            {isEditMode && (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-video bg-neutral-200 rounded-lg relative group">
                    <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white">
            {isEditMode ? 'Save Changes' : 'Create Attraction'}
          </Button>
        </div>
      </form>
    </div>
  );
}
