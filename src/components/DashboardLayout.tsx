import { ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  MessageSquare, 
  UserCog, 
  FileText, 
  Search,
  Bell,
  TrendingUp,
  Eye,
  Star,
  Map,
  LogOut,
  Settings,
} from 'lucide-react';
import TourStatLogo from './TourStatLogo';
import { Avatar, AvatarFallback } from './ui/avatar';

type DashboardScreen = 'overview' | 'behavior' | 'attractions' | 'attraction-detail' | 'itinerary' | 'feedback' | 'users' | 'reports' | 'report-detail' | 'profile';

interface DashboardLayoutProps {
  children: ReactNode;
  currentScreen: DashboardScreen;
  onNavigate: (screen: DashboardScreen) => void;
}

const navigation = [
  { id: 'overview' as DashboardScreen, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'behavior' as DashboardScreen, label: 'Tourist Behavior', icon: Users },
  { id: 'attractions' as DashboardScreen, label: 'Attractions', icon: MapPin },
  { id: 'users' as DashboardScreen, label: 'User Management', icon: UserCog },
  { id: 'reports' as DashboardScreen, label: 'Reports', icon: FileText },
];

export default function DashboardLayout({ children, currentScreen, onNavigate }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-neutral-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-neutral-200">
          <TourStatLogo size="md" showText={true} tagline="decisions" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id || 
                (item.id === 'attractions' && (currentScreen === 'attraction-detail')) ||
                (item.id === 'reports' && currentScreen === 'report-detail');
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-lime-400 text-white'
                      : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-neutral-200">
          <div 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 cursor-pointer"
          >
            <Avatar>
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-lime-400 text-white">
                AA
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">Admin User</p>
              <p className="text-xs text-neutral-500 truncate">admin@tourstat.my</p>
            </div>
            <Settings className="w-4 h-4 text-neutral-400" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}