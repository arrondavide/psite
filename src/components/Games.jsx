import React, { useState, useEffect } from 'react';
import { Search, ExternalLink } from "lucide-react";
import GameGrid from "./GameGrid";
import { supabase } from "../supabase";

function Games() {
  return (
    <div className="h-full flex flex-col">
      <SearchBar />
      <TrendingGames />
      <AllGames />
    </div>
  );
}

// Search Bar Component
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="search-container">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search games..."
          className="search-input"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>
    </div>
  );
}

// Trending Games Component
function TrendingGames() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      const { data } = await supabase
        .from("games")
        .select("*")
        .eq("status", "trending")
        .limit(3)
        .order("created_at", { ascending: false });

      if (data) setTrending(data);
    };

    fetchTrending();
  }, []);

  const handleImageError = (e) => {
    e.target.src = "/api/placeholder/400/320";
  };

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6 text-white">Trending Games</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trending.map((game) => (
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
  );
}

// All Games Component
function AllGames() {
  return (
    <section className="mt-12 flex-1">
      <h2 className="text-2xl font-bold mb-6 text-white">All Games</h2>
      <GameGrid />
    </section>
  );
}

export default Games;