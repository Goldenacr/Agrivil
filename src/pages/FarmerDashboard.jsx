import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productUnit, setProductUnit] = useState('');
  const [productImageFile, setProductImageFile] = useState(null);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', user.id);
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching products', description: error.message });
    } else {
      setProducts(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleModalOpen = (product) => {
    if (product) {
      setCurrentProduct(product);
      setProductName(product.name);
      setProductDesc(product.description);
      setProductPrice(product.price);
      setProductStock(product.stock);
      setProductUnit(product.unit);
    } else {
      setCurrentProduct(null);
      setProductName('');
      setProductDesc('');
      setProductPrice('');
      setProductStock('');
      setProductUnit('');
    }
    setProductImageFile(null);
    setIsModalOpen(true);
  };
  
  const handleSubmit = async () => {
    if (!user) return;
    let imageUrl = currentProduct?.image_url;

    if (productImageFile) {
        const fileExt = productImageFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('product_images')
            .upload(filePath, productImageFile);

        if (uploadError) {
            toast({ variant: 'destructive', title: 'Image upload failed', description: uploadError.message });
            return;
        }

        const { data: urlData } = supabase.storage.from('product_images').getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
    }
    
    const productData = {
        name: productName,
        description: productDesc,
        price: productPrice,
        stock: productStock,
        unit: productUnit,
        farmer_id: user.id,
        image_url: imageUrl,
    };

    const { error } = currentProduct
      ? await supabase.from('products').update(productData).eq('id', currentProduct.id)
      : await supabase.from('products').insert(productData);

    if (error) {
      toast({ variant: 'destructive', title: 'Failed to save product', description: error.message });
    } else {
      toast({ title: 'Product saved successfully!' });
      setIsModalOpen(false);
      fetchProducts();
    }
  };

  const deleteProduct = async (productId) => {
     if (!window.confirm('Are you sure you want to delete this product?')) return;
     const { error } = await supabase.from('products').delete().eq('id', productId);
     if (error) {
        toast({ variant: 'destructive', title: 'Failed to delete product', description: error.message });
     } else {
        toast({ title: 'Product deleted successfully' });
        fetchProducts();
     }
  };
  
  if (loading) return <div className="text-center py-10">Loading Your Dashboard...</div>;

  return (
    <>
      <Helmet>
        <title>Farmer Dashboard - Agrivil</title>
        <meta name="description" content="Manage your products and view sales." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Your Products</h1>
            <Button onClick={() => handleModalOpen(null)}>Add New Product</Button>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length > 0 ? products.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">UGX {product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock} {product.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleModalOpen(product)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteProduct(product.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-gray-500">You haven't added any products yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
      
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              <Input placeholder="Product Name (e.g., Fresh Tomatoes)" value={productName} onChange={e => setProductName(e.target.value)} />
              <Input placeholder="Description" value={productDesc} onChange={e => setProductDesc(e.target.value)} />
              <Input placeholder="Price (UGX)" type="number" value={productPrice} onChange={e => setProductPrice(e.target.value)} />
              <Input placeholder="Stock" type="number" value={productStock} onChange={e => setProductStock(e.target.value)} />
              <Input placeholder="Unit (e.g., kg, bunch, item)" value={productUnit} onChange={e => setProductUnit(e.target.value)} />
               <label className="flex items-center space-x-2 cursor-pointer text-sm">
                    <Upload className="w-5 h-5" />
                    <span>{productImageFile ? productImageFile.name : 'Upload Image'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setProductImageFile(e.target.files[0])} />
                </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FarmerDashboard;