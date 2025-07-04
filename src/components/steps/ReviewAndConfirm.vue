<template>
  <div class="review-and-confirm">
    <div class="step-header">
      <i class="fas fa-check-square step-header-icon"></i> <h2>Step 6: Review & Confirm</h2>
    </div>
    <p>Please review your appointment details below before confirming.</p>

    <div class="summary-section">
      <h3>Appointment Summary</h3>
      <div class="summary-details">
        <div class="detail-item">
          <strong>Service:</strong> <span>{{ bookingDetails.service ? bookingDetails.service.serviceName : 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <strong>Doctor:</strong>
          <span>{{ bookingDetails.doctor ? (bookingDetails.doctor.fullName || `Dr. ${bookingDetails.doctor.firstName} ${bookingDetails.doctor.lastName}`) : 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <strong>Date:</strong>
          <span>{{ formattedDate }}</span>
        </div>
        <div class="detail-item">
          <strong>Time:</strong>
          <span>{{ bookingDetails.time || 'N/A' }}</span>
        </div>
      </div>
    </div>

    <div class="summary-section">
      <h3>Patient Information</h3>
      <div class="summary-details">
        <div class="detail-item">
          <strong>Name:</strong>
          <span>{{ bookingDetails.patientDetails ? bookingDetails.patientDetails.fullName : 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <strong>Date of Birth:</strong>
          <span>{{ bookingDetails.patientDetails ? formattedPatientDOB : 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <strong>Contact:</strong>
          <span>{{ bookingDetails.patientDetails ? bookingDetails.patientDetails.contactNumber : 'N/A' }}</span>
        </div>
        <div class="detail-item">
          <strong>Email:</strong>
          <span>{{ bookingDetails.patientDetails ? bookingDetails.patientDetails.email : 'N/A' }}</span>
        </div>
        <div class="detail-item full-width-detail">
          <strong>Reason for visit:</strong>
          <span>{{ bookingDetails.patientDetails ? (bookingDetails.patientDetails.reasonForVisit || 'N/A') : 'N/A' }}</span>
        </div>
      </div>
    </div>

    <p class="policy-text">By confirming, you agree to our booking policies. A confirmation will be sent via email.</p>

    <div class="navigation-buttons">
      <button @click="emitNavigation('back')" type="button" class="back-button">Back</button>
      <button @click="emitNavigation('confirm')" type="button" class="next-button confirm-button">
        Confirm Appointment
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'ReviewAndConfirm',
  props: {
    bookingDetails: {
      type: Object,
      required: true,
      default: () => ({
        service: null,
        doctor: null,
        date: null,
        time: null,
        patientDetails: null,
      }),
    },
  },
  setup(props, { emit }) {
    const formattedDate = computed(() => {
      if (!props.bookingDetails.date) return 'N/A';
      const date = new Date(props.bookingDetails.date);
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    });

    const formattedPatientDOB = computed(() => {
      if (!props.bookingDetails.patientDetails || !props.bookingDetails.patientDetails.dateOfBirth) return 'N/A';
      const dob = new Date(props.bookingDetails.patientDetails.dateOfBirth);
      const options = { month: '2-digit', day: '2-digit', year: 'numeric' };
      return dob.toLocaleDateString('en-US', options);
    });

    const emitNavigation = (direction) => {
      if (direction === 'confirm') {
        emit('confirm-booking');
      } else if (direction === 'back') {
        emit('navigate-back');
      }
    };

    return {
      formattedDate,
      formattedPatientDOB,
      emitNavigation,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/_common.scss'; // Ensure path is correct for Sass

.review-and-confirm {
  @include step-card-base; // Use mixin
}

.step-header {
  @include step-header-base; // Use mixin
}

.step-header-icon {
  @include step-header-icon-base; // Use mixin
}

/* FONT AWESOME i tag styling */
.step-header-icon i {
  color: $color-text-dark;
}

h2 {
  color: $color-text-dark;
  margin-bottom: $spacing-md;
  font-size: $font-size-xxl;
  line-height: 1.2;
}

p {
  color: $color-text-medium-grey;
  margin-bottom: $spacing-xl;
  font-size: $font-size-md;
  line-height: 1.2;
}

.summary-section {
  background-color: $color-bg-white;
  border: 1px solid $color-border-light;
  border-radius: $spacing-sm; // 8px
  padding: $spacing-lg $spacing-xl; // 15px 20px
  margin-bottom: $spacing-xl; // 20px
}

.summary-section h3 {
  color: $color-text-dark;
  font-size: $font-size-lg; // 1.1em
  margin-top: 0;
  margin-bottom: $spacing-lg; // 15px
  border-bottom: 1px solid $color-border-darker; // #ccc
  padding-bottom: $spacing-md; // 10px
}

.summary-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: $spacing-md $spacing-xl; // 10px 20px
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
  font-weight: normal; // Default to normal weight
  word-break: break-word;
  flex-grow: 1;
  flex-shrink: 1;
}

.detail-item.full-width-detail {
  grid-column: 1 / -1;
}

.policy-text {
  font-size: $font-size-xs; // 0.85em
  color: $color-text-light-grey; // #888
  text-align: center;
  margin-top: $spacing-xl; // 20px
  line-height: 1.4;
}

.navigation-buttons {
  margin-top: $spacing-xxl; // 30px
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.back-button {
  @include secondary-button; // Use mixin
}

.next-button {
  @include primary-button; // Use mixin
}

.confirm-button {
  background-color: $color-confirm-green;
}
.confirm-button:hover {
  background-color: $color-confirm-green-darker;
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
  background-color: #f0f8ff; // Specific light blue hover
  color: $color-primary-blue-darker;
}
</style>