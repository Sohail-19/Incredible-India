import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  BookmarkCheck,
  Mountain,
  Clock,
  IndianRupee,
  Users,
  Zap,
  MapPin,
  Camera,
  Train,
  Bus,
  Car,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icon issue in Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

import { getPlaceBySlug, getPlaces, getNearbyPlaces } from '../api/places';
import { getWishlist, addToWishlist, removeFromWishlist } from '../api/wishlist';
import { useAuth } from '../context/AuthContext';
import { formatCategory, formatCrowdScore } from '../utils/formatters';
import Badge from '../components/common/Badge';
import PlaceCard from '../components/common/PlaceCard';
import AuthGateModal from '../components/common/AuthGateModal';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Haversine distance from Delhi (28.6139° N, 77.2090° E)
function getDistanceFromDelhi(lat, lon) {
  if (!lat || !lon) return null;
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a =
    0.5 -
    c((lat - 28.6139) * p) / 2 +
    (c(28.6139 * p) * c(lat * p) * (1 - c((lon - 77.2090) * p))) / 2;
  return Math.round(12742 * Math.asin(Math.sqrt(a)));
}

const PlaceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [userDistance, setUserDistance] = useState(null);

  // Fetch place details
  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPlaceBySlug(slug);
        if (!data) throw new Error('Place not found');
        setPlace(data);

        // Fetch actual nearby hidden gems using place coordinates
        let others = [];
        if (data.coordinates?.coordinates) {
          const lng = data.coordinates.coordinates[0];
          const lat = data.coordinates.coordinates[1];
          const nearby = await getNearbyPlaces(lat, lng, 1000); // Check within 1000km
          others = nearby.filter((p) => p._id !== data._id).slice(0, 2);
        } else {
          // Fallback if no coordinates
          const allPlaces = await getPlaces();
          others = allPlaces
            .filter((p) => p._id !== data._id)
            .sort(() => 0.5 - Math.random()) // Simple shuffle
            .slice(0, 2);
        }
        setNearbyPlaces(others);
      } catch (err) {
        console.error('Fetch place detail failed:', err);
        setError('Unable to load place details.');
        // Briefly show error then redirect
        setTimeout(() => navigate('/places'), 3000);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug, navigate]);

  // Fetch wishlist
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

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!place) return;

    const isWishlisted = wishlistIds.includes(place._id);
    try {
      if (isWishlisted) {
        await removeFromWishlist(place._id);
        setWishlistIds((prev) => prev.filter((id) => id !== place._id));
      } else {
        await addToWishlist(place._id);
        setWishlistIds((prev) => [...prev, place._id]);
      }
    } catch (err) {
      console.error('Wishlist toggle failed:', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToastMessage('Link copied to clipboard!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Get user location and calculate distance to place
  useEffect(() => {
    if (place?.coordinates?.coordinates && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat1 = pos.coords.latitude;
          const lon1 = pos.coords.longitude;
          const lon2 = place.coordinates.coordinates[0];
          const lat2 = place.coordinates.coordinates[1];

          // Haversine
          const p = 0.017453292519943295;
          const c = Math.cos;
          const a =
            0.5 -
            c((lat2 - lat1) * p) / 2 +
            (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;
          const dist = Math.round(12742 * Math.asin(Math.sqrt(a)));
          setUserDistance(dist);
        },
        (err) => {
          // If permission denied or error, gracefully hide the distance text
          if (
            err.code === err.PERMISSION_DENIED ||
            err.code === err.POSITION_UNAVAILABLE ||
            err.code === err.TIMEOUT
          ) {
            setUserDistance(null);
          }
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    }
  }, [place]);

  const getMonthStatus = (monthIndex) => {
    const monthNum = monthIndex + 1;
    if (!place?.bestMonths) return 'neutral';
    if (place.bestMonths.includes(monthNum)) return 'best';

    const isAdjacent = place.bestMonths.some((bm) => {
      return (
        bm === monthNum + 1 ||
        bm === monthNum - 1 ||
        (bm === 12 && monthNum === 1) ||
        (bm === 1 && monthNum === 12)
      );
    });

    if (isAdjacent) return 'good';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-center">
        <div>
          <p className="text-lg font-medium text-text-primary">{error || 'Place not found'}</p>
          <p className="mt-2 text-sm text-text-secondary">Redirecting to places...</p>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlistIds.includes(place._id);
  const crowdInfo = formatCrowdScore(place.crowdScore);
  const distanceDelhi =
    place.coordinates?.coordinates &&
    getDistanceFromDelhi(place.coordinates.coordinates[1], place.coordinates.coordinates[0]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 1. HERO IMAGE */}
      <div className="relative h-[280px] w-full bg-surface-dark">
        <img
          src={place.imageUrls?.hero || `https://picsum.photos/seed/${place.slug}/1200/800`}
          alt={place.name}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />

        {/* Top actions */}
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleToggleWishlist}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
            >
              {isWishlisted ? (
                <BookmarkCheck className="h-5 w-5 text-primary" fill="currentColor" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom text */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <Badge className="mb-2 bg-primary text-white border-none uppercase tracking-wider text-[10px]">
            {formatCategory(place.category)}
          </Badge>
          <h1 className="text-3xl font-bold">{place.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
            <MapPin className="h-4 w-4" />
            {place.state}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-6">
        {/* 2. QUICK STATS ROW */}
        <div className="grid grid-cols-4 divide-x divide-border-light rounded-card border border-border-light bg-surface py-4 shadow-sm">
          <div className="flex flex-col items-center justify-center text-center px-1">
            <Mountain className="h-5 w-5 text-primary mb-1" />
            <span className="text-xs font-bold text-text-primary whitespace-nowrap">
              {place.altitude || '—'}
            </span>
            <span className="text-[10px] text-text-muted">Altitude</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-1">
            <Clock className="h-5 w-5 text-primary mb-1" />
            <span className="text-xs font-bold text-text-primary whitespace-nowrap">
              {place.distanceFromNearestCity || '—'}
            </span>
            <span className="text-[10px] text-text-muted">From {place.nearestCity || 'City'}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-1">
            <IndianRupee className="h-5 w-5 text-primary mb-1" />
            <span className="text-xs font-bold text-text-primary whitespace-nowrap">
              {place.estimatedCostPerDay?.budget ? `~₹${place.estimatedCostPerDay.budget}/d` : '—'}
            </span>
            <span className="text-[10px] text-text-muted">Budget</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center px-1">
            <Users className={`h-5 w-5 mb-1 ${crowdInfo.className.includes('success') ? 'text-green-600' : crowdInfo.className.includes('warning') ? 'text-amber-500' : 'text-primary'}`} />
            <span className={`text-xs font-bold whitespace-nowrap ${crowdInfo.className.includes('success') ? 'text-green-700' : crowdInfo.className.includes('warning') ? 'text-amber-600' : 'text-primary'}`}>
              {crowdInfo.text}
            </span>
            <span className="text-[10px] text-text-muted">Crowd Score</span>
          </div>
        </div>

        {/* 3. CROWD WARNING BANNER */}
        {place.crowdScore === 'rising' && (
          <div className="mt-5 flex items-start gap-3 rounded-card bg-amber-50 px-4 py-3 border border-amber-100">
            <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 leading-relaxed">
              <span className="font-semibold">Crowd score is rising</span> — {place.crowdNote || 'best visited in the next 1-2 years before commercialization peaks.'}
            </p>
          </div>
        )}

        {/* 4. ABOUT SECTION */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-text-primary mb-3">About this place</h2>
          <div className="text-sm text-text-secondary leading-relaxed space-y-3">
            <p className={showFullDesc ? '' : 'line-clamp-4'}>{place.description}</p>
            {place.description?.length > 200 && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                {showFullDesc ? 'Read less' : 'Read more'}
                <ArrowLeft className={`h-3 w-3 transition-transform ${showFullDesc ? 'rotate-90' : '-rotate-180'}`} />
              </button>
            )}
          </div>
        </section>

        {/* 5. HIGHLIGHTS SECTION */}
        {place.highlights && place.highlights.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">Highlights</h2>
            <div className="grid grid-cols-2 gap-3">
              {place.highlights.map((highlight, i) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border border-border-light bg-gray-50 px-3 py-2.5">
                  <Camera className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-xs font-medium text-text-primary leading-tight">{highlight}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. BEST TIME TO VISIT */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Best time to visit</h2>
          <div className="grid grid-cols-4 gap-2">
            {MONTHS.map((month, i) => {
              const status = getMonthStatus(i);
              return (
                <div
                  key={month}
                  className={`flex items-center justify-center rounded py-1.5 text-xs font-medium border
                    ${status === 'best' ? 'bg-[#3b5b48] border-[#3b5b48] text-white' : ''}
                    ${status === 'good' ? 'bg-amber-100 border-amber-200 text-amber-800' : ''}
                    ${status === 'neutral' ? 'bg-surface border-border-light text-text-secondary' : ''}
                  `}
                >
                  {month}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[11px] text-text-muted justify-center">
            <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#3b5b48]" /> Best</span>
            <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-amber-400" /> Good</span>
            <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full border border-gray-300" /> Monsoon</span>
          </div>
        </section>

        {/* 7. LOCATION SECTION */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Location</h2>
          {place.coordinates?.coordinates && (
            <div className="overflow-hidden rounded-card border border-border-light shadow-sm">
              <div className="h-48 sm:h-64 w-full relative z-0">
                <MapContainer
                  center={[place.coordinates.coordinates[1], place.coordinates.coordinates[0]]}
                  zoom={11}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[place.coordinates.coordinates[1], place.coordinates.coordinates[0]]}>
                    <Popup>{place.name}</Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Overlay Info underneath map */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-4">
                <div>
                  <p className="font-bold text-text-primary">{place.name}</p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {Math.abs(place.coordinates.coordinates[1]).toFixed(4)}° {place.coordinates.coordinates[1] >= 0 ? 'N' : 'S'},{' '}
                    {Math.abs(place.coordinates.coordinates[0]).toFixed(4)}° {place.coordinates.coordinates[0] >= 0 ? 'E' : 'W'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {userDistance !== null && (
                    <div className="rounded-full bg-primary-tint px-3 py-1 text-[11px] font-semibold text-primary">
                      {userDistance} km from your location
                    </div>
                  )}
                  {distanceDelhi !== null && (
                    <div className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-text-secondary">
                      {distanceDelhi} km from Delhi
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 8. GETTING THERE */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Getting there</h2>
          <div className="flex flex-wrap gap-2">
            {place.howToReach?.train && (
              <div className="flex items-center gap-1.5 rounded-full border border-border-light bg-surface px-3 py-1.5 text-xs text-text-secondary">
                <Train className="h-3.5 w-3.5" /> Train
              </div>
            )}
            {place.howToReach?.bus && (
              <div className="flex items-center gap-1.5 rounded-full border border-border-light bg-surface px-3 py-1.5 text-xs text-text-secondary">
                <Bus className="h-3.5 w-3.5" /> Bus
              </div>
            )}
            {place.howToReach?.road && (
              <div className="flex items-center gap-1.5 rounded-full border border-border-light bg-surface px-3 py-1.5 text-xs text-text-secondary">
                <Car className="h-3.5 w-3.5" /> Self drive
              </div>
            )}
          </div>
          <div className="mt-3">
            <p className="text-xs text-text-secondary">
              💰 Estimated cost: <span className="font-semibold text-text-primary">
                ₹{(place.estimatedCostPerDay?.budget || 1000) * 1.5}–{(place.estimatedCostPerDay?.budget || 1000) * 3} per day
              </span>
            </p>
            <button 
              onClick={() => navigate('/planner', { state: { destination: place.state } })}
              className="mt-1 text-xs text-primary font-medium hover:underline"
            >
              Full cost breakdown in your AI trip plan →
            </button>
          </div>
        </section>

        {/* 9. PHOTOS */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-text-primary mb-4">Photos</h2>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none snap-x">
            {[
              place.imageUrls?.hero || `https://picsum.photos/seed/${place.slug}/800/600`,
              place.imageUrls?.detail || `https://picsum.photos/seed/${place.slug}-alt1/800/600`,
              `https://picsum.photos/seed/${place.slug}-alt2/800/600`,
              `https://picsum.photos/seed/${place.slug}-alt3/800/600`
            ].map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`${place.name} photo ${idx + 1}`}
                className="h-32 w-48 shrink-0 rounded-lg object-cover snap-start shadow-sm"
              />
            ))}
          </div>
        </section>

        {/* 10. NEARBY HIDDEN GEMS */}
        {nearbyPlaces.length > 0 && (
          <section className="mt-8 pb-8">
            <h2 className="text-xl font-bold text-text-primary mb-4">Nearby hidden gems</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nearbyPlaces.map((p) => (
                <PlaceCard
                  key={p._id}
                  place={p}
                  isWishlisted={wishlistIds.includes(p._id)}
                  onToggleWishlist={handleToggleWishlist}
                  variant="standard"
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 11. STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border-light bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex max-w-2xl gap-3">
          <button
            onClick={handleToggleWishlist}
            className={`flex flex-1 items-center justify-center gap-2 rounded-btn border py-3 font-semibold transition-colors ${
              isWishlisted 
                ? 'bg-[#1B4332] border-[#1B4332] text-white hover:bg-[#153424]' 
                : 'border-border-dark text-text-primary hover:bg-gray-50'
            }`}
          >
            {isWishlisted ? (
              <>
                <Bookmark className="h-5 w-5" fill="currentColor" />
                Wishlisted
              </>
            ) : (
              <>
                <Bookmark className="h-5 w-5" />
                Wishlist
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/planner', { state: { destination: place.state } })}
            className="flex flex-1 items-center justify-center gap-2 rounded-btn bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-dark"
          >
            Plan trip here
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>

      <AuthGateModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow-lg animate-in fade-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default PlaceDetail;
