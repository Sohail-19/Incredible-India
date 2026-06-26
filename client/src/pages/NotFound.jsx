import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPinOff, ArrowRight } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const popularPlaces = [
    { name: 'Prashar Lake', state: 'Himachal Pradesh', slug: 'prashar-lake' },
    { name: 'Ziro Valley', state: 'Arunachal Pradesh', slug: 'ziro-valley' },
    { name: 'Lonar Crater Lake', state: 'Maharashtra', slug: 'lonar-crater-lake' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-start px-6 pt-16 pb-24">
      {/* Top section — 404 illustration */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <span className="text-[120px] font-extrabold text-gray-200 leading-none">4</span>
        <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center flex-shrink-0">
          <MapPinOff size={36} className="text-[#6B6B6B]" />
        </div>
        <span className="text-[120px] font-extrabold text-gray-200 leading-none">4</span>
      </div>

      {/* Heading and subtitle */}
      <div className="text-center mb-8">
        <h1 className="font-bold text-2xl text-[#1A1A1A] mb-2">This trail leads nowhere</h1>
        <p className="text-sm text-[#6B6B6B] leading-relaxed max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-3 mb-10">
        <button
          onClick={() => navigate('/')}
          className="w-full bg-[#FF6F00] text-white rounded-xl py-4 font-semibold text-base transition-colors hover:bg-[#E66400]"
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate('/places')}
          className="w-full border-2 border-[#1B4332] text-[#1B4332] rounded-xl py-4 font-semibold text-base bg-transparent transition-colors hover:bg-black/5"
        >
          Browse hidden gems
        </button>
      </div>

      {/* Popular Trails section */}
      <div className="w-full max-w-sm">
        <h2 className="text-xs font-bold text-[#6B6B6B] tracking-widest mb-3 uppercase">
          Popular Trails
        </h2>
        {popularPlaces.map((place, idx) => (
          <div
            key={idx}
            onClick={() => navigate(`/places/${place.slug}`)}
            className="flex items-center gap-3 bg-white rounded-xl p-3 mb-2 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <img
              src={`https://picsum.photos/seed/${place.slug}/48/48`}
              alt={place.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-[#1A1A1A] truncate">
                {place.name}
              </h3>
              <p className="text-xs text-[#6B6B6B] mt-0.5 truncate">
                {place.state}
              </p>
            </div>
            <ArrowRight size={18} className="text-[#FF6F00] ml-auto flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotFound;
