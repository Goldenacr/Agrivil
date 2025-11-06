import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";

const ProductsList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { toast } = useToast();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select(`*, farmer:farmer_id (full_name)`)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching products:', error);
                toast({
                    variant: "destructive",
                    title: "Failed to fetch products",
                    description: error.message,
                });
            } else {
                setProducts(data);
            }
            setLoading(false);
        };
        fetchProducts();
    }, [toast]);

    const handleAddToCart = (product) => {
        addToCart(product);
        toast({
            title: "Added to Cart!",
            description: `${product.name} has been added to your cart.`,
        });
    };
    
    if (loading) {
        return <div className="text-center py-10">Loading fresh produce...</div>;
    }
    
    if (products.length === 0) {
        return <div className="text-center py-10">No products available at the moment. Check back soon!</div>
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
                <motion.div
                    key={product.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col"
                    whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}
                >
                    <Link to={`/marketplace/${product.id}`} className="block">
                        <div className="h-48 bg-gray-200 flex items-center justify-center">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-500">No Image</span>
                            )}
                        </div>
                    </Link>
                    <div className="p-4 flex-grow flex flex-col">
                        <Link to={`/marketplace/${product.id}`}>
                            <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                        </Link>
                        <p className="text-sm text-gray-500 mb-2">by {product.farmer?.full_name || 'Farmer'}</p>
                        <p className="text-xl font-bold text-green-600 mt-auto">${product.price}</p>
                    </div>
                    <div className="p-4 border-t">
                        <Button
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                            onClick={() => handleAddToCart(product)}
                        >
                            Add to Cart
                        </Button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default ProductsList;