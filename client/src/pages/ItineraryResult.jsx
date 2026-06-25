import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft, Share2, Zap, MapPin, Bus, Car, Train, Bookmark, Download, Check, IndianRupee, Calendar, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthGateModal from '../components/common/AuthGateModal';
import { saveItinerary } from '../api/itineraries';

const ItineraryResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [sessionData] = useState(() => {
    if (location.state?.itinerary) {
      return location.state;
    }
    const saved = sessionStorage.getItem('pendingItinerary');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const data = sessionData?.itinerary;
  const wizardData = sessionData?.wizardData;

  // If directly accessing this page without state, redirect back to planner
  if (!data) {
    return <Navigate to="/planner" replace />;
  }

  // The actual Gemini response structure based on planner.js
  const itinerary = data.generatedPlan || {};
  itinerary.budgetLevel = itinerary.budgetLevel || data.budgetLevel;

  const formatRange = (cost) => {
    if (cost?.min && cost?.max) 
      return `₹${cost.min.toLocaleString('en-IN')}–${cost.max.toLocaleString('en-IN')}`;
    if (typeof cost === 'number') 
      return `~₹${cost.toLocaleString('en-IN')}`;
    return cost || '—';
  };

  useEffect(() => {
    if (isAuthenticated && sessionStorage.getItem('pendingSave') === 'true' && data) {
      sessionStorage.removeItem('pendingSave');
      handleSave();
    }
  }, [isAuthenticated, data]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Could add a toast here
    alert("URL copied to clipboard!");
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pendingItinerary', JSON.stringify(sessionData));
      sessionStorage.setItem('pendingSave', 'true');
      setShowAuthModal(true);
      return;
    }
    
    setIsSaving(true);
    try {
      await saveItinerary({
        ...data,
        title: itinerary.title || data.title,
        startDate: new Date(), // Just placeholder for save
      });
      setIsSaved(true);
    } catch (error) {
      console.error("Failed to save itinerary:", error);
      alert("Failed to save itinerary. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    alert("PDF download coming soon!");
  };

  const formatBudget = (level) => {
    if (level === 'budget') return 'Budget';
    if (level === 'mid') return 'Mid-range';
    if (level === 'luxury') return 'Luxury';
    return level || 'Budget';
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans pb-28">
      {/* 1. NAVBAR */}
      <nav className="flex items-center justify-between px-4 py-4 bg-[#1B4332] text-white sticky top-0 z-20 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">IncredibleIndia</h1>
        <button onClick={handleShare} className="p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors">
          <Share2 className="w-5 h-5" />
        </button>
      </nav>

      {/* 2. TRIP HEADER */}
      <header className="bg-[#1B4332] px-6 py-6 pb-8 text-white rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <span className="text-[10px] font-bold text-[#A7F3D0] tracking-wider uppercase mb-2 block">
            Your AI-Generated Trip
          </span>
          <h2 className="text-3xl font-bold leading-tight mb-6">
            {itinerary.title || `${data.days}-Day Trip from ${data.startCity}`}
          </h2>

          <div className="flex items-center gap-4 text-sm font-medium mb-6">
            <div className="flex flex-col items-center flex-1">
              <Calendar className="w-5 h-5 mb-1 text-primary" />
              <span>{data.days} Days</span>
            </div>
            <div className="w-[1px] h-8 bg-white/20"></div>
            <div className="flex flex-col items-center flex-1">
              <MapPin className="w-5 h-5 mb-1 text-primary" />
              <span>{data.startCity}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/20"></div>
            <div className="flex flex-col items-center flex-1">
              <IndianRupee className="w-5 h-5 mb-1 text-primary" />
              <span>{formatBudget(itinerary.budgetLevel)}</span>
            </div>
          </div>

          {data.travelStyles && data.travelStyles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {data.travelStyles.map(style => (
                <span key={style} className="px-3 py-1.5 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm">
                  {style}
                </span>
              ))}
            </div>
          )}

          {itinerary.importantNotes && itinerary.importantNotes.length > 0 && (
            <div className="bg-primary/20 border border-primary/30 rounded-xl p-4 flex gap-3 items-start">
              <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm leading-relaxed text-white/90">
                {itinerary.importantNotes[0]}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="px-5 py-8 max-w-md mx-auto space-y-10">
        
        {/* 3. DAY CARDS SECTION */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-text-primary">Your Itinerary</h3>
            <button 
              onClick={() => navigate('/map', {
                state: {
                  selectedSlugs: itinerary.days?.map(d => {
                    if (d.placeSlug) return d.placeSlug;
                    const name = d.placeName || d.destination;
                    return name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : null;
                  }).filter(Boolean) ?? []
                }
              })} 
              className="text-primary font-bold text-sm"
            >
              Map View
            </button>
          </div>

          <div className="space-y-4">
            {itinerary.days?.map((day, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-border-light">
                <div className="relative h-48 w-full bg-gray-200">
                  <img 
                    src={`https://picsum.photos/seed/${encodeURIComponent(day.placeName || 'india')}-day${day.day}/800/400`} 
                    alt={day.destination || day.placeName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    Day {day.day}
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {day.placeName || day.destination}
                        {day.dayTheme && (
                          <span className="font-normal text-text-secondary"> · {day.dayTheme}</span>
                        )}
                      </h3>
                      <p className="text-sm text-text-secondary mt-0.5">{day.state}</p>
                    </div>
                    {day.estimatedDayCost && (
                      <div className="text-primary font-bold">
                        ~₹{day.estimatedDayCost.min?.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-5">
                    {day.activities?.map((act, actIdx) => (
                      <div key={actIdx} className="flex gap-3">
                        <div className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded flex-shrink-0 h-min mt-0.5">
                          {act.time}
                        </div>
                        <p className="text-sm text-text-secondary leading-snug">
                          {act.activity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs font-medium text-text-muted">
                    <div className="flex items-center gap-1.5 max-w-[60%] line-clamp-1">
                      <Bus className="w-3.5 h-3.5" />
                      <span className="truncate">{day.transportFromPrevious || "Local exploration"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      <span>Rising crowd</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. COST SUMMARY CARD */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-border-light">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-5 h-5 text-[#1B4332]" />
            <h3 className="text-lg font-bold text-[#1B4332]">Trip Cost Estimate</h3>
          </div>

          <div className="space-y-0 text-sm">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-text-secondary">Accommodation</span>
              <span className="font-bold text-text-primary">{formatRange(itinerary.costBreakdown?.accommodation)}</span>
            </div>
            <div className="flex justify-between py-3 bg-gray-50/50 border-b border-gray-100 px-2 -mx-2">
              <span className="text-text-secondary">Food & Drinks</span>
              <span className="font-bold text-text-primary">{formatRange(itinerary.costBreakdown?.food)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-text-secondary">Transport</span>
              <span className="font-bold text-text-primary">{formatRange(itinerary.costBreakdown?.transport)}</span>
            </div>
            <div className="flex justify-between py-3 bg-gray-50/50 px-2 -mx-2">
              <span className="text-text-secondary">Activities</span>
              <span className="font-bold text-text-primary">{formatRange(itinerary.costBreakdown?.activities)}</span>
            </div>
          </div>

          <div className="flex justify-between items-end mt-6 pt-4 border-t-2 border-dashed border-gray-200">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total</span>
            {itinerary.totalEstimatedCost ? (
              <span className="text-2xl font-bold text-primary">
                {formatRange(itinerary.totalEstimatedCost)}
              </span>
            ) : (
              <span className="text-2xl font-bold text-primary">
                ~₹{(data.days * 5000).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-2 text-right">
            For 1 person · {data.budgetLevel} tier · {data.days} days
          </p>
        </section>

        {/* 5. TRANSPORT SUMMARY CARD */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-border-light mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Bus className="w-5 h-5 text-[#1B4332]" />
            <h3 className="text-lg font-bold text-[#1B4332]">Getting There</h3>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-gray-100">
            <div className="relative">
              <div className="absolute -left-6 w-6 h-6 rounded-full bg-white border-2 border-primary flex items-center justify-center -ml-0.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Departure</h4>
              <p className="font-bold text-text-primary text-sm mb-1">{data.startCity} → Destination</p>
              <p className="text-sm text-text-secondary">Overnight bus or private cabs recommended.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-6 w-6 h-6 rounded-full bg-white border-2 border-[#1B4332] flex items-center justify-center -ml-0.5">
                <div className="w-2 h-2 rounded-full bg-[#1B4332]" />
              </div>
              <h4 className="text-xs font-bold text-[#1B4332] uppercase tracking-wider mb-1">On Ground</h4>
              <p className="font-bold text-text-primary text-sm mb-1">Local Transit</p>
              <p className="text-sm text-text-secondary">Mix of local transport and walking.</p>
            </div>
            
            <div className="relative">
              <div className="absolute -left-6 w-6 h-6 rounded-full bg-white border-2 border-gray-400 flex items-center justify-center -ml-0.5">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
              </div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Return</h4>
              <p className="font-bold text-text-primary text-sm mb-1">Destination → {data.startCity}</p>
              <p className="text-sm text-text-secondary">Direct return options available.</p>
            </div>
          </div>
        </section>

      </main>

      {/* 6. STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex gap-3">
          <button 
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-btn border-2 border-[#1B4332] text-[#1B4332] font-bold text-sm transition-colors hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-btn font-bold text-sm text-white transition-colors shadow-sm ${
              isSaved 
                ? 'bg-[#1B4332] hover:bg-[#1B4332]' 
                : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Itinerary'}
              </>
            )}
          </button>
        </div>
      </div>

      {showAuthModal && (
        <AuthGateModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          trigger="itinerary"
        />
      )}
    </div>
  );
};

export default ItineraryResult;
