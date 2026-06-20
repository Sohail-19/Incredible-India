import { NavLink } from 'react-router-dom';
import { Compass, Map, Bookmark, User } from 'lucide-react';

const tabs = [
  { to: '/', icon: Compass, label: 'Explore' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/wishlist', icon: Bookmark, label: 'Saved' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const BottomTabBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-surface shadow-bottom-bar border-t border-border-light">
      <div className="flex h-16 items-center justify-around">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 transition-colors duration-200 ${
                isActive
                  ? 'text-primary'
                  : 'text-text-tertiary hover:text-text-secondary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      {/* Safe area for iPhones with home indicator */}
      <div className="h-safe-area-inset-bottom bg-surface" />
    </nav>
  );
};

export default BottomTabBar;
