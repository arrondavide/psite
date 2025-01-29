import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../supabase';

export default function GameGrid() {
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      console.log('Fetching games...');
      const { data, error } = await supabase
        .from('games')
        .select('*');
        
      if (error) throw error;
      console.log('Fetched games:', data);
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentGames = games.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Results Count */}
      <div className="text-gray-300">
        Showing {Math.min(ITEMS_PER_PAGE, games.length - startIndex)} of {games.length} games
        {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentGames.map(game => (
          <div key={game.id} className="game-card bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={game.thumbnail_url}
              alt={game.title}
              className="w-full h-48 object-cover"
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