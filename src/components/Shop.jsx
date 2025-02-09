import React, { useState, useEffect } from 'react';
import { Send, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { supabase } from '../supabase';

function Shop({ walletAddress }) {
  const [shopItems, setShopItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [imageIndices, setImageIndices] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Predefined categories
  const categories = [
    'Pokémon Cards and Trading Cards',
    'NFTs and Digital Collectibles',
    'Rare Collectibles',
    'Gaming and In-Game Assets',
    'Art and Creative Works',
    'Luxury and High-End Items',
    'Miscellaneous Rare Items',
    'User-Generated Content (UGC)',
    'Bundles and Collections'
  ];

  useEffect(() => {
    const fetchShopItems = async () => {
      const { data, error } = await supabase
        .from('shop')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching shop items:', error);
      } else {
        setShopItems(data || []);
        setFilteredItems(data || []);
        
        const initialIndices = data.reduce((acc, item) => {
          acc[item.id] = 0;
          return acc;
        }, {});
        setImageIndices(initialIndices);
      }
    };

    fetchShopItems();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...shopItems];

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (priceRange.min !== '') {
      filtered = filtered.filter(item => item.price >= Number(priceRange.min));
    }
    if (priceRange.max !== '') {
      filtered = filtered.filter(item => item.price <= Number(priceRange.max));
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [shopItems, searchQuery, selectedCategory, priceRange]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(startIndex, endIndex);

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

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="shop-container">
      <h1 className="text-3xl font-bold mb-8 text-white">Shop</h1>
      
      {/* Filters Section */}
      <div className="mb-8 space-y-4 bg-gray-800 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-gray-700 text-white px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 transform rotate-90 text-gray-400 pointer-events-none" size={20} />
          </div>
          
          {/* Price Range Filters */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-24 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-24 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Reset Filters
          </button>
        </div>

        {/* Category Pills */}
        <div className="overflow-x-auto pb-2">
          <div className="flex space-x-2 min-w-max">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        
        {/* Results Count */}
        <div className="text-gray-300">
          Showing {Math.min(ITEMS_PER_PAGE, filteredItems.length - startIndex)} of {filteredItems.length} items
          {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
        </div>
      </div>

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentItems.map(item => (
          <div key={item.id} className="shop-item-card bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="relative h-64 overflow-hidden">
              {item.image_urls && item.image_urls.length > 0 && (
                <div className="relative w-full h-full">
                  <img 
                    src={item.image_urls[imageIndices[item.id]]} 
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                  
                  {item.image_urls.length > 1 && (
                    <>
                      <button 
                        onClick={() => handlePrevImage(item.id, item.image_urls.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={() => handleNextImage(item.id, item.image_urls.length)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                        {item.image_urls.map((_, index) => (
                          <div 
                            key={index}
                            className={`h-2 w-2 rounded-full ${
                              index === imageIndices[item.id] 
                              ? 'bg-white' 
                              : 'bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-white">{item.name}</h3>
                {item.category && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    {item.category}
                  </span>
                )}
              </div>
              
              <p className="text-gray-300 mt-2 line-clamp-2">{item.description}</p>
              
              <div className="mt-2 text-white">
                <span>Price: ${item.price} USD</span>
              </div>
              
              <div className="mt-4 flex space-x-2">
                {item.telegram_link && (
                  <a 
                    href={item.telegram_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition flex items-center"
                  >
                    <Send size={16} className="mr-2" /> Telegram
                  </a>
                )}
                {item.whatsapp_link && (
                  <a 
                    href={item.whatsapp_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition flex items-center"
                  >
                    <FaWhatsapp size={16} className="mr-2" /> WhatsApp
                  </a>
                )}
              </div>

              <button 
                className="gaming-button mt-4 w-full cursor-not-allowed opacity-50"
                disabled
              >
                Purchase Disabled
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

export default Shop;