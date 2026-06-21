import { Routes, Route, useLocation, Navigate, useNavigationType } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import BottomTabBar from './components/layout/BottomTabBar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Places from './pages/Places';
import PlaceDetail from './pages/PlaceDetail';
import MapView from './pages/MapView';
import Planner from './pages/Planner';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Pages that show the navigation shell (Navbar + BottomTabBar + Footer)
const SHELL_ROUTES = ['/', '/places', '/map', '/wishlist', '/profile', '/terms', '/privacy'];

// ScrollToTop component
const ScrollToTop = () => {
  const location = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    // Only scroll to top if it's a new navigation, not a "Back" button (POP)
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [location, navType]);

  return null;
};

const App = () => {
  const location = useLocation();

  // Check if current route should show navigation shell
  const showShell = SHELL_ROUTES.some(
    (route) => location.pathname === route || location.pathname.startsWith('/places/')
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ScrollToTop />
      {showShell && <Navbar />}

      <main className={`flex-1 ${showShell ? 'pb-16 md:pb-0' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/places" element={<Places />} />
          <Route path="/places/:slug" element={<PlaceDetail />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {showShell && <Footer />}
      {showShell && <BottomTabBar />}
    </div>
  );
};

export default App;
