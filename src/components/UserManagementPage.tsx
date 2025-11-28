import { useState, useEffect } from 'react';
import { Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_approved: boolean;
  requested_at: string;
  created_at: string;
};

export default function UserManagementPage() {
  const { user } = useAuth();
  const [usersData, setUsersData] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('analytics_only');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        if (user) {
          const { data: currentUser } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (currentUser) {
            setCurrentUserRole(currentUser.role || 'analytics_only');
          }
        }

        const { data, error } = await supabase.rpc('get_admin_users_with_emails');

        if (error) {
          console.error('Error fetching users:', error);
          toast.error('Failed to load users');
          return;
        }

        if (data) {
          setUsersData(data);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const pendingUsers = usersData.filter(u => !u.is_approved);
  const approvedUsers = usersData.filter(u => u.is_approved);

  const filteredApproved = approvedUsers.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPending = pendingUsers.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      'admin': 'bg-red-100 text-red-700',
      'analytics_only': 'bg-blue-100 text-blue-700',
    };
    const labels: Record<string, string> = {
      'admin': 'Admin',
      'analytics_only': 'Analytics Only',
    };
    return <Badge className={colors[role] || 'bg-neutral-100 text-neutral-700'}>{labels[role] || role}</Badge>;
  };

  const handleApprove = async (userId: string, role: string = 'analytics_only') => {
    try {
      setProcessingUserId(userId);
      const { error } = await supabase.rpc('approve_admin_user', {
        user_id: userId,
        approved_role: role
      });

      if (error) throw error;

      toast.success('User approved successfully!');

      // Refresh users list
      const { data } = await supabase.rpc('get_admin_users_with_emails');
      if (data) setUsersData(data);
    } catch (error: any) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      setProcessingUserId(userId);
      const { error } = await supabase.rpc('reject_admin_user', { user_id: userId });

      if (error) throw error;

      toast.success('User request rejected');

      // Refresh users list
      const { data } = await supabase.rpc('get_admin_users_with_emails');
      if (data) setUsersData(data);
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      toast.error('Failed to reject user');
    } finally {
      setProcessingUserId(null);
    }
  };

  const getInitials = (email: string) => {
    if (!email) return '??';
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Admin Management</h1>
          <p className="text-neutral-600">Manage admin users and their permissions</p>
        </div>
        {pendingUsers.length > 0 && (
          <Badge className="bg-amber-100 text-amber-700 px-4 py-2">
            {pendingUsers.length} Pending {pendingUsers.length === 1 ? 'Request' : 'Requests'}
          </Badge>
        )}
      </div>

      {/* Pending Users Section */}
      {currentUserRole === 'admin' && filteredPending.length > 0 && (
        <Card className="border-amber-200">
          <div className="p-6 border-b border-amber-100 bg-amber-50">
            <h2 className="text-xl">Pending Requests</h2>
            <p className="text-sm text-neutral-600">New users awaiting approval</p>
          </div>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPending.map((pendingUser) => (
                  <TableRow key={pendingUser.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-amber-100 text-amber-700">
                            {getInitials(pendingUser.full_name || pendingUser.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{pendingUser.full_name || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{pendingUser.email || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-neutral-500">
                      {new Date(pendingUser.requested_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(pendingUser.id)}
                          disabled={processingUserId === pendingUser.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={() => handleReject(pendingUser.id)}
                          disabled={processingUserId === pendingUser.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Active Users Section */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h2 className="text-xl mb-4">Active Users</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Search by email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApproved.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-neutral-500">
                    No active users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredApproved.map((adminUser) => (
                  <TableRow key={adminUser.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-lime-400 text-white">
                            {getInitials(adminUser.full_name || adminUser.email)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{adminUser.full_name || adminUser.email?.split('@')[0] || 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{adminUser.email || 'N/A'}</TableCell>
                    <TableCell>{getRoleBadge(adminUser.role)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {currentUserRole === 'admin' && adminUser.role !== 'admin' && adminUser.id !== user?.id && (
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Enter the details of the user you want to invite.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteRole">Role</Label>
              <Select value={inviteData.role} onValueChange={(value) => setInviteData({ ...inviteData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="analytics_only">Analytics Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} className="bg-gradient-to-r from-green-500 to-lime-400 text-white">
              <Mail className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}