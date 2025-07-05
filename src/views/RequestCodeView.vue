<template>
  <div class="request-code-view">
    <div class="step-header">
      <i class="fas fa-key step-header-icon"></i> <h2>Request Verification Code</h2>
    </div>
    <p>Please enter your contact details to receive a verification code.</p>

    <form @submit.prevent="onRequestCode" class="verification-form">
      <div class="form-group">
        <label for="contact"><i class="fas fa-user-alt label-icon"></i> Contact Number / Email</label>
        <input
          type="text"
          id="contact"
          v-model="contact"
          required
          placeholder="e.g., 09123456789 or your@email.com"
        />
      </div>
      <div class="form-group">
        <label for="method"><i class="fas fa-paper-plane label-icon"></i> Receive code via:</label>
        <select id="method" v-model="method" required>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
      </div>
      <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <button type="submit" :disabled="loading" class="next-button">
        {{ loading ? 'Sending Code...' : 'Request Code' }}
      </button>
    </form>
    <div class="navigation-link">
        <a href="#" @click.prevent="navigateToBooking">Book a New Appointment</a>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { requestVerificationCode } from '@/services/api';
import { useRouter, useRoute } from 'vue-router'; // Import useRouter and useRoute

export default {
  name: 'RequestCodeView',
  setup() {
    const router = useRouter();
    const route = useRoute();

    const contact = ref('');
    const method = ref('email');
    const loading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');

    // Function to pre-fill contact from URL query params (e.g., from confirmation page)
    const prefillFromUrl = () => {
      if (route.query.contact) {
        contact.value = route.query.contact;
        if (route.query.contact.includes('@')) {
            method.value = 'email';
        } else {
            method.value = 'sms';
        }
      }
      if (route.query.email && !route.query.contact) { // If only email is provided
          contact.value = route.query.email;
          method.value = 'email';
      }
    };

    const onRequestCode = async () => {
      loading.value = true;
      errorMessage.value = '';
      successMessage.value = '';

      try {
        const result = await requestVerificationCode({ ContactIdentifier: contact.value, Method: method.value });
        successMessage.value = result.message || 'Verification code sent successfully!';
        
        // On success, navigate to the verify code page, passing contact details
        router.push({
          name: 'VerifyCode', // The name of the route for VerifyCodeView
          query: { 
            contact: contact.value, 
            method: method.value,
            message: encodeURIComponent(successMessage.value) // Pass success message to next page
          } 
        });

      } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Failed to request code. Please try again.';
        console.error('Request Code Error:', error);
      } finally {
        loading.value = false;
      }
    };

    const navigateToBooking = () => {
      router.push('/'); // Navigate to the root (booking wizard)
    };

    onMounted(() => {
        prefillFromUrl(); // Call prefill when component mounts
    });

    return {
      contact,
      method,
      loading,
      errorMessage,
      successMessage,
      onRequestCode,
      navigateToBooking,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/_common.scss'; // Adjust path based on location in /views

.request-code-view {
  @include step-card-base;
  max-width: 600px; // Slightly narrower for forms
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

.verification-form {
    width: 100%;
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

.label-icon {
    font-size: $font-size-md;
    margin-right: $spacing-sm;
    color: $color-text-medium-grey;
}

input[type="text"],
input[type="tel"],
input[type="email"],
select {
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

.success-message {
  color: $color-info;
  background-color: lighten($color-info, 60%);
  border: 1px solid $color-info;
  padding: $spacing-sm $spacing-md;
  border-radius: $spacing-xs;
  margin-bottom: $spacing-md; // Space below message
  text-align: center;
}

.error-message {
  color: $color-error;
  background-color: lighten($color-error, 60%);
  border: 1px solid $color-error;
  padding: $spacing-sm $spacing-md;
  border-radius: $spacing-xs;
  margin-bottom: $spacing-md; // Space below message
  text-align: center;
}

button[type="submit"] {
  @include primary-button;
  width: 100%; // Full width button for form
}

.navigation-link {
    margin-top: $spacing-lg; // 15px
    text-align: center;
    a {
        color: $color-primary-blue;
        text-decoration: none;
        &:hover {
            text-decoration: underline;
        }
    }
}
</style>