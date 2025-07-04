<template>
  <div class="choose-time">
    <div class="step-header">
      <i class="fas fa-clock step-header-icon"></i> <h2>Step 4: Select a Time</h2>
    </div>
    <p>Available slots for {{ formattedSelectedDate }}</p>

    <div v-if="loading" class="loading-message">
      Loading available times...
    </div>
    <div v-else-if="error" class="error-message">
      Error loading times: {{ error }}
    </div>
    <div v-else class="time-slots-grid">
      <button
        v-for="timeSlot in availableTimeSlots"
        :key="timeSlot"
        class="time-slot-button"
        :class="{ 'selected': selectedTime === timeSlot }"
        @click="selectTime(timeSlot)"
      >
        {{ timeSlot }}
      </button>
      <div v-if="!availableTimeSlots || availableTimeSlots.length === 0" class="no-slots">
        No available time slots for this date.
      </div>
    </div>

    <div class="navigation-buttons">
      <button @click="emitNavigation('back')" class="back-button">Back</button>
      <button @click="emitNavigation('next')" :disabled="!selectedTime" class="next-button">
        Next
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import { getAvailableSlots } from '@/services/api'; 

export default {
  name: 'ChooseTime',
  props: {
    selectedService: {
      type: Object,
      required: true,
    },
    selectedDoctor: {
      type: Object,
      default: null,
    },
    selectedDate: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const availableTimeSlots = ref([]);
    const selectedTime = ref(null);
    const loading = ref(false);
    const error = ref(null);

    const formattedSelectedDate = computed(() => {
      if (!props.selectedDate) return '';
      const date = new Date(props.selectedDate);
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    });

    const fetchAvailableSlots = async () => {
      if (!props.selectedService || !props.selectedDate) {
        error.value = 'Service and date must be selected.';
        return;
      }

      loading.value = true;
      error.value = null;
      try {
        const params = {
          serviceId: props.selectedService.serviceId,
          doctorId: props.selectedDoctor ? props.selectedDoctor.staffId : null,
          date: props.selectedDate,
        };
        const slots = await getAvailableSlots(params);
        availableTimeSlots.value = slots;
      } catch (err) {
        error.value = err.message || 'Failed to retrieve available time slots.';
        console.error("Error fetching available slots:", err);
        availableTimeSlots.value = [];
      } finally {
        loading.value = false;
      }
    };

    const selectTime = (time) => {
      selectedTime.value = time;
    };

    const emitNavigation = (direction) => {
      if (direction === 'next' && selectedTime.value) {
        emit('time-selected', selectedTime.value);
      } else if (direction === 'back') {
        emit('navigate-back');
      }
    };

    watch([() => props.selectedService, () => props.selectedDoctor, () => props.selectedDate], () => {
      fetchAvailableSlots();
      selectedTime.value = null;
    }, { immediate: true });

    return {
      availableTimeSlots,
      selectedTime,
      loading,
      error,
      formattedSelectedDate,
      selectTime,
      emitNavigation,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/_common.scss'; // Ensure path is correct for Sass

.choose-time {
  @include step-card-base; // Use mixin
  width: 40%; /* CHANGED: Reduced width from 70% to 60% */
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

.loading-message, .error-message, .no-slots {
  padding: $spacing-xl;
  background-color: $color-bg-white;
  border: 1px solid $color-border-light;
  border-radius: $spacing-xs; // 5px
  margin-top: $spacing-lg;
  color: $color-error;
}

.loading-message {
    color: $color-info;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); // Width was 100px here
  gap: $spacing-md; // 10px
  margin-top: $spacing-xl; // 20px
  justify-content: center;
}

.time-slot-button {
  background-color: $color-bg-white;
  border: 1px solid $color-border-medium;
  border-radius: $spacing-xs; // 5px
  padding: $spacing-md $spacing-lg; // 10px 15px
  font-size: $font-size-md; // 1em
  color: $color-text-dark;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 100px; // Width was 100px here
  text-align: center;
  outline: none;
}

.time-slot-button:hover {
  border-color: $color-primary-blue;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
  transform: translateY(-1px);
}

.time-slot-button.selected {
  border-color: $color-primary-blue;
  box-shadow: 0 2px 15px rgba(40, 167, 69, 0.2); // Specific shadow for selected
  background-color: $color-primary-blue;
  color: $color-bg-white;
  font-weight: bold;
}

.navigation-buttons {
  margin-top: $spacing-xxl;
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