import { useState } from 'react';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import TourStatLogo from './TourStatLogo';

interface ForgotPasswordPageProps {
  onReset: () => void;
  onNavigateToSignIn: () => void;
}

export default function ForgotPasswordPage({ onReset, onNavigateToSignIn }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('reset');
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setStep('success');
  };

  if (step === 'email') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-lime-400 rounded-2xl mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl mb-2">Forgot password?</h2>
            <p className="text-neutral-600">
              No worries, we'll send you reset instructions.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tourstat.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white"
            >
              Send reset link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onNavigateToSignIn}
              className="text-sm text-green-600 hover:text-green-700"
            >
              ← Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'reset') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-lime-400 rounded-2xl mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl mb-2">Set new password</h2>
            <p className="text-neutral-600">
              Your new password must be different from previously used passwords.
            </p>
          </div>

          <form onSubmit={handleResetSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white"
            >
              Reset password
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl mb-2">Password reset successful</h2>
        <p className="text-neutral-600 mb-8">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>

        <Button 
          onClick={onReset}
          className="w-full h-12 bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white"
        >
          Continue to sign in
        </Button>
      </div>
    </div>
  );
}