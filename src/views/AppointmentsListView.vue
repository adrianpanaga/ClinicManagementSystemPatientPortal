<template>
  <div class="appointments-list-view">
    <div class="step-header">
      <i class="fas fa-list-alt step-header-icon"></i>
      <h2>My Appointments</h2>
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
    
    <div v-else-if="appointments.length > 0"> 
      <h3 class="appointments-grid-header">Your Appointments {{ patientDisplayName ? `for ${patientDisplayName}` : '' }} ({{ appointments.length }})</h3>
      <div class="appointments-grid">
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
    </div>
    <div v-else class="no-appointments-message">
      No appointments found {{ patientDisplayName ? `for ${patientDisplayName}` : '' }}. Please verify your contact information or book a new appointment.
    </div>

    <div class="navigation-buttons full-width-buttons">
      <button @click="navigateToBooking" class="next-button">Book a New Appointment</button>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { getAppointmentsByPatientContact, getAppointmentsByPatientId } from '@/services/api'; 
import { useRouter, useRoute } from 'vue-router';

export default {
  name: 'AppointmentsListView',
  props: {
    patientId: { type: [Number, String], default: null },
    contact: { type: String, default: '' },
    email: { type: String, default: '' },
    patientFullName: { type: String, default: '' },
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
    const initialFetchAttempted = ref(false); 

    const hasInitialQueryParams = computed(() => {
        return !!(props.patientId || props.contact || props.email);
    });

    const patientDisplayName = computed(() => {
        if (props.patientFullName) return props.patientFullName;
        if (props.email) return props.email;
        if (lookupDetails.email) return lookupDetails.email;
        if (props.contact) return props.contact; // Added fallback for contact display if no email
        if (lookupDetails.contactNumber) return lookupDetails.contactNumber;
        return '';
    });

    const isLookupFormValid = computed(() => {
      return lookupDetails.contactNumber.trim() !== '' &&
             lookupDetails.email.trim() !== '';
    });

    const fetchAppointments = async () => {
      console.log("--- fetchAppointments started ---");
      console.log("Props:", props.patientId, props.contact, props.email);
      console.log("Lookup Details (form):", lookupDetails.contactNumber, lookupDetails.email);

      loading.value = true;
      error.value = null;
      appointments.value = []; 
      initialFetchAttempted.value = true;

      let contactToUse;
      let emailToUse;
      let patientIdToUse = props.patientId; 

      if (props.contact && props.email) {
        contactToUse = props.contact;
        emailToUse = props.email;
      } else if (route.query.contact && route.query.email && hasInitialQueryParams.value) { 
        contactToUse = route.query.contact;
        emailToUse = route.query.email;
      } else { 
        contactToUse = lookupDetails.contactNumber;
        emailToUse = lookupDetails.email;
      }
      
      if (!patientIdToUse && (!contactToUse || contactToUse.trim() === '' || !emailToUse || emailToUse.trim() === '')) {
          error.value = 'Contact number and email are required.';
          loading.value = false;
          console.log("Validation failed in fetchAppointments. PatientId:", patientIdToUse, "Contact:", contactToUse, "Email:", emailToUse);
          return;
      }
      
      try {
        let response;
        if (patientIdToUse) {
            console.log("Calling getAppointmentsByPatientId with:", patientIdToUse);
            response = await getAppointmentsByPatientId(patientIdToUse);
        } else {
            console.log("Calling getAppointmentsByPatientContact with:", contactToUse, emailToUse);
            response = await getAppointmentsByPatientContact({ contactNumber: contactToUse, email: emailToUse });
        }
        
        console.log("Raw API response in frontend:", response); // CRUCIAL LOG
        appointments.value = response;
        console.log("Appointments array after assignment:", appointments.value); // CRUCIAL LOG
        console.log("Appointments.value.length:", appointments.value.length); // CRUCIAL LOG

      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to retrieve appointments.';
        console.error("Error fetching appointments:", err);
      } finally {
        loading.value = false;
        console.log("--- fetchAppointments finished ---");
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
        initialFetchAttempted.value = false;
        appointments.value = [];
        error.value = null;
    };

    onMounted(() => {
        console.log("AppointmentsListView Mounted. Initial props:", props.patientId, props.contact, props.email);
        if (hasInitialQueryParams.value) {
            fetchAppointments();
        }
    });
    
    // Watch for prop changes if component stays mounted across route query changes (less common)
    watch([() => props.patientId, () => props.contact, () => props.email], (newVal, oldVal) => {
      if (newVal.some((val, i) => val !== oldVal[i])) { // Only refetch if identity changed
        console.log("AppointmentsListView Props changed. Re-fetching.");
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
  max-width: 800px; // Wider to accommodate card content
  padding: $spacing-xl; // 20px
}

.step-header {
  @include step-header-base;
  justify-content: flex-start; // Align to start
  margin-bottom: $spacing-xs; // 5px
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
  margin-bottom: $spacing-xl; // 20px
}

/* Patient Lookup Form - Hide it */
.patient-lookup-form {
  display: none; // HIDE THE FORM - Access is now protected by router guard
}

.loading-message, .error-message, .no-appointments-message {
  padding: $spacing-xl;
  background-color: $color-bg-white;
  border: 1px solid $color-border-light;
  border-radius: $spacing-xs;
  margin-top: $spacing-lg;
  color: $color-error; // Default to error color
  text-align: center;
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

.navigation-link { /* For "Go to Verification Page" link in error/no-appointments */
    margin-top: $spacing-md;
    text-align: center;
    a {
        color: $color-primary-blue;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
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
  gap: $spacing-xl; // 20px gap between cards
  margin-top: $spacing-md; // Reduced margin-top as header is now outside
  margin-bottom: $spacing-xxl;
}

.appointment-card {
  background-color: $color-bg-white;
  border: 1px solid $color-border-medium;
  border-radius: $spacing-sm; // 8px
  padding: $spacing-lg; // 15px
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  font-size: $font-size-sm; // 0.9em
  color: $color-text-dark;

  .card-header-date, .card-header-time {
    display: flex;
    align-items: center;
    font-weight: bold;
    color: $color-primary-blue;
    font-size: $font-size-lg; // 1.1em
    margin-bottom: $spacing-xs; // 5px
    
    i { // Icon
      font-size: $font-size-md; // 1em
      margin-right: $spacing-xs; // 5px
      color: $color-primary-blue;
    }
  }

  .card-header-time {
    margin-bottom: $spacing-lg; // 15px space below time header
  }

  .card-section {
    width: 100%;
    margin-bottom: $spacing-lg; // 15px space between sections
    border-top: 1px solid $color-border-light; // Separator line
    padding-top: $spacing-lg; // 15px
  }

  .detail-item-card { // Reusing concept from review/confirm
    display: flex;
    align-items: baseline; // Align text by baseline
    margin-bottom: $spacing-sm; // 8px between details

    strong {
      color: $color-text-dark;
      font-size: $font-size-sm; // 0.9em
      margin-right: $spacing-xs; // 5px
      white-space: nowrap; // Keep label on one line
    }

    span {
      color: $color-text-dark;
      font-size: $font-size-md; // 1em
      word-break: break-word; // Allow values to break
      flex-grow: 1; // Allow value to take space
    }

    i { // Icon within detail item
      font-size: $font-size-md;
      margin-right: $spacing-xs;
      color: $color-text-medium-grey;
    }

    // &.full-width-card-detail {
    //     // Specific styles if needed for full width items within card
    // }
  }

  .appointment-status {
    width: 100%;
    text-align: right; // Status aligned right
    margin-top: $spacing-md; // 10px
    font-weight: bold;
    color: $color-primary-blue; // Example status color
  }
}

.navigation-buttons {
  margin-top: $spacing-xxl;
  display: flex;
  justify-content: center; // Center buttons at the bottom
  width: 100%;
  gap: $spacing-md; // 10px between buttons
}

button.next-button { // For "Book a New Appointment"
  @include primary-button;
  width: auto; // Auto width for this specific button
}

.secondary-button {
  @include secondary-button; // Use mixin
  width: auto; // Auto width for this specific button
}
</style>