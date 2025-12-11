// src/components/admin/invite-staff-dialog.tsx

'use client';

import { useState } from 'react';
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
import { UserPlus, Loader2, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface InviteStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (email: string, fullName: string) => Promise<{ success: boolean; tempPassword?: string }>;
  isLoading?: boolean;
  organizationName?: string;
}

export function InviteStaffDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  organizationName,
}: InviteStaffDialogProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [errors, setErrors] = useState<{ email?: string; fullName?: string }>({});
  const [inviteResult, setInviteResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; fullName?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (validate()) {
      const result = await onConfirm(email.trim(), fullName.trim());
      if (result.success && result.tempPassword) {
        setInviteResult({
          email: email.trim(),
          tempPassword: result.tempPassword,
        });
      } 
    }
  };

  const handleCopy = () => {
    if (inviteResult) {
      const text = `Email: ${inviteResult.email}\nTemporary Password: ${inviteResult.tempPassword}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Credentials copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmail('');
      setFullName('');
      setErrors({});
      setInviteResult(null);
      setCopied(false);
    }
    onOpenChange(open);
  };

  // Success state - show credentials
  if (inviteResult) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle>Staff Invited Successfully!</DialogTitle>
                <DialogDescription>
                  Share these credentials with the new staff member
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium font-mono">{inviteResult.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temporary Password</p>
                <p className="font-medium font-mono">{inviteResult.tempPassword}</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Credentials
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              The staff member should change their password after first login.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => handleOpenChange(false)} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Invite Staff Member</DialogTitle>
              <DialogDescription>
                Add a new member to your team
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {organizationName && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="font-medium">{organizationName}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Enter staff member's full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: undefined });
              }}
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="staff@organization.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            A temporary password will be generated. You&apos;ll need to share the credentials with the staff member.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inviting...
              </>
            ) : (
              'Send Invitation'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}