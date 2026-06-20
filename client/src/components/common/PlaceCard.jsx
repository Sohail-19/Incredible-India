import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, MapPin } from 'lucide-react';
import Badge from './Badge';
import { formatCategory, formatCrowdScore, truncateText, formatBudget } from '../../utils/formatters';

const PlaceCard = ({ place, variant = 'standard', isWishlisted = false, onToggleWishlist }) => {
  const navigate = useNavigate();

  const crowdInfo = formatCrowdScore(place.crowdScore);

  const handleClick = () => {
    navigate(`/places/${place.slug}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onToggleWishlist?.(place._id);
  };

  if (variant === 'featured') {
    return (
      <div
        onClick={handleClick}
        className="group relative cursor-pointer overflow-hidden rounded-card-lg shadow-card transition-all duration-300 hover:shadow-card-hover"
      >
        {/* Full-bleed Image */}
        <div className="relative h-72 sm:h-80 lg:h-96">
          <img
            src={place.imageUrls?.hero || '/placeholder.jpg'}
            alt={place.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Bookmark */}
          <button
            onClick={handleWishlistClick}
            className="absolute right-3 top-3 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all hover:bg-white/40"
          >
            {isWishlisted ? (
              <BookmarkCheck className="h-5 w-5 text-primary" fill="currentColor" />
            ) : (
              <Bookmark className="h-5 w-5 text-white" />
            )}
          </button>

          {/* Badges */}
          <div className="absolute left-3 top-3 flex gap-2">
            <Badge variant="neutral">{formatCategory(place.category)}</Badge>
          </div>

          {/* Overlaid text */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className={`badge ${crowdInfo.className}`}>{crowdInfo.text}</span>
            </div>
            <h3 className="text-xl font-bold text-white sm:text-2xl">{place.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
              <MapPin className="h-3.5 w-3.5" />
              {place.state}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Standard variant
  return (
    <div
      onClick={handleClick}
      className="group card cursor-pointer overflow-hidden transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={place.imageUrls?.thumb || place.imageUrls?.hero || '/placeholder.jpg'}
          alt={place.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Bookmark */}
        <button
          onClick={handleWishlistClick}
          className="absolute right-2.5 top-2.5 rounded-full bg-white/20 p-1.5 backdrop-blur-sm transition-all hover:bg-white/40"
        >
          {isWishlisted ? (
            <BookmarkCheck className="h-4 w-4 text-primary" fill="currentColor" />
          ) : (
            <Bookmark className="h-4 w-4 text-white" />
          )}
        </button>

        {/* Category Badge */}
        <div className="absolute left-2.5 top-2.5">
          <Badge variant="neutral">{formatCategory(place.category)}</Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`badge ${crowdInfo.className}`}>{crowdInfo.text}</span>
          <span className="badge bg-gray-100 text-text-muted">{formatBudget(place.budgetLevel)}</span>
        </div>
        <h3 className="text-base font-semibold text-text-primary group-hover:text-primary transition-colors">
          {place.name}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-text-muted">
          <MapPin className="h-3 w-3" />
          {place.state}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {truncateText(place.description, 90)}
        </p>
      </div>
    </div>
  );
};

export default PlaceCard;
