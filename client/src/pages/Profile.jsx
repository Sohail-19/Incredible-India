import { useAuth } from '../context/AuthContext';
import { User } from 'lucide-react';
import { getInitials } from '../utils/formatters';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="page-container py-8">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
          {user ? getInitials(user.name) : <User className="h-8 w-8" />}
        </div>
        <h1 className="text-2xl font-bold text-secondary">
          {user?.name || 'Profile'}
        </h1>
        <p className="mt-1 text-text-muted">{user?.email}</p>
        <p className="mt-3 text-text-secondary">Profile Page — Coming Soon</p>
        <div className="mt-4 h-1 w-16 rounded-full bg-primary" />
      </div>
    </div>
  );
};

export default Profile;
