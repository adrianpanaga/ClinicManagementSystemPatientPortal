// src/services/api.js
import axios from 'axios';

// Set your backend API base URL here.
// During development, it's typically your localhost:port for the ASP.NET Core API.
// For production, this will be your deployed API's URL (e.g., https://api.yourclinic.com).
const API_BASE_URL = 'https://localhost:7215/api'; // <--- IMPORTANT: Replace with your actual backend API URL

const apiClient = axios.create({ // Correctly named apiClient
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to handle errors consistently
const handleApiError = (error) => {
  console.error('API call failed:', error.response ? error.response.data : error.message);
  throw error; // Re-throw to allow component to handle specific error UI
};

// --- Patient Verification Endpoints ---
export const requestVerificationCode = async (contactInfo) => {
  try {
    const response = await apiClient.post('/PatientVerification/RequestCode', contactInfo); // CHANGED to apiClient.post
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const verifyCodeAndGetAppointments = async (verificationData) => {
  try {
    const response = await apiClient.post('/PatientVerification/VerifyCode', verificationData); // CHANGED to apiClient.post
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// --- NEW: Clinic Services Endpoint ---
export const getServices = async () => {
  try {
    const response = await apiClient.get('/Services'); // CHANGED to apiClient.get
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getDoctors = async () => {
  try {
    // This endpoint should return all staff details
    const response = await apiClient.get('/StaffDetails/ForBooking'); // CHANGED to apiClient.get
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getAvailableSlots = async (params) => {
  // params should contain doctorId, serviceId, date
  try {
    const response = await apiClient.get('/Appointments/AvailableSlots', { params }); // CHANGED to apiClient.get
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const bookAppointment = async (appointmentData) => {
  try {
    const response = await apiClient.post('/Appointments', appointmentData); // CHANGED to apiClient.post
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};