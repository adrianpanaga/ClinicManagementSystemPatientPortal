<template>
  <div class="appointment-booking-wizard">
    <h1>Book Your Appointment</h1>
    <div v-if="currentStep <= totalSteps" class="progress-indicator">
      <div
        v-for="(stepName, index) in stepNames"
        :key="index"
        class="step-item"
        :class="{
          'active': (index + 1) === currentStep,
          'completed': (index + 1) < currentStep
        }"
      >
        <div class="step-label">{{ stepName }}</div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: progressBarWidth }"></div>
      </div>
    </div>

    <!-- Step Content -->
    <div class="wizard-content">
      <KeepAlive>
        <div style="width: 100%;">
          <!-- Step 1: Choose Service -->
          <ChooseService
            v-if="currentStep === 1"
            @service-selected="handleServiceSelected"
          />

          <!-- Step 2: Choose Doctor -->
          <ChooseDoctor
            v-else-if="currentStep === 2"
            @doctor-selected="handleDoctorSelected"
            @navigate-back="prevStep"
          />

          <!-- Step 3: Choose Date -->
          <ChooseDate
            v-else-if="currentStep === 3"
            @date-selected="handleDateSelected"
            @navigate-back="prevStep"
            :initialDate="bookingData.date"
          />

          <!-- Step 4: Choose Time -->
          <ChooseTime
            v-else-if="currentStep === 4"
            @time-selected="handleTimeSelected"
            @navigate-back="prevStep"
            :selectedService="bookingData.service"
            :selectedDoctor="bookingData.doctor"
            :selectedDate="bookingData.date"
          />

          <!-- Step 5: Patient Details -->
          <PatientDetailsForm
            v-else-if="currentStep === 5"
            @patient-details-submitted="handlePatientDetailsSubmitted"
            @navigate-back="prevStep"
            :prefillPatientData="bookingData.patientDetails"
          />

          <!-- Step 6: Review & Confirm -->
          <ReviewAndConfirm
            v-else-if="currentStep === 6"
            @confirm-booking="handleConfirmBooking"
            @navigate-back="prevStep"
            :bookingDetails="bookingData"
          />

          <!-- Step 7: Confirmation Page -->
          <div v-else-if="currentStep === 7" class="confirmation-page">
            <div class="confirmation-header">
              <i class="fas fa-check-circle confirmation-header-icon"></i>
              <h2>Appointment Confirmed!</h2>
            </div>
            <p class="confirmation-subtitle">Your appointment has been successfully booked.</p>

            <div class="appointment-confirmation-summary">
              <div class="confirmation-details-grid">
                <!-- Use common detail-item structure -->
                <div class="detail-item">
                  <strong>Service:</strong>
                  <span>{{ bookingData.service ? bookingData.service.serviceName : 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <strong>Doctor:</strong>
                  <span>{{ bookingData.doctor ? (bookingData.doctor.fullName || `Dr. ${bookingData.doctor.firstName} ${bookingData.doctor.lastName}`) : 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <strong>Date:</strong>
                  <span>{{ formattedConfirmationDate }}</span>
                </div>
                <div class="detail-item">
                  <strong>Time:</strong>
                  <span>{{ bookingData.time || 'N/A' }}</span>
                </div>
                <div class="detail-item">
                  <strong>Patient:</strong>
                  <span>{{ bookingData.patientDetails ? bookingData.patientDetails.fullName : 'N/A' }}</span>
                </div>
                <div class="detail-item full-width-detail">
                  <strong>Reason:</strong>
                  <span>{{ bookingData.patientDetails ? (bookingData.patientDetails.reasonForVisit || 'N/A') : 'N/A' }}</span>
                </div>
              </div>
            </div>

            <p class="confirmation-email-text">A confirmation has been sent to {{ bookingData.patientDetails ? bookingData.patientDetails.email : 'your email' }}.</p>

            <div class="navigation-buttons full-width-buttons">
                <button @click="startOver" class="next-button">Book Another Appointment</button>
                <button @click="viewAllAppointments" class="secondary-button">View All Appointments</button>
            </div>
          </div>
        </div>
      </KeepAlive>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import ChooseService from './steps/ChooseService.vue';
import ChooseDoctor from './steps/ChooseDoctor.vue';
import ChooseDate from './steps/ChooseDate.vue';
import ChooseTime from './steps/ChooseTime.vue';
import PatientDetailsForm from './steps/PatientDetailsForm.vue';
import ReviewAndConfirm from './steps/ReviewAndConfirm.vue';
import { bookAppointment as bookAppointmentApi } from '@/services/api'; 

export default {
  name: 'AppointmentBookingWizard',
  components: {
    ChooseService,
    ChooseDoctor,
    ChooseDate,
    ChooseTime,
    PatientDetailsForm,
    ReviewAndConfirm,
  },
  setup() {
    const currentStep = ref(1);
    const totalSteps = 6;
    const stepNames = ['Service', 'Doctor', 'Date', 'Time', 'Details', 'Confirm'];

    const bookingData = ref({
      service: null, 
      doctor: null,  
      date: null,    
      time: null,    
      patientDetails: null, 
    });

    const bookingError = ref(null);

    const progressBarWidth = computed(() => {
      return `${(currentStep.value / totalSteps) * 100}%`;
    });

    const formattedConfirmationDate = computed(() => {
      if (!bookingData.value.date) return 'N/A';
      const date = new Date(bookingData.value.date);
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    });

    const nextStep = () => {
      if (currentStep.value < totalSteps + 1) {
        currentStep.value++;
      }
    };

    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };

    const handleServiceSelected = (service) => {
      bookingData.value.service = service;
      nextStep();
    };

    const handleDoctorSelected = (doctor) => {
      bookingData.value.doctor = doctor;
      nextStep();
    };

    const handleDateSelected = (date) => {
      bookingData.value.date = date;
      nextStep();
    };

    const handleTimeSelected = (time) => {
      bookingData.value.time = time;
      nextStep();
    };

    const handlePatientDetailsSubmitted = (details) => {
      bookingData.value.patientDetails = details;
      nextStep();
    };

    const handleConfirmBooking = async () => {
        bookingError.value = null; 
        
        const appointmentDateTimeString = `${bookingData.value.date}T${bookingData.value.time}:00`;
        const appointmentDateTime = new Date(appointmentDateTimeString);

        const patientIdFromBooking = bookingData.value.patientDetails?.patientId || null; 

        const payload = {
            serviceId: bookingData.value.service.serviceId,
            doctorId: bookingData.value.doctor ? bookingData.value.doctor.staffId : null,
            appointmentDateTime: appointmentDateTime.toISOString(),
            status: "Scheduled", 
            notes: bookingData.value.patientDetails?.reasonForVisit || null,
            patientId: patientIdFromBooking,
            firstName: bookingData.value.patientDetails?.fullName.split(' ')[0] || null, 
            lastName: bookingData.value.patientDetails?.fullName.split(' ').slice(1).join(' ') || null, 
            email: bookingData.value.patientDetails?.email || null, 
            contactNumber: bookingData.value.patientDetails?.contactNumber || null, 
        };
        
        console.log('Sending payload to backend:', payload);

        try {
          const response = await bookAppointmentApi(payload); 
          
          if (response && response.doctor) {
            bookingData.value.doctor = response.doctor; 
          } else {
            console.warn("Booking successful, but no assigned doctor details in response.");
          }
          
          nextStep(); 
        } catch (error) {
          console.error("Appointment booking failed:", error);
          bookingError.value = error.response?.data?.message || 'Failed to book appointment. Please try again.';
        }
    };

    const startOver = () => {
        currentStep.value = 1;
        bookingData.value = {
            service: null,
            doctor: null,
            date: null,
            time: null,
            patientDetails: null,
        };
        bookingError.value = null;
    };

    const viewAllAppointments = () => {
        console.log("Navigating to view all appointments...");
    };


    return {
      currentStep,
      totalSteps,
      stepNames,
      bookingData,
      bookingError,
      progressBarWidth,
      formattedConfirmationDate, 
      nextStep,
      prevStep,
      handleServiceSelected,
      handleDoctorSelected,
      handleDateSelected,
      handleTimeSelected,
      handlePatientDetailsSubmitted,
      handleConfirmBooking,
      startOver,
      viewAllAppointments,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/_common.scss';

.appointment-booking-wizard {
  font-family: 'PT Sans', sans-serif;
  width: 80vw;
  margin: $spacing-md auto; 
  padding: $spacing-xxl; 
  background-color: $color-bg-white; 
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  display: block;
  text-align: left;
}

h1 {
  color: $color-text-dark; 
  margin-bottom: $spacing-lg; 
  font-size: $font-size-xxxxxl; 
  text-align: center;
}

.progress-indicator {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 70%; 
  margin: 0 auto $spacing-lg auto; 
  padding: 0;
  position: relative;
  height: 60px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
  padding: 0 $spacing-md; 
}

.step-label {
  font-size: $font-size-sm; 
  color: $color-text-dark; 
  white-space: nowrap;
  text-align: center;
  transition: color 0.3s ease, font-weight 0.3s ease;
  margin-top: $spacing-lg; 
}

.step-item.active .step-label {
  color: $color-primary-blue; 
  font-weight: bold;
}

.step-item.completed .step-label {
  color: $color-text-dark; 
  font-weight: normal;
}

.progress-bar-container {
  position: absolute;
  height: $spacing-sm; 
  background-color: $color-bg-light-grey-alt; 
  width: 100%;
  left: 0;
  top: 0;
  border-radius: $spacing-xs; 
  z-index: 1;
}

.progress-bar {
  height: 100%;
  background-color: $color-primary-blue; 
  border-radius: $spacing-xs; 
  transition: width 0.4s ease-in-out;
}

.wizard-content {
  background-color: #fcfcfc; 
  border: 1px solid $color-border-light; 
  border-radius: 8px; 
  padding: $spacing-xxl; 
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* PlaceHolder Step Styles (matching general step card styles for consistency) */
.placeholder-step {
  @include step-card-base; 
  padding: $spacing-lg $spacing-xl; 
  background-color: $color-bg-light; 
  border: 1px solid $color-border-medium; 
}

.placeholder-step h2 {
  color: $color-text-dark; 
  margin-bottom: $spacing-md; 
  font-size: $font-size-xxl; 
  line-height: 1.2;
}

.placeholder-step p {
  color: $color-text-medium-grey; 
  margin-bottom: $spacing-xl; 
  font-size: $font-size-sm; 
  line-height: 1.2;
}

.navigation-buttons {
  margin-top: $spacing-xxl; 
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.back-button {
  @include secondary-button; 
}

.next-button {
  @include primary-button; 
}

/* Secondary Button Styling (general, will be overridden by specifics) */
.secondary-button {
  background-color: $color-bg-white;
  color: $color-primary-blue;
  border: 1px solid $color-primary-blue;
  padding: $spacing-md $spacing-xl;
  border-radius: $spacing-xs;
  font-size: $font-size-md;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.secondary-button:hover {
  background-color: #f0f8ff; 
  color: $color-primary-blue-darker;
}


/* MODIFIED: Confirmation Page Styles */
.confirmation-page {
  @include step-card-base; 
  padding: $spacing-xl; 
  background-color: $color-bg-white; 
  border: 1px solid $color-border-medium; 
  max-width: 500px; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.confirmation-header {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: $spacing-md; 
}

.confirmation-header-icon {
  font-size: $font-size-xxxxl; 
  color: $color-primary-blue; 
  margin-right: $spacing-md; 
}

.confirmation-page h2 {
  color: $color-primary-blue; 
  margin-top: 0;
  margin-bottom: 0;
  font-size: $font-size-xxxxl; 
  line-height: 1.2;
}

.confirmation-subtitle {
  color: $color-text-medium-grey; 
  margin-top: 0;
  margin-bottom: $spacing-xl; 
  font-size: $font-size-md; 
  line-height: 1.4;
  text-align: center;
}

.appointment-confirmation-summary {
  background-color: #f5f5f5; 
  border-radius: 6px; 
  padding: $spacing-lg $spacing-xl; 
  width: 100%;
  box-sizing: border-box;
  margin-bottom: $spacing-xl; 
}

.confirmation-details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: $spacing-md $spacing-lg; 
}

.detail-item {
  @include detail-item-base; // Use mixin
  margin-bottom: $spacing-sm; // 8px
}

.detail-item strong {
  color: $color-text-dark;
  font-size: $font-size-md; // 1em
  margin-right: $spacing-xs; // 5px
  white-space: nowrap;
  flex-grow: 0;
  flex-shrink: 0;
}

.detail-item span {
  color: $color-text-dark;
  font-size: $font-size-md; // 1em
  font-weight: normal;
  word-break: break-word;
  flex-grow: 1;
  flex-shrink: 1;
}

.detail-item.full-width-detail {
  grid-column: 1 / -1;
}

.confirmation-email-text {
  font-size: $font-size-sm; // 0.95em (closest to 0.9em)
  color: $color-text-dark; // #333
  text-align: center;
  margin-top: $spacing-lg; // 15px
  line-height: 1.4;
}

.navigation-buttons {
  margin-top: $spacing-xxl; // 30px
  display: flex;
  flex-direction: column; // Stack buttons vertically
  gap: $spacing-md; // 10px
  width: 100%;
}

.navigation-buttons .next-button {
  @include primary-button;
  width: 100%;
}

.navigation-buttons .secondary-button {
  @include secondary-button;
  width: 100%;
  background-color: $color-bg-white;
  color: $color-primary-blue;
  border: 1px solid $color-primary-blue;
}

.navigation-buttons .secondary-button:hover {
  background-color: #f0f8ff;
  color: $color-primary-blue-darker;
}

/* Specific override for Confirm button */
.confirm-button {
  background-color: $color-confirm-green;
}
.confirm-button:hover {
  background-color: $color-confirm-green-darker;
}
</style>