
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/lib/customSupabaseClient';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          farmer:profiles ( full_name )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch product details.'});
      } else {
        setProduct(data);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, toast]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <p className="text-2xl text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{product.name} - Golden Acres Marketplace</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="bg-transparent py-12">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-lg border overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4"
                >
                    <img 
                    className="w-full h-[500px] object-cover rounded-lg shadow-xl" 
                    alt={product.name}
                    src={product.image_url || "https://placehold.co/600x400/E2E8F0/A0AEC0?text=No+Image"} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col justify-center p-8"
                >
                    <span className="text-sm text-primary font-semibold mb-2">{product.category || 'Produce'}</span>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-6">{product.description}</p>
                    
                    <div className="mb-6">
                    <span className="text-4xl font-bold text-primary">
                        GHS {Number(product.price).toLocaleString()}
                    </span>
                    <span className="text-xl text-gray-500 ml-2">per {product.unit}</span>
                    </div>

                    <div className="mb-6">
                    <p className="text-gray-700 mb-2">Farmer: <span className="font-semibold">{product.farmer?.full_name || 'Golden Acres'}</span></p>
                    <p className="text-gray-700">Stock: <span className="font-semibold">{product.stock} {product.unit}s available</span></p>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                    <span className="text-gray-700 font-semibold">Quantity:</span>
                    <div className="flex items-center border rounded-lg bg-white">
                        <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 hover:bg-gray-100 transition"
                        disabled={quantity <= 1}
                        >
                        <Minus className="w-5 h-5" />
                        </button>
                        <span className="px-6 py-2 font-semibold">{quantity}</span>
                        <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="p-2 hover:bg-gray-100 transition"
                        disabled={quantity >= product.stock}
                        >
                        <Plus className="w-5 h-5" />
                        </button>
                    </div>
                    </div>

                    <Button
                    size="lg"
                    onClick={handleAddToCart}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground w-full md:w-auto"
                    disabled={product.stock === 0}
                    >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                </motion.div>
                </div>
            </div>
        </section>
      </div>
    </>
  );
};

export default ProductDetailPage;
