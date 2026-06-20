import { useParams } from 'react-router-dom';

const PlaceDetail = () => {
  const { slug } = useParams();

  return (
    <div className="page-container py-8">
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-secondary">Place Detail</h1>
        <p className="mt-3 text-text-secondary">Viewing: {slug}</p>
        <p className="mt-1 text-text-tertiary">Place Detail Page — Coming Soon</p>
        <div className="mt-4 h-1 w-16 rounded-full bg-primary" />
      </div>
    </div>
  );
};

export default PlaceDetail;
