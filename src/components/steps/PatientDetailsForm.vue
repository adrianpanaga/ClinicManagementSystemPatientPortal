<template>
  <div class="patient-details-form">
    <div class="step-header">
      <i class="fas fa-user-circle step-header-icon"></i> <h2>Step 5: Patient Details</h2>
    </div>
    <p>Please provide your information.</p>

    <form @submit.prevent="emitSubmission" class="details-form">
      <div class="form-row">
        <div class="form-group">
          <label for="fullName"><i class="fas fa-user label-icon"></i> Full Name</label>
          <input
            type="text"
            id="fullName"
            v-model="patientDetails.fullName"
            required
            placeholder="John Doe" :disabled="isPreFilled.fullName"
          />
        </div>
        <div class="form-group">
          <label for="dateOfBirth"><i class="fas fa-calendar-alt label-icon"></i> Date of Birth</label>
          <input
            type="date"
            id="dateOfBirth"
            v-model="patientDetails.dateOfBirth"
            required
            placeholder="dd/mm/yyyy" :disabled="isPreFilled.dateOfBirth"
          />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="contactNumber"><i class="fas fa-phone label-icon"></i> Contact Number</label>
          <input
            type="tel"
            id="contactNumber"
            v-model="patientDetails.contactNumber"
            required
            placeholder="(123) 456-7890" :disabled="isPreFilled.contactNumber"
          />
        </div>
        <div class="form-group">
          <label for="email"><i class="fas fa-envelope label-icon"></i> Email Address</label>
          <input
            type="email"
            id="email"
            v-model="patientDetails.email"
            required
            placeholder="john.doe@example.com" :disabled="isPreFilled.email"
          />
        </div>
      </div>

      <div class="form-group full-width">
        <label for="reasonForVisit"><i class="fas fa-sticky-note label-icon"></i> Reason for visit (Optional)</label>
        <textarea
          id="reasonForVisit"
          v-model="patientDetails.reasonForVisit"
          rows="3"
          placeholder="e.g., Annual check-up, persistent cough, etc."
        ></textarea>
      </div>

      <div class="navigation-buttons">
        <button @click="emitNavigation('back')" type="button" class="back-button">Back</button>
        <button type="submit" :disabled="!isFormValid" class="next-button">
          Next
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';

export default {
  name: 'PatientDetailsForm',
  props: {
    prefillPatientData: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const patientDetails = reactive({
      fullName: '',
      dateOfBirth: '',
      contactNumber: '',
      email: '',
      reasonForVisit: '',
    });

    const isPreFilled = reactive({
      fullName: false,
      dateOfBirth: false,
      contactNumber: false,
      email: false,
    });

    const applyPrefill = () => {
      if (!props.prefillPatientData) {
        return;
      }

      if (props.prefillPatientData.fullName) {
        patientDetails.fullName = props.prefillPatientData.fullName;
        isPreFilled.fullName = true;
      }
      if (props.prefillPatientData.dateOfBirth) {
        patientDetails.dateOfBirth = new Date(props.prefillPatientData.dateOfBirth).toISOString().split('T')[0];
        isPreFilled.dateOfBirth = true;
      }
      if (props.prefillPatientData.contactNumber) {
        patientDetails.contactNumber = props.prefillPatientData.contactNumber;
        isPreFilled.contactNumber = true;
      }
      if (props.prefillPatientData.email) {
        patientDetails.email = props.prefillPatientData.email;
        isPreFilled.email = true;
      }
    };

    watch(() => props.prefillPatientData, applyPrefill, { immediate: true });

    const isFormValid = computed(() => {
      return patientDetails.fullName.trim() !== '' &&
             patientDetails.dateOfBirth.trim() !== '' &&
             patientDetails.contactNumber.trim() !== '' &&
             patientDetails.email.trim() !== '';
    });

    const emitSubmission = () => {
      if (isFormValid.value) {
        emit('patient-details-submitted', { ...patientDetails });
      }
    };

    const emitNavigation = (direction) => {
      if (direction === 'back') {
        emit('navigate-back');
      }
    };

    return {
      patientDetails,
      isPreFilled,
      isFormValid,
      emitSubmission,
      emitNavigation,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/_common.scss'; // Ensure path is correct for Sass

.patient-details-form {
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
  margin-top: 0;
  margin-bottom: $spacing-xl;
  font-size: $font-size-md;
  line-height: 1.2;
}

/* Form Specific Styles */
.details-form {
  margin-top: $spacing-xl; // 20px
}

.form-row {
  display: flex;
  gap: $spacing-xl; // 20px
  margin-bottom: $spacing-lg; // 15px
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
    flex: none;
    width: 100%;
}

/* MODIFIED: Label styling */
label {
  font-size: $font-size-sm; // 0.9em
  color: $color-text-dark; // #333
  margin-bottom: $spacing-xs; // 5px
  font-weight: bold;
  display: flex;
  align-items: center;
}

/* NEW: Icon next to label styling */
.label-icon {
  font-size: $font-size-md; // 1em
  margin-right: $spacing-sm; // 8px
  color: $color-text-medium-grey; // #555
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="date"],
textarea {
  padding: $spacing-md $spacing-lg; // 10px 12px
  border: 1px solid $color-border-light; // #ddd
  border-radius: $spacing-xs; // 5px
  font-size: $font-size-md; // 1em
  color: $color-text-dark; // #333
  background-color: $color-bg-white; // white
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus,
textarea:focus {
  border-color: $color-primary-blue; // #469efc
  box-shadow: 0 0 0 $spacing-xxs rgba(70, 158, 252, 0.2); // 2px
  outline: none;
}

input:disabled,
textarea:disabled {
  background-color: $color-bg-light; // #f0f0f0
  color: $color-text-light-grey; // #888
  cursor: not-allowed;
}

/* Consistent Navigation Buttons */
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
</style>