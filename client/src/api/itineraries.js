import api from './axios';

export const saveItinerary = async (itinerary) => {
  const { data } = await api.post('/itineraries', itinerary);
  return data;
};

export const getItineraries = async () => {
  const { data } = await api.get('/itineraries');
  return data;
};

export const getItineraryById = async (id) => {
  const { data } = await api.get(`/itineraries/${id}`);
  return data;
};

export const deleteItinerary = async (id) => {
  const { data } = await api.delete(`/itineraries/${id}`);
  return data;
};
