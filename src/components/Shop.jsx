import React, { useState, useEffect } from 'react'
import { Send, ChevronLeft, ChevronRight } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { supabase } from '../supabase'

function Shop({ walletAddress }) {
  const [shopItems, setShopItems] = useState([])
  const [imageIndices, setImageIndices] = useState({})

  useEffect(() => {
    const fetchShopItems = async () => {
      const { data, error } = await supabase
        .from('shop')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching shop items:', error)
      } else {
        setShopItems(data || [])
        
        // Initialize image indices
        const initialIndices = data.reduce((acc, item) => {
          acc[item.id] = 0
          return acc
        }, {})
        setImageIndices(initialIndices)
      }
    }

    fetchShopItems()
  }, [])

  const handleNextImage = (itemId, totalImages) => {
    setImageIndices(prev => ({
      ...prev,
      [itemId]: (prev[itemId] + 1) % totalImages
    }))
  }

  const handlePrevImage = (itemId, totalImages) => {
    setImageIndices(prev => ({
      ...prev,
      [itemId]: (prev[itemId] - 1 + totalImages) % totalImages
    }))
  }

  return (
    <div className="shop-container">
      <h1 className="text-3xl font-bold mb-8 text-white">Shop</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {shopItems.map(item => (
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
              <h3 className="font-bold text-lg text-white">{item.name}</h3>
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
    </div>
  )
}

export default Shop