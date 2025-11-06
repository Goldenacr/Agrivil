
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ShoppingCart as ShoppingCartIcon, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const { user, signOut } = useAuth();
  const { cartItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select(`full_name, role`)
          .eq('id', user.id)
          .single();

        if (data) {
          setProfile(data);
        }
      } else {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [user]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    window.scrollTo(0, 0);
  };
  
  const getDashboardLink = () => {
    if (!profile) return '/login';
    if (profile.role === 'admin') return '/admin-dashboard';
    if (profile.role === 'farmer') return '/farmer-dashboard';
    return '/customer-dashboard';
  };
  
  const mobileLinkProps = {
    onClick: () => setIsOpen(false),
    className: "block text-gray-700 hover:text-primary"
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }}>
              <img src="https://horizons-cdn.hostinger.com/1ff2a2eb-9cef-439f-b1c4-73368cb28fdf/dee3e90e0fad3a78c5aad3fa165b27b3.jpg" alt="Golden Acres Logo" className="h-16 w-auto rounded-full" />
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary transition">Home</Link>
            <Link to="/about" className="text-gray-700 hover:text-primary transition">About</Link>
            <Link to="/marketplace" className="text-gray-700 hover:text-primary transition">Marketplace</Link>
            <Link to="/logistics" className="text-gray-700 hover:text-primary transition">Logistics</Link>
            <Link to="/blog" className="text-gray-700 hover:text-primary transition">Blog</Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary transition">Contact</Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              {user && profile ? (
                <>
                  <Link to={getDashboardLink()}>
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      {profile.full_name}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
             <Button variant="ghost" size="icon" className="relative" onClick={() => setIsCartOpen(true)}>
                <ShoppingCartIcon className="h-6 w-6" />
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                        {totalItems}
                    </span>
                )}
            </Button>
             <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-gray-700"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white border-t"
        >
          <div className="px-4 py-4 space-y-3">
            <Link to="/" {...mobileLinkProps}>Home</Link>
            <Link to="/about" {...mobileLinkProps}>About</Link>
            <Link to="/marketplace" {...mobileLinkProps}>Marketplace</Link>
            <Link to="/logistics" {...mobileLinkProps}>Logistics</Link>
            <Link to="/blog" {...mobileLinkProps}>Blog</Link>
            <Link to="/contact" {...mobileLinkProps}>Contact</Link>
            {user && profile ? (
              <>
                <Link to={getDashboardLink()} {...mobileLinkProps}>Dashboard</Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left text-gray-700 hover:text-primary">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" {...mobileLinkProps}>Login</Link>
                <Link to="/register" {...mobileLinkProps}>Sign Up</Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
