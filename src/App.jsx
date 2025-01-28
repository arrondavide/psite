import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Menu, X, Search, ExternalLink } from 'lucide-react'
import WalletConnect from './components/WalletConnect'
import GameUpload from './components/GameUpload'
import GameGrid from './components/GameGrid'
import { supabase } from './supabase'
import Shop from './components/Shop'
import Logo from './assets/logo.png' // Import the SVG logo
import LoadingSpinner from './components/LoadingSpinner';
// Upload Page Component
function UploadPage({ walletAddress }) {
  if (!walletAddress) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold text-red-600 mb-4">Wallet Not Connected</h2>
        <p>Please connect your wallet to upload games.</p>
      </div>
    );
  }

  return (
    // <div className="max-w-2xl mx-auto mt-8">
    //   <h1 className="text-3xl font-bold mb-6">Upload Your Game</h1>
    //   <div className="bg-white rounded-lg shadow p-6">
        <GameUpload walletAddress={walletAddress} />
    //   </div>
    // </div>
  );
}

// Navigation Component
function Navigation({ walletAddress, isMobile, closeMobileMenu }) {
  const navLinks = [
    { to: "/shop", label: "Shop" },
    { to: "/how-it-works", label: "How it Works" },
    ...(walletAddress ? [{ to: "/upload", label: "Upload Game" }] : []),
    { href: "https://your-support-url.com", label: "Support", external: true }
  ]

  return (
    <nav className={`
      ${isMobile 
        ? 'fixed inset-0 z-50 bg-gray-900 flex flex-col p-6 space-y-4' 
        : 'flex items-center space-x-6'
      }
    `}>
      {isMobile && (
        <div className="flex justify-between items-center mb-6">
          <Link to="/" onClick={closeMobileMenu} className="h-8 w-auto">
            <img src={Logo} alt="Game Portal Logo" className="h-8 w-auto" />
          </Link>
          <button onClick={closeMobileMenu} className="text-white">
            <X size={24} />
          </button>
        </div>
      )}
      {navLinks.map((link, index) => (
        link.external ? (
          <a 
            key={index}
            href={link.href}
            target="_blank" 
            rel="noopener noreferrer"
            className="nav-link block"
            onClick={isMobile ? closeMobileMenu : undefined}
          >
            {link.label}
          </a>
        ) : (
          <Link 
            key={index}
            to={link.to}
            className="nav-link block"
            onClick={isMobile ? closeMobileMenu : undefined}
          >
            {link.label}
          </Link>
        )
      ))}
    </nav>
  )
}

// How It Works page
function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold mb-8">How It Works</h1>
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Connect Your Wallet</h2>
          <p>Connect your MetaMask wallet to get started. This will serve as your account.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">2. Upload Your Game</h2>
          <p>Share your game by providing the game URL, thumbnail, and social media links.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">3. Manage Your Games</h2>
          <p>All your uploaded games will be associated with your wallet address.</p>
        </section>
      </div>
    </div>
  )
}

// Search Bar Component
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')

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
  )
}
// Updated Trending Games Component
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
    e.target.src = '/api/placeholder/400/320'
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

// Main App Component
export default function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Responsive sizing check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Simulate loading data from the server
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <header className="header-container">
          <div className="max-w-7xl mx-auto py-4 px-4 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/" className="h-8 w-auto">
                <img src={Logo} alt="Game Portal Logo" className="h-8 w-auto" />
              </Link>
              
              {isMobile ? (
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="text-white"
                >
                  <Menu size={24} />
                </button>
              ) : (
                <Navigation walletAddress={walletAddress} />
              )}
            </div>
            <WalletConnect onConnect={setWalletAddress} />
          </div>
        </header>

        {isMobile && isMobileMenuOpen && (
          <Navigation 
            walletAddress={walletAddress} 
            isMobile={true} 
            closeMobileMenu={() => setIsMobileMenuOpen(false)} 
          />
        )}

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <main className="flex-1 w-full">
            <div className="max-w-7xl mx-auto py-6 px-4 h-full">
              <Routes>
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/shop" element={<Shop walletAddress={walletAddress} />} />
                <Route path="/upload" element={<UploadPage walletAddress={walletAddress} />} />
                <Route
                  path="/"
                  element={
                    <div className="h-full flex flex-col">
                      <SearchBar />
                      <TrendingGames />
                      <section className="mt-12 flex-1">
                      <h2 className="text-2xl font-bold mb-6 text-white">All Games</h2>
                        {/* <h2 className="text-2xl font-bold mb-6">All Games</h2> */}
                        <GameGrid />
                      </section>
                    </div>
                  }
                />
              </Routes>
            </div>
          </main>
        )}
      </div>
    </Router>
  )
}