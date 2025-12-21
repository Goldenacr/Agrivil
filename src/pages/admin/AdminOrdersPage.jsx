
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Truck, 
  Home, 
  Package, 
  Calendar, 
  Phone, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
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
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hubs, setHubs] = useState({});
  const { toast } = useToast();
  
  // States for modals
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    fetchData();
    
    // Subscribe to realtime changes on orders table
    const channel = supabase.channel('admin_orders_list')
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'orders' },
            (payload) => {
                setOrders(currentOrders => currentOrders.map(order => 
                    order.id === payload.new.id ? { ...order, ...payload.new } : order
                ));
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Hubs first for mapping
      const { data: hubsData, error: hubsError } = await supabase
        .from('pickup_hubs')
        .select('id, name, area, region');
      
      if (hubsError) throw hubsError;

      const hubsMap = {};
      hubsData?.forEach(hub => {
        hubsMap[hub.id] = hub;
      });
      setHubs(hubsMap);

      // Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            product_name,
            farmer_name
          )
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error fetching data",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateStatus = async (orderId, newStatus) => {
      // 1. Snapshot previous state for rollback
      const previousOrders = [...orders];
      const previousSelectedOrder = selectedOrder ? { ...selectedOrder } : null;

      // 2. Optimistically update the UI
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
           setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      try {
          // 3. Perform actual update
          const { error } = await supabase
              .from('orders')
              .update({ status: newStatus })
              .eq('id', orderId)
              .select(); // Ensure we select back the data to confirm RLS allowed the update
              
          if (error) throw error;
          
          // 4. Log to history
          const { error: historyError } = await supabase.from('order_status_history').insert({
              order_id: orderId,
              status: newStatus,
              notes: `Status updated to ${newStatus} by admin.`
          });
          
          if (historyError) {
              console.warn("History log failed:", historyError);
          }
          
          toast({ title: "Status updated", description: `Order is now ${newStatus}` });
      } catch (error) {
          // 5. Revert on error
          console.error("Update failed", error);
          setOrders(previousOrders);
          if (previousSelectedOrder) setSelectedOrder(previousSelectedOrder);
          
          toast({ variant: 'destructive', title: "Update failed", description: error.message || "Could not update order status." });
      }
  };

  const handleDeleteOrder = async () => {
      if (!orderToDelete) return;
      try {
          const { error } = await supabase.rpc('delete_order_and_dependents', { order_id_to_delete: orderToDelete.id });
          
          if (error) throw error;
          
          setOrders(orders.filter(o => o.id !== orderToDelete.id));
          setOrderToDelete(null);
          if (selectedOrder?.id === orderToDelete.id) setSelectedOrder(null);
          
          toast({ title: "Order deleted", description: "The order has been permanently removed." });
      } catch (error) {
          console.error("Delete error:", error);
          toast({ variant: 'destructive', title: "Delete failed", description: error.message });
      }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      case 'order placed': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800';
      case 'out for delivery': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    }
  };
  
  const getPaymentStatusColor = (status) => {
      switch(status?.toLowerCase()) {
          case 'paid': return 'text-green-600 bg-green-50 border-green-200';
          case 'unpaid': return 'text-red-600 bg-red-50 border-red-200';
          default: return 'text-gray-600 bg-gray-50 border-gray-200';
      }
  };

  const getLocationDetails = (order) => {
    const info = order.delivery_info;
    
    if (!info) return { type: 'Unknown', label: 'No Info', subLabel: '', icon: <Home className="h-4 w-4 text-gray-400" /> };

    let parsedInfo = info;
    if (typeof info === 'string') {
        try {
            parsedInfo = JSON.parse(info);
        } catch (e) {
            return { type: 'Unknown', label: info, subLabel: '', icon: <Home className="h-4 w-4 text-gray-400" /> };
        }
    }

    if (parsedInfo.method === 'Pickup') {
      const hubId = parsedInfo.hub_id;
      const hub = hubs[hubId];
      
      const hubName = hub ? hub.name : (parsedInfo.hub_name || 'Unknown Hub');
      const hubArea = hub ? hub.area : (parsedInfo.hub_area || '');
      const hubRegion = hub ? hub.region : '';

      return {
        type: 'Pickup',
        label: `${hubName} ${hubArea ? `(${hubArea})` : ''}`,
        subLabel: hubRegion || 'Pickup Center',
        icon: <Truck className="h-4 w-4 text-orange-500" />
      };
    } else {
      return {
        type: 'Home Delivery',
        label: parsedInfo.address || 'No Address Provided',
        subLabel: 'Home Delivery',
        icon: <Home className="h-4 w-4 text-blue-500" />
      };
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_phone?.includes(searchTerm)
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const MobileOrderCard = ({ order }) => {
    const location = getLocationDetails(order);
    
    return (
      <motion.div
        layout="position"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="mb-4"
      >
        <Card className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-4">
            {/* Header: ID and Status */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-muted-foreground">#{order.id.slice(0, 8)}</span>
                <h3 className="font-semibold text-lg text-foreground mt-1">{order.customer_name || 'Guest User'}</h3>
              </div>
              <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={`${getStatusColor(order.status)} whitespace-nowrap`}>
                    {order.status}
                  </Badge>
                  <Badge variant="outline" className={`${getPaymentStatusColor(order.payment_status)} text-[10px] px-1.5 py-0`}>
                      {order.payment_status || 'unpaid'}
                  </Badge>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-y-3 text-sm border-t pt-3 border-dashed">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 bg-gray-50 p-1.5 rounded-full">{location.icon}</div>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium text-foreground text-sm break-words">{location.label}</span>
                  <span className="text-xs text-muted-foreground">{location.subLabel}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="shrink-0 bg-gray-50 p-1.5 rounded-full"><Calendar className="h-4 w-4 text-gray-500" /></div>
                <span className="text-gray-700">{formatDate(order.created_at)}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="shrink-0 bg-gray-50 p-1.5 rounded-full"><Phone className="h-4 w-4 text-gray-500" /></div>
                <a href={`tel:${order.customer_phone}`} className="text-gray-700 hover:text-primary transition-colors">
                  {order.customer_phone || 'No Phone'}
                </a>
              </div>
            </div>

            {/* Footer: Total and Actions */}
            <div className="pt-3 mt-1 border-t flex justify-between items-center bg-gray-50/50 -mx-4 -mb-4 px-4 py-3">
              <div>
                <span className="text-xs text-muted-foreground block">Total Amount</span>
                <p className="font-bold text-lg text-primary">GHS {Number(order.total_amount).toFixed(2)}</p>
              </div>
              
              <div className="flex gap-2">
                 <Button variant="outline" size="sm" className="h-9 px-4 bg-white" onClick={() => setSelectedOrder(order)}>
                    View
                 </Button>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 bg-white border">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Processing')}>Mark as Processing</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')}>Mark as Out for Delivery</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Delivered')}>Mark as Delivered</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600" onClick={() => handleUpdateStatus(order.id, 'Cancelled')}>Cancel Order</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => setOrderToDelete(order)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Delete Permanently
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-[100vw] overflow-x-hidden bg-gray-50/30 min-h-screen">
       {/* CSS Smooth Scroll Injection */}
       <style>{`
        html {
          scroll-behavior: smooth;
        }
        /* Custom scrollbar for better feel */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/90 supports-[backdrop-filter]:bg-white/50">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">View and manage all customer orders.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search ID, Name..."
              className="pl-8 bg-gray-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin w-10 h-10 text-primary" />
        </div>
      ) : (
        <>
          {/* Mobile View: Stacked Cards */}
          <div className="md:hidden space-y-4 pb-20">
            <AnimatePresence mode="popLayout">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <MobileOrderCard key={order.id} order={order} />
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed shadow-sm"
                >
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No orders found matching your search.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block border rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b text-gray-600 font-semibold uppercase text-xs tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 bg-gray-50">Order ID</th>
                    <th className="px-6 py-4 bg-gray-50">Customer</th>
                    <th className="px-6 py-4 bg-gray-50">Status</th>
                    <th className="px-6 py-4 bg-gray-50">Payment</th>
                    <th className="px-6 py-4 bg-gray-50">Delivery Info</th>
                    <th className="px-6 py-4 bg-gray-50">Date</th>
                    <th className="px-6 py-4 bg-gray-50 text-right">Total</th>
                    <th className="px-6 py-4 bg-gray-50 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                       const location = getLocationDetails(order);
                       return (
                        <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                            #{order.id.slice(0, 8)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">{order.customer_name || 'Guest'}</span>
                              <span className="text-xs text-gray-500 font-mono mt-0.5">{order.customer_phone || '-'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <Badge variant="outline" className={getPaymentStatusColor(order.payment_status)}>
                                    {order.payment_status || 'unpaid'}
                                </Badge>
                                <span className="text-[10px] text-gray-500">{order.payment_method?.replace('_', ' ') || 'N/A'}</span>
                              </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="bg-gray-50 p-1.5 rounded-full text-gray-500">
                                   {location.icon}
                               </div>
                               <div className="flex flex-col max-w-[220px]">
                                 <span className="font-medium truncate text-gray-900" title={location.label}>{location.label}</span>
                                 <span className="text-xs text-muted-foreground">{location.subLabel}</span>
                               </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900">
                            GHS {Number(order.total_amount).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                                  <MoreVertical className="h-4 w-4 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                                    <Eye className="w-4 h-4 mr-2" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Processing')}><Clock className="w-4 h-4 mr-2"/> Processing</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')}><Truck className="w-4 h-4 mr-2"/> Out for Delivery</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'Delivered')}><CheckCircle className="w-4 h-4 mr-2"/> Delivered</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleUpdateStatus(order.id, 'Cancelled')}>
                                    <XCircle className="w-4 h-4 mr-2"/> Cancel Order
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => setOrderToDelete(order)}>
                                    <Trash2 className="w-4 h-4 mr-2"/> Delete Permanently
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-muted-foreground bg-gray-50/50">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No orders found matching your criteria.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Order Details Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Order Details - #{selectedOrder?.id?.substring(0,8)}</DialogTitle>
                <DialogDescription>
                    Placed on {selectedOrder && formatDate(selectedOrder.created_at)}
                </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <span className="bg-primary/10 p-1 rounded text-primary"><Package className="h-4 w-4"/></span> 
                                Customer Info
                            </h4>
                            <div className="space-y-1 text-sm">
                                <p><span className="text-muted-foreground">Name:</span> {selectedOrder.customer_name}</p>
                                <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.customer_phone}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <span className="bg-primary/10 p-1 rounded text-primary"><Truck className="h-4 w-4"/></span>
                                Delivery & Payment
                            </h4>
                             <div className="space-y-1 text-sm">
                                <p><span className="text-muted-foreground">Method:</span> {getLocationDetails(selectedOrder).type}</p>
                                <p><span className="text-muted-foreground">Location:</span> {getLocationDetails(selectedOrder).label}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-muted-foreground">Payment:</span> 
                                    <Badge variant="outline" className={getPaymentStatusColor(selectedOrder.payment_status)}>
                                        {selectedOrder.payment_status || 'unpaid'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">({selectedOrder.payment_method})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="font-semibold mb-2">Order Items</h4>
                        <div className="border rounded-md overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="text-left p-3">Product</th>
                                        <th className="text-left p-3">Farmer</th>
                                        <th className="text-center p-3">Qty</th>
                                        <th className="text-right p-3">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.order_items?.map((item, idx) => (
                                        <tr key={idx} className="border-t">
                                            <td className="p-3 font-medium">{item.product_name}</td>
                                            <td className="p-3 text-muted-foreground">{item.farmer_name || 'Agribridge'}</td>
                                            <td className="p-3 text-center">{item.quantity}</td>
                                            <td className="p-3 text-right">GHS {Number(item.price).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t">
                        <span className="font-bold text-lg">Total Amount</span>
                        <span className="font-bold text-2xl text-primary">GHS {Number(selectedOrder.total_amount).toFixed(2)}</span>
                    </div>
                </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedOrder.id, 'Processing')}>Processing</Button>
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}>Delivered</Button>
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!orderToDelete} onOpenChange={(open) => !open && setOrderToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the order 
                    <span className="font-mono font-bold"> #{orderToDelete?.id.slice(0,8)}</span> and remove it from our servers.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteOrder} className="bg-red-600 hover:bg-red-700">Delete Order</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrdersPage;
