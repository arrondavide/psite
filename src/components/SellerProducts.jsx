import React, { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '../supabase';

const SellerProducts = ({ walletAddress }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageIndices, setImageIndices] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!walletAddress) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm text-blue-500 hover:text-blue-600 mt-4"
      >
        Manage Products
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto relative">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Your Products</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
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
                          <button
                            onClick={() => setDeleteConfirm(product)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
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
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerProducts;