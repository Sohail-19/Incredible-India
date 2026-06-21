import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronDown, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPlacesByMonth, getPlaces } from '../api/places';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist';
import PlaceCard from '../components/common/PlaceCard';
import { PlaceCardSkeleton } from '../components/common/LoadingSkeleton';
import AuthGateModal from '../components/common/AuthGateModal';
import { monthShort } from '../utils/formatters';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const currentMonth = new Date().getMonth() + 1;

  // Fetch featured places on mount
  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try month-based first for seasonal relevance
        let data = await getPlacesByMonth(currentMonth);
        // Fall back to all places if not enough seasonal results
        if (!data || data.length < 3) {
          data = await getPlaces();
        }
        setPlaces(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch places:', err);
        setError('Unable to load places right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [currentMonth]);

  // Fetch wishlist if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds([]);
      return;
    }
    const fetchWishlist = async () => {
      try {
        const data = await getWishlist();
        const ids = (data.places || []).map((p) => (typeof p === 'string' ? p : p._id));
        setWishlistIds(ids);
      } catch (err) {
        console.error('Failed to fetch wishlist:', err);
      }
    };
    fetchWishlist();
  }, [isAuthenticated]);

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/places?search=${encodeURIComponent(q)}`);
    }
  };

  // Wishlist toggle handler
  const handleToggleWishlist = async (placeId) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    try {
      if (wishlistIds.includes(placeId)) {
        await removeFromWishlist(placeId);
        setWishlistIds((prev) => prev.filter((id) => id !== placeId));
      } else {
        await addToWishlist(placeId);
        setWishlistIds((prev) => [...prev, placeId]);
      }
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
    }
  };

  // Format bestMonths array into readable range (e.g., "Oct–Mar")
  const formatBestMonths = (months) => {
    if (!months || months.length === 0) return null;
    const sorted = [...months].sort((a, b) => a - b);
    return `${monthShort(sorted[0])}–${monthShort(sorted[sorted.length - 1])}`;
  };

  return (
    <div className="bg-background">
      {/* ═══════════════════════════════════════════════
          SECTION 1: HERO
          ═══════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/himalaya/1600/900"
            alt="Indian Himalayas"
            className="h-full w-full object-cover"
          />
          {/* Dark green gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, transparent 0%, rgba(27,67,50,0.3) 40%, rgba(27,67,50,0.85) 100%)',
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center px-5 text-center">
          {/* Eyebrow */}
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70 sm:text-sm">
            Explore the Unexplored
          </p>

          {/* Headline */}
          <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Discover India's{' '}
            <span className="text-primary">Hidden Gems</span>
          </h1>

          {/* Subtext */}
          <p className="mt-3 max-w-md text-sm text-white/80 sm:text-base md:text-lg">
            1200+ destinations most Indians have never heard of
          </p>

          {/* Glassmorphism Search */}
          <form onSubmit={handleSearch} className="mt-8 w-full max-w-md">
            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md transition-colors focus-within:border-white/40 focus-within:bg-white/15">
              <Search className="h-4 w-4 flex-shrink-0 text-white/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mountains, lakes, temples..."
                className="w-full bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
            </div>
            <p className="mt-2 text-xs text-white/50">
              Try:{' '}
              <button
                type="button"
                onClick={() => navigate('/places?search=Prashar%20Lake')}
                className="text-white/70 underline decoration-white/30 hover:text-white"
              >
                Prashar Lake
              </button>
              ,{' '}
              <button
                type="button"
                onClick={() => navigate('/places?search=Ziro%20Valley')}
                className="text-white/70 underline decoration-white/30 hover:text-white"
              >
                Ziro Valley
              </button>
              ,{' '}
              <button
                type="button"
                onClick={() => navigate('/places?search=Lonar%20Crater')}
                className="text-white/70 underline decoration-white/30 hover:text-white"
              >
                Lonar Crater
              </button>
            </p>
          </form>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/planner')}
            className="mt-8 inline-flex items-center gap-2 rounded-btn bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-xl active:scale-[0.98] sm:text-base"
          >
            <Sparkles className="h-4 w-4" />
            Plan My Trip with AI
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-white/50">
            Scroll to explore
          </p>
          <ChevronDown className="h-4 w-4 animate-bounce text-white/50" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2: STATS
          ═══════════════════════════════════════════════ */}
      <section className="bg-background px-5 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Beyond the Usual Tourist Trail
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-text-secondary sm:text-base">
            India has 35+ UNESCO sites and thousands of places nobody talks
            about. We found them.
          </p>

          {/* Stat Cards */}
          <div className="mt-10 flex items-start justify-center gap-8 sm:gap-14">
            {/* Stat 1 */}
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-primary sm:text-4xl">
                1200+
              </span>
              <span className="mt-1 text-xs text-text-muted sm:text-sm">
                Hidden
                <br />
                destinations
              </span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-text-primary sm:text-4xl">
                28
              </span>
              <span className="mt-1 text-xs text-text-muted sm:text-sm">
                States
                <br />
                covered
              </span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center">
              <span className="text-3xl font-extrabold text-primary sm:text-4xl">
                AI
              </span>
              <span className="mt-1 text-xs text-text-muted sm:text-sm">
                Trip
                <br />
                planner
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 3: FEATURED PLACES — "Hidden Gems This Season"
          ═══════════════════════════════════════════════ */}
      <section className="bg-background px-5 pb-14 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          {/* Section Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary sm:text-xl">
              Hidden Gems This Season
            </h2>
            <Link
              to="/places"
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <PlaceCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-card bg-surface p-8 text-center shadow-card">
              <p className="text-text-secondary">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary mt-4"
              >
                Try Again
              </button>
            </div>
          ) : places.length === 0 ? (
            <div className="rounded-card bg-surface p-8 text-center shadow-card">
              <p className="text-text-secondary">
                No places available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => (
                <div key={place._id} className="flex flex-col">
                  <PlaceCard
                    place={place}
                    variant="standard"
                    isWishlisted={wishlistIds.includes(place._id)}
                    onToggleWishlist={handleToggleWishlist}
                  />
                  {/* Best months indicator — outside PlaceCard to match design */}
                  {place.bestMonths && place.bestMonths.length > 0 && (
                    <div className="mt-1 flex items-center gap-1.5 px-4 pb-1">
                      <Calendar className="h-3 w-3 text-text-tertiary" />
                      <span className="text-xs text-text-muted">
                        Best: {formatBestMonths(place.bestMonths)}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 4: BOTTOM CTA
          ═══════════════════════════════════════════════ */}
      <section className="px-5 pb-14 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-card-lg bg-secondary px-6 py-10 text-center sm:px-12 sm:py-14">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Not sure where to go?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              Tell our AI your city, days and budget. Get a full day-wise
              itinerary in seconds.
            </p>
            <button
              onClick={() => navigate('/planner')}
              className="mt-6 inline-flex items-center gap-2 rounded-btn bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-xl active:scale-[0.98] sm:text-base"
            >
              Try AI Planner
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Auth Gate Modal for unauthenticated wishlist clicks */}
      <AuthGateModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        trigger="wishlist"
      />
    </div>
  );
};

export default Home;
