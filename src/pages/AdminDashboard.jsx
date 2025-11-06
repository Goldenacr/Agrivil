
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Upload, Ban, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/contexts/SupabaseAuthContext';

const FancyLoader = () => (
  <div className="fixed inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="fancy-loader"></div>
  </div>
);

const orderStatuses = [
    'Order Placed',
    'Rider Dispatched to Farm',
    'Products Picked Up',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
];

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', unit: '', farmer_id: '' });
  const [productImageFile, setProductImageFile] = useState(null);

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [currentBlogPost, setCurrentBlogPost] = useState(null);
  const [blogForm, setBlogForm] = useState({ title: '', content: '', excerpt: '', category: '' });
  const [blogImageFile, setBlogImageFile] = useState(null);

  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [banDuration, setBanDuration] = useState('7');
  const [userToManage, setUserToManage] = useState(null);
  
  const fetchData = useCallback(async () => {
    const [profilesRes, productsRes, blogRes, ordersRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*, farmer:profiles(full_name, phone_number)'),
      supabase.from('blog_posts').select('*, author:profiles(full_name)'),
      supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
    ]);

    if (profilesRes.error) toast({ variant: 'destructive', title: 'Error fetching users', description: profilesRes.error.message });
    else {
        setUsers(profilesRes.data);
        setFarmers(profilesRes.data.filter(p => p.role === 'farmer'));
    }

    if (productsRes.error) toast({ variant: 'destructive', title: 'Error fetching products', description: productsRes.error.message });
    else setProducts(productsRes.data);

    if (blogRes.error) toast({ variant: 'destructive', title: 'Error fetching blog posts', description: blogRes.error.message });
    else setBlogPosts(blogRes.data);

    if (ordersRes.error) toast({ variant: 'destructive', title: 'Error fetching orders', description: ordersRes.error.message });
    else setOrders(ordersRes.data);

    setLoading(false);
  }, [toast]);

  useEffect(() => {
    setLoading(true);
    fetchData();

    const orderChannel = supabase.channel('public:orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
            fetchData();
        })
        .subscribe();
    
    const profilesChannel = supabase.channel('public:profiles')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
            setUsers(currentUsers => currentUsers.map(u => u.id === payload.new.id ? payload.new : u));
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'profiles' }, payload => {
            setUsers(currentUsers => currentUsers.filter(u => u.id !== payload.old.id));
        })
        .subscribe();

    return () => {
        supabase.removeChannel(orderChannel);
        supabase.removeChannel(profilesChannel);
    };
  }, [fetchData]);

  // Product Handlers
  const handleProductModalOpen = (product) => {
    if (product) {
      setCurrentProduct(product);
      setProductForm({ name: product.name, description: product.description, price: product.price, stock: product.stock, unit: product.unit, farmer_id: product.farmer_id || '' });
    } else {
      setCurrentProduct(null);
      setProductForm({ name: '', description: '', price: '', stock: '', unit: '', farmer_id: '' });
    }
    setProductImageFile(null);
    setIsProductModalOpen(true);
  };
  
  const handleProductSubmit = async () => {
    let imageUrl = currentProduct?.image_url;
    if (productImageFile) {
        const { publicUrl, error } = await uploadFile(productImageFile, 'product_images');
        if (error) return;
        imageUrl = publicUrl;
    }
    
    const productData = { ...productForm, image_url: imageUrl, farmer_id: productForm.farmer_id || null };
    if (!productData.farmer_id) {
        toast({ variant: 'destructive', title: 'Validation Error', description: 'Please select a farmer.' });
        return;
    }
    const { error } = currentProduct
      ? await supabase.from('products').update(productData).eq('id', currentProduct.id)
      : await supabase.from('products').insert(productData);
    handleApiResponse(error, `Product ${currentProduct ? 'updated' : 'created'}`, `Failed to save product`, () => {
      setIsProductModalOpen(false);
      fetchData();
    });
  };

  const deleteProduct = async (productId) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    handleApiResponse(error, 'Product deleted', 'Failed to delete product', fetchData);
  };

  // Blog Handlers
  const handleBlogModalOpen = (post) => {
    if (post) {
      setCurrentBlogPost(post);
      setBlogForm({ title: post.title, content: post.content, excerpt: post.excerpt, category: post.category });
    } else {
      setCurrentBlogPost(null);
      setBlogForm({ title: '', content: '', excerpt: '', category: '' });
    }
    setBlogImageFile(null);
    setIsBlogModalOpen(true);
  };

  const handleBlogSubmit = async () => {
    let imageUrl = currentBlogPost?.image_url;
    if (blogImageFile) {
        const { publicUrl, error } = await uploadFile(blogImageFile, 'blog_images');
        if (error) return;
        imageUrl = publicUrl;
    }
    
    const blogData = { ...blogForm, image_url: imageUrl, author_id: user.id };
    const { error } = currentBlogPost
      ? await supabase.from('blog_posts').update(blogData).eq('id', currentBlogPost.id)
      : await supabase.from('blog_posts').insert(blogData);
    handleApiResponse(error, `Blog post ${currentBlogPost ? 'saved' : 'created'}`, `Failed to save post`, () => {
      setIsBlogModalOpen(false);
      fetchData();
    });
  };

  const deleteBlogPost = async (postId) => {
    const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
    handleApiResponse(error, 'Blog post deleted', 'Failed to delete blog post', fetchData);
  };

  // User Handlers
  const updateUserRole = async (userId, newRole) => {
    const originalRole = users.find(u => u.id === userId)?.role;

    if (userId === profile.id && newRole !== 'admin') {
      toast({
        variant: "destructive",
        title: "Action Forbidden",
        description: "You cannot remove your own admin role.",
      });
      return;
    }

    // Optimistically update UI
    setUsers(currentUsers =>
      currentUsers.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );

    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    
    if (error) {
      // Revert UI on failure
      setUsers(currentUsers =>
        currentUsers.map(u => (u.id === userId ? { ...u, role: originalRole } : u))
      );
      handleApiResponse(error, null, 'Failed to update user role');
    } else {
      handleApiResponse(null, 'User role updated', null);
    }
  };

  const handleBanUser = async () => {
    if (!userToManage) return;
    
    let bannedUntil = null;
    if (banDuration !== 'permanent' && banDuration !== 'unban') {
        const date = new Date();
        date.setDate(date.getDate() + parseInt(banDuration, 10));
        bannedUntil = date.toISOString();
    } else if (banDuration === 'permanent') {
        bannedUntil = new Date('9999-12-31T23:59:59Z').toISOString();
    }
    
    const { error } = await supabase.from('profiles').update({ banned_until: bannedUntil }).eq('id', userToManage.id);
    const successMsg = banDuration === 'unban' ? 'User unbanned' : `User banned`;
    handleApiResponse(error, successMsg, 'Failed to update user status', () => setIsBanModalOpen(false));
  };
  
  const handleOpenBanModal = (user) => {
    setUserToManage(user);
    setIsBanModalOpen(true);
  }

  const deleteUser = async (userId) => {
    const { error: functionError } = await supabase.functions.invoke('delete-user', {
        body: { userId },
    });
    // We proceed even if the auth user deletion fails, to ensure profile is deleted.
    if (functionError) {
        toast({ variant: 'destructive', title: 'Failed to delete user from auth', description: functionError.message });
    }
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    handleApiResponse(error, 'User fully deleted', 'Failed to delete user profile');
  };

  // Order Handlers
  const updateOrderStatus = async (orderId, newStatus) => {
    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

    if (updateError) {
        handleApiResponse(updateError, '', 'Failed to update order status');
        return;
    }
    
    const { error: logError } = await supabase
        .from('order_status_history')
        .insert({
            order_id: orderId,
            status: newStatus,
            notes: `Status updated to "${newStatus}" by admin.`
        });
        
    handleApiResponse(logError, 'Order status updated', 'Failed to log status update');
  };

  // Generic Helper Functions
  const uploadFile = async (file, bucket) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
    if (uploadError) {
        toast({ variant: 'destructive', title: 'Image upload failed', description: uploadError.message });
        return { error: uploadError };
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { publicUrl: data.publicUrl, error: null };
  };

  const handleApiResponse = (error, successMsg, errorMsg, onSuccess) => {
    if (error) {
        toast({ variant: 'destructive', title: errorMsg, description: error.message });
    } else {
        if(successMsg) toast({ title: successMsg });
        if (onSuccess) onSuccess();
    }
  };

  if (loading) return <FancyLoader />;

  return (
    <>
      <Helmet><title>Admin Dashboard - Golden Acres</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-transparent">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="mb-8 text-gray-600">Welcome, {user.email}. Manage your platform here.</p>

        <Tabs defaultValue="orders" className="bg-card/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Manage Orders</h2>
            <div className="bg-white/50 shadow rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200">
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-mono">{o.id.substring(0,8)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{o.customer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">GHS {o.total_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Select onValueChange={(newStatus) => updateOrderStatus(o.id, newStatus)} defaultValue={o.status}>
                          <SelectTrigger className="w-[200px] bg-white h-9"><SelectValue/></SelectTrigger>
                          <SelectContent>
                              {orderStatuses.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Users</h2>
            <div className="bg-white/50 shadow rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200">
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{u.full_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.phone_number || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         <Select onValueChange={(newRole) => updateUserRole(u.id, newRole)} value={u.role}>
                          <SelectTrigger className="w-[120px] bg-white h-9"><SelectValue/></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="farmer">Farmer</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {u.banned_until && new Date(u.banned_until) > new Date()
                          ? <span className="text-red-500 font-bold">Banned</span>
                          : <span className="text-green-500">Active</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/admin-dashboard/users/${u.id}`)}><Eye className="h-4 w-4 mr-2" />Details</Button>
                        {user.id !== u.id && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenBanModal(u)}><Ban className="h-4 w-4 text-orange-500" /></Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button></AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone. This will permanently delete the user <span className="font-bold">{u.full_name}</span> and all their data.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteUser(u.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Products</h2>
              <Button onClick={() => handleProductModalOpen(null)} className="bg-primary hover:bg-primary/90">Add Product</Button>
            </div>
            <div className="bg-white/50 shadow rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Farmer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{p.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.farmer?.full_name || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">GHS {p.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.stock} {p.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleProductModalOpen(p)}><Edit className="h-4 w-4" /></Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button></AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This action cannot be undone. This will permanently delete the product <span className="font-bold">{p.name}</span>.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteProduct(p.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="blog" className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Blog Posts</h2>
              <Button onClick={() => handleBlogModalOpen(null)} className="bg-primary hover:bg-primary/90">Add Blog Post</Button>
            </div>
            <div className="bg-white/50 shadow rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200">
                  {blogPosts.map(post => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{post.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleBlogModalOpen(post)}><Edit className="h-4 w-4" /></Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button></AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>This will permanently delete the blog post titled <span className="font-bold">{post.title}</span>.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteBlogPost(post.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* MODALS */}
      <Dialog open={isBanModalOpen} onOpenChange={setIsBanModalOpen}>
        <DialogContent className="bg-card/90 backdrop-blur-sm border">
          <DialogHeader><DialogTitle>Manage User: {userToManage?.full_name}</DialogTitle><DialogDescription>Restrict or ban this user. Banned users cannot log in.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4"><Select onValueChange={setBanDuration} defaultValue={banDuration}><SelectTrigger><SelectValue placeholder="Select ban duration" /></SelectTrigger><SelectContent><SelectItem value="1">1 Day</SelectItem><SelectItem value="7">7 Days</SelectItem><SelectItem value="30">30 Days</SelectItem><SelectItem value="permanent">Permanent</SelectItem><SelectItem value="unban">Unban</SelectItem></SelectContent></Select></div>
          <DialogFooter><Button variant="outline" onClick={() => setIsBanModalOpen(false)}>Cancel</Button><Button onClick={handleBanUser} className={banDuration === 'unban' ? '' : 'bg-destructive hover:bg-destructive/90'}>{banDuration === 'unban' ? 'Update Status' : 'Apply Ban'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="bg-card/90 backdrop-blur-sm border">
          <DialogHeader><DialogTitle>{currentProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
              <Input placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
              <Textarea placeholder="Description" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
              <Input placeholder="Price (GHS)" type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
              <Input placeholder="Stock" type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} />
              <Input placeholder="Unit (e.g., kg, bunch)" value={productForm.unit} onChange={e => setProductForm({...productForm, unit: e.target.value})} />
              <Select onValueChange={(val) => setProductForm({...productForm, farmer_id: val})} value={productForm.farmer_id}><SelectTrigger className="w-full"><SelectValue placeholder="Select Farmer *" /></SelectTrigger><SelectContent>{farmers.map(f => <SelectItem key={f.id} value={f.id}>{f.full_name}</SelectItem>)}</SelectContent></Select>
               <label className="flex items-center space-x-2 cursor-pointer text-sm p-3 border-dashed border-2 rounded-lg justify-center hover:bg-accent/50"><Upload className="w-5 h-5" /><span>{productImageFile ? productImageFile.name : 'Upload Image'}</span><input type="file" accept="image/*" className="hidden" onChange={e => setProductImageFile(e.target.files[0])} /></label>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancel</Button><Button onClick={handleProductSubmit} className="bg-primary hover:bg-primary/90">Save Product</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isBlogModalOpen} onOpenChange={setIsBlogModalOpen}>
        <DialogContent className="sm:max-w-[625px] bg-card/90 backdrop-blur-sm border">
          <DialogHeader><DialogTitle>{currentBlogPost ? 'Edit Blog Post' : 'Add New Blog Post'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
              <Input placeholder="Title" value={blogForm.title} onChange={e => setBlogForm({...blogForm, title: e.target.value})} />
              <Input placeholder="Category" value={blogForm.category} onChange={e => setBlogForm({...blogForm, category: e.target.value})} />
              <Textarea placeholder="Excerpt (a short summary)" value={blogForm.excerpt} onChange={e => setBlogForm({...blogForm, excerpt: e.target.value})} />
              <Textarea placeholder="Full Content (Markdown is supported)" rows={10} value={blogForm.content} onChange={e => setBlogForm({...blogForm, content: e.target.value})} />
              <label className="flex items-center space-x-2 cursor-pointer text-sm p-3 border-dashed border-2 rounded-lg justify-center hover:bg-accent/50"><Upload className="w-5 h-5" /><span>{blogImageFile ? blogImageFile.name : 'Upload Cover Image'}</span><input type="file" accept="image/*" className="hidden" onChange={e => setBlogImageFile(e.target.files[0])} /></label>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsBlogModalOpen(false)}>Cancel</Button><Button onClick={handleBlogSubmit} className="bg-primary hover:bg-primary/90">Save Post</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminDashboard;
