import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-tint">
        <MapPin className="h-9 w-9 text-primary" />
      </div>
      <h1 className="text-6xl font-bold text-secondary">404</h1>
      <p className="mt-2 text-lg text-text-secondary">This destination doesn't exist... yet.</p>
      <p className="mt-1 text-sm text-text-tertiary">The page you're looking for can't be found.</p>
      <Link to="/" className="btn-primary mt-6">
        Back to Exploring
      </Link>
    </div>
  );
};

export default NotFound;
