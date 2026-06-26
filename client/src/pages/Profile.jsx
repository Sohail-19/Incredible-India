import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Bell, Moon, Lock, HelpCircle, Star, LogOut, ChevronRight, Trash2 } from 'lucide-react';

const Profile = () => {
  const [wishlist, setWishlist] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' } });
      return;
    }

    const fetchData = async () => {
      try {
        const [wishlistRes, itinerariesRes, journalRes] = await Promise.all([
          api.get('/wishlist').catch(() => ({ data: [] })),
          api.get('/itineraries').catch(() => ({ data: [] })),
          api.get('/journal').catch(() => ({ data: [] }))
        ]);

        const extractArray = (data) => Array.isArray(data) ? data : (data.wishlist || data.itineraries || data.journals || data.data || data.places || []);

        setWishlist(extractArray(wishlistRes.data));
        setItineraries(extractArray(itinerariesRes.data));
        setJournals(extractArray(journalRes.data));
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, navigate]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const deleteItinerary = async (id) => {
    try {
      await api.delete(`/itineraries/${id}`);
      setItineraries(prev => prev.filter(i => i._id !== id));
      showToast('Itinerary deleted');
    } catch (err) {
      console.error("Failed to delete itinerary", err);
      showToast('Failed to delete itinerary');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const stats = {
    saved: wishlist.length,
    visited: journals.length, // journal entries represent visited places
    trips: itineraries.length,
    journals: journals.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <span className="text-[#6B6B6B]">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] overflow-y-auto pb-24">
      {/* Section 1 — Profile header */}
      <div className="bg-[#1B4332] px-5 pt-6 pb-8 rounded-b-2xl">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-[72px] h-[72px] rounded-full bg-[#FF6F00] border-2 border-white flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="font-bold text-2xl text-white">{getInitials(user?.name)}</span>
          </div>
          <div>
            <h2 className="font-bold text-xl text-white">{user?.name || 'User'}</h2>
            <p className="text-sm text-white/80 mt-0.5">{user?.email}</p>
            <button onClick={() => showToast('Coming soon')} className="text-sm text-[#FF6F00] font-semibold mt-1 flex items-center gap-1">
              Edit profile →
            </button>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 flex justify-between items-center text-center text-white">
          <div>
            <div className="font-bold text-xl">{stats.saved}</div>
            <div className="text-xs opacity-60 mt-0.5">Saved</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div>
            <div className="font-bold text-xl">{stats.visited}</div>
            <div className="text-xs opacity-60 mt-0.5">Visited</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div>
            <div className="font-bold text-xl">{stats.trips}</div>
            <div className="text-xs opacity-60 mt-0.5">Trips</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div>
            <div className="font-bold text-xl">{stats.journals}</div>
            <div className="text-xs opacity-60 mt-0.5">Journals</div>
          </div>
        </div>
      </div>

      {/* Section 2 — Visited Places */}
      <div className="px-5 py-6">
        <h3 className="font-bold text-lg text-[#1A1A1A] mb-3">Visited Places</h3>
        {journals.length === 0 ? (
          <p className="text-center text-sm text-[#6B6B6B] my-4">No visited places yet. Start exploring!</p>
        ) : (
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide -mx-5 px-5">
            {journals.slice(0, 5).map((journal, idx) => (
              <div key={idx} className="shrink-0 w-[140px] bg-white rounded-xl shadow-sm overflow-hidden relative">
                <img
                  src={`https://picsum.photos/seed/${journal.placeName || journal.title}/140/96`}
                  alt={journal.placeName || journal.title}
                  className="w-full h-24 object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#1B4332]/90 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  ✓ Visited
                </div>
                <h4 className="font-semibold text-xs text-[#1A1A1A] truncate px-2 pt-1">{journal.placeName || journal.title}</h4>
                <div className="text-[10px] text-[#FF6F00] px-2 pb-2">
                  ⭐ {journal.rating || '5.0'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 3 — Travel Journal */}
      <div className="px-5 pb-6">
        <h3 className="font-bold text-lg text-[#1A1A1A] mb-3">Travel Journal</h3>
        {journals.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-center text-sm text-[#6B6B6B]">
            No journal entries yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex gap-3">
              <img
                src={`https://picsum.photos/seed/${journals[0].placeName || journals[0].title}/64/64`}
                alt={journals[0].title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h4 className="font-bold text-base text-[#1A1A1A]">{journals[0].title}</h4>
                <p className="text-xs text-[#6B6B6B] mt-0.5">Visited {new Date(journals[0].date || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                <div className="text-[10px] text-[#FF6F00] mt-1">⭐⭐⭐⭐⭐</div>
              </div>
            </div>
            {journals[0].quote && (
              <p className="italic text-sm text-[#1A1A1A] border-l-2 border-[#FF6F00] pl-3 my-3">
                "{journals[0].quote}"
              </p>
            )}
            <div className="flex gap-2 mt-3">
              {[1, 2, 3].map(i => (
                <img
                  key={i}
                  src={`https://picsum.photos/seed/${journals[0].title}-${i}/48/48`}
                  alt="thumbnail"
                  className="w-12 h-12 rounded-md object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 4 — Saved Itineraries */}
      <div className="px-5 pb-6">
        <h3 className="font-bold text-lg text-[#1A1A1A] mb-3">Saved Itineraries</h3>
        {itineraries.length === 0 ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E0E0E0] text-center">
            <p className="text-sm text-[#6B6B6B] mb-3">No saved itineraries yet. Generate one with the AI Planner!</p>
            <button onClick={() => navigate('/planner')} className="bg-[#FF6F00] text-white px-4 py-2 rounded-lg text-sm font-semibold inline-block">
              Try AI Planner →
            </button>
          </div>
        ) : (
          <div>
            {itineraries.map((itinerary, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-[#E0E0E0] flex justify-between items-start mb-3">
                <div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {itinerary.travelStyles?.map(style => (
                      <span key={style} className="bg-[#FFF3E0] text-[#FF6F00] text-[10px] px-2 py-0.5 rounded font-semibold mr-1">
                        {style}
                      </span>
                    ))}
                  </div>
                  <h4 className="font-bold text-base text-[#1A1A1A] mt-1 mb-1">{itinerary.title || 'My Amazing Trip'}</h4>
                  <button onClick={() => navigate('/itinerary-result', { 
                    state: { 
                      itinerary: { ...itinerary, _id: itinerary._id }, 
                      alreadySaved: true 
                    } 
                  })} className="text-sm text-[#FF6F00] font-semibold flex items-center gap-1">
                    View details →
                  </button>
                </div>
                <div className="flex gap-2 items-center shrink-0">
                  <button onClick={() => showToast('Coming soon')} className="bg-[#F7F5F0] text-[#1B4332] text-xs font-semibold px-2.5 py-1.5 rounded-md">
                    ⬇ PDF
                  </button>
                  <button onClick={() => deleteItinerary(itinerary._id)} className="text-[#9E9E9E] hover:text-[#BA1A1A] p-1.5 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 5 — Account settings */}
      <div className="px-5 pb-8">
        <h3 className="font-bold text-lg text-[#1A1A1A] mb-3">Account</h3>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden divide-y divide-[#E0E0E0]">
          <div onClick={() => showToast('Coming soon')} className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F7F5F0] cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-[#1A1A1A]" />
              <span className="text-sm font-medium text-[#1A1A1A]">Notifications</span>
            </div>
            <ChevronRight size={18} className="text-[#9E9E9E]" />
          </div>
          <div onClick={() => showToast('Coming soon')} className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F7F5F0] cursor-pointer">
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-[#1A1A1A]" />
              <span className="text-sm font-medium text-[#1A1A1A]">Dark mode</span>
            </div>
            <ChevronRight size={18} className="text-[#9E9E9E]" />
          </div>
          <div onClick={() => showToast('Coming soon')} className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F7F5F0] cursor-pointer">
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-[#1A1A1A]" />
              <span className="text-sm font-medium text-[#1A1A1A]">Privacy</span>
            </div>
            <ChevronRight size={18} className="text-[#9E9E9E]" />
          </div>
          <div onClick={() => showToast('Coming soon')} className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F7F5F0] cursor-pointer">
            <div className="flex items-center gap-3">
              <HelpCircle size={18} className="text-[#1A1A1A]" />
              <span className="text-sm font-medium text-[#1A1A1A]">Help</span>
            </div>
            <ChevronRight size={18} className="text-[#9E9E9E]" />
          </div>
          <div onClick={() => showToast('Coming soon')} className="flex items-center justify-between px-4 py-3.5 hover:bg-[#F7F5F0] cursor-pointer">
            <div className="flex items-center gap-3">
              <Star size={18} className="text-[#1A1A1A]" />
              <span className="text-sm font-medium text-[#1A1A1A]">Rate app</span>
            </div>
            <ChevronRight size={18} className="text-[#9E9E9E]" />
          </div>
          <div onClick={handleLogout} className="flex items-center justify-between px-4 py-3.5 hover:bg-red-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-[#BA1A1A]" />
              <span className="text-sm font-medium text-[#BA1A1A]">Logout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1B4332] text-white text-sm px-4 py-2 rounded-full z-50 whitespace-nowrap shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default Profile;
