import React, { useState, useEffect } from 'react';
import { Trash2, ChevronLeft, ChevronRight, X, Package, LayoutGrid, List } from 'lucide-react';
import { supabase } from '../supabase';

const SellerProducts = ({ walletAddress }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageIndices, setImageIndices] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const getCategories = () => {
    const categories = ['all', ...new Set(products.map(p => p.category))];
    return categories;
  };

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const handleNextImage = (itemId, totalImages, e) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [itemId]: (prev[itemId] + 1) % totalImages
    }));
  };

  const handlePrevImage = (itemId, totalImages, e) => {
    e.stopPropagation();
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

  const ManageProductsButton = () => (
    <button
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
    >
      <Package size={18} />
      <span>Manage Products</span>
    </button>
  );

  return (
    <>
      <ManageProductsButton />

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Your Products
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                  >
                    <List size={18} />
                  </button>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Categories */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {getCategories().map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                      ${selectedCategory === category 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                </div>
              ) : error ? (
                <div className="text-red-500 p-8 text-center bg-red-50 rounded-lg">
                  {error}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No products found in this category.</p>
                </div>
              ) : (
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-4'}`}
                >
                  {filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      className={`
                        ${viewMode === 'grid'
                          ? 'bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border'
                          : 'flex gap-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 border'
                        }`}
                    >
                      <div className={`
                        relative 
                        ${viewMode === 'grid' ? 'h-48' : 'h-32 w-32'} 
                        bg-gray-50`}
                      >
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
                                  onClick={(e) => handlePrevImage(product.id, product.image_urls.length, e)}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <button
                                  onClick={(e) => handleNextImage(product.id, product.image_urls.length, e)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>

                      <div className={`
                        ${viewMode === 'grid' ? 'p-4' : 'flex-1'}
                      `}>
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full mt-1">
                              {product.category}
                            </span>
                          </div>
                          <button
                            onClick={() => setDeleteConfirm(product)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                        <p className="text-lg font-semibold text-blue-600 mt-2">
                          ${product.price} USD
                        </p>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-semibold mb-2">Delete Product</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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