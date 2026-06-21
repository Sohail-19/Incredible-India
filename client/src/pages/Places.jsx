import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Star,
  Bookmark,
  BookmarkCheck,
  Map,
  ArrowRight,
  ChevronDown,
  Navigation,
  SearchX,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getPlaces, getNearbyPlaces } from '../api/places';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist';
import Badge from '../components/common/Badge';
import { PlaceCardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import AuthGateModal from '../components/common/AuthGateModal';
import PlacesGridCard from '../components/common/PlacesGridCard';


/* ─── Filter Option Configs ─────────────────────────────── */
const CATEGORY_OPTIONS = [
  { value: '', label: 'All Places' },
  { value: 'mountain', label: '🏔️ Mountain' },
  { value: 'beach', label: '🏖️ Beach' },
  { value: 'heritage', label: '🏛️ Heritage' },
  { value: 'wildlife', label: '🦁 Wildlife' },
  { value: 'village', label: '🏘️ Village' },
];

const SEASON_OPTIONS = [
  { value: '', label: 'All Seasons' },
  { value: 'summer', label: '☀️ Summer' },
  { value: 'winter', label: '❄️ Winter' },
  { value: 'monsoon', label: '🌧️ Monsoon' },
];

const CROWD_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'low', label: '🟢 Low crowd' },
  { value: 'rising', label: '🟡 Rising' },
  { value: 'popular', label: '🔴 Popular' },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'rating', label: 'Rating (high to low)' },
  { value: 'name', label: 'Name (A–Z)' },
];

const PAGE_SIZE = 6;

/* ═══════════════════════════════════════════════════════════
   PLACES PAGE
   ═══════════════════════════════════════════════════════════ */
const Places = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  /* ── Filters (synced with URL) ── */
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [season, setSeason] = useState(searchParams.get('season') || '');
  const [crowdScore, setCrowdScore] = useState(searchParams.get('crowdScore') || '');
  const [sortBy, setSortBy] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  /* ── Data state ── */
  const [allPlaces, setAllPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  /* ── Nearby / geolocation ── */
  const [nearbyMode, setNearbyMode] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  /* ── Wishlist ── */
  const [wishlistIds, setWishlistIds] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* ── Refs ── */
  const debounceTimer = useRef(null);
  const sortDropdownRef = useRef(null);

  /* ─── Sync filter state → URL search params ────────────── */
  const syncParams = useCallback(
    (overrides = {}) => {
      const next = {
        search: overrides.search ?? searchInput,
        category: overrides.category ?? category,
        season: overrides.season ?? season,
        crowdScore: overrides.crowdScore ?? crowdScore,
      };
      const params = new URLSearchParams();
      Object.entries(next).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });
      setSearchParams(params, { replace: true });
    },
    [searchInput, category, season, crowdScore, setSearchParams],
  );

  /* ─── Fetch places from API ────────────────────────────── */
  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNearbyMode(false);
    try {
      const params = {};
      if (searchInput.trim()) params.search = searchInput.trim();
      if (category) params.category = category;
      if (season) params.season = season;
      if (crowdScore) params.crowdScore = crowdScore;

      const data = await getPlaces(params);
      setAllPlaces(Array.isArray(data) ? data : []);
      setVisibleCount(PAGE_SIZE);
    } catch (err) {
      console.error('Fetch places failed:', err);
      setError('Unable to load places. Please try again.');
      setAllPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [searchInput, category, season, crowdScore]);

  /* ─── Refetch when filters change ──────────────────────── */
  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  /* ─── Fetch wishlist if authenticated ──────────────────── */
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistIds([]);
      return;
    }
    const load = async () => {
      try {
        const data = await getWishlist();
        setWishlistIds(
          (data.places || []).map((p) => (typeof p === 'string' ? p : p._id)),
        );
      } catch {
        /* silently ignore */
      }
    };
    load();
  }, [isAuthenticated]);

  /* ─── Close sort dropdown on outside click ─────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── Debounced search input ───────────────────────────── */
  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      syncParams({ search: value });
    }, 300);
  };

  /* ─── Filter handlers (update state + sync URL) ────────── */
  const handleCategoryChange = (val) => {
    const next = val || '';
    setCategory(next);
    syncParams({ category: next });
  };

  const handleSeasonChange = (val) => {
    const next = val || '';
    setSeason(next);
    syncParams({ season: next });
  };

  const handleCrowdChange = (val) => {
    const next = val || '';
    setCrowdScore(next);
    syncParams({ crowdScore: next });
  };

  /* ─── Clear all filters ────────────────────────────────── */
  const clearAllFilters = () => {
    setSearchInput('');
    setCategory('');
    setSeason('');
    setCrowdScore('');
    setNearbyMode(false);
    setGeoError(null);
    setSearchParams({}, { replace: true });
  };

  const resetNearMe = () => {
    setGeoError(null);
    fetchPlaces();
  };

  /* ─── Near Me (geolocation) ────────────────────────────── */
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await getNearbyPlaces(latitude, longitude, 1000);
          setAllPlaces(Array.isArray(data) ? data : []);
          setVisibleCount(PAGE_SIZE);
          setNearbyMode(true);
        } catch (err) {
          console.error('Nearby fetch failed:', err);
          setGeoError('Could not find places near you.');
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location access denied. Enable it in your browser settings.');
        } else {
          setGeoError('Unable to determine your location.');
        }
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  /* ─── Wishlist toggle ──────────────────────────────────── */
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
    } catch {
      /* silently ignore */
    }
  };

  /* ─── Client-side sort ─────────────────────────────────── */
  const sortedPlaces = [...allPlaces].sort((a, b) => {
    // In nearby mode, always sort by distance (closest first)
    if (nearbyMode) return (a.distanceKm || 0) - (b.distanceKm || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    return 0; // "featured" = API default order
  });

  const visiblePlaces = sortedPlaces.slice(0, visibleCount);
  const hasMore = visibleCount < sortedPlaces.length;
  const activeFilterCount =
    (searchInput ? 1 : 0) + (category ? 1 : 0) + (season ? 1 : 0) + (crowdScore ? 1 : 0);

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      {/* ─── STICKY HEADER: Search + Near Me ─────────────── */}
      <div className="sticky top-0 z-30 border-b border-border-light bg-surface/95 backdrop-blur-md md:top-16">
        <div className="page-container py-3">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-btn border border-border bg-background px-3 py-2.5 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="h-4 w-4 flex-shrink-0 text-text-tertiary" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search destinations..."
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
            </div>
            <button
              onClick={() => {
                /* Scroll to filters smoothly */
                document.getElementById('filter-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-btn border border-border bg-background text-text-muted transition-colors hover:border-primary/40 hover:text-primary"
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>

          {/* Near Me Pill */}
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleNearMe}
              disabled={geoLoading}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                nearbyMode
                  ? 'border-primary bg-primary-tint text-primary'
                  : 'border-border bg-surface text-text-secondary hover:border-primary/40 hover:text-primary'
              } ${geoLoading ? 'opacity-60' : ''}`}
            >
              <Navigation className={`h-3 w-3 ${geoLoading ? 'animate-pulse' : ''}`} />
              {geoLoading ? 'Locating...' : '📍 Near Me'}
            </button>

            {nearbyMode && (
              <span className="text-xs text-text-muted">
                Showing nearby places •{' '}
                <button
                  onClick={resetNearMe}
                  className="text-primary hover:underline"
                >
                  Reset
                </button>
              </span>
            )}

            {geoError && (
              <span className="text-xs text-danger">{geoError}</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── FILTER ROWS ─────────────────────────────────── */}
      <div id="filter-section" className="page-container space-y-3 pt-4">
        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleCategoryChange(opt.value === category ? '' : opt.value)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                (opt.value === '' && !category) || opt.value === category
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-surface text-text-secondary border border-border hover:border-secondary/40 hover:text-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Season Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SEASON_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSeasonChange(opt.value === season ? '' : opt.value)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                (opt.value === '' && !season) || opt.value === season
                  ? 'bg-secondary text-white shadow-sm'
                  : 'bg-surface text-text-secondary border border-border hover:border-secondary/40 hover:text-secondary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Crowd Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CROWD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleCrowdChange(opt.value === crowdScore ? '' : opt.value)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                (opt.value === '' && !crowdScore) || opt.value === crowdScore
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-text-secondary border border-border hover:border-primary/40 hover:text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── RESULTS HEADER ──────────────────────────────── */}
      <div className="page-container mt-4 flex items-center justify-between">
        <p className="text-sm font-medium text-text-secondary">
          <span className="font-bold text-text-primary">{sortedPlaces.length}</span> places
          found
        </p>

        {/* Sort Dropdown — hidden in nearby mode (distance sort is automatic) */}
        {nearbyMode ? (
          <span className="flex items-center gap-1.5 text-sm text-text-muted">
            <Navigation className="h-3.5 w-3.5" />
            Sorted by distance
          </span>
        ) : (
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Sort by:{' '}
              <span className="font-semibold text-primary">
                {SORT_OPTIONS.find((s) => s.value === sortBy)?.label}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  showSortDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 top-full z-20 mt-1.5 w-48 animate-scale-in rounded-card bg-surface py-1 shadow-modal">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSortDropdown(false);
                    }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      opt.value === sortBy
                        ? 'bg-primary-tint text-primary font-medium'
                        : 'text-text-secondary hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── RESULTS LIST ────────────────────────────────── */}
      <div className="page-container mt-4">
        {loading ? (
          /* ── Skeleton Loading ── */
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          /* ── Error State ── */
          <div className="rounded-card bg-surface p-8 text-center shadow-card">
            <p className="text-text-secondary">{error}</p>
            <button onClick={fetchPlaces} className="btn-primary mt-4">
              Try Again
            </button>
          </div>
        ) : sortedPlaces.length === 0 && nearbyMode ? (
          /* ── Near Me Empty State ── */
          <EmptyState
            icon={Navigation}
            heading="No hidden gems nearby"
            subtext={`No hidden gems within 1000 km of your location. Try browsing all places instead.`}
            primaryAction={{ label: 'Browse all places', onClick: resetNearMe }}
          />
        ) : sortedPlaces.length === 0 ? (
          /* ── Generic Empty State ── */
          <EmptyState
            icon={SearchX}
            heading="No places found"
            subtext="Try adjusting your filters or search query to discover more hidden gems."
            primaryAction={{ label: 'Clear all filters', onClick: clearAllFilters }}
          />
        ) : (
          /* ── Results ── */
          <div className="animate-stagger grid grid-cols-1 gap-6 md:grid-cols-2">
            {visiblePlaces.map((place) => (
              <PlacesGridCard
                key={place._id}
                place={place}
                isWishlisted={wishlistIds.includes(place._id)}
                onToggleWishlist={handleToggleWishlist}
                nearbyMode={nearbyMode}
              />
            ))}
          </div>
        )}

        {/* ── Load More ── */}
        {!loading && hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="btn-outline gap-2"
            >
              Load More Places
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* ─── FLOATING MAP BUTTON ─────────────────────────── */}
      <button
        onClick={() => navigate('/map')}
        className="fixed bottom-20 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white shadow-lg transition-all duration-200 hover:bg-secondary-mid hover:shadow-xl active:scale-95 md:bottom-8"
        aria-label="Open Map View"
      >
        <Map className="h-5 w-5" />
      </button>

      {/* ─── Auth Gate Modal ─────────────────────────────── */}
      <AuthGateModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        trigger="wishlist"
      />
    </div>
  );
};

export default Places;

