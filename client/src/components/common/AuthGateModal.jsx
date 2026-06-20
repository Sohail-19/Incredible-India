import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, ClipboardList, PenLine } from 'lucide-react';
import Button from './Button';

const triggerConfig = {
  wishlist: {
    icon: Heart,
    heading: 'Save to your Wishlist',
    subtext: 'Create a free account to save places you love and access them anytime.',
  },
  itinerary: {
    icon: ClipboardList,
    heading: 'Save your Itinerary',
    subtext: 'Sign up to save your AI-generated travel plans and revisit them later.',
  },
  journal: {
    icon: PenLine,
    heading: 'Start your Travel Journal',
    subtext: 'Create an account to log your travel experiences and memories.',
  },
};

const AuthGateModal = ({ isOpen, onClose, trigger = 'wishlist' }) => {
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const config = triggerConfig[trigger] || triggerConfig.wishlist;
  const Icon = config.icon;

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-sm rounded-card-lg bg-surface p-6 shadow-modal animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-text-tertiary hover:bg-gray-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-tint">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">{config.heading}</h3>
          <p className="mt-1.5 text-sm text-text-secondary">{config.subtext}</p>

          {/* Actions */}
          <div className="mt-6 flex w-full flex-col gap-2.5">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => { onClose(); navigate('/register'); }}
            >
              Create free account
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { onClose(); navigate('/login'); }}
            >
              Login instead
            </Button>
            <button
              onClick={onClose}
              className="mt-1 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthGateModal;
