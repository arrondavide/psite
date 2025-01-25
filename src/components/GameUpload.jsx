import { useState } from 'react'
import { supabase } from '../supabase'
import { Upload, Link, Twitter, MessageCircle } from 'lucide-react';

export default function GameUpload({ walletAddress }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gameUrl: '',
    thumbnailUrl: '',
    twitterUrl: '',
    discordUrl: '',
    status: 'normal'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('games')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            game_url: formData.gameUrl,
            thumbnail_url: formData.thumbnailUrl,
            twitter_url: formData.twitterUrl || null,
            discord_url: formData.discordUrl || null,
            wallet_address: walletAddress,
            status: formData.status
          }
        ])
        
      if (error) throw error
      setIsSubmitting(false);
      alert('Game uploaded successfully!')
      // Clear form
      setFormData({
        title: '',
        description: '',
        gameUrl: '',
        thumbnailUrl: '',
        twitterUrl: '',
        discordUrl: '',
        status: 'normal'
      });
      setPreviewImage('');
    } catch (error) {
      setIsSubmitting(false);
      console.error('Upload error:', error);
    }
  };

  const handleThumbnailChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, thumbnailUrl: url }));
    setPreviewImage(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Upload Your Game</h1>
        <p className="text-gray-300 text-lg">Share your awesome game with our community</p>
      </div>

      <div className="bg-gray-800 border border-gray-700 p-8 rounded-xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview Section */}
          <div className="mb-8">
            <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden border-2 border-dashed border-gray-600 flex items-center justify-center">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Game preview"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewImage('')}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <Upload size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Preview will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Game Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Game URL</label>
              <div className="relative">
                <Link size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="url"
                  name="gameUrl"
                  value={formData.gameUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, gameUrl: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Thumbnail URL</label>
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleThumbnailChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Twitter URL (optional)</label>
              <div className="relative">
                <Twitter size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="url"
                  name="twitterUrl"
                  value={formData.twitterUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitterUrl: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Discord URL (optional)</label>
              <div className="relative">
                <MessageCircle size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="url"
                  name="discordUrl"
                  value={formData.discordUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, discordUrl: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <>
                <Upload size={20} />
                <span>Upload Game</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}