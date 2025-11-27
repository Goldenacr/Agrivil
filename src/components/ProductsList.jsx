import React, { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ShoppingCart, Star } from 'lucide-react';

// Individual Product Card Component in Vertical Layout
const ProductCard = memo(({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock <= 0) return;
        addToCart(product, 1);
    };

    const price = Number(product.price).toFixed(2);
    const isOutOfStock = product.stock <= 0;

    return (
        <motion.div
            layout
            className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
        >
            <Link to={`/marketplace/${product.id}`} className="flex flex-col flex-grow">
                {/* Image Section - Top */}
                <div className="relative w-full h-48 sm:h-56 bg-gray-100 overflow-hidden">
                    <motion.img
                        src={product.image_url || 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400'}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                     {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                             <span className="text-white font-bold text-xs tracking-wider uppercase border border-white px-3 py-1.5 rounded-full">Sold Out</span>
                        </div>
                    )}
                </div>

                {/* Content Section - Bottom */}
                <div className="p-4 flex flex-col flex-grow justify-between">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between items-start">
                             <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                {product.name}
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">{product.category || 'Fresh Produce'}</p>
                    </div>

                    <div className="space-y-3 mt-auto">
                         <div className="flex items-center justify-between">
                            <div className="text-lg font-extrabold text-primary">
                                GHS {price}
                                <span className="text-xs font-normal text-gray-400 ml-1">/ {product.unit}</span>
                            </div>
                         </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-1">
                                 {product.average_rating > 0 ? (
                                     <>
                                        <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                                        <span className="text-xs font-bold text-gray-700">{Number(product.average_rating).toFixed(1)}</span>
                                        <span className="text-[10px] text-gray-400">({product.total_reviews || 0})</span>
                                     </>
                                 ) : (
                                    <span className="text-[10px] text-gray-400">No ratings yet</span>
                                 )}
                            </div>
                            
                            <Button
                                size="icon"
                                className={`h-8 w-8 rounded-full shadow-sm transition-colors ${isOutOfStock ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white hover:bg-primary'}`}
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                            >
                                <ShoppingCart className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
});

const ProductsList = memo(() => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { id: routeId } = useParams();
    const location = useLocation();

    // Determine if we are on a specific farmer's page
    const isFarmerPage = location.pathname.startsWith('/farmer/');
    const farmerId = isFarmerPage ? routeId : null;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            
            let query = supabase.rpc('get_products_with_stats');
            
            // Apply filter if on a farmer page
            if (farmerId) {
                query = query.eq('farmer_id', farmerId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching products:', error);
                toast({
                    variant: "destructive",
                    title: "Failed to fetch products",
                    description: error.message,
                });
                // Fallback to simple fetch if RPC fails
                let fallbackQuery = supabase
                    .from('products')
                    .select(`*, farmer:farmer_id (full_name)`)
                    .order('created_at', { ascending: false });
                
                if (farmerId) {
                    fallbackQuery = fallbackQuery.eq('farmer_id', farmerId);
                }
                
                const { data: fallbackData } = await fallbackQuery;
                setProducts(fallbackData || []);
            } else {
                setProducts(data);
            }
            setLoading(false);
        };
        fetchProducts();
    }, [toast, farmerId]);

    if (loading) {
        return (
            <div className="text-center py-20 flex justify-center items-center flex-col min-h-[300px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <span className="text-gray-500 font-medium">Loading fresh produce...</span>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
             <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-xl text-gray-500 font-medium">No products available.</p>
                <p className="text-gray-400 mt-2">Check back later for fresh harvest!</p>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    return (
        <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </motion.div>
    );
});

export default ProductsList;