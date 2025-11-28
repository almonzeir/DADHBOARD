import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import TourStatLogo from './TourStatLogo';

interface SignInPageProps {
  onSignIn: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToForgot: () => void;
}

export default function SignInPage({ onSignIn, onNavigateToSignUp, onNavigateToForgot }: SignInPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('SignInPage mounted');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign in form submitted');
    setError('');
    setLoading(true);

    try {
      console.log('Attempting to sign in with:', email);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase response:', { data, error: signInError });

      if (signInError) throw signInError;

      if (data.user) {
        console.log('User authenticated, checking admin access...');

        // Check if user has admin access (is approved)
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('is_approved')
          .eq('id', data.user.id)
          .single();

        console.log('Admin check response:', { adminData, adminError });

        if (adminError || !adminData) {
          console.warn('User not found in admin_users table');
          await supabase.auth.signOut();
          throw new Error("You don't have access to log in here yet");
        }

        if (!adminData.is_approved) {
          console.warn('User is not approved');
          await supabase.auth.signOut();
          throw new Error("Your account is pending approval. Please contact an administrator.");
        }

        // User is approved, allow login
        console.log('Login successful and approved');
        toast.success('Welcome back!');

        // Call the parent handler
        onSignIn();

        // Fallback: If the app doesn't redirect automatically within 1s, reload the page
        // This handles cases where AuthContext might not trigger a re-render immediately
        setTimeout(() => {
          console.log('Triggering manual reload as fallback...');
          window.location.reload();
        }, 1000);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login');
      toast.error(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 via-green-400 to-lime-400 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-lime-200 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-md text-white">
          <div className="mb-8">
            <TourStatLogo size="lg" variant="white" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Welcome back to the future of tourism analytics</h2>
          <p className="text-lg text-white/90">
            Access powerful insights from tourist behavior, optimize destinations, and make data-driven decisions for Kedah's tourism ecosystem.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-white/90">Real-time tourist activity tracking</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-white/90">AI-powered itinerary analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <p className="text-white/90">Comprehensive destination insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <TourStatLogo size="md" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Sign in</h2>
            <p className="text-neutral-600">Enter your credentials to access the admin dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tourstat.my"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-green-600 focus:ring-green-500" />
                <span className="text-sm text-neutral-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={onNavigateToForgot}
                className="text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-green-500 to-lime-400 hover:from-green-600 hover:to-lime-500 text-white shadow-md hover:shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <button
                onClick={onNavigateToSignUp}
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Create one
              </button>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-xs text-center text-neutral-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}