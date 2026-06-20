import api from './axios';

export const createJournalEntry = async (entry) => {
  const { data } = await api.post('/journal', entry);
  return data;
};

export const getJournalEntries = async () => {
  const { data } = await api.get('/journal');
  return data;
};

export const deleteJournalEntry = async (id) => {
  const { data } = await api.delete(`/journal/${id}`);
  return data;
};
