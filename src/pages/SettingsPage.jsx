
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { User, Shield, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const settingsNavItems = [
  { path: '/settings/profile', icon: User, label: 'Profile' },
  { path: '/settings/security', icon: Shield, label: 'Security' },
];

const SettingsPage = () => {
  const location = useLocation();
  const { profile } = useAuth();
  
  // Determine if we are on the root settings page (mobile view mainly)
  const isRootSettings = location.pathname === '/settings';

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-50/50 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Improved Header Navigation with more prominent Home button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border shadow-sm">
            <div>
                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
                 <p className="text-gray-500 dark:text-gray-400">Manage your profile and security preferences</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                 <Button asChild variant="outline" className="gap-2">
                    <Link to="/">
                      <Home className="h-4 w-4" />
                      Home
                    </Link>
                 </Button>
                 <Button asChild variant="outline" className="gap-2">
                    <Link to={profile?.role === 'admin' ? '/admin-dashboard' : '/customer-dashboard'}>
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                 </Button>
            </div>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <Card className={`md:col-span-3 p-2 h-fit ${!isRootSettings ? 'hidden md:block' : ''}`}>
            <nav className="space-y-1">
              {settingsNavItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <div
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </Card>

          {/* Main Content Area */}
          <div className={`md:col-span-9 ${isRootSettings ? 'hidden md:block' : ''}`}>
             <Card className="min-h-[500px] p-6 shadow-sm border-0 md:border">
                {isRootSettings ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 min-h-[400px]">
                        <User className="h-16 w-16 mb-4 opacity-20" />
                        <p>Select a category from the menu to get started.</p>
                        <Button asChild variant="link" className="mt-4 md:hidden">
                            <Link to="/">Back to Home</Link>
                        </Button>
                    </div>
                ) : (
                    <Outlet />
                )}
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
