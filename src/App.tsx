import { useState } from 'react';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import EmailVerificationPage from './components/EmailVerificationPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import DashboardLayout from './components/DashboardLayout';
import OverviewDashboard from './components/OverviewDashboard';
import TouristBehaviorPage from './components/TouristBehaviorPage';
import AttractionsListPage from './components/AttractionsListPage';
import AttractionDetailPage from './components/AttractionDetailPage';
import UserManagementPage from './components/UserManagementPage';
import ReportsPage from './components/ReportsPage';
import ReportDetailPage from './components/ReportDetailPage';
import ProfilePage from './components/ProfilePage';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type AuthScreen = 'signin' | 'signup' | 'verify' | 'forgot' | 'reset' | 'success';
type DashboardScreen = 'overview' | 'behavior' | 'attractions' | 'attraction-detail' | 'users' | 'reports' | 'report-detail' | 'profile';

function AppContent() {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<AuthScreen>('signin');
  const [dashboardScreen, setDashboardScreen] = useState<DashboardScreen>('overview');
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-lime-50 to-white">
        {authScreen === 'signin' && (
          <SignInPage
            onSignIn={() => { }} // Handled by AuthContext
            onNavigateToSignUp={() => setAuthScreen('signup')}
            onNavigateToForgot={() => setAuthScreen('forgot')}
          />
        )}
        {authScreen === 'signup' && (
          <SignUpPage
            onSignUp={() => setAuthScreen('verify')}
            onNavigateToSignIn={() => setAuthScreen('signin')}
          />
        )}
        {authScreen === 'verify' && (
          <EmailVerificationPage
            onVerify={() => setAuthScreen('signin')}
          />
        )}
        {authScreen === 'forgot' && (
          <ForgotPasswordPage
            onReset={() => setAuthScreen('signin')}
            onNavigateToSignIn={() => setAuthScreen('signin')}
          />
        )}
      </div>
    );
  }

  return (
    <DashboardLayout
      currentScreen={dashboardScreen}
      onNavigate={(screen) => {
        setDashboardScreen(screen);
        if (screen !== 'attraction-detail') {
          setSelectedAttractionId(null);
        }
      }}
    >
      <Toaster />
      {dashboardScreen === 'overview' && <OverviewDashboard />}
      {dashboardScreen === 'behavior' && <TouristBehaviorPage />}
      {dashboardScreen === 'attractions' && (
        <AttractionsListPage
          onViewDetail={(id) => {
            setSelectedAttractionId(id);
            setDashboardScreen('attraction-detail');
          }}
        />
      )}
      {dashboardScreen === 'attraction-detail' && selectedAttractionId && (
        <AttractionDetailPage
          attractionId={selectedAttractionId}
          onBack={() => setDashboardScreen('attractions')}
        />
      )}
      {dashboardScreen === 'users' && <UserManagementPage />}
      {dashboardScreen === 'reports' && (
        <ReportsPage
          onViewDetail={() => setDashboardScreen('report-detail')}
        />
      )}
      {dashboardScreen === 'report-detail' && (
        <ReportDetailPage
          onBack={() => setDashboardScreen('reports')}
        />
      )}
      {dashboardScreen === 'profile' && (
        <ProfilePage
          onBack={() => setDashboardScreen('overview')}
        />
      )}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}