
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminHeader = () => {
  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }}>
              <img src="https://horizons-cdn.hostinger.com/1ff2a2eb-9cef-439f-b1c4-73368cb28fdf/dee3e90e0fad3a78c5aad3fa165b27b3.jpg" alt="Golden Acres Logo" className="h-16 w-auto rounded-full" />
            </motion.div>
            <span className="font-bold text-xl hidden sm:inline">Golden Acres Admin</span>
          </Link>
          <Link to="/" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Home className="w-4 h-4 mr-2" />
            Back to Site
          </Link>
        </div>
      </div>
    </header>
  );
};

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <AdminHeader />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
