
import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Package, ShoppingBag, Truck, ChevronDown, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const getStatusStyles = (status) => {
    const normalized = status?.toLowerCase() || '';
    if (normalized === 'delivered') return "bg-green-100 text-green-800 border-green-200";
    if (normalized === 'order placed') return "bg-blue-100 text-blue-800 border-blue-200";
    if (normalized === 'out for delivery') return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (normalized === 'cancelled') return "bg-red-100 text-red-800 border-red-200";
    if (normalized === 'processing') return "bg-purple-100 text-purple-800 border-purple-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
};

const OrderCard = ({ order, onDeleteRequest }) => {
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);

    return (
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between p-4 bg-gray-50/50 border-b">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <p className="font-semibold text-gray-800">Order <span className="font-mono text-primary">#{order.id.substring(0, 8)}</span></p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`py-1 px-3 text-sm ${getStatusStyles(order.status)}`}>{order.status}</Badge>
                    {(order.status === 'Cancelled' || order.status === 'Delivered') && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            onClick={(e) => { e.stopPropagation(); onDeleteRequest(order); }}
                            title="Delete Order History"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="space-y-2">
                        {order.order_items.slice(0, 2).map(item => (
                            <div key={item.id} className="flex items-center gap-3">
                                {item.products?.image_url ? (
                                    <img src={item.products.image_url} alt={item.product_name} className="w-10 h-10 object-cover rounded-md border"/>
                                ) : (
                                    <div className="w-10 h-10 bg-gray-100 rounded-md border flex items-center justify-center">
                                        <Package className="w-5 h-5 text-gray-400"/>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-gray-700">{item.product_name}</p>
                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                        {order.order_items.length > 2 && <p className="text-xs text-gray-500 pl-12">+ {order.order_items.length - 2} more items</p>}
                    </div>
                    <div className="text-right">
                        <p className="text-gray-500 text-sm">Total</p>
                        <p className="font-bold text-xl text-gray-800">GHS {Number(order.total_amount).toLocaleString()}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">
                            {order.payment_status || 'unpaid'}
                        </Badge>
                    </div>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed">
                    <Link to={`/track-order/${order.id}`}>
                        <Button variant="outline" size="sm">
                            <Truck className="w-4 h-4 mr-2" /> Track Order
                        </Button>
                    </Link>
                    <Button variant="link" size="sm" onClick={() => setIsDetailsVisible(!isDetailsVisible)} className="text-primary">
                        {isDetailsVisible ? 'Hide' : 'View'} Details
                        <motion.div animate={{ rotate: isDetailsVisible ? 180 : 0 }} className="ml-1">
                            <ChevronDown className="w-4 h-4" />
                        </motion.div>
                    </Button>
                </div>

                <AnimatePresence>
                    {isDetailsVisible && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="font-semibold mb-3 text-gray-700">All Items in this Order:</h4>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                    {order.order_items.map((item, i) => (
                                        <motion.div 
                                          key={item.id} 
                                          className="flex items-center space-x-4"
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: i * 0.05 }}
                                        >
                                            {item.products?.image_url ? (
                                                <img src={item.products.image_url} alt={item.product_name} className="w-12 h-12 rounded-md object-cover border"/>
                                            ) : (
                                                 <div className="w-12 h-12 bg-gray-100 rounded-md border flex items-center justify-center">
                                                    <Package className="w-6 h-6 text-gray-400"/>
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800">{item.product_name}</p>
                                                <p className="text-xs text-gray-600">Qty: {item.quantity} &times; GHS {Number(item.price).toLocaleString()}</p>
                                            </div>
                                            <p className="ml-auto font-semibold text-sm text-gray-800">GHS {(item.quantity * item.price).toLocaleString()}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
};

const MyOrdersPage = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderToDelete, setOrderToDelete] = useState(null);

    const fetchOrders = useCallback(async (isInitial = false) => {
        if (!user) return;
        if (isInitial) setLoading(true);
        
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    *,
                    products ( name, image_url )
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            toast({ variant: 'destructive', title: 'Error fetching orders', description: error.message });
        } else {
            setOrders(data);
        }
        if (isInitial) setLoading(false);
    }, [user, toast]);
    
    const handleDeleteOrder = async () => {
        if(!orderToDelete) return;
        
        try {
             // Ideally use the RPC 'delete_order_and_dependents'
             const { error } = await supabase.rpc('delete_order_and_dependents', { order_id_to_delete: orderToDelete.id });
             if (error) throw error;
             
             setOrders(orders.filter(o => o.id !== orderToDelete.id));
             toast({ title: "Order Removed", description: "The order has been removed from your history." });
             setOrderToDelete(null);
        } catch (error) {
             toast({ variant: 'destructive', title: "Delete Failed", description: error.message });
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        } else if (user) {
            fetchOrders(true);
        }
    }, [user, authLoading, navigate, fetchOrders]);

    // Real-time updates subscription
    useEffect(() => {
        if (!user) return;

        const channel = supabase.channel(`my_orders_page_${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                     // Optimistically update the order in the list without re-fetching which causes spinner
                     setOrders(currentOrders => currentOrders.map(order => {
                        if (order.id === payload.new.id) {
                            // Merge new data with existing order, preserving order_items which aren't in payload
                            return { ...order, ...payload.new };
                        }
                        return order;
                    }));
                    
                    toast({ 
                        title: "Order Updated", 
                        description: `Order #${payload.new.id.substring(0, 8)} status is now ${payload.new.status}` 
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, toast]);

    if (loading || authLoading) {
        return (
            <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-transparent">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <>
      <Helmet>
        <title>My Orders - Golden Acres</title>
        <meta name="description" content="View your order history and track your current orders with Golden Acres." />
      </Helmet>
      <div className="bg-gray-50 min-h-[calc(100vh-5rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">My Orders</h1>
                <p className="mt-2 text-lg text-gray-600">Track and manage all your purchases from Golden Acres.</p>
            </motion.div>
            
            {orders.length > 0 ? (
                <div className="space-y-6">
                    <AnimatePresence>
                        {orders.map((order, index) => (
                             <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: index * 0.1 }}
                             >
                                <OrderCard order={order} onDeleteRequest={setOrderToDelete} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white rounded-xl border border-dashed">
                    <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700">You have no orders yet.</h2>
                    <p className="text-gray-500 mt-2 mb-6">Explore our marketplace and find something fresh!</p>
                     <Button asChild>
                        <Link to="/marketplace">Start Shopping</Link>
                    </Button>
                </motion.div>
            )}
        </div>
      </div>
      
      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Delete Order History?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will remove the order record from your history. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyOrdersPage;
