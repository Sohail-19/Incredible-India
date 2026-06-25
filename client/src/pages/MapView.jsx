import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../api/axios';
import { MapPin, Search, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const normalPin = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#FF6F00;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.25);border:2px solid #fff;"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

const selectedPin = L.divIcon({
  className: '',
  html: `<div style="width:32px;height:32px;background:#1B4332;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);border:2px solid #fff;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const formatBestMonths = (months) => {
  if (!months || months.length === 0) return '';
  return months.map(m => monthNames[m - 1]).join(', ');
};

function MapEvents({ onClick }) {
  useMapEvents({
    click: () => onClick(),
  });
  return null;
}

const MapView = () => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSlugs, setSelectedSlugs] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [activePlace, setActivePlace] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.get('/places').then(res => {
      setPlaces(res.data);
      setFilteredPlaces(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (location.state?.selectedSlugs) {
      setSelectedSlugs(location.state.selectedSlugs);
      setSelectionMode(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPlaces(places);
    } else {
      setFilteredPlaces(places.filter(p =>
        p.category?.toLowerCase() === selectedCategory.toLowerCase()
      ));
    }
  }, [selectedCategory, places]);

  const handlePinClick = (place) => {
    if (selectionMode) {
      setSelectedSlugs(prev => {
        const newSlugs = prev.includes(place.slug) 
          ? prev.filter(s => s !== place.slug) 
          : [...prev, place.slug];
        if (newSlugs.length === 0) setSelectionMode(false);
        return newSlugs;
      });
    } else {
      if (activePlace?.slug === place.slug) {
        setSelectionMode(true);
        setSelectedSlugs(prev => prev.includes(place.slug) ? prev : [...prev, place.slug]);
        setActivePlace(null);
      } else {
        setActivePlace(place);
      }
    }
  };

  const buildTrip = () => {
    navigate('/planner', {
      state: { preSelectedPlaces: selectedSlugs }
    });
  };

  const categories = ['All', 'Mountain', 'Beach', 'Heritage', 'Lakes', 'Valleys', 'Wildlife'];

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#E6EFE9]">
        <span className="text-[#1B4332] font-semibold">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#E6EFE9]">
      {/* Layer 1 — Leaflet map */}
      <MapContainer
        center={[22.5, 82.0]}
        zoom={5}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onClick={() => setActivePlace(null)} />
        {filteredPlaces.map(place => (
          <Marker
            key={place.slug}
            position={[place.coordinates.coordinates[1], place.coordinates.coordinates[0]]}
            icon={selectedSlugs.includes(place.slug) ? selectedPin : normalPin}
            opacity={selectionMode && !selectedSlugs.includes(place.slug) ? 0.5 : 1}
            eventHandlers={{ click: () => handlePinClick(place) }}
          />
        ))}
      </MapContainer>

      {/* Layer 2 — Top navbar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-[#1B4332] shadow-md pt-[env(safe-area-inset-top,20px)]">
        {selectionMode ? (
          <div className="px-4 py-4 mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setSelectionMode(false);
                  setSelectedSlugs([]);
                }} 
                className="text-white p-1"
              >
                <X size={24} />
              </button>
              <span className="text-white font-semibold text-base">Select places</span>
            </div>
            <div className="bg-[#FF6F00] text-white rounded-full px-3 py-1 text-sm font-bold shadow-sm">
              {selectedSlugs.length} selected
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3">
            <div className="px-4 flex items-center justify-between mb-4">
              <span className="text-white font-extrabold italic text-xl tracking-wide">
                Incredible<span className="text-[#FF6F00]">India</span>
              </span>
              <button className="text-white p-1">
                <Search size={22} />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#FF6F00] text-white'
                      : 'bg-white text-[#1B4332]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Layer 3 — Bottom sheet */}
      {activePlace && !selectionMode && (
        <div className="absolute bottom-16 md:bottom-0 left-0 right-0 z-[1000]">
          <div className="bg-white rounded-t-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.15)] p-5 pb-[env(safe-area-inset-bottom,20px)]">
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4"></div>
            
            <div className="flex gap-4 mb-5">
              <img
                src={`https://picsum.photos/seed/${activePlace.slug}/72/72`}
                alt={activePlace.name}
                className="w-[72px] h-[72px] rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#1A1A1A] text-[16px] truncate">{activePlace.name}</h3>
                <div className="flex items-center gap-1 text-[#6B6B6B] mt-1 text-[13px] truncate">
                  <MapPin size={12} className="flex-shrink-0" />
                  <span className="truncate">{activePlace.nearestCity}, {activePlace.state}</span>
                </div>
                <div className="text-[#6B6B6B] text-[12px] mt-1">
                  Best: {formatBestMonths(activePlace.bestMonths)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(`/places/${activePlace.slug}`)}
                className="w-full border border-[#1B4332] text-[#1B4332] rounded-xl py-3 font-semibold text-sm transition-colors active:bg-gray-50"
              >
                View Details
              </button>
              <button
                onClick={() => {
                  setSelectionMode(true);
                  setSelectedSlugs(prev => prev.includes(activePlace.slug) ? prev : [...prev, activePlace.slug]);
                  setActivePlace(null);
                }}
                className="w-full bg-[#FF6F00] text-white rounded-xl py-3 font-semibold text-sm transition-colors active:bg-[#e66400]"
              >
                Add to Trip +
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layer 4 — Selection mode bottom action bar */}
      {selectionMode && (
        <div className="absolute bottom-16 md:bottom-0 left-0 right-0 z-[1000]">
          <div className="bg-[#1B4332] rounded-t-2xl px-5 py-4 pb-[calc(env(safe-area-inset-bottom,20px)+16px)] shadow-[0_-8px_24px_rgba(0,0,0,0.25)]">
            <p className="text-[#D8F3DC] text-sm text-center mb-3">Tap pins to select or deselect destinations</p>
            <button
              onClick={buildTrip}
              disabled={selectedSlugs.length === 0}
              className={`w-full rounded-xl py-4 font-semibold text-base transition-colors ${
                selectedSlugs.length > 0 
                  ? 'bg-[#FF6F00] text-white active:bg-[#e66400]' 
                  : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              Build AI trip →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
