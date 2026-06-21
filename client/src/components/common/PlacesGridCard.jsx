import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, MapPin, Star, Navigation, Calendar, ArrowRight } from 'lucide-react';
import Badge from './Badge';
import { formatCategory, formatCrowdScore, formatBudget, truncateText, monthShort } from '../../utils/formatters';

const PlacesGridCard = ({ place, isWishlisted = false, onToggleWishlist, nearbyMode = false }) => {
  const navigate = useNavigate();
  const crowdInfo = formatCrowdScore(place.crowdScore);

  const formatBestMonths = (months) => {
    if (!months || months.length === 0) return null;
    const sorted = [...months].sort((a, b) => a - b);
    return `${monthShort(sorted[0])}–${monthShort(sorted[sorted.length - 1])}`;
  };

  return (
    <div
      onClick={() => {
        sessionStorage.setItem('places-scroll-position', window.scrollY);
        navigate(`/places/${place.slug}`);
      }}
      className="group card cursor-pointer overflow-hidden transition-all duration-300 flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-[180px] lg:h-[200px] overflow-hidden shrink-0">
        <img
          src={place.imageUrls?.thumb || place.imageUrls?.hero || `https://picsum.photos/seed/${place.slug}/800/600`}
          alt={place.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Badge */}
        <div className="absolute left-3 top-3">
          <Badge variant="neutral">{formatCategory(place.category)}</Badge>
        </div>

        {/* Bookmark */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist?.(place._id);
          }}
          className="absolute right-3 top-3 rounded-full bg-white/20 p-1.5 backdrop-blur-sm transition-all hover:bg-white/40"
        >
          {isWishlisted ? (
            <BookmarkCheck className="h-5 w-5 text-primary" fill="currentColor" />
          ) : (
            <Bookmark className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Top Badges */}
        <div className="mb-2 flex items-center gap-2">
          <span className={`badge ${crowdInfo.className}`}>{crowdInfo.text}</span>
          <span className="badge bg-gray-100 text-text-muted">{formatBudget(place.budgetLevel)}</span>
        </div>

        {/* Name & State */}
        <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors">
          {place.name}
        </h3>
        
        <div className="mt-1 flex items-center gap-2">
          <p className="flex items-center gap-1 text-sm text-text-muted">
            <MapPin className="h-3.5 w-3.5" />
            {place.state}
          </p>
          {nearbyMode && place.distanceKm != null && (
            <span className="flex items-center gap-1 text-[11px] text-text-muted bg-gray-50 px-2 py-0.5 rounded-full">
              <Navigation className="h-3 w-3" />
              {place.distanceKm} km away
            </span>
          )}
        </div>

        {/* Highlight Tags */}
        {place.highlights && place.highlights.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {place.highlights.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="mt-3 text-sm leading-relaxed text-text-secondary flex-1">
          {truncateText(place.description, 140)}
        </p>

        {/* Bottom row */}
        <div className="mt-4 flex items-center justify-between border-t border-border-light pt-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-semibold text-text-primary">
                {place.rating || '4.5'}
              </span>
              {place.reviewCount && (
                <span className="text-xs text-text-muted">({place.reviewCount})</span>
              )}
            </div>
            {place.bestMonths && place.bestMonths.length > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-text-tertiary" />
                <span className="text-xs text-text-muted">
                  Best: {formatBestMonths(place.bestMonths)}
                </span>
              </div>
            )}
          </div>

          <span className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:underline">
            Explore
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlacesGridCard;
