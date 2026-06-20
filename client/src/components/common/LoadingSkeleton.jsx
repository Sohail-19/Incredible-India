const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} />
);

export const PlaceCardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton className="h-44 w-full rounded-none" />
    <div className="p-4">
      <div className="flex gap-2 mb-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-1" />
      <Skeleton className="h-3 w-1/3 mb-3" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);

export const PageSkeleton = () => (
  <div className="page-container py-8">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <PlaceCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export default Skeleton;
