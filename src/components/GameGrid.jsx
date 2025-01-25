import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function GameGrid() {
  const [games, setGames] = useState([])

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      console.log('Fetching games...')
      const { data, error } = await supabase
        .from('games')
        .select('*')
        
      if (error) throw error
      console.log('Fetched games:', data)
      setGames(data)
    } catch (error) {
      console.error('Error fetching games:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {games.map(game => (
        <div key={game.id} className="game-card">
          <img 
            src={game.thumbnail_url}
            alt={game.title}
            className="w-full h-48 object-cover rounded-t-2xl"
          />
          <div className="p-4">
            <h3 className="font-bold text-xl mb-2 text-white">{game.title}</h3>
            <p className="text-gray-300">{game.description}</p>
            <div className="mt-4 space-x-2">
              <a 
                href={game.game_url}
                target="_blank"
                rel="noopener noreferrer"
                className="gaming-button"
              >
                Play Game
              </a>
              {game.twitter_url && (
                <a 
                  href={game.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link inline-block"
                >
                  Twitter
                </a>
              )}
              {game.discord_url && (
                <a 
                  href={game.discord_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link inline-block"
                >
                  Discord
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}