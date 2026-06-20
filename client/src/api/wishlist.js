import api from './axios';

export const getWishlist = async () => {
  const { data } = await api.get('/wishlist');
  return data;
};

export const addToWishlist = async (placeId) => {
  const { data } = await api.post(`/wishlist/${placeId}`);
  return data;
};

export const removeFromWishlist = async (placeId) => {
  const { data } = await api.delete(`/wishlist/${placeId}`);
  return data;
};
