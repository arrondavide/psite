import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet, Link, useOutletContext } from "react-router-dom";
import { Menu, X, Search, ExternalLink } from "lucide-react";
import WalletConnect from "./components/WalletConnect";
import GameUpload from "./components/GameUpload";
import GameGrid from "./components/GameGrid";
import { supabase } from "./supabase";
import Shop from "./components/Shop";
import BecomeSeller from "./components/BecomeSeller"; // Import the new component
import Logo from "./assets/logo.png";
import LoadingSpinner from "./components/LoadingSpinner";


// Games Tab Component
function GamesTab() {
  return (
    <div className="h-full flex flex-col">
      <SearchBar />
      <TrendingGames />
      <section className="mt-12 flex-1">
        <h2 className="text-2xl font-bold mb-6 text-white">All Games</h2>
        <GameGrid />
      </section>
    </div>
  );
}

function BecomeSellerPage() {
  const { walletAddress } = useOutletContext();
  return <BecomeSeller walletAddress={walletAddress} />;
}

function UploadPage() {
  const { walletAddress } = useOutletContext();

  if (!walletAddress) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold text-red-600 mb-4">Wallet Not Connected</h2>
        <p>Please connect your wallet to upload games.</p>
      </div>
    );
  }

  return <GameUpload walletAddress={walletAddress} />;
}

function Navigation({ walletAddress, isMobile, closeMobileMenu }) {
  const navLinks = [
    { to: "/", label: "Shop" },
    { to: "/games", label: "Games" },
    { to: "/how-it-works", label: "How it Works" },
    ...(walletAddress ? [{ to: "/upload", label: "Upload Game" }] : []),
    ...(walletAddress ? [{ to: "/become-seller", label: "Become a Seller" }] : []),
    { href: "https://your-support-url.com", label: "Support", external: true },
  ];

  return (
    <nav
      className={`${
        isMobile
          ? "fixed inset-0 z-50 bg-gray-900 flex flex-col p-6 space-y-4"
          : "flex items-center space-x-6"
      }`}
    >
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
      {navLinks.map((link, index) =>
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
      )}
    </nav>
  );
}


// How It Works Page
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
  );
}

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

function RootLayout() {
  const [walletAddress, setWalletAddress] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
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

      <main className="flex-1 w-full">
        <div className="max-w-7xl mx-auto py-6 px-4 h-full">
          <Outlet context={{ walletAddress }} />
        </div>
      </main>
    </div>
  );
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      errorElement: <div>Not Found</div>,
      children: [
        {
          path: "/",
          element: <Shop />,
        },
        {
          path: "/games",
          element: <GamesTab />,
        },
        {
          path: "/how-it-works",
          element: <HowItWorks />,
        },
        {
          path: "/upload",
          element: <UploadPage />,
        },
        {
          path: "/become-seller",
          element: <BecomeSellerPage />,
        },
      ],
    },
  ],
  {
    basename: "/psite",
  }
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <RouterProvider router={router} />
      )}
    </>
  );
}