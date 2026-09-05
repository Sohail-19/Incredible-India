import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Heart, Trash2, ArrowRight } from 'lucide-react';

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const formatBestMonths = (months) => {
  if (!months || months.length === 0) return '';
  return months.map(m => monthNames[m - 1]).join(', ');
};

const crowdBadge = (score) => {
  if (score === 'low') return { label: 'Low crowd', bg: 'bg-[#D8F3DC]', text: 'text-[#2E7D32]' };
  if (score === 'rising') return { label: 'Rising', bg: 'bg-[#FFF3E0]', text: 'text-[#E65100]' };
  return { label: 'Popular', bg: 'bg-[#FFE0E0]', text: 'text-[#BA1A1A]' };
};

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/wishlist' } });
      return;
    }

    const fetchWishlist = async () => {
      try {
        const { data } = await api.get('/wishlist');
        const items = Array.isArray(data) ? data : (data.wishlist || data.data || data.places || []);
        setWishlist(items);
        setFilteredWishlist(items);
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredWishlist(wishlist);
    } else {
      setFilteredWishlist(wishlist.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase()));
    }
  }, [selectedCategory, wishlist]);

  const removeFromWishlist = async (placeId) => {
    try {
      await api.delete(`/wishlist/${placeId}`);
      setWishlist(prev => prev.filter(p => p._id !== placeId));
    } catch (err) {
      console.error("Failed to remove from wishlist", err);
    }
  };

  const categories = ['All', ...new Set((Array.isArray(wishlist) ? wishlist : []).map(p => p.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <span className="text-[#6B6B6B]">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col">
      {/* Section 1 — Page header */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="font-bold text-2xl text-[#1A1A1A]">My Wishlist</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">{wishlist.length} places saved</p>
      </div>

      {/* Section 2 — Category filter chips */}
      {wishlist.length > 0 && (
        <div className="px-5 pb-3 overflow-x-auto flex gap-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={
                selectedCategory === cat
                  ? "bg-[#FF6F00] text-white rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap"
                  : "bg-white text-[#1A1A1A] border border-[#E0E0E0] rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap"
              }
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Section 3 & 4 — Wishlist cards list or Empty state */}
      {filteredWishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 py-16 text-center flex-1">
          <div className="w-20 h-20 rounded-full bg-[#FFF3E0] flex items-center justify-center mx-auto mb-6">
            <Heart size={36} className="text-[#FF6F00]" />
          </div>
          <h2 className="font-bold text-xl text-[#1A1A1A] mb-2">No saved places yet</h2>
          <p className="text-sm text-[#6B6B6B] mb-8">
            Start exploring and tap the ♡ icon on any place to save it here.
          </p>
          <button
            onClick={() => navigate('/places')}
            className="w-full bg-[#FF6F00] text-white rounded-xl py-3.5 font-semibold text-sm mb-3"
          >
            Explore hidden gems →
          </button>
          <button
            onClick={() => navigate('/planner')}
            className="w-full border border-[#1B4332] text-[#1B4332] rounded-xl py-3.5 font-semibold text-sm"
          >
            Try AI Planner instead
          </button>
        </div>
      ) : (
        <div className="px-5 flex flex-col gap-3 pb-32">
          {filteredWishlist.map((place) => {
            const badge = crowdBadge(place.crowdScore);
            return (
              <div 
                key={place._id} 
                className="bg-white rounded-xl shadow-sm flex overflow-hidden h-[110px] cursor-pointer"
                onClick={() => navigate(`/places/${place.slug}`)}
              >
                <img
                  src={`https://picsum.photos/seed/${place.slug}/110/110`}
                  alt={place.name}
                  className="w-[110px] h-[110px] object-cover flex-shrink-0"
                />
                <div className="flex-1 p-3 flex flex-col justify-between relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFromWishlist(place._id); }}
                    className="absolute top-2 right-2 text-[#9E9E9E] hover:text-[#BA1A1A] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div>
                    <h3 className="font-semibold text-base text-[#1A1A1A] leading-tight pr-6 truncate">
                      {place.name}
                    </h3>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">{place.state}</p>
                    <div className="flex gap-1.5 mt-1">
                      {place.category && (
                        <span className="bg-[#D8F3DC] text-[#1B4332] text-[10px] px-1.5 py-0.5 rounded-sm font-medium">
                          {place.category}
                        </span>
                      )}
                      <span className={`${badge.bg} ${badge.text} text-[10px] px-1.5 py-0.5 rounded-sm font-medium`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-auto">
                    <span className="text-[11px] text-[#6B6B6B]">
                      Best: {formatBestMonths(place.bestMonths)}
                    </span>
                    <button onClick={() => navigate(`/places/${place.slug}`)}>
                      <ArrowRight size={14} className="text-[#FF6F00]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Section 5 — FAB */}
      {wishlist.length > 0 && (
        <button
          onClick={() => navigate('/planner/wishlist', {
            state: {
              wishlistPlaces: wishlist.map(p => ({ name: p.name, slug: p.slug, category: p.category })),
              wishlistPlaceNames: wishlist.map(p => p.name),
            }
          })}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-[#FF6F00] text-white px-6 py-3 rounded-full shadow-lg font-medium text-sm flex items-center gap-2 whitespace-nowrap hover:bg-[#e66400] transition-colors"
        >
          ✨ Plan a trip from wishlist
        </button>
      )}
    </div>
  );
};

export default Wishlist;
