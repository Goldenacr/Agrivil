
import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { useBrowserNotification } from '@/hooks/useBrowserNotification';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutGrid, Users, Tractor, ShoppingCart, BarChart, PenSquare, Star, Settings, LogOut, X, Menu, MapPin, PackageCheck } from 'lucide-react';

const navItems = [
  { href: '/admin-dashboard', icon: LayoutGrid, label: 'Dashboard' },
  { href: '/admin-dashboard/users', icon: Users, label: 'Users' },
  { href: '/admin-dashboard/farmers', icon: Tractor, label: 'Farmers' },
  { href: '/admin-dashboard/products', icon: ShoppingCart, label: 'Products' },
  { href: '/admin-dashboard/orders', icon: BarChart, label: 'Orders' },
  { href: '/admin-dashboard/mass-delivery', icon: PackageCheck, label: 'Mass Delivery' },
  { href: '/admin-dashboard/blog', icon: PenSquare, label: 'Blog Posts' },
  { href: '/admin-dashboard/reviews', icon: Star, label: 'Reviews' },
  { href: '/admin-dashboard/pickup-hubs', icon: MapPin, label: 'Pickup Hubs' },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const handleLinkClick = () => {
    if (window.innerWidth < 768) { // md breakpoint
        onToggle();
    }
  }

  return (
    <aside className={`fixed inset-y-0 left-0 bg-gray-900 text-white z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64`}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-800">
          <Link to="/" className="text-2xl font-bold">Agribridge</Link>
          <button onClick={onToggle} className="md:hidden text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.label}
              to={item.href}
              end={item.href === '/admin-dashboard'}
              onClick={handleLinkClick}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <div className="space-y-2 mb-4">
             <NavLink to="/admin-dashboard/settings" onClick={handleLinkClick} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${isActive ? 'bg-orange-500 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}>
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </NavLink>
            <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-orange-500 text-white">{getInitials(profile?.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{profile?.full_name || 'Admin User'}</p>
              <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { sendNotification } = useBrowserNotification();
  
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchAdminSettings = useCallback(async () => {
      if (!user) return null;
      const { data } = await supabase.from('admin_settings').select('*').eq('user_id', user.id).single();
      return data;
  }, [user]);

  useEffect(() => {
    const handleNewOrder = async (payload) => {
        const settings = await fetchAdminSettings();
        const description = `Order from ${payload.new.customer_name} for GHS ${payload.new.total_amount}.`;
        if (settings?.notify_new_orders) {
            toast({ title: "🎉 New Order Received!", description });
            sendNotification("🎉 New Order Received!", { body: description });
        }
    };
    
    const handleNewFarmer = async (payload) => {
        if (payload.new.is_verified === false || payload.new.is_verified === null) {
            const settings = await fetchAdminSettings();
            const description = `${payload.new.full_name || 'A new farmer'} has registered and is awaiting verification.`;
            if (settings?.notify_farmer_verification) {
                toast({ title: "🧑‍🌾 Farmer Needs Verification", description });
                sendNotification("🧑‍🌾 Farmer Needs Verification", { body: description });
            }
        }
    };

    const orderChannel = supabase.channel('public:orders').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, handleNewOrder).subscribe();
    const farmerChannel = supabase.channel('public:profiles-farmer-insert').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles', filter: 'role=eq.farmer' }, handleNewFarmer).subscribe();
      
    return () => {
      supabase.removeChannel(orderChannel);
      supabase.removeChannel(farmerChannel);
    };
  }, [user, toast, sendNotification, fetchAdminSettings]);
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 md:justify-end shrink-0">
          <button onClick={toggleSidebar} className="md:hidden text-gray-600 hover:text-gray-900">
            <Menu className="h-6 w-6" />
          </button>
          <p className="font-semibold">Admin Panel</p>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
       {sidebarOpen && <div onClick={toggleSidebar} className="fixed inset-0 bg-black/50 z-40 md:hidden" />}
    </div>
  );
};

export default AdminLayout;
