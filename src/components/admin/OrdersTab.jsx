
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trash2, Home, Warehouse, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from '@/lib/customSupabaseClient';

const orderStatuses = [
    'Order Placed',
    'Rider Dispatched to Farm',
    'Products Picked Up',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
];


const DeliveryInfo = ({ info }) => {
    const [hubName, setHubName] = useState(null);
    const [loadingHub, setLoadingHub] = useState(false);

    React.useEffect(() => {
        if (info?.method === 'Pickup' && info.hub_id) {
            setLoadingHub(true);
            const fetchHubName = async () => {
                const { data, error } = await supabase.from('pickup_hubs').select('name').eq('id', info.hub_id).single();
                if (!error && data) {
                    setHubName(data.name);
                } else {
                    setHubName('Unknown Hub');
                }
                setLoadingHub(false);
            };
            fetchHubName();
        }
    }, [info]);
    
    if (!info) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <HelpCircle className="h-4 w-4" />
                            <span>Legacy</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Delivery info not available for this order.</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    
    if (info.method === 'Delivery') {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                           <Home className="h-4 w-4 text-blue-500" />
                           <span>Home Delivery</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>{info.address || 'Address not specified'}</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (info.method === 'Pickup') {
        return (
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                           <Warehouse className="h-4 w-4 text-green-500" />
                           <span>Pickup Hub</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        {loadingHub ? <p>Loading hub name...</p> : <p>{hubName || 'Hub not specified'}</p>}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return (
        <div className="flex items-center gap-2 text-muted-foreground">
            <HelpCircle className="h-4 w-4" />
            <span>Not specified</span>
        </div>
    );
};


const OrdersTab = ({ orders, onStatusUpdate, onDelete }) => {
    
    const getFarmerNames = (orderItems) => {
        if (!orderItems || orderItems.length === 0) return 'N/A';
        const names = [...new Set(orderItems.map(item => item.farmer_name).filter(Boolean))];
        return names;
    };
    
    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">Manage Orders</h3>
            <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-left font-medium text-muted-foreground">Order ID</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Customer</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Farmer(s)</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Delivery Method</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Total</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                                <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((o, index) => {
                                const farmerNames = getFarmerNames(o.order_items);
                                return (
                                    <motion.tr
                                        key={o.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white hover:bg-gray-50/50"
                                    >
                                        <td className="p-3 font-mono text-xs">{o.id.substring(0, 8)}...</td>
                                        <td className="p-3">{o.customer_name}</td>
                                        <td className="p-3 text-muted-foreground">
                                            {farmerNames === 'N/A' ? 'N/A' : farmerNames.length > 1 ? (
                                                 <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span className="cursor-pointer underline decoration-dotted">Multiple ({farmerNames.length})</span>
                                                        </TooltipTrigger>
                                                        <TooltipContent><p>{farmerNames.join(', ')}</p></TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : ( farmerNames[0] )}
                                        </td>
                                        <td className="p-3">
                                            <DeliveryInfo info={o.delivery_info} />
                                        </td>
                                        <td className="p-3">GHS {Number(o.total_amount).toLocaleString()}</td>
                                        <td className="p-3">
                                            <Select onValueChange={(newStatus) => onStatusUpdate(o.id, newStatus)} value={o.status}>
                                                <SelectTrigger className="w-[180px] h-9 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {orderStatuses.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                                        <td className="p-3 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(o)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
             {orders.length === 0 && <p className="text-center text-muted-foreground py-8">No orders found.</p>}
        </div>
    );
};

export default OrdersTab;
