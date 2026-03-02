import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getShows = async () => {
  const response = await api.get('/shows');
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const checkAvailability = async (showId, category, quantity) => {
  const response = await api.post('/check-availability', {
    showId,
    category,
    quantity,
  });
  return response.data;
};

export const getSeatingPlan = async (showId, category) => {
  const response = await api.get(`/seating-plan/${showId}/${category}`);
  return response.data;
};

export const lockSeats = async (showId, seatIds) => {
  const response = await api.post('/lock-seats', {
    showId,
    seatIds,
  });
  return response.data;
};

export const releaseSeats = async (lockId) => {
  const response = await api.post('/release-seats', {
    lockId,
  });
  return response.data;
};

export const completeBooking = async (bookingData) => {
  const response = await api.post('/complete-booking', bookingData);
  return response.data;
};

export const verifyLock = async (lockId) => {
  const response = await api.get(`/verify-lock/${lockId}`);
  return response.data;
};

export default api;
