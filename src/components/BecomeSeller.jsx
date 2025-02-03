import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { AlertCircle } from 'lucide-react';

function BecomeSeller({ walletAddress }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrls: [],
    telegramLink: '',
    whatsappLink: '',
    category: '' // Added category field
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVerifiedSeller, setIsVerifiedSeller] = useState(false);

  // Define categories
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

  // Check if user is already a verified seller
  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!walletAddress) return;

      const { data, error } = await supabase
        .from('shop')
        .select('verified')
        .eq('seller_wallet_address', walletAddress)
        .single();

      if (data) {
        setIsVerifiedSeller(data.verified);
      }
    };

    checkSellerStatus();
  }, [walletAddress]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'imageUrls') {
      const urls = value.split(',').map(url => url.trim()).filter(url => url);
      setFormData(prev => ({ ...prev, [name]: urls }));
    } else if (name === 'price') {
      const numberValue = value.replace(/[^0-9.]/g, '');
      setFormData(prev => ({ ...prev, [name]: numberValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Valid price is required';
    if (formData.imageUrls.length === 0) return 'At least one image URL is required';
    if (formData.imageUrls.some(url => !url.startsWith('http'))) return 'Invalid image URL format';
    if (!formData.telegramLink && !formData.whatsappLink) return 'At least one contact method is required';
    if (!formData.category) return 'Category selection is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: uploadError } = await supabase
        .from('shop')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            image_urls: formData.imageUrls,
            telegram_link: formData.telegramLink,
            whatsapp_link: formData.whatsappLink,
            seller_wallet_address: walletAddress,
            verified: false,
            category: formData.category // Added category
          }
        ]);

      if (uploadError) throw uploadError;

      alert('Product uploaded successfully! Pending verification.');
      navigate('/shop');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow">
        <div className="flex items-center gap-2 text-red-500 mb-4">
          <AlertCircle size={20} />
          <p>Please connect your wallet to become a seller</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold text-white mb-4">Become a Seller</h2>
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded p-3 mb-4 text-red-500">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-white mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-white mb-1">Price (USD)</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-white mb-1">Image URLs (comma separated)</label>
          <input
            type="text"
            name="imageUrls"
            value={formData.imageUrls.join(',')}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required
          />
          <p className="text-gray-400 text-sm mt-1">Enter full URLs starting with http:// or https://</p>
        </div>

        <div>
          <label className="block text-white mb-1">Telegram Link</label>
          <input
            type="text"
            name="telegramLink"
            value={formData.telegramLink}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-white mb-1">WhatsApp Link</label>
          <input
            type="text"
            name="whatsappLink"
            value={formData.whatsappLink}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className={`gaming-button w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Uploading...' : 'Submit for Verification'}
        </button>
      </form>
    </div>
  );
}

export default BecomeSeller;