<template>
  <div class="appointment-verification">
    <h2>Verify Your Appointment</h2>
    <p>Enter your contact details to view your appointments.</p>

    <form @submit.prevent="onRequestCode">
      <div class="form-group">
        <label for="contact">Contact Number / Email</label>
        <input
          type="text"
          id="contact"
          v-model="contact"
          required
          placeholder="e.g., 09123456789 or your@email.com"
        />
      </div>
      <div class="form-group">
        <label for="method">Receive code via:</label>
        <select id="method" v-model="method" required>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Request Code' }}
      </button>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </form>

    <form v-if="showVerificationInput" @submit.prevent="onVerifyCode">
      <h3>Verify Code</h3>
      <div class="form-group">
        <label for="code">Verification Code</label>
        <input type="text" id="code" v-model="verificationCode" required placeholder="Enter code" />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Verifying...' : 'Verify Code' }}
      </button>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </form>

    <div v-if="appointments.length > 0" class="appointments-display">
      <h3>Your Appointments</h3>
      <table class="appointments-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in appointments" :key="appt.appointmentId">
            <td>{{ appt.service ? appt.service.serviceName : 'N/A' }}</td>
            <td>{{ appt.doctor ? (appt.doctor.fullName || `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}`) : 'N/A' }}</td>
            <td>{{ formatDate(appt.appointmentDateTime) }}</td>
            <td>{{ formatTime(appt.appointmentDateTime) }}</td>
            <td>{{ appt.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else-if="appointments.length === 0 && !loading && verificationCode && !errorMessage" class="no-appointments-message">
        No appointments found for the provided code.
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { requestVerificationCode, verifyCodeAndGetAppointments } from '@/services/api';
import { useRoute } from 'vue-router'; 

export default {
  name: 'AppointmentVerification',
  setup() {
    const route = useRoute(); 

    const contact = ref('');
    const method = ref('email');
    const verificationCode = ref('');
    const showVerificationInput = ref(false);
    const appointments = ref([]);
    const loading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');

    const prefillFromUrl = () => {
      if (route.query.contact) {
        contact.value = route.query.contact;
        if (route.query.contact.includes('@')) {
            method.value = 'email';
        } else {
            method.value = 'sms';
        }
      }
      if (route.query.email && !route.query.contact) { 
          contact.value = route.query.email;
          method.value = 'email';
      }
    };

    const onRequestCode = async () => {
      loading.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      try {
        const result = await requestVerificationCode({ ContactIdentifier: contact.value, Method: method.value }); // CRITICAL FIX: Changed 'contact' to 'ContactIdentifier', 'method' to 'Method'
        successMessage.value = result.message || 'Verification code sent successfully!';
        showVerificationInput.value = true;
      } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to request code. Please try again.';
        console.error('Request Code Error:', error);
      } finally {
        loading.value = false;
      }
    };

    const onVerifyCode = async () => {
      loading.value = true;
      errorMessage.value = '';
      successMessage.value = '';
      appointments.value = [];

      try {
        const result = await verifyCodeAndGetAppointments({
          ContactIdentifier: contact.value, // CRITICAL FIX: Changed 'contact' to 'ContactIdentifier'
          Code: verificationCode.value, // CRITICAL FIX: Changed 'code' to 'Code'
          Method: method.value, // CRITICAL FIX: Changed 'method' to 'Method'
        });

        if (result.appointments && result.appointments.length > 0) {
          appointments.value = result.appointments;
          successMessage.value = 'Code verified! Your appointments are listed below.';
        } else {
          successMessage.value = result.message || 'Code verified, but no appointments found.';
        }
      } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Verification failed. Please check your code and try again.';
        console.error('Verify Code Error:', error);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateTimeString) => {
      if (!dateTimeString) return 'N/A';
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateTimeString) => {
      if (!dateTimeString) return 'N/A';
      const date = new Date(dateTimeString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    onMounted(() => {
        prefillFromUrl();
    });

    return {
      contact,
      method,
      verificationCode,
      showVerificationInput,
      appointments,
      loading,
      errorMessage,
      successMessage,
      onRequestCode,
      onVerifyCode,
      formatDate,
      formatTime,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/_common.scss'; // Adjust path based on location in /views

.appointments-display, .appointments-list-view {
  @include step-card-base;
  max-width: 800px; // A bit wider for the table
}

.step-header {
  @include step-header-base;
  justify-content: flex-start;
  margin-bottom: $spacing-xs;
}

.step-header-icon {
  @include step-header-icon-base;
}

h2 {
  color: $color-text-dark;
  font-size: $font-size-xxl;
  line-height: 1.2;
}

p {
  color: $color-text-medium-grey;
  font-size: $font-size-md;
  margin-bottom: $spacing-xl;
}

.form-group {
  margin-bottom: $spacing-lg; // 15px
}

label {
  font-size: $font-size-sm;
  color: $color-text-dark;
  margin-bottom: $spacing-xs;
  font-weight: bold;
  display: flex;
  align-items: center;
}

input[type="text"],
input[type="tel"],
input[type="email"],
select {
  padding: $spacing-md $spacing-lg;
  border: 1px solid $color-border-light;
  border-radius: $spacing-xs; // 5px
  font-size: $font-size-md;
  color: $color-text-dark;
  background-color: $color-bg-white;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    border-color: $color-primary-blue;
    box-shadow: 0 0 0 $spacing-xxs rgba($color-primary-blue, 0.2);
    outline: none;
  }
}

button[type="submit"] {
  @include primary-button;
  width: auto; // Let button size to content
  margin-top: $spacing-lg; // 15px
}

.success-message {
  color: $color-info;
  background-color: lighten($color-info, 60%);
  border: 1px solid $color-info;
  padding: $spacing-sm $spacing-md;
  border-radius: $spacing-xs;
  margin-top: $spacing-lg;
  text-align: center;
}

.error-message {
  color: $color-error;
  background-color: lighten($color-error, 60%);
  border: 1px solid $color-error;
  padding: $spacing-sm $spacing-md;
  border-radius: $spacing-xs;
  margin-top: $spacing-lg;
  text-align: center;
}

.appointments-display {
  margin-top: $spacing-xxl; // 30px
}

.appointments-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: $spacing-md;
  font-size: $font-size-sm;
  color: $color-text-dark;

  th, td {
    padding: $spacing-sm $spacing-md;
    border: 1px solid $color-border-light;
    text-align: left;
  }

  th {
    background-color: $color-bg-light;
    font-weight: bold;
    color: $color-text-dark;
  }

  tr:nth-child(even) {
    background-color: lighten($color-bg-light, 2%);
  }
}

.no-appointments-message {
    text-align: center;
    color: $color-text-medium-grey;
    padding: $spacing-lg;
    border: 1px dashed $color-border-medium;
    border-radius: $spacing-xs;
    margin-top: $spacing-xxl;
}

.navigation-buttons {
  margin-top: $spacing-xxl;
  display: flex;
  justify-content: center;
  width: 100%;
}

.secondary-button { // Reusing primary button style
  @include secondary-button;
  width: auto;
}
</style>