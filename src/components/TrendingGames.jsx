import { useState, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'

function TrendingGames() {
  const [trending, setTrending] = useState([])
  
  useEffect(() => {
    const fetchTrending = async () => {
        const { data } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'trending')
        .limit(3)
        .order('created_at', { ascending: false })
      
      if (data) setTrending(data)
    }

    fetchTrending()
  }, [])

  const handleImageError = (e) => {
    e.target.src = '/api/placeholder/400/320' // Fallback placeholder image
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-white">Trending Games</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trending.map(game => (
          <div key={game.id} className="game-card">
            <div className="relative h-48">
              <img 
                src={game.thumbnail_url} 
                alt={game.title}
                onError={handleImageError}
                className="w-full h-full object-cover rounded-t-2xl"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-white">{game.title}</h3>
              <p className="text-gray-300 mt-2 line-clamp-2">{game.description}</p>
              <a 
                href={game.game_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="gaming-button mt-4 inline-flex items-center gap-2"
              >
                Play Game
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
export default TrendingGames