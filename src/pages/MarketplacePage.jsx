
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FancyLoader = () => (
  <div className="fixed inset-0 bg-card/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="fancy-loader"></div>
  </div>
);


const ProductCard = ({ product, index }) => {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    
    return (
        <motion.div 
            className="bg-card/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col border"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
        >
            <Link to={`/marketplace/${product.id}`} className="block">
                <div className="relative overflow-hidden">
                    <img 
                        src={product.image_url || "https://placehold.co/400x300/E2E8F0/A0AEC0?text=No+Image"} 
                        alt={product.name} 
                        className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                     <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">by {product.farmer?.full_name || 'Golden Acres'}</p>
                    <p className="text-2xl font-bold text-primary">
                        GHS {Number(product.price).toLocaleString()}
                        <span className="text-sm font-normal text-gray-500"> / {product.unit}</span>
                    </p>
                </div>
            </Link>
             <div className="px-4 pb-4 mt-auto">
                <div className="flex items-center gap-2 mb-3">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Input 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                        className="w-16 h-9 text-center"
                        min="1"
                    />
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setQuantity(quantity + 1)}>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <Button 
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
                    onClick={() => addToCart(product, quantity)}
                    disabled={product.stock === 0}
                >
                    <ShoppingCart className="mr-2 h-4 w-4" /> 
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            </div>
        </motion.div>
    );
};

const MarketplacePage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select(`*, farmer:profiles(full_name, phone_number)`);
            
            if (error) {
                console.error('Error fetching products', error);
            } else {
                setProducts(data);
            }
            setLoading(false);
        };
        fetchProducts();
    }, []);

    return (
        <>
            <Helmet>
                <title>Marketplace - Golden Acres</title>
                <meta name="description" content="Browse fresh farm produce from local farmers. Quality products at fair prices." />
            </Helmet>
            <section className="bg-primary/10 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.h1
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-4xl font-bold mb-4 text-gray-800">Marketplace</motion.h1>
                    <motion.p 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{delay: 0.2}}
                     className="text-xl text-gray-600">Fresh produce directly from our verified farmers</motion.p>
                </div>
            </section>

            <section className="py-12 bg-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {loading ? (
                         <FancyLoader />
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.map((product, index) => <ProductCard key={product.id} product={product} index={index}/>)}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-card/80 backdrop-blur-sm rounded-xl border">
                            <h2 className="text-2xl font-semibold text-gray-700">No Products Yet</h2>
                            <p className="text-gray-500 mt-2">Check back later for fresh produce!</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
};

export default MarketplacePage;
