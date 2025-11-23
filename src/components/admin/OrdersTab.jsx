import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

const orderStatuses = [
    'Order Placed',
    'Rider Dispatched to Farm',
    'Products Picked Up',
    'Out for Delivery',
    'Delivered',
    'Cancelled'
];

const OrdersTab = ({ orders, onStatusUpdate, onDelete }) => {
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
                                <th className="p-3 text-left font-medium text-muted-foreground">Total</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                                <th className="p-3 text-left font-medium text-muted-foreground">Date</th>
                                <th className="p-3 text-right font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((o, index) => (
                                <motion.tr
                                    key={o.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white hover:bg-gray-50/50"
                                >
                                    <td className="p-3 font-mono text-xs">{o.id.substring(0, 8)}...</td>
                                    <td className="p-3">{o.customer_name}</td>
                                    <td className="p-3">GHS {Number(o.total_amount).toLocaleString()}</td>
                                    <td className="p-3">
                                        <Select onValueChange={(newStatus) => onStatusUpdate(o.id, newStatus)} defaultValue={o.status}>
                                            <SelectTrigger className="w-[180px] h-9 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {orderStatuses.map(status => (
                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                ))}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             {orders.length === 0 && <p className="text-center text-muted-foreground py-8">No orders found.</p>}
        </div>
    );
};

export default OrdersTab;