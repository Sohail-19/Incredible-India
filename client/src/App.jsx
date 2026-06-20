import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
const SHELL_ROUTES = ['/', '/places', '/map', '/wishlist', '/profile'];

const App = () => {
  const location = useLocation();

  // Check if current route should show navigation shell
  const showShell = SHELL_ROUTES.some(
    (route) => location.pathname === route || location.pathname.startsWith('/places/')
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
