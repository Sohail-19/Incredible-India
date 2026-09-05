import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, MapPin, Calendar, Wallet, Check, Compass, AlertTriangle } from 'lucide-react';

const POPULAR_CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'];

const BUDGET_OPTIONS = [
  {
    id: 'budget',
    title: 'Budget Explorer',
    subtitle: 'Hostels, local food, shared transport',
    icon: '🎒'
  },
  {
    id: 'mid',
    title: 'Comfortable Traveller',
    subtitle: 'Comfortable stays, mix of experiences',
    icon: '✈️'
  },
  {
    id: 'luxury',
    title: 'Premium Explorer',
    subtitle: 'Premium hotels, private transfers',
    icon: '💎'
  }
];

const WishlistPlanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [wishlistPlaces, setWishlistPlaces] = useState([]);
  const [wishlistPlaceNames, setWishlistPlaceNames] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    startCity: '',
    days: 3,
    budgetLevel: 'mid',
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  useEffect(() => {
    const places = location.state?.wishlistPlaces;
    const names = location.state?.wishlistPlaceNames;
    if (!places || places.length === 0 || !names || names.length === 0) {
      navigate('/wishlist', { replace: true });
      return;
    }
    setWishlistPlaces(places);
    setWishlistPlaceNames(names);
  }, [location, navigate]);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingStep(prev => {
          if (prev < 4) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingStep(0);
    }
  }, [loading]);

  const handleNext = () => {
    if (currentStep === 1 && !wizardData.startCity.trim()) {
      showToast('Please enter your starting city');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const travelStyles = wishlistPlaces.map(p => p.category).filter(Boolean);
      const reqBody = {
        startCity: wizardData.startCity,
        days: wizardData.days,
        budgetLevel: wizardData.budgetLevel,
        travelStyles,
        wishlistPlaceNames,
      };

      const res = await axios.post('/planner/generate', reqBody);
      const result = res.data;

      navigate('/itinerary-result', {
        state: {
          itinerary: {
            ...result,
            budgetLevel: wizardData.budgetLevel,
            startCity: wizardData.startCity,
          }
        }
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong while generating your trip.');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState startCity={wizardData.startCity} currentLoadingStep={loadingStep} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Oops!</h2>
        <p className="text-[#6B6B6B] mb-8 max-w-sm">{error}</p>
        <button
          onClick={() => setError('')}
          className="bg-[#FF6F00] hover:bg-[#e66400] text-white px-8 py-3 rounded-xl font-bold transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col font-sans">
      {/* HEADER */}
      <header className="bg-[#1B4332] text-white pt-12 pb-4 px-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold tracking-tight">IncredibleIndia</h1>
          <button 
            onClick={() => isAuthenticated ? navigate('/profile') : navigate('/login', { state: { from: location.pathname } })}
            className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="w-4 h-4 rounded-full bg-[#FF6F00] flex items-center justify-center text-[10px] font-bold">
              
            </div>
          </button>
        </div>
      </header>

      {/* STEP INDICATOR */}
      <div className="bg-white px-6 py-4 shadow-sm border-b border-[#E5E5E5] z-10 sticky top-[88px]">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Step {currentStep} of 3</span>
            <span className="text-xs font-bold text-[#FF6F00]">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(step => (
              <div 
                key={step} 
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  step <= currentStep ? 'bg-[#FF6F00]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* WISHLIST BANNER */}
      <div className="w-full max-w-md mx-auto">
        <div className="mx-5 mt-4 bg-[#D8F3DC] border border-[#1B4332]/20 rounded-xl px-4 py-3">
          <p className="text-sm text-[#1B4332] font-semibold mb-1">✨ Your wishlist destinations</p>
          <div className="flex flex-wrap gap-2">
            {wishlistPlaces.map(place => (
              <span key={place.slug} className="bg-[#1B4332] text-white text-xs px-2.5 py-1 rounded-full font-medium">
                {place.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto px-6 py-8 pb-32 flex flex-col items-center">
        <div className="w-full max-w-md relative">
          
          {/* STEP 1: City */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] leading-tight flex items-center gap-2">
                  Where are you starting from? 📍
                </h2>
              </div>
              
              <div>
                <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider mb-2 block">
                  Your City
                </label>
                <input
                  type="text"
                  placeholder="Search for your city..."
                  value={wizardData.startCity}
                  onChange={(e) => setWizardData({...wizardData, startCity: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent transition-all shadow-sm bg-white text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#6B6B6B] uppercase tracking-wider mb-3 block">
                  Popular Cities
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {POPULAR_CITIES.map(city => (
                    <button
                      key={city}
                      onClick={() => setWizardData({...wizardData, startCity: city})}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1A1A1A] rounded-full text-sm font-medium transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Days */}
          {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in text-center">
              <h2 className="text-2xl font-bold text-[#1A1A1A] leading-tight flex items-center justify-center gap-2">
                How many days? 🗓️
              </h2>

              <div className="flex justify-center mb-4">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={wizardData.days}
                  onChange={(e) => setWizardData({...wizardData, days: parseInt(e.target.value) || ''})}
                  className="w-24 text-center border-b-2 border-[#1A1A1A] bg-transparent text-5xl font-black text-[#1B4332] py-2 focus:outline-none focus:border-[#FF6F00] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '3 Days', value: 3 },
                  { label: '5 Days', value: 5 },
                  { label: '7 Days', value: 7 },
                  { label: '10 Days', value: 10 }
                ].map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => setWizardData({...wizardData, days: preset.value})}
                    className={`py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                      wizardData.days === preset.value 
                      ? 'border-2 border-[#FF6F00] bg-[#FF6F00]/10 text-[#FF6F00]' 
                      : 'border border-gray-200 bg-white text-[#6B6B6B] hover:bg-gray-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <p className="text-xs text-[#6B6B6B] mt-3">
                We'll plan visits to all {wishlistPlaces.length} of your saved places across {wizardData.days || 0} days.
              </p>
            </div>
          )}

          {/* STEP 3: Budget */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A] leading-tight flex items-center gap-2">
                  What's your budget? 💰
                </h2>
              </div>

              <div className="space-y-4">
                {BUDGET_OPTIONS.map(option => {
                  const isSelected = wizardData.budgetLevel === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setWizardData({...wizardData, budgetLevel: option.id})}
                      className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all ${
                        isSelected 
                        ? 'border-[#FF6F00] bg-[#FF6F00]/5 shadow-sm' 
                        : 'border-[#E5E5E5] bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{option.icon}</span>
                          <div>
                            <h3 className={`font-bold text-lg ${isSelected ? 'text-[#FF6F00]' : 'text-[#1A1A1A]'}`}>
                              {option.title}
                            </h3>
                            <p className="text-sm text-[#6B6B6B] mt-1">{option.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full border border-[#FF6F00] flex items-center justify-center">
                              <Check className="w-3 h-3 text-[#FF6F00]" strokeWidth={3}/>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* BOTTOM NEXT BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F7F5F0] via-[#F7F5F0]/95 to-transparent z-20">
        <div className="max-w-md mx-auto">
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="w-full bg-[#FF6F00] hover:bg-[#e66400] text-white text-lg font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              Next <span>→</span>
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="w-full bg-[#FF6F00] hover:bg-[#e66400] text-white text-lg font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              Generate my trip ✨
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#BA1A1A] text-white text-sm px-4 py-2 rounded-full z-50 whitespace-nowrap shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

// Loading State Component
const LoadingState = ({ startCity, currentLoadingStep }) => {
  const steps = [
    `Finding hidden gems near ${startCity || 'your city'}`,
    "Checking seasonal conditions",
    "Building your day-wise plan",
    "Estimating costs & transport"
  ];

  return (
    <div className="min-h-screen bg-[#1B4332] flex flex-col items-center justify-center px-6 text-white overflow-hidden relative">
      {/* Background glow effects */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#FF6F00]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-[#2D6A4F]/40 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Animated spinner/pulse */}
        <div className="mb-12 relative">
          <div className="w-20 h-20 border-4 border-white/10 border-t-[#FF6F00] rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 bg-[#FF6F00]/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-8 h-8 text-[#FF6F00] animate-pulse" />
          </div>
        </div>

        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Crafting your perfect trip...</h2>
          <p className="text-white/70 text-sm max-w-[280px] mx-auto leading-relaxed">
            Our AI is finding the best hidden gems for your journey from {startCity || 'your city'}
          </p>
        </div>

        <div className="w-full max-w-[320px] space-y-6">
          {steps.map((stepText, index) => {
            const stepNum = index + 1;
            const isCompleted = currentLoadingStep > stepNum;
            const isActive = currentLoadingStep === stepNum;
            const isPending = currentLoadingStep < stepNum;

            return (
              <div key={index} className={`flex items-center gap-4 transition-all duration-500 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                <div className="relative flex-shrink-0">
                  {isCompleted && (
                    <div className="w-8 h-8 rounded-full bg-[#FF6F00] flex items-center justify-center shadow-lg shadow-[#FF6F00]/30">
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </div>
                  )}
                  {isActive && (
                    <div className="w-8 h-8 rounded-full border-2 border-[#FF6F00] flex items-center justify-center bg-[#1B4332] z-10 relative">
                      <div className="w-2.5 h-2.5 bg-[#FF6F00] rounded-full animate-pulse" />
                    </div>
                  )}
                  {isPending && (
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
                      <span className="text-xs font-semibold text-white/50">{stepNum}</span>
                    </div>
                  )}
                  
                  {/* Vertical connector line (except for last item) */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-6 -mb-6 ${isCompleted ? 'bg-[#FF6F00]' : 'bg-white/10'}`} />
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isActive ? 'text-[#FF6F00]' : 'text-white/40'}`}>
                    Step {stepNum}
                  </span>
                  <span className={`text-sm ${isActive || isCompleted ? 'text-white font-semibold' : 'text-white/60'}`}>
                    {stepText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-10 left-0 right-0 flex justify-center text-white/50 text-xs gap-2 items-center">
        <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
          <span className="w-1 h-1 bg-white/50 rounded-full animate-ping"></span>
        </div>
        This usually takes 10-15 seconds
      </div>
    </div>
  );
};

export default WishlistPlanner;
