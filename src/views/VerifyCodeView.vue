<template>
  <div class="verify-code-view">
    <div class="step-header">
      <i class="fas fa-lock step-header-icon"></i> <h2>Verify Code</h2>
    </div>
    <p>A verification code has been sent to {{ contactIdentifierDisplay }}.</p>
    <p v-if="successMessage" class="success-message">{{ successMessage }}</p>

    <form @submit.prevent="onVerifyCode" class="verification-form">
      <div class="form-group">
        <label for="code"><i class="fas fa-hashtag label-icon"></i> Verification Code</label>
        <input type="text" id="code" v-model="code" required placeholder="Enter 4-10 digit code" />
      </div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <button type="submit" :disabled="loading" class="next-button">
        {{ loading ? 'Verifying...' : 'Verify Code' }}
      </button>
    </form>
    <div class="navigation-link">
        <a href="#" @click.prevent="requestNewCode">Request New Code</a>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { verifyCodeAndGetAppointments } from '@/services/api';
import { useRouter, useRoute } from 'vue-router'; 

export default {
  name: 'VerifyCodeView',
  setup() {
    const router = useRouter();
    const route = useRoute();

    // Data passed from RequestCodeView via query parameters
    const contactIdentifier = ref(route.query.contact || '');
    const method = ref(route.query.method || 'email');
    const successMessage = ref(route.query.message ? decodeURIComponent(route.query.message) : '');

    const code = ref('');
    const loading = ref(false);
    const errorMessage = ref('');
    // No need for appointments ref here, as it's passed to AppointmentsListView

    const contactIdentifierDisplay = computed(() => {
        if (contactIdentifier.value.includes('@')) {
            const parts = contactIdentifier.value.split('@');
            if (parts[0].length > 3) {
                return parts[0].substring(0, 3) + '***@' + parts[1];
            }
            return '***@' + parts[1];
        } else if (contactIdentifier.value.length > 4) {
            return contactIdentifier.value.substring(0, 3) + '***' + contactIdentifier.value.substring(contactIdentifier.value.length - 4);
        }
        return 'your contact';
    });

    const onVerifyCode = async () => {
      loading.value = true;
      errorMessage.value = '';
      successMessage.value = '';
      
      try {
        const result = await verifyCodeAndGetAppointments({
          ContactIdentifier: contactIdentifier.value,
          Code: code.value,
          Method: method.value,
        });

        // Assuming backend returns PatientId, FullName, Email, ContactNumber in result
        if (result.isSuccess) {
            // CRITICAL: On successful verification, navigate to MyAppointments view with patientId and details
            router.push({
                name: 'MyAppointments', 
                query: { 
                    patientId: result.patientId, // Pass patientId received from backend
                    contact: result.contactNumber, 
                    email: result.email,
                    patientFullName: result.fullName // Pass full name for display
                }
            });
        } else {
            errorMessage.value = result.message || 'Verification failed. Please check your code and try again.';
        }

      } catch (error) {
        errorMessage.value = error.response?.data?.message || 'Verification failed. Please check your code and try again.';
        console.error('Verify Code Error:', error);
      } finally {
        loading.value = false;
      }
    };

    const requestNewCode = () => {
        router.push({ name: 'RequestCode' });
    };

    onMounted(() => {
        if (!contactIdentifier.value) {
            router.replace({ name: 'RequestCode' });
        }
    });

    return {
      contactIdentifierDisplay,
      code,
      loading,
      errorMessage,
      successMessage,
      onVerifyCode,
      requestNewCode,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../assets/styles/_common.scss'; // Adjust path based on location in /views

.verify-code-view {
  @include step-card-base;
  max-width: 600px;
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
    margin-bottom: $spacing-lg;
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

button[type="submit"] {
  @include primary-button;
  width: 100%;
}

.success-message {
  color: $color-info;
  background-color: lighten($color-info, 60%);
  border: 1px solid $color-info;
  padding: $spacing-sm $spacing-md;
  border-radius: $spacing-xs;
  margin-bottom: $spacing-md;
  text-align: center;
}

.error-message {
  color: $color-error;
  background-color: lighten($color-error, 60%);
  border: 1px solid $color-error;
  padding: $spacing-sm $spacing-md;
  border-radius: $spacing-xs;
  margin-bottom: $spacing-md;
  text-align: center;
}

.navigation-link {
    margin-top: $spacing-lg;
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