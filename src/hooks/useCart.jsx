
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { toast } = useToast();
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const localCart = localStorage.getItem('golden_acres_cart');
        if (localCart) {
            try {
              const parsedCart = JSON.parse(localCart);
              if (Array.isArray(parsedCart)) {
                setCartItems(parsedCart);
              }
            } catch (error) {
              console.error("Failed to parse cart from localStorage", error);
              setCartItems([]);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('golden_acres_cart', JSON.stringify(cartItems));
    }, [cartItems]);
    
    const addToCart = (product, quantity = 1) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: "Please Login First",
                description: "You need to be logged in to add items to your cart.",
            });
            navigate('/login');
            return;
        }

        if (quantity <= 0) {
            toast({
                variant: 'destructive',
                title: "Invalid Quantity",
                description: "Please add at least one item.",
            });
            return;
        }

        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prevItems, { ...product, quantity }];
        });
        toast({
            title: "Added to Cart! 🛒",
            description: `${quantity} x ${product.name} has been added.`,
        });
    };

    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item => (item.id === productId ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const handleWhatsAppCheckout = async () => {
        if (cartItems.length === 0) {
            toast({ title: "Your cart is empty!", description: "Add some products before checking out." });
            return;
        }

        if (!user || !profile) {
            toast({ variant: 'destructive', title: "Not Logged In", description: "You must be logged in to place an order." });
            navigate('/login');
            return;
        }

        const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: subtotal,
                customer_name: profile.full_name,
                customer_phone: profile.phone_number,
                status: 'Order Placed'
            })
            .select()
            .single();

        if (orderError) {
            toast({ variant: 'destructive', title: "Order Failed", description: orderError.message });
            return;
        }
        
        const orderItemsToInsert = cartItems.map(item => ({
            order_id: orderData.id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            product_name: item.name,
            farmer_name: item.farmer?.full_name || 'Golden Acres Farm'
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);

        if (itemsError) {
            await supabase.from('orders').delete().eq('id', orderData.id);
            toast({ variant: 'destructive', title: "Order Failed", description: `Could not save order items: ${itemsError.message}` });
            return;
        }


        const phoneNumber = "+233533811757";
        let message = `*New Order from Golden Acres!* ✨\n\n*Order ID:* ${orderData.id.substring(0,8)}\n*Customer:* ${profile.full_name}\n*Phone:* ${profile.phone_number}\n\nI'd like to place an order for the following items:\n\n`;

        cartItems.forEach(item => {
            message += `*${item.name}*\n`;
            message += `_From Farmer_: ${item.farmer?.full_name || 'Golden Acres Farm'}\n`;
            message += `_Quantity_: ${item.quantity} ${item.unit || 'item'}(s)\n`;
            message += `_Subtotal_: GHS ${(item.price * item.quantity).toLocaleString()}\n\n`;
        });
        
        message += `-------------------\n`;
        message += `*Total Amount: GHS ${subtotal.toLocaleString()}*\n\n`;
        message += `Thank you!`;
        
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        toast({
            title: "Order Placed Successfully!",
            description: "Your order has been saved and you are being redirected to WhatsApp.",
        });

        clearCart();
        setIsCartOpen(false);
        navigate('/customer-dashboard');
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        handleWhatsAppCheckout,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
