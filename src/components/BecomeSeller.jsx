import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { AlertCircle, Upload, X, Image as ImageIcon } from 'lucide-react';

// Utility function to compress image
const compressImage = async (file, maxWidth = 800, maxHeight = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
}

function BecomeSeller({ walletAddress }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    telegramLink: '',
    whatsappLink: '',
  });
  const [images, setImages] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVerifiedSeller, setIsVerifiedSeller] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Categories remain the same...
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      const numberValue = value.replace(/[^0-9.]/g, '');
      setFormData(prev => ({ ...prev, [name]: numberValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const newImages = [];
    const newPreviews = [];

    for (const file of files) {
      // Check file size and type
      if (!file.type.startsWith('image/')) {
        setError('Please upload only image files');
        continue;
      }

      try {
        // Compress image
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, {
          type: 'image/jpeg',
        });

        // Create preview URL
        const previewUrl = URL.createObjectURL(compressedFile);
        
        newImages.push(compressedFile);
        newPreviews.push(previewUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Error processing image');
      }
    }

    setImages(prev => [...prev, ...newImages]);
    setImagesPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => {
      // Revoke the URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    const totalImages = images.length;
    
    for (let i = 0; i < totalImages; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${walletAddress}/${fileName}`;

      try {
        const { data, error } = await supabase.storage
          .from('shop-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('shop-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
        setUploadProgress(((i + 1) / totalImages) * 100);
      } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
      }
    }

    return uploadedUrls;
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) return 'Valid price is required';
    if (images.length === 0) return 'At least one image is required';
    if (!formData.telegramLink && !formData.whatsappLink) return 'At least one contact method is required';
    if (!formData.category) return 'Category selection is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUploadProgress(0);

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
      // Upload images first
      const imageUrls = await uploadImages();

      // Create product listing
      const { data, error: uploadError } = await supabase
        .from('shop')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            image_urls: imageUrls,
            telegram_link: formData.telegramLink,
            whatsapp_link: formData.whatsappLink,
            seller_wallet_address: walletAddress,
            verified: false,
            category: formData.category
          }
        ]);

      if (uploadError) throw uploadError;

      alert('Product uploaded successfully! Pending verification.');
      navigate('/shop');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
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
        <div>
          <label className="block text-white mb-1">Product Images</label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-4">
            <div className="flex flex-wrap gap-4 mb-4">
              {imagesPreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
            
            {images.length < 5 && (
              <div className="flex items-center justify-center">
                <label className="cursor-pointer flex flex-col items-center space-y-2">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <Upload className="text-gray-400" />
                  </div>
                  <span className="text-sm text-gray-400">
                    Click to upload images (max 5)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Images will be automatically compressed. Maximum 5 images allowed.
          </p>
        </div>

        {uploadProgress > 0 && (
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div
              className="bg-blue-500 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}

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