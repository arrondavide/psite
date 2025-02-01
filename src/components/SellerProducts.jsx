import React, { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SellerProducts = ({ walletAddress }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageIndices, setImageIndices] = useState({});

  useEffect(() => {
    if (walletAddress) {
      fetchSellerProducts();
    }
  }, [walletAddress]);

  const fetchSellerProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shop')
        .select('*')
        .eq('seller_wallet_address', walletAddress)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data);
      const initialIndices = data.reduce((acc, item) => {
        acc[item.id] = 0;
        return acc;
      }, {});
      setImageIndices(initialIndices);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextImage = (itemId, totalImages) => {
    setImageIndices(prev => ({
      ...prev,
      [itemId]: (prev[itemId] + 1) % totalImages
    }));
  };

  const handlePrevImage = (itemId, totalImages) => {
    setImageIndices(prev => ({
      ...prev,
      [itemId]: (prev[itemId] - 1 + totalImages) % totalImages
    }));
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from('shop')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(product => product.id !== productId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!walletAddress) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-sm text-blue-500 hover:text-blue-600">
          Manage Products
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold mb-4">Your Products</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            You haven't uploaded any products yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(product => (
              <div key={product.id} className="bg-gray-100 rounded-lg p-4">
                <div className="relative h-48 mb-4 bg-white rounded-lg overflow-hidden">
                  {product.image_urls?.length > 0 && (
                    <>
                      <img
                        src={product.image_urls[imageIndices[product.id]]}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                      {product.image_urls.length > 1 && (
                        <>
                          <button
                            onClick={() => handlePrevImage(product.id, product.image_urls.length)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            onClick={() => handleNextImage(product.id, product.image_urls.length)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{product.name}</h3>
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <button className="text-red-500 hover:text-red-600 p-1">
                          <Trash2 size={16} />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <p className="text-sm text-gray-600">{product.description}</p>
                  <p className="text-sm font-medium">${product.price} USD</p>
                  <div className="text-xs text-gray-500">
                    Category: {product.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SellerProducts;