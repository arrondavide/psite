import React, { useState } from 'react';
import { supabase } from '../supabase';

function BecomeSeller({ walletAddress }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [telegramLink, setTelegramLink] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const { data, error } = await supabase
      .from('shop')
      .insert([
        {
          name,
          description,
          price: parseFloat(price),
          image_urls: imageUrls,
          telegram_link: telegramLink,
          whatsapp_link: whatsappLink,
          seller_wallet_address: walletAddress,
        },
      ]);

    if (error) {
      alert('Error uploading product:', error);
    } else {
      alert('Product uploaded successfully!');
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setImageUrls([]);
      setTelegramLink('');
      setWhatsappLink('');
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold text-white mb-4">Become a Seller</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">Price (USD)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">Image URLs (comma separated)</label>
          <input
            type="text"
            value={imageUrls.join(',')}
            onChange={(e) => setImageUrls(e.target.value.split(','))}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </div>
        <div>
          <label className="block text-white">Telegram Link</label>
          <input
            type="text"
            value={telegramLink}
            onChange={(e) => setTelegramLink(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <div>
          <label className="block text-white">WhatsApp Link</label>
          <input
            type="text"
            value={whatsappLink}
            onChange={(e) => setWhatsappLink(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>
        <button
          type="submit"
          className="gaming-button w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Uploading...' : 'Upload Product'}
        </button>
      </form>
    </div>
  );
}

export default BecomeSeller;