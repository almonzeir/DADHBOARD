import { useState } from 'react';
import { Plus, Search, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Switch } from './ui/switch';

interface ManageAttractionsPageProps {
  onAddNew: () => void;
  onEdit: (id: string) => void;
}

const managedAttractions = [
  {
    id: '1',
    name: 'Langkawi Sky Bridge',
    category: 'Nature & Adventure',
    status: 'Published',
    visibility: true,
    lastUpdated: '2025-11-15',
  },
  {
    id: '2',
    name: 'Underwater World Langkawi',
    category: 'Entertainment',
    status: 'Published',
    visibility: true,
    lastUpdated: '2025-11-14',
  },
  {
    id: '3',
    name: 'Gunung Jerai',
    category: 'Nature & Adventure',
    status: 'Published',
    visibility: true,
    lastUpdated: '2025-11-13',
  },
  {
    id: '4',
    name: 'Bujang Valley Archaeological Museum',
    category: 'Culture & Heritage',
    status: 'Maintenance',
    visibility: false,
    lastUpdated: '2025-11-10',
  },
  {
    id: '5',
    name: 'Paddy Museum',
    category: 'Culture & Heritage',
    status: 'Published',
    visibility: true,
    lastUpdated: '2025-11-12',
  },
  {
    id: '6',
    name: 'Alor Setar Tower',
    category: 'Entertainment',
    status: 'Published',
    visibility: true,
    lastUpdated: '2025-11-11',
  },
  {
    id: '7',
    name: 'Pantai Cenang',
    category: 'Beach & Relaxation',
    status: 'Published',
    visibility: true,
    lastUpdated: '2025-11-09',
  },
  {
    id: '8',
    name: 'Oriental Village',
    category: 'Shopping & Dining',
    status: 'Draft',
    visibility: false,
    lastUpdated: '2025-11-08',
  },
];

export default function ManageAttractionsPage({ onAddNew, onEdit }: ManageAttractionsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [attractions, setAttractions] = useState(managedAttractions);

  const handleToggleVisibility = (id: string) => {
    setAttractions(attractions.map(attr =>
      attr.id === id ? { ...attr, visibility: !attr.visibility } : attr
    ));
  };

  const filteredAttractions = attractions.filter((attraction) =>
    attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attraction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Published':
        return <Badge className="bg-green-100 text-green-700">Published</Badge>;
      case 'Draft':
        return <Badge className="bg-yellow-100 text-yellow-700">Draft</Badge>;
      case 'Maintenance':
        return <Badge className="bg-orange-100 text-orange-700">Maintenance</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Manage Content</h1>
          <p className="text-neutral-600">Add, edit, and manage attraction listings</p>
        </div>
        <Button
          onClick={onAddNew}
          className="bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Attraction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-1">Total Attractions</p>
            <p className="text-3xl">247</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-1">Published</p>
            <p className="text-3xl text-green-600">234</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-1">Drafts</p>
            <p className="text-3xl text-yellow-600">8</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-neutral-600 mb-1">Maintenance</p>
            <p className="text-3xl text-orange-600">5</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              type="search"
              placeholder="Search attractions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Attractions Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attraction Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttractions.map((attraction) => (
                <TableRow key={attraction.id}>
                  <TableCell>{attraction.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{attraction.category}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(attraction.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={attraction.visibility}
                        onCheckedChange={() => handleToggleVisibility(attraction.id)}
                      />
                      {attraction.visibility ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-neutral-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{attraction.lastUpdated}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(attraction.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
