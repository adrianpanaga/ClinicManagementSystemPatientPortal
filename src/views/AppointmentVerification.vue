<template>
  <div class="appointment-verification">
    <h2>View My Appointments</h2>
    <p>Enter your registered email or phone number to receive a verification code.</p>

    <form @submit.prevent="onVerifyCode" v-if="!codeSent">
      <div class="form-group">
        <label for="contactIdentifier">Email or Phone Number:</label>
        <input
          type="text"
          id="contactIdentifier"
          v-model="contactIdentifier"
          placeholder="e.g., patient@example.com or +639123456789"
          required
        />
      </div>

      <div class="form-group">
        <label for="method">Receive code via:</label>
        <select id="method" v-model="method" required>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>

      <div class="form-group">
        <label for="lastName">Last Name (Optional, for better matching):</label>
        <input
          type="text"
          id="lastName"
          v-model="lastName"
          placeholder="e.g., Doe"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send Verification Code' }}
      </button>
    </form>

    <form @submit.prevent="onVerifyCode" v-if="codeSent">
      <p>A 6-digit code has been sent to {{ contactIdentifier }}. It expires in 5 minutes.</p>
      <div class="form-group">
        <label for="verificationCode">Enter Code:</label>
        <input
          type="text"
          id="verificationCode"
          v-model="verificationCode"
          placeholder="e.g., 123456"
          required
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Verifying...' : 'Verify Code' }}
      </button>
      <button type="button" @click="resetForm" :disabled="loading" class="secondary-button">Cancel</button>
    </form>

    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <div v-if="appointments.length && !loading">
      <h3>Your Appointments:</h3>
      <p class="patient-greeting">Hello, {{ patientDetails.firstName }} {{ patientDetails.lastName }}!</p>
      <ul class="appointment-list">
        <li v-for="appt in appointments" :key="appt.appointmentId" class="appointment-item">
          <strong>{{ new Date(appt.appointmentDateTime).toLocaleString() }}</strong><br />
          Service: {{ appt.service.serviceName }}<br />
          Doctor: {{ appt.doctor.firstName }} {{ appt.doctor.lastName }} ({{ appt.doctor.jobTitle }})<br />
          Status: {{ appt.status }}<br />
          Notes: {{ appt.notes || 'N/A' }}
        </li>
      </ul>
    </div>
    <p v-else-if="!loading && codeSent && !appointments.length && !errorMessage">
      No appointments found for this account or after verification.
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { requestVerificationCode, verifyCodeAndGetAppointments } from '../services/api'; // Corrected import

// Reactive variables for form inputs and state
const contactIdentifier = ref('');
const method = ref('email'); // Default to email
const lastName = ref('');
const verificationCode = ref('');

const codeSent = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const appointments = ref([]);
const patientDetails = ref(null); // To store basic patient info after successful verification

// Function to request a verification code
async function onRequestCode() {
  loading.value = true;
  errorMessage.value = ''; // Clear previous errors
  appointments.value = []; // Clear previous appointments
  patientDetails.value = null;

  try {
    const response = await apiClient.post('/PatientVerification/RequestCode', {
      contactIdentifier: contactIdentifier.value,
      method: method.value,
      lastName: lastName.value,
    });
    codeSent.value = true;
    // The backend's message is usually generic for security, so display that
    // errorMessage.value = response.data.message; // Optional: If backend returns a message to display
  } catch (error) {
    console.error('Error requesting code:', error);
    // Display a user-friendly error message, avoid exposing backend details
    errorMessage.value = error.response?.data?.message || 'Failed to send verification code. Please check your details and try again.';
    codeSent.value = false; // Stay on request form if sending failed
  } finally {
    loading.value = false;
  }
}

// Function to verify the entered code
async function onVerifyCode() {
  loading.value = true;
  errorMessage.value = ''; // Clear previous errors
  appointments.value = []; // Clear previous appointments
  patientDetails.value = null;

  try {
    const response = await apiClient.post('/PatientVerification/VerifyCode', {
      contactIdentifier: contactIdentifier.value,
      code: verificationCode.value,
    });

    // Assuming your backend returns patient details and appointments directly
    // in the root of the response data (as per our last API design for VerifyCode)
    patientDetails.value = {
      firstName: response.data.firstName,
      lastName: response.data.lastName,
      patientId: response.data.patientID, // Corrected from patientId to patientID based on your API response
    };
    appointments.value = response.data.appointments || [];

    // Optionally, hide the verification form after successful display of appointments
    // codeSent.value = false; // Could reset this to hide the form, or keep it to allow re-verification

  } catch (error) {
    console.error('Error verifying code:', error);
    errorMessage.value = error.response?.data?.message || 'Invalid or expired code. Please try again or request a new code.';
    appointments.value = []; // Clear appointments on error
    patientDetails.value = null;
  } finally {
    loading.value = false;
  }
}

// Function to reset the form (e.g., if user wants to send a new code)
function resetForm() {
  contactIdentifier.value = '';
  lastName.value = '';
  verificationCode.value = '';
  codeSent.value = false;
  loading.value = false;
  errorMessage.value = '';
  appointments.value = [];
  patientDetails.value = null;
}
</script>

<style scoped>
.appointment-verification {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-weight: bold;
}

input[type="text"],
input[type="email"],
input[type="tel"],
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box; /* Include padding in width */
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

button:hover:not(:disabled) {
  background-color: #0056b3;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.secondary-button {
  background-color: #6c757d;
}

.secondary-button:hover:not(:disabled) {
  background-color: #5a6268;
}

.error-message {
  color: #dc3545;
  text-align: center;
  margin-top: 15px;
  font-weight: bold;
}

.patient-greeting {
  font-size: 1.1rem;
  font-weight: bold;
  color: #28a745;
  margin-top: 20px;
}

.appointment-list {
  list-style-type: none;
  padding: 0;
  margin-top: 20px;
}

.appointment-item {
  background-color: #f8f9fa;
  border: 1px solid #e2e6ea;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 10px;
  line-height: 1.6;
}

.appointment-item strong {
  color: #007bff;
}
</style>