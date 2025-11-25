
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle, Home, Loader2, Info, ShieldCheck, MessageCircle, Search, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/customSupabaseClient';
import ProductsTab from '@/components/admin/ProductsTab';
import { useDebounce } from '@/hooks/useDebounce';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FarmerDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]); // Needed for product modal dropdown
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchFarmerData = useCallback(async () => {
    if (!profile || profile.role !== 'farmer') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [productsRes, farmersRes] = await Promise.all([
          supabase
              .from('products')
              .select(`*, farmer:profiles(full_name, id)`)
              .eq('farmer_id', profile.id),
          supabase
              .from('profiles')
              .select('id, full_name')
              .eq('role', 'farmer')
      ]);

      if (productsRes.error) throw productsRes.error;
      setProducts(productsRes.data);

      if (farmersRes.error) throw farmersRes.error;
      setFarmers(farmersRes.data);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to fetch data',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [profile, toast]);

  useEffect(() => {
    fetchFarmerData();
  }, [fetchFarmerData]);

  const handleLogout = async () => {
      await signOut();
      navigate('/');
  };

  const handleProductSave = () => {
    toast({ title: "Product saved successfully!" });
    fetchFarmerData();
  };

  const handleProductDelete = async (product) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id);
      if (error) throw error;
      toast({ title: "Product deleted successfully." });
      fetchFarmerData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to delete product', description: error.message });
    }
  };

  const filteredProducts = useMemo(() => {
    if (!debouncedSearchTerm) return products;
    return products.filter(p => p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [products, debouncedSearchTerm]);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profile && profile.role !== 'farmer') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600">You do not have permission to view the farmer dashboard.</p>
        <Link to="/" className="mt-6">
          <Button>Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  const isVerified = profile?.is_verified;
  
  const whatsAppNumber = "233557488116";
  const shortUserId = user?.id ? user.id.split('-')[0] : 'N/A';
  const prefilledMessage = `Hello Golden Acres, I would like to verify my farmer account.\n\nMy Name: ${profile?.full_name || 'N/A'}\nUser ID: ${shortUserId}`;
  const encodedMessage = encodeURIComponent(prefilledMessage);
  const whatsAppUrl = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;

  const VerificationBanner = () => (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 mb-8 shadow-sm relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-100 rounded-full opacity-50 blur-xl"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
                <div className="bg-orange-100 p-3 rounded-full">
                     <ShieldCheck className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Action Required: Verify Your Account</h3>
                    <p className="text-gray-600 mt-1 max-w-2xl">
                        Welcome to Golden Acres! To start listing your products and receiving orders, we need to verify your farmer profile. 
                        This quick process ensures trust and quality in our marketplace.
                    </p>
                </div>
            </div>
            
            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                <Button className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white border-none shadow-md hover:shadow-lg transition-all">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Verify via WhatsApp
                </Button>
            </a>
        </div>
    </motion.div>
  );

  const AddProductButton = () => {
    if (!isVerified) {
      return (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md bg-gray-50 border-none shadow-2xl rounded-2xl p-0">
             <div className="p-8 text-center">
                <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                    className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 mb-6 shadow-lg"
                >
                    <ShieldCheck className="h-12 w-12 text-white" />
                </motion.div>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold text-gray-800">
                        Account Verification Required
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 mt-2 text-base">
                        To add products and start selling, your account needs to be verified by our team.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <p className="text-sm text-gray-500 mt-4">
                    Click the button below to send us a verification request on WhatsApp.
                </p>
                
                <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full mt-6">
                    <Button noHover className="w-full bg-green-500 hover:bg-green-600 text-white text-base py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <MessageCircle className="h-5 w-5 mr-3" />
                        Verify via WhatsApp
                    </Button>
                </a>
            </div>

            <AlertDialogFooter className="bg-gray-100 p-4 rounded-b-2xl">
              <AlertDialogCancel asChild>
                <Button variant="ghost" className="w-full">Close</Button>
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    } else {
        // Logic for verified users to add product would open a normal modal, 
        // but here we just trigger the passed prop if available, or handled by ProductsTab's logic
        // Actually ProductsTab handles the "Add Product" button itself in its own layout? 
        // Wait, ProductsTab accepts onAdd which usually saves. 
        // The "Add Product" button is traditionally OUTSIDE the tab or INSIDE. 
        // In my previous code for FarmerDashboard, the button was in the header.
        // Let's reuse the logic but just return a normal button that triggers the modal state if I had it lifted.
        // But FarmerDashboard doesn't lift the modal state currently. 
        // ProductsTab has the "Add Product" button inside it.
        // Ah, my previous FarmerDashboard code had "AddProductButton" in the header.
        // And PASSED "onAdd" to ProductsTab.
        // But ProductsTab ALSO has an "Add Product" button inside it in the previous snippet?
        // Let's check `ProductsTab.jsx` I wrote earlier... Yes, it has a button.
        // So I should probably HIDE the button in ProductsTab if I have one in Dashboard, or vice versa.
        // Or simply: FarmerDashboard passes `isFarmerView={true}`. 
        // I'll let ProductsTab handle the ADD button, but I need to intercept it if not verified?
        // No, the best UX is to let the dashboard show the button, and if clicked -> show alert.
        // But ProductsTab is self-contained.
        
        // FIX: I will remove the Add Button from the header of FarmerDashboard 
        // and let the ProductsTab handle it? 
        // OR, keep the header button for better visibility and make it trigger the logic.
        
        // For simplicity and robustness based on the previous file content:
        // I will keep the AddProductButton component here but it returns NULL if verified,
        // because ProductsTab has its own button?
        // actually `ProductsTab` I wrote in step 2 has a button.
        // So if I render `ProductsTab`, it shows a button.
        // If the user is NOT verified, I shouldn't render `ProductsTab` fully enabled?
        // Or `ProductsTab` should be hidden?
        
        // User requirement: "Add a prominent verification prompt... so they don't miss ... even if they don't click add product"
        // This implies the banner is key.
        
        // If verified, I return null here so no duplicate button in header (assuming ProductsTab has one).
        // BUT, looking at my previous FarmerDashboard code, `ProductsTab` was rendered.
        // And there was a button in the header: `<AddProductButton />`.
        // If I keep it, I might have two buttons.
        // Let's check `ProductsTab` code again.
        // Yes, `<div className="flex justify-between... <Button ...>Add Product</Button>`.
        // So `ProductsTab` has a button.
        // I should probably remove the button from the FarmerDashboard header if ProductsTab is present,
        // OR pass a prop to ProductsTab to hide its button.
        // However, I can't edit ProductsTab in this step (I already did in prev turn).
        // So, I will just not render the header button if verified, 
        // relying on ProductsTab's button.
        return null; 
    }
  };


  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4"
      >
        <h1 className="text-3xl font-bold text-gray-800">
          Your Products
        </h1>
        <div className="flex items-center gap-2">
            <AnimatePresence>
               {/* Only show this button if NOT verified, to trigger the alert. If verified, ProductsTab has the button. */}
               {!isVerified && (
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
                        <PlusCircle className="h-4 w-4 mr-2" /> Add Product
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md bg-gray-50 border-none shadow-2xl rounded-2xl p-0">
                        <div className="p-8 text-center">
                            <motion.div 
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                                className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 mb-6 shadow-lg"
                            >
                                <ShieldCheck className="h-12 w-12 text-white" />
                            </motion.div>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-bold text-gray-800">
                                    Account Verification Required
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600 mt-2 text-base">
                                    To add products and start selling, your account needs to be verified by our team.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <p className="text-sm text-gray-500 mt-4">
                                Click the button below to send us a verification request on WhatsApp.
                            </p>
                            
                            <a href={whatsAppUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full mt-6">
                                <Button noHover className="w-full bg-green-500 hover:bg-green-600 text-white text-base py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <MessageCircle className="h-5 w-5 mr-3" />
                                    Verify via WhatsApp
                                </Button>
                            </a>
                        </div>
                        <AlertDialogFooter className="bg-gray-100 p-4 rounded-b-2xl">
                        <AlertDialogCancel asChild>
                            <Button variant="ghost" className="w-full">Close</Button>
                        </AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
               )}
            </AnimatePresence>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link to="/" className="flex items-center">
                <Home className="h-4 w-4 mr-2" /> Home
              </Link>
            </Button>
            <Button variant="destructive" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
        </div>
      </motion.div>

      {/* New Verification Banner */}
      {!isVerified && <VerificationBanner />}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isVerified ? (
            <>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by product name..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ProductsTab 
                    products={filteredProducts} 
                    farmers={farmers} 
                    onAdd={handleProductSave} 
                    onEdit={handleProductSave} 
                    onDelete={handleProductDelete} 
                    isFarmerView={true}
                />
            </>
        ) : (
            <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg mt-4 bg-gray-50/50">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0}} 
                animate={{ scale: 1, opacity: 1}} 
                transition={{delay: 0.3}}
                className="flex justify-center mb-4"
              >
                <Info className="h-12 w-12 text-gray-300" />
              </motion.div>
              <h3 className="text-xl font-semibold text-gray-700">Verification Pending</h3>
              <p className="text-lg text-gray-600 mt-2">Your product management dashboard will appear here once your account is verified.</p>
              <p className="text-gray-500 mt-2">Thank you for your patience!</p>
            </div>
        )}
      </motion.div>
    </div>
  );
};

export default FarmerDashboard;
