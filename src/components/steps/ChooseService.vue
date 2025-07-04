<template>
  <div class="choose-service">
    <div class="step-header">
      <i class="fas fa-calendar-check step-header-icon"></i> <h2>Step 1: Choose a Service</h2>
    </div>
    <p>Please select the type of service you need.</p>

    <div v-if="loading" class="loading-message">
      Loading services...
    </div>
    <div v-else-if="error" class="error-message">
      Error loading services: {{ error }}
    </div>
    <div v-else class="service-list">
      <div
        v-for="service in services"
        :key="service.serviceId"
        class="service-card"
        :class="{ 'selected': selectedService && selectedService.serviceId === service.serviceId }"
        @click="selectService(service)"
      >
        <div class="service-icon">
          <i v-if="service.serviceId === 1" class="fas fa-stethoscope"></i>
          <i v-else-if="service.serviceId === 2" class="fas fa-head-side-cough"></i> 
          <i v-else-if="service.serviceId === 3" class="fas fa-syringe"></i>
          <i v-else-if="service.serviceId === 4 || service.serviceId === 5" class="fas fa-heartbeat"></i>
          <i v-else-if="service.serviceId === 6" class="fas fa-face-flushed"></i>
          <i v-else-if="service.serviceId === 7" class="fas fa-bone"></i>
          <i v-else-if="service.serviceId === 8" class="fas fa-person-walking"></i>
          <i v-else-if="service.serviceId === 9" class="fas fa-shoe-prints"></i>
          <i v-else-if="service.serviceId === 10" class="fas fa-ear-listen"></i>
          <i v-else-if="service.serviceId === 11" class="fas fa-baby"></i>
          <i v-else-if="service.serviceId === 12" class="fas fa-eye"></i>
          <i v-else-if="service.serviceId === 13" class="fas fa-tooth"></i>
          <i v-else-if="service.serviceId === 14" class="fas fa-brain"></i>
          <i v-else-if="service.serviceId === 15" class="fas fa-hand-holding-heart"></i>
          <i v-else-if="service.serviceId === 16" class="fas fa-flask"></i>
          <i v-else class="fas fa-clipboard-check"></i> </div>
        <h3>{{ service.serviceName }}</h3>
        <p v-if="service.description">{{ service.description }}</p>
      </div>
      <div v-if="!services || services.length === 0" class="no-services">
        No services available at this time. Please check back later.
      </div>
    </div>

    <div class="navigation-buttons">
      <button ref="nextButton" @click="emitSelection" :disabled="!selectedService" class="next-button">
        Next
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { getServices } from '@/services/api';

export default {
  name: 'ChooseService',
  setup(props, { emit }) {
    const services = ref([]);
    const selectedService = ref(null);
    const loading = ref(true);
    const error = ref(null);

    const nextButton = ref(null);

    const fetchServices = async () => {
      try {
        loading.value = true;
        error.value = null;
        const data = await getServices();
        services.value = data;
      } catch (err) {
        error.value = err.message || 'Failed to fetch services.';
      } finally {
        loading.value = false;
      }
    };

    const selectService = (service) => {
      selectedService.value = service;
      if (nextButton.value) {
        nextButton.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    const emitSelection = () => {
      if (selectedService.value) {
        emit('service-selected', selectedService.value);
      }
    };

    onMounted(fetchServices);

    return {
      services,
      selectedService,
      loading,
      error,
      nextButton,
      selectService,
      emitSelection,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../assets/styles/_common.scss'; // NEW: Import common styles

.choose-service {
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
  color: $color-text-dark; // Use variable
}


h2 {
  color: $color-text-dark; // Use variable
  margin-top: 0;
  margin-bottom: 0;
  font-size: $font-size-xxl; // Use variable
  line-height: 1.2;
}

p {
  color: $color-text-medium-grey; // Use variable
  margin-top: 0;
  margin-bottom: $spacing-xl; // Use variable
  font-size: $font-size-md; // Use variable
  line-height: 1.2;
}

.loading-message, .error-message, .no-services {
  padding: $spacing-xl; // 20px
  background-color: $color-bg-white; // white
  border: 1px solid $color-border-light; // #ddd
  border-radius: 5px; // Not in variables
  margin-top: $spacing-lg; // 15px
  color: $color-error; // Use variable
}

.loading-message {
    color: $color-info; // Use variable
}

.service-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: $spacing-lg; // 15px
  margin-top: $spacing-xl; // 20px
}

.service-card {
  background-color: $color-bg-white; // white
  border: 1px solid $color-border-medium; // #e0e0e0
  border-radius: 8px; // Not in variables
  padding: $spacing-lg; // 15px
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 140px; // Fixed height
}

.service-card:hover {
  border-color: $color-primary-blue; // Use variable
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
  transform: translateY(-3px);
}

.service-card.selected {
  border-color: $color-bg-white; // white
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
  background-color: $color-primary-blue; // Use variable
}

.service-icon {
  width: 50px; // Not in variables
  height: 50px; // Not in variables
  background-color: transparent;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: $spacing-xs; // 5px
}

/* FONT AWESOME i tag styling */
.service-icon i {
  color: $color-text-dark; // Use variable
  font-size: $font-size-xl; // 1.2em
}


.service-card h3 {
  color: $color-text-dark; // Use variable
  margin-top: 0;
  margin-bottom: $spacing-xs; // 5px
  font-size: $font-size-xl; // 1.2em
  font-weight: 500;
}

.service-card p {
  color: $color-text-medium-grey; // Use variable
  font-size: $font-size-sm; // 0.9em
  line-height: 1.2;
  margin-bottom: 0;
  flex-grow: 1;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  display: box;
  box-orient: vertical;
  line-clamp: 3;
}

/* MODIFIED: Icon color for selected service card */
.service-card.selected .service-icon i {
  color: $color-bg-white; // white
}

.service-card.selected h3 {
  color: $color-bg-white; // white
}

.service-card.selected p {
    color: $color-bg-white; // white
}

.navigation-buttons {
  margin-top: $spacing-xxl; // 30px
  text-align: right;
}

.next-button {
  @include primary-button; // Use mixin
}

.next-button:hover:not(:disabled) {
  background-color: $color-primary-blue-darker; // Use variable
}

.next-button:disabled {
  background-color: $color-bg-light-grey-alt; // Use variable
}
</style>