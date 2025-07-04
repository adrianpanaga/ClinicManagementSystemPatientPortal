<template>
  <div class="choose-doctor">
    <div class="step-header">
      <i class="fas fa-user-doctor step-header-icon"></i> <h2>Step 2: Choose a Doctor</h2>
    </div>
    <p>Select a specific doctor or choose "Any Available Doctor".</p>

    <div v-if="loading" class="loading-message">
      Loading doctors...
    </div>
    <div v-else-if="error" class="error-message">
      Error loading doctors: {{ error }}
    </div>
    <div v-else class="doctor-list">
      <div
        class="doctor-card"
        :class="{ 'selected': selectedDoctor === null }"
        @click="selectDoctor(null)"
      >
        <div class="doctor-avatar">
          <i class="fas fa-users"></i>
        </div>
        <h3>Any Available Doctor</h3>
        <p class="any-doctor-description">Choose this option if you don't have a specific preference.</p>
      </div>

      <div
        v-for="doctor in doctors"
        :key="doctor.staffId"
        class="doctor-card"
        :class="{ 'selected': selectedDoctor && selectedDoctor.staffId === doctor.staffId }"
        @click="selectDoctor(doctor)"
      >
        <div class="doctor-avatar">
          <i class="fas fa-user-md"></i> </div>
        <h3>Dr. {{ doctor.firstName }} {{ doctor.lastName }}</h3>
        <p v-if="doctor.specialization" class="doctor-detail">Specialization: {{ doctor.specialization }}</p>
      </div>
      <div v-if="!doctors || doctors.length === 0" class="no-doctors">
        No specialist doctors available at this time. Please select "Any Available Doctor".
      </div>
    </div>

    <div class="navigation-buttons">
      <button @click="emitNavigation('back')" class="back-button">Back</button>
      <button ref="nextButton" @click="emitNavigation('next')" :disabled="selectedDoctor === undefined" class="next-button">
        Next
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getDoctors } from '@/services/api';

export default {
  name: 'ChooseDoctor',
  props: {
    // selectedService: Object // No longer needed as backend filters doctors directly
  },
  setup(props, { emit }) {
    const doctors = ref([]);
    const selectedDoctor = ref(undefined);
    const loading = ref(true);
    const error = ref(null);

    const nextButton = ref(null);

    const fetchDoctors = async () => {
      try {
        loading.value = true;
        error.value = null;
        const data = await getDoctors(); 
        doctors.value = data;
      } catch (err) {
        error.value = err.message || 'Failed to fetch doctors.';
      } finally {
        loading.value = false;
      }
    };

    const selectDoctor = (doctor) => {
      selectedDoctor.value = doctor;
      if (nextButton.value) {
        nextButton.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    const emitNavigation = (direction) => {
      if (direction === 'next' && selectedDoctor.value !== undefined) {
        emit('doctor-selected', selectedDoctor.value);
      } else if (direction === 'back') {
        emit('navigate-back');
      }
    };

    onMounted(fetchDoctors);

    return {
      doctors,
      selectedDoctor,
      loading,
      error,
      nextButton,
      selectDoctor,
      emitNavigation,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/_common.scss'; // NEW: Import common styles

.choose-doctor {
  @include step-card-base; // Use mixin
}

.step-header {
  @include step-header-base; // Use mixin
}

.step-header-icon {
  @include step-header-icon-base; // Use mixin
  margin-top: $spacing-md; // 10px (User's specific adjustment)
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

.loading-message, .error-message, .no-doctors {
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

.doctor-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: $spacing-lg;
  margin-top: $spacing-xl;
}

.doctor-card {
  background-color: $color-bg-white;
  border: 1px solid $color-border-medium;
  border-radius: $spacing-sm; // 8px
  padding: $spacing-md; // 10px
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  height: 140px;
}

.doctor-card:hover {
  border-color: $color-primary-blue;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
  transform: translateY(-3px);
}

.doctor-card.selected {
  border-color: $color-primary-blue; // #469efc
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
  background-color: $color-primary-blue; // #469efc
}

.doctor-avatar {
  width: 50px;
  height: 50px;
  background-color: transparent;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: $spacing-xs; // 5px
}

/* FONT AWESOME i tag styling */
.doctor-avatar i {
  font-size: $font-size-xl;
  color: $color-text-dark;
}

.doctor-card.selected .doctor-avatar i {
  color: $color-bg-white; // white
}

.doctor-card h3 {
  color: $color-text-dark;
  margin-top: 0;
  margin-bottom: $spacing-xxs; // 2px (adjusted by user)
  font-size: $font-size-xl;
  font-weight: 500;
}

.doctor-card p {
  color: $color-text-medium-grey;
  font-size: $font-size-sm;
  line-height: 1.2;
  margin: 0;
  flex-grow: 0; 

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  display: box;
  box-orient: vertical;
  line-clamp: 2;
}

p.any-doctor-description {
  white-space: normal;
  line-height: 1.2;
  margin-bottom: 0;
  flex-grow: 1;
  -webkit-line-clamp: unset;
  line-clamp: unset;
}

.doctor-card.selected h3 {
  color: $color-bg-white;
}

.doctor-card.selected p {
  color: $color-bg-white;
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

/* Secondary Button Styling */
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
</style>