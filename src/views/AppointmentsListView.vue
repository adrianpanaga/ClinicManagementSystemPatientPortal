<template>
  <div class="appointments-list-view">
    <div class="step-header">
      <i class="fas fa-list-alt step-header-icon"></i> <h2>My Appointments</h2>
    </div>
    <p>View your upcoming and past appointments.</p>

    <form v-if="!initialFetchAttempted || (error && !loading) || (appointments.length === 0 && initialFetchAttempted && !loading && !error)" 
          @submit.prevent="fetchAppointments" class="patient-lookup-form">
      <p class="form-instruction">Please enter the contact details used during booking to retrieve your appointments.</p>
      <div class="form-row">
        <div class="form-group">
          <label for="lookupContact"><i class="fas fa-phone label-icon"></i> Contact Number</label>
          <input
            type="tel"
            id="lookupContact"
            v-model="lookupDetails.contactNumber"
            required
            placeholder="(123) 456-7890"
          />
        </div>
        <div class="form-group">
          <label for="lookupEmail"><i class="fas fa-envelope label-icon"></i> Email Address</label>
          <input
            type="email"
            id="lookupEmail"
            v-model="lookupDetails.email"
            required
            placeholder="john.doe@example.com"
          />
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="!isLookupFormValid" class="next-button">
          Retrieve Appointments
        </button>
      </div>
    </form>

    <div v-if="loading" class="loading-message">
      Loading your appointments...
    </div>
    <div v-else-if="error && !loading && initialFetchAttempted" class="error-message">
      Error: {{ error }}
      <div v-if="hasInitialQueryParams" class="navigation-link">
          <a href="#" @click.prevent="showFormForRetry">Retry with manual input</a>
      </div>
    </div>
    
    <h3 v-else-if="appointments.length > 0" class="appointments-grid-header">Your Appointments {{ patientDisplayName ? `for ${patientDisplayName}` : '' }} ({{ appointments.length }})</h3>

    <div v-if="appointments.length > 0" class="appointments-grid">
      <div v-for="appt in appointments" :key="appt.appointmentId" class="appointment-card">
        <div class="card-header-date">
          <i class="fas fa-calendar-alt header-icon"></i>
          <span>{{ formatDate(appt.appointmentDateTime) }}</span>
        </div>
        <div class="card-header-time">
          <i class="fas fa-clock header-icon"></i>
          <span>{{ formatTime(appt.appointmentDateTime) }}</span>
        </div>
        
        <div class="card-section">
          <div class="detail-item-card">
            <strong><i class="fas fa-user label-icon"></i> Patient:</strong>
            <span>{{ appt.patient ? appt.patient.fullName || `${appt.patient.firstName} ${appt.patient.lastName}` : 'N/A' }}</span>
          </div>
          <div class="detail-item-card">
            <strong><i class="fas fa-stethoscope label-icon"></i> Service:</strong>
            <span>{{ appt.service ? appt.service.serviceName : 'N/A' }}</span>
          </div>
          <div class="detail-item-card">
            <strong><i class="fas fa-user-md label-icon"></i> Doctor:</strong>
            <span>{{ appt.doctor ? (appt.doctor.fullName || `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}`) : 'N/A' }}</span>
          </div>
          <div class="detail-item-card full-width-card-detail">
            <strong><i class="fas fa-notes-medical label-icon"></i> Reason:</strong>
            <span>{{ appt.notes || 'N/A' }}</span>
          </div>
        </div>

        <div class="appointment-status">
            Status: <strong>{{ appt.status }}</strong>
        </div>
      </div>
    </div>
    <div v-else-if="appointments.length === 0 && initialFetchAttempted && !loading && !error" class="no-appointments-message">
      No appointments found {{ patientDisplayName ? `for ${patientDisplayName}` : '' }}. Please verify your contact information or book a new appointment.
    </div>

    <div class="navigation-buttons full-width-buttons">
      <button @click="navigateToBooking" class="next-button">Book a New Appointment</button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { getAppointmentsByPatientContact, getAppointmentsByPatientId } from '@/services/api'; 
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'AppointmentsListView',
  props: {
    patientId: { type: [Number, String], default: null }, // patientId from route.query
    contact: { type: String, default: '' },
    email: { type: String, default: '' },
    patientFullName: { type: String, default: '' }, // Passed from VerifyCodeView/Confirmation
  },
  setup(props) { 
    const router = useRouter();
    const route = useRoute(); 

    const lookupDetails = reactive({
      contactNumber: '',
      email: '',
    });

    const appointments = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const initialFetchAttempted = ref(false); // NEW: Track if initial fetch has been tried

    // Check if initial query parameters (contact/email/patientId) are present
    const hasInitialQueryParams = computed(() => {
        return !!(props.patientId || props.contact || props.email);
    });

    // Patient display name for messages
    const patientDisplayName = computed(() => {
        // Prioritize patientFullName prop if it came from verification
        if (props.patientFullName) return props.patientFullName;
        if (props.email) return props.email; // Fallback to email from prop
        if (lookupDetails.email) return lookupDetails.email; // Fallback to form email
        return '';
    });

    const isLookupFormValid = computed(() => {
      // Ensure both fields are non-empty before enabling submit
      return lookupDetails.contactNumber.trim() !== '' &&
             lookupDetails.email.trim() !== '';
    });

    const fetchAppointments = async () => {
      loading.value = true;
      error.value = null;
      appointments.value = []; 
      initialFetchAttempted.value = true; // Mark initial fetch attempt

      let contactToUse;
      let emailToUse;
      let patientIdToUse = props.patientId; // Prioritize patientId if available from props

      // Determine contact details: prioritize props (from verification), then form, then route.query (for initial direct visit)
      if (props.contact && props.email) { // If contact/email came directly as props
        contactToUse = props.contact;
        emailToUse = props.email;
      } else if (route.query.contact && route.query.email && hasInitialQueryParams.value && !isLookupFormValid.value) { // If came from booking confirmation redirect
        contactToUse = route.query.contact;
        emailToUse = route.query.email;
      } else { // Use form values (manual entry or prefilled by mount)
        contactToUse = lookupDetails.contactNumber;
        emailToUse = lookupDetails.email;
      }
      
      // Final validation before API call
      if (!patientIdToUse && (!contactToUse || contactToUse.trim() === '' || !emailToUse || emailToUse.trim() === '')) {
          error.value = 'Contact number and email are required.'; // Error if no PatientId and no contact/email
          loading.value = false;
          return;
      }
      
      try {
        let response;
        if (patientIdToUse) { // If patientId is available, use it for direct lookup
          response = await getAppointmentsByPatientId(patientIdToUse); // Call by PatientId
        } else { // Fallback to contact lookup if no PatientId
          response = await getAppointmentsByPatientContact({ contactNumber: contactToUse, email: emailToUse });
        }
        
        appointments.value = response;
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to retrieve appointments.';
        console.error("Error fetching appointments:", err);
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

    const navigateToBooking = () => {
      router.push('/');
    };

    const showFormForRetry = () => {
        initialFetchAttempted.value = false; // Show the form again
        appointments.value = []; // Clear appointments
        error.value = null; // Clear error
    };

    onMounted(() => {
        // If query params exist when page mounts, attempt fetch immediately
        if (hasInitialQueryParams.value) {
            // Pre-fill lookupDetails for display if coming from URL, even if patientId is used for fetch
            lookupDetails.contactNumber = props.contact || route.query.contact || '';
            lookupDetails.email = props.email || route.query.email || '';
            fetchAppointments();
        }
    });

    return {
      lookupDetails,
      appointments,
      loading,
      error,
      hasInitialQueryParams,
      initialFetchAttempted,
      isLookupFormValid,
      fetchAppointments,
      formatDate,
      formatTime,
      navigateToBooking,
      patientDisplayName,
      showFormForRetry,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/_common.scss'; // Adjust path based on location in /views

.appointments-list-view {
  @include step-card-base; // Reuses common card styling
  max-width: 1000px; // Wider to accommodate card content
  padding: $spacing-xl; // 20px
}

.step-header {
  @include step-header-base;
  justify-content: flex-start; // Align to start
  margin-bottom: 0; // CHANGED: Reduced space below the step header
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
  margin-top: 0; // CHANGED: Ensure no top margin
  margin-bottom: $spacing-xl; // Keep bottom margin for space before form/list
}

.form-instruction {
  text-align: center;
  margin-bottom: $spacing-xxl;
}

/* Patient Lookup Form */
.patient-lookup-form {
  margin-bottom: $spacing-xxl;
  width: 100%;
  border: 1px solid $color-border-medium;
  padding: $spacing-xl;
  border-radius: $spacing-sm;
  background-color: $color-bg-white;
}

.form-row {
  display: flex;
  gap: $spacing-xl;
  margin-bottom: $spacing-lg;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

label {
  font-size: $font-size-sm;
  color: $color-text-dark;
  margin-bottom: $spacing-xs;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.label-icon {
  font-size: $font-size-md;
  margin-right: $spacing-sm;
  color: $color-text-medium-grey;
}

input[type="text"],
input[type="email"],
input[type="tel"] {
  padding: $spacing-md $spacing-lg;
  border: 1px solid $color-border-light;
  border-radius: $spacing-xs;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: $spacing-xl;
}

button.next-button {
  @include primary-button;
  width: auto;
}

.loading-message, .error-message, .no-appointments-message {
  padding: $spacing-xl;
  background-color: $color-bg-white;
  border: 1px solid $color-border-light;
  border-radius: $spacing-xs;
  margin-top: $spacing-lg;
  color: $color-error;
}

.loading-message {
    color: $color-info;
}

.no-appointments-message {
    text-align: center;
    color: $color-text-medium-grey;
    padding: $spacing-lg;
    border: 1px dashed $color-border-medium;
    border-radius: $spacing-xs;
    margin-top: $spacing-xxl;
}

/* Styling for the appointments grid header */
.appointments-grid-header {
    color: $color-primary-blue;
    font-size: $font-size-lg;
    margin-bottom: $spacing-lg;
    text-align: center;
    width: 100%;
}

/* Appointment Cards Grid Specific Styles */
.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $spacing-xl;
  margin-top: $spacing-md;
  margin-bottom: $spacing-xxl;
}

.appointment-card {
  background-color: $color-bg-white;
  border: 1px solid $color-border-medium;
  border-radius: $spacing-sm;
  padding: $spacing-lg;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  font-size: $font-size-sm;
  color: $color-text-dark;

  .card-header-date, .card-header-time {
    display: flex;
    align-items: center;
    font-weight: bold;
    color: $color-primary-blue;
    font-size: $font-size-lg;
    margin-bottom: $spacing-xs;
    
    i {
      font-size: $font-size-md;
      margin-right: $spacing-xs;
      color: $color-primary-blue;
    }
  }

  .card-header-time {
    margin-bottom: $spacing-lg;
  }

  .card-section {
    width: 100%;
    margin-bottom: $spacing-lg;
    border-top: 1px solid $color-border-light;
    padding-top: $spacing-lg;
  }

  .detail-item-card {
    display: flex;
    align-items: baseline;
    margin-bottom: $spacing-sm;

    strong {
      color: $color-text-dark;
      font-size: $font-size-sm;
      margin-right: $spacing-xs;
      white-space: nowrap;
    }

    span {
      color: $color-text-dark;
      font-size: $font-size-md;
      word-break: break-word;
      flex-grow: 1;
    }

    i {
      font-size: $font-size-md;
      margin-right: $spacing-xs;
      color: $color-text-medium-grey;
    }

    &.full-width-card-detail {
        // Specific styles if needed for full width items within card
    }
  }

  .appointment-status {
    width: 100%;
    text-align: right;
    margin-top: $spacing-md;
    font-weight: bold;
    color: $color-primary-blue;
  }
}

.navigation-buttons {
  margin-top: $spacing-xxl;
  display: flex;
  justify-content: center;
  width: 100%;
  gap: $spacing-md;
}

button.next-button {
  @include primary-button;
  width: auto;
}

.secondary-button {
  @include secondary-button;
  width: auto;
}
</style>