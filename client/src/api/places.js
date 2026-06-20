import api from './axios';

export const getPlaces = async (params = {}) => {
  const { data } = await api.get('/places', { params });
  return data;
};

export const getPlaceBySlug = async (slug) => {
  const { data } = await api.get(`/places/${slug}`);
  return data;
};

export const getPlacesByMonth = async (month) => {
  const { data } = await api.get(`/places/month/${month}`);
  return data;
};

export const getNearbyPlaces = async (lat, lng, radius = 100) => {
  const { data } = await api.get('/places/nearby', { params: { lat, lng, radius } });
  return data;
};
