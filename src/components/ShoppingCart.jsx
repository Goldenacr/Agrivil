import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { X, Trash2 } from 'lucide-react';

const ShoppingCart = () => {
    const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, handleWhatsAppCheckout } = useCart();
    
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <AnimatePresence>
            {isCartOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    onClick={() => setIsCartOpen(false)}
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-card/90 shadow-2xl flex flex-col border-l"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="p-4 flex justify-between items-center border-b">
                            <h2 className="text-2xl font-bold">Your Cart</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)}>
                                <X className="h-6 w-6" />
                            </Button>
                        </header>
                        
                        <div className="flex-grow overflow-y-auto p-4">
                            {cartItems.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <li key={item.id} className="py-4 flex items-start space-x-4">
                                            <img
                                                src={item.image_url || 'https://placehold.co/100x100'}
                                                alt={item.name}
                                                className="w-20 h-20 object-cover rounded-md"
                                            />
                                            <div className="flex-grow">
                                                <h3 className="font-semibold">{item.name}</h3>
                                                <p className="text-sm text-gray-500">GHS {Number(item.price).toLocaleString()}</p>
                                                <div className="flex items-center mt-2">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                        className="w-16 p-1 border rounded-md text-center bg-transparent"
                                                        min="1"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                               <p className="font-bold">GHS {(item.price * item.quantity).toLocaleString()}</p>
                                               <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                                                    <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-20">
                                    <p className="text-xl text-gray-500">Your cart is empty.</p>
                                </div>
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <footer className="p-4 border-t bg-muted/50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-semibold">Subtotal</span>
                                    <span className="text-xl font-bold">GHS {subtotal.toLocaleString()}</span>
                                </div>
                                <Button className="w-full bg-green-600 hover:bg-green-700 py-6 text-lg" onClick={handleWhatsAppCheckout}>
                                    Order on WhatsApp
                                </Button>
                            </footer>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShoppingCart;