
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShoppingCart, BarChart, PenSquare, Tractor, Search, MapPin, PackageCheck, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SystemOverview from '@/components/admin/SystemOverview';
import UsersTab from '@/components/admin/UsersTab';
import ProductsTab from '@/components/admin/ProductsTab';
import FarmersTab from '@/components/admin/FarmersTab';
import OrdersTab from '@/components/admin/OrdersTab';
import BlogTab from '@/components/admin/BlogTab';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useBrowserNotification } from '@/hooks/useBrowserNotification';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const { user: currentUser } = useAuth();
    const { toast } = useToast();
    const { sendNotification, requestPermission, permission } = useBrowserNotification();

    const [data, setData] = useState({ users: [], products: [], orders: [], blogPosts: [], farmers: [] });
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteAction, setDeleteAction] = useState(null);

    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const debouncedUserSearch = useDebounce(userSearchTerm, 300);
    const debouncedProductSearch = useDebounce(productSearchTerm, 300);
    const [notificationSettings, setNotificationSettings] = useState({
        notify_new_orders: false, 
        notify_farmer_verification: false
    });

    const fetchNotificationSettings = useCallback(async () => {
        if (!currentUser) return;
        const { data } = await supabase.from('admin_settings').select('notify_new_orders, notify_farmer_verification').eq('user_id', currentUser.id).single();
        if (data) setNotificationSettings(data);
    }, [currentUser]);

    const fetchData = useCallback(async (showLoader = true) => {
        if (showLoader) setLoading(true);

        const [usersRes, productsRes, ordersRes, blogPostsRes, farmersRes] = await Promise.all([
            supabase.rpc('get_all_users_with_profiles'),
            supabase.from('products').select('*, farmer:profiles(id, full_name, is_verified)'),
            supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
            supabase.from('blog_posts').select('*, author:profiles(id, full_name)'),
            supabase.from('profiles').select('*').eq('role', 'farmer').order('created_at', { ascending: false }),
        ]);

        setData({
            users: usersRes.data || [],
            products: productsRes.data || [],
            orders: ordersRes.data || [],
            blogPosts: blogPostsRes.data || [],
            farmers: farmersRes.data || [],
        });

        if (showLoader) setLoading(false);
    }, []);

    useEffect(() => {
        if (permission === 'default') {
            requestPermission();
        }
    }, [permission, requestPermission]);

    useEffect(() => {
        fetchData();
        fetchNotificationSettings();

        const channel = supabase.channel('admin-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                // We re-fetch settings or rely on the effect dependency to update the closure
                // For immediate reliability, we can also check the current ref if we used one, 
                // but re-subscription via dependency array works for this scale.
                if (notificationSettings.notify_new_orders) {
                    sendNotification('New Order Received', { 
                        body: `Order #${payload.new.id.slice(0,8)} has been placed worth GHS ${payload.new.total_amount}.`,
                        tag: 'new-order'
                    });
                }
                toast({ title: "New Order", description: `Order #${payload.new.id.slice(0,8)} received.` });
                fetchData(false);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, (payload) => {
                if (payload.new.role === 'farmer' && !payload.new.is_verified) {
                     if (notificationSettings.notify_farmer_verification) {
                        sendNotification('New Farmer Registration', { 
                            body: `${payload.new.full_name} registered and needs verification.`,
                            tag: 'new-farmer'
                        });
                     }
                     toast({ title: "New Farmer", description: `${payload.new.full_name} needs verification.` });
                }
                fetchData(false);
            })
             // Listen for ANY change to profiles to update lists if something else changes
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => fetchData(false))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchData(false))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, () => fetchData(false))
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [fetchData, fetchNotificationSettings, notificationSettings, requestPermission, sendNotification, toast, permission]);

    const filteredUsers = useMemo(() => {
        if (!debouncedUserSearch) return data.users;
        return data.users.filter(u => 
            u.full_name?.toLowerCase().includes(debouncedUserSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(debouncedUserSearch.toLowerCase())
        );
    }, [data.users, debouncedUserSearch]);

    const filteredProducts = useMemo(() => {
        if (!debouncedProductSearch) return data.products;
        return data.products.filter(p => p.name.toLowerCase().includes(debouncedProductSearch.toLowerCase()));
    }, [data.products, debouncedProductSearch]);


    const handleApiResponse = (error, successMsg, errorMsg, onSuccess) => {
        if (error) {
            toast({ variant: 'destructive', title: errorMsg, description: error.message });
        } else {
            if (successMsg) toast({ title: successMsg });
            if (onSuccess) onSuccess();
        }
    };
    
    const confirmDelete = (item, action) => {
        setItemToDelete(item);
        setDeleteAction(() => action);
        setShowDeleteConfirm(true);
    };

    const executeDelete = async () => {
        if (!itemToDelete || !deleteAction) return;
        await deleteAction(itemToDelete);
        setShowDeleteConfirm(false); setItemToDelete(null); setDeleteAction(null);
    };
    
    // User Management
    const deleteUser = async (user) => {
        const { error } = await supabase.functions.invoke('delete-user', { body: { userId: user.id } });
        handleApiResponse(error, 'User deleted successfully', 'Failed to delete user', () => fetchData(false));
    };
    
    const updateUserRole = async (userId, newRole) => {
        if (userId === currentUser.id && newRole !== 'admin') {
            toast({ variant: "destructive", title: "Action Forbidden", description: "You cannot remove your own admin role." });
            return;
        }
        
        const updates = { role: newRole };
        // When converting to farmer, ensure they are unverified so they must complete verification
        if (newRole === 'farmer') {
            updates.is_verified = false;
            updates.verification_status = 'pending';
        }

        const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
        handleApiResponse(error, 'User role updated', 'Failed to update role', () => fetchData(false));
    };

    const handleBanUser = async (userToManage, banDuration) => {
        let bannedUntil = null;
        if (banDuration !== 'permanent' && banDuration !== 'unban') {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(banDuration, 10));
            bannedUntil = date.toISOString();
        } else if (banDuration === 'permanent') {
            bannedUntil = new Date('9999-12-31T23:59:59Z').toISOString();
        }
        const { error } = await supabase.from('profiles').update({ banned_until: bannedUntil }).eq('id', userToManage.id);
        handleApiResponse(error, `User status updated`, 'Failed to update status', () => fetchData(false));
    };
    
    const handleVerifyFarmer = async (farmerId) => {
        const { error } = await supabase.from('profiles').update({ is_verified: true, verification_status: 'approved' }).eq('id', farmerId);
        handleApiResponse(error, 'Farmer verified!', 'Failed to verify farmer', () => fetchData(false));
    };
    
    const handleDeclineFarmer = async (farmerId) => {
        // 1. First, attempt to delete the verification documents from storage
        try {
            const { data: list } = await supabase.storage.from('product_images').list(`verification/${farmerId}`);
            if (list && list.length > 0) {
                const filesToRemove = list.map(x => `verification/${farmerId}/${x.name}`);
                await supabase.storage.from('product_images').remove(filesToRemove);
            }
        } catch (err) {
            console.error("Error deleting verification docs:", err);
            // We continue to delete the user even if file deletion fails, to avoid orphan users
        }

        // 2. Then delete the user account
         const { error } = await supabase.functions.invoke('delete-user', { body: { userId: farmerId } });
         handleApiResponse(error, 'Farmer application declined and account removed.', 'Failed to decline application', () => fetchData(false));
    };

    // Product Management
    const deleteProduct = async (product) => {
        const { error } = await supabase.from('products').delete().eq('id', product.id);
        handleApiResponse(error, 'Product deleted', 'Failed to delete product', () => fetchData(false));
    };

    // Order Management
    const deleteOrder = async (order) => {
        const { error } = await supabase.rpc('delete_order_and_dependents', { order_id_to_delete: order.id });
        handleApiResponse(error, 'Order deleted', 'Failed to delete order', () => fetchData(false));
    };

    // Blog Management
    const deleteBlogPost = async (post) => {
        const { error } = await supabase.from('blog_posts').delete().eq('id', post.id);
        handleApiResponse(error, 'Blog post deleted', 'Failed to delete post', () => fetchData(false));
    };

    return (
        <>
            <Helmet><title>Admin Dashboard - Agribridge</title></Helmet>
            <div className="py-8">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            </div>
            
            <Tabs defaultValue="overview">
                 <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-9 mb-4">
                    <TabsTrigger value="overview"><BarChart className="h-4 w-4 mr-2" /> Overview</TabsTrigger>
                    <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" /> Users</TabsTrigger>
                    <TabsTrigger value="farmers"><Tractor className="h-4 w-4 mr-2" /> Farmers</TabsTrigger>
                    <TabsTrigger value="products"><ShoppingCart className="h-4 w-4 mr-2" /> Products</TabsTrigger>
                    <TabsTrigger value="orders"><BarChart className="h-4 w-4 mr-2" /> Orders</TabsTrigger>
                    <TabsTrigger asChild>
                        <Link to="/admin-dashboard/mass-delivery" className="flex items-center justify-center"><PackageCheck className="h-4 w-4 mr-2" />Delivery</Link>
                    </TabsTrigger>
                     <TabsTrigger asChild>
                        <Link to="/admin-dashboard/countries" className="flex items-center justify-center"><Globe className="h-4 w-4 mr-2" />Countries</Link>
                    </TabsTrigger>
                    <TabsTrigger value="blog"><PenSquare className="h-4 w-4 mr-2" /> Blog</TabsTrigger>
                    <TabsTrigger asChild>
                        <Link to="/admin-dashboard/pickup-hubs" className="flex items-center justify-center">
                            <MapPin className="h-4 w-4 mr-2" /> Hubs
                        </Link>
                    </TabsTrigger>
                </TabsList>

                {loading ? <p className="text-center py-10">Loading data...</p> : (
                    <>
                        <TabsContent value="overview"><SystemOverview users={data.users} products={data.products} orders={data.orders} /></TabsContent>
                        <TabsContent value="users">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Search by name or email..." className="pl-10" value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} />
                            </div>
                            <UsersTab users={filteredUsers} currentUser={currentUser} onRoleUpdate={updateUserRole} onBan={handleBanUser} onDelete={(user) => confirmDelete(user, deleteUser)} />
                        </TabsContent>
                        <TabsContent value="farmers"><FarmersTab farmers={data.farmers} onVerify={handleVerifyFarmer} onDecline={handleDeclineFarmer}/></TabsContent>
                        <TabsContent value="products">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Search by product name..." className="pl-10" value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} />
                            </div>
                            <ProductsTab products={filteredProducts} farmers={data.users.filter(u => u.role === 'farmer')} onAdd={fetchData} onEdit={fetchData} onDelete={(p) => confirmDelete(p, deleteProduct)} />
                        </TabsContent>
                        <TabsContent value="orders"><OrdersTab orders={data.orders} onStatusUpdate={() => fetchData(false)} onDelete={(o) => confirmDelete(o, deleteOrder)} /></TabsContent>
                        <TabsContent value="blog"><BlogTab blogPosts={data.blogPosts} onAdd={fetchData} onEdit={fetchData} onDelete={(p) => confirmDelete(p, deleteBlogPost)} /></TabsContent>
                    </>
                )}
            </Tabs>
            
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone and will permanently delete the item.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} className="bg-destructive hover:bg-destructive/90">Confirm Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default AdminDashboard;
