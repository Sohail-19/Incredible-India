import api from './axios';

export const generateItinerary = async ({ startCity, days, budgetLevel, travelStyles }) => {
  const { data } = await api.post('/planner/generate', {
    startCity,
    days,
    budgetLevel,
    travelStyles,
  });
  return data;
};
