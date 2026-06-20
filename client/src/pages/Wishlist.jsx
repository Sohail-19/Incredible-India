import { Bookmark } from 'lucide-react';

const Wishlist = () => {
  return (
    <div className="page-container py-8">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint">
          <Bookmark className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-secondary">Your Wishlist</h1>
        <p className="mt-3 text-text-secondary">Wishlist Page — Coming Soon</p>
        <div className="mt-4 h-1 w-16 rounded-full bg-primary" />
      </div>
    </div>
  );
};

export default Wishlist;
