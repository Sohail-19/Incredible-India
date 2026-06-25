import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, User, MapPin, Calendar, Wallet, Compass, Plus, Minus, AlertTriangle } from 'lucide-react';
import { generateItinerary } from '../api/planner';
import { useAuth } from '../context/AuthContext';

const POPULAR_CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'];

const TRAVEL_STYLES = [
  { id: 'adventure', label: 'Adventure', emoji: '🏔' },
  { id: 'photography', label: 'Photography', emoji: '📸' },
  { id: 'wellness', label: 'Wellness', emoji: '🧘' },
  { id: 'history', label: 'History & Culture', emoji: '🏛' },
  { id: 'food', label: 'Food & Local life', emoji: '🍽' },
  { id: 'nature', label: 'Nature & Wildlife', emoji: '🌿' }
];

const BUDGET_OPTIONS = [
  {
    id: 'budget',
    title: 'Budget Explorer',
    subtitle: 'Under ₹1,500/day',
    tags: ['HOSTELS', 'PUBLIC TRANSPORT', 'STREET FOOD'],
    icon: '₹'
  },
  {
    id: 'mid',
    title: 'Comfortable Traveller',
    subtitle: '₹1,500 - ₹5,000/day',
    tags: ['GUESTHOUSES', 'PRIVATE CABS'],
    icon: '₹₹'
  },
  {
    id: 'luxury',
    title: 'Premium Explorer',
    subtitle: 'Above ₹5,000/day',
    tags: ['LUXURY HOTELS', 'FINE DINING'],
    icon: '₹₹₹'
  }
];

const Planner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    startCity: '',
    days: 5,
    budgetLevel: 'budget',
    travelStyles: [],
    wishlistPlaceNames: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);

  // Pre-fill startCity if navigated from a place detail page
  useEffect(() => {
    if (location.state?.startCity) {
      setWizardData(prev => ({ ...prev, startCity: location.state.startCity }));
    }
    if (location.state?.wishlistPlaceNames) {
      setWizardData(prev => ({ ...prev, wishlistPlaceNames: location.state.wishlistPlaceNames }));
    }
  }, [location.state]);

  // Loading animation effect
  useEffect(() => {
    if (isLoading) {
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
  }, [isLoading]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateItinerary(wizardData);
      navigate('/itinerary-result', { 
        state: { 
          itinerary: {
            ...result,
            budgetLevel: wizardData.budgetLevel,
            startCity: wizardData.startCity,
          }, 
          wizardData 
        } 
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong while generating your trip.');
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
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

  if (isLoading) {
    return <LoadingState startCity={wizardData.startCity} currentLoadingStep={loadingStep} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Oops!</h2>
        <p className="text-text-secondary mb-8 max-w-sm">{error}</p>
        <button
          onClick={() => setError(null)}
          className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-btn font-bold transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Wizard Header */}
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
            <User className="w-4 h-4 text-white" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white px-6 py-4 shadow-sm border-b border-border-light z-10 sticky top-[88px]">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Step {currentStep} of 4</span>
            <span className="text-xs font-bold text-primary">{currentStep * 25}%</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step} 
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  step <= currentStep ? 'bg-primary' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 pb-32 flex flex-col items-center">
        <div className="w-full max-w-md animate-fade-in relative">
          
          {/* STEP 1: City */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-text-primary leading-tight flex items-center gap-2">
                  Where are you starting from? 📍
                </h2>
              </div>
              
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">
                  Your City
                </label>
                <input
                  type="text"
                  placeholder="Search for your city..."
                  value={wizardData.startCity}
                  onChange={(e) => setWizardData({...wizardData, startCity: e.target.value})}
                  className="w-full border border-border-dark rounded-btn px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 block">
                  Popular Cities
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {POPULAR_CITIES.map(city => (
                    <button
                      key={city}
                      onClick={() => setWizardData({...wizardData, startCity: city})}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-text-primary rounded-full text-sm font-medium transition-colors"
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
            <div className="space-y-10 animate-slide-up text-center">
              <h2 className="text-2xl font-bold text-text-primary leading-tight flex items-center justify-center gap-2">
                How many days do you have? 📅
              </h2>

              <div className="flex items-center justify-center gap-8 my-8">
                <button 
                  onClick={() => setWizardData(prev => ({...prev, days: Math.max(1, prev.days - 1)}))}
                  className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-6 h-6 text-text-secondary" />
                </button>
                <div className="text-7xl font-black text-[#1B4332] w-24 text-center">
                  {wizardData.days}
                </div>
                <button 
                  onClick={() => setWizardData(prev => ({...prev, days: Math.min(30, prev.days + 1)}))}
                  className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors shadow-md"
                >
                  <Plus className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                {[
                  { label: 'Weekend (2)', value: 2 },
                  { label: 'Long Weekend (3)', value: 3 },
                  { label: '5 Days', value: 5 },
                  { label: '1 Week (7)', value: 7 }
                ].map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => setWizardData({...wizardData, days: preset.value})}
                    className={`py-3 px-4 rounded-btn text-sm font-bold transition-all ${
                      wizardData.days === preset.value 
                      ? 'border-2 border-primary bg-primary/10 text-primary' 
                      : 'border border-gray-200 bg-gray-50 text-text-secondary hover:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Budget */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-slide-up">
              <div>
                <h2 className="text-2xl font-bold text-text-primary leading-tight flex items-center gap-2">
                  What's your budget? 💰
                </h2>
                <p className="text-text-secondary mt-1">Per person, per day estimate</p>
              </div>

              <div className="space-y-4">
                {BUDGET_OPTIONS.map(option => {
                  const isSelected = wizardData.budgetLevel === option.id;
                  return (
                    <div
                      key={option.id}
                      onClick={() => setWizardData({...wizardData, budgetLevel: option.id})}
                      className={`relative cursor-pointer rounded-card border-2 p-5 transition-all ${
                        isSelected 
                        ? 'border-primary bg-orange-50/50 shadow-sm' 
                        : 'border-border-light bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-bold text-lg ${isSelected ? 'text-primary-dark' : 'text-text-primary'}`}>
                            {option.title}
                          </h3>
                          <p className="text-sm text-text-secondary mt-1">{option.subtitle}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {option.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-text-muted rounded tracking-wider uppercase">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {isSelected && <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center mb-2"><Check className="w-3 h-3 text-primary" strokeWidth={3}/></div>}
                          {!isSelected && <div className="w-5 h-5 rounded-full border border-gray-300 mb-2"></div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Travel Style */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-slide-up">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">🧭</div>
                <h2 className="text-2xl font-bold text-text-primary">What's your travel style?</h2>
                <p className="text-text-secondary mt-1">Pick all that apply</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {TRAVEL_STYLES.map(style => {
                  const isSelected = wizardData.travelStyles.includes(style.id);
                  return (
                    <div
                      key={style.id}
                      onClick={() => {
                        setWizardData(prev => ({
                          ...prev,
                          travelStyles: isSelected 
                            ? prev.travelStyles.filter(id => id !== style.id)
                            : [...prev.travelStyles, style.id]
                        }));
                      }}
                      className={`cursor-pointer rounded-xl border p-4 text-center flex flex-col items-center justify-center gap-3 relative transition-all min-h-[120px] ${
                        isSelected 
                        ? 'border-[#1B4332] bg-[#E8F5E9] shadow-sm' 
                        : 'border-border-dark bg-white hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#1B4332] flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      <span className="text-3xl">{style.emoji}</span>
                      <span className={`text-sm font-bold ${isSelected ? 'text-[#1B4332]' : 'text-text-primary'}`}>
                        {style.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Bottom Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent z-20">
        <div className="max-w-md mx-auto">
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              disabled={currentStep === 1 && !wizardData.startCity.trim()}
              className="w-full bg-primary hover:bg-primary-dark text-white text-lg font-bold py-4 rounded-btn transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              Next <span>→</span>
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={wizardData.travelStyles.length === 0}
              className="w-full bg-primary hover:bg-primary-dark text-white text-lg font-bold py-4 rounded-btn transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
            >
              Generate my trip ✨
            </button>
          )}
        </div>
      </div>
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
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-[#2D6A4F]/40 rounded-full blur-[100px]" />
      
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Animated spinner/pulse */}
        <div className="mb-12 relative">
          <div className="w-20 h-20 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 bg-primary/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-8 h-8 text-primary animate-pulse" />
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
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                      <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    </div>
                  )}
                  {isActive && (
                    <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center bg-[#1B4332] z-10 relative">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                    </div>
                  )}
                  {isPending && (
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/5">
                      <span className="text-xs font-semibold text-white/50">{stepNum}</span>
                    </div>
                  )}
                  
                  {/* Vertical connector line (except for last item) */}
                  {index < steps.length - 1 && (
                    <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-6 -mb-6 ${isCompleted ? 'bg-primary' : 'bg-white/10'}`} />
                  )}
                </div>
                
                <div className="flex flex-col">
                  <span className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isActive ? 'text-primary' : 'text-white/40'}`}>
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

export default Planner;
