import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '../supabase';
import { useOutletContext } from 'react-router-dom';

export default function GameGrid() {
  const { walletAddress } = useOutletContext();
  const [games, setGames] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userVotes, setUserVotes] = useState({});
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchGames();
    if (walletAddress) {
      fetchUserVotes();
    }
  }, [walletAddress]);

  const fetchGames = async () => {
    try {
      console.log('Fetching games...');
      const { data, error } = await supabase
        .from('game_stats')
        .select(`
          *,
          game:game_id (
            id,
            created_at
          )
        `)
        .order('created_at', { foreignTable: 'game', ascending: false });
        
      if (error) throw error;
      console.log('Fetched games:', data);
      setGames(data);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('game_votes')
        .select('*')
        .eq('wallet_address', walletAddress);
        
      if (error) throw error;
      
      // Convert to object for easier lookup
      const votes = {};
      data.forEach(vote => {
        votes[vote.game_id] = vote.vote_type;
      });
      setUserVotes(votes);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const handleVote = async (gameId, voteType) => {
    if (!walletAddress) {
      alert('Please connect your wallet to vote');
      return;
    }
  
    try {
      // First, try to insert/update the vote
      const { data: voteData, error: voteError } = await supabase
        .rpc('handle_game_vote', {
          p_game_id: gameId,
          p_wallet_address: walletAddress,
          p_vote_type: voteType,
          p_previous_vote: userVotes[gameId] || null
        });
  
      if (voteError) throw voteError;
  
      // Update local state
      setUserVotes(prev => ({
        ...prev,
        [gameId]: voteType
      }));
  
      // Fetch updated game data
      const { data: updatedGame, error: gameError } = await supabase
        .from('game_stats')
        .select('upvotes, downvotes')
        .eq('game_id', gameId)
        .single();
  
      if (gameError) throw gameError;
  
      // Update the games state with new vote counts
      setGames(prevGames => 
        prevGames.map(game => 
          game.game_id === gameId 
            ? { ...game, upvotes: updatedGame.upvotes, downvotes: updatedGame.downvotes }
            : game
        )
      );
  
      console.log('Vote successful:', voteData);
    } catch (error) {
      console.error('Error handling vote:', error);
      alert('Error processing vote. Please try again.');
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
          <div key={game.game_id} className="game-card bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={game.thumbnail_url}
              alt={game.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-xl mb-2 text-white">{game.name}</h3>
              <p className="text-gray-300">{game.description}</p>
              
              {/* Voting Section */}
              <div className="flex items-center gap-4 mt-4 mb-4">
                <button
                  onClick={() => handleVote(game.game_id, 'upvote')}
                  disabled={!walletAddress}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    userVotes[game.game_id] === 'upvote'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <ThumbsUp size={16} />
                  <span>{game.upvotes || 0}</span>
                </button>
                
                <button
                  onClick={() => handleVote(game.game_id, 'downvote')}
                  disabled={!walletAddress}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    userVotes[game.game_id] === 'downvote'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  <ThumbsDown size={16} />
                  <span>{game.downvotes || 0}</span>
                </button>
              </div>

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
                {game.telegram_url && (
                  <a 
                    href={game.telegram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link inline-block"
                  >
                    Telegram
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