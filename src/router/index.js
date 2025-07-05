// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import AppointmentBookingWizard from '../components/AppointmentBookingWizard.vue';
import RequestCodeView from '../views/RequestCodeView.vue';
import VerifyCodeView from '../views/VerifyCodeView.vue';
import AppointmentsListView from '../views/AppointmentsListView.vue';

const routes = [
  {
    path: '/',
    name: 'BookAppointment',
    component: AppointmentBookingWizard,
  },
  {
    path: '/request-code',
    name: 'RequestCode',
    component: RequestCodeView,
  },
  {
    path: '/verify-code',
    name: 'VerifyCode',
    component: VerifyCodeView,
  },
  {
    path: '/my-appointments',
    name: 'MyAppointments',
    component: AppointmentsListView,
    // MODIFIED: Props function to pull data from sessionStorage after verification
    props: (route) => {
      const isVerified = sessionStorage.getItem('isPatientVerified') === 'true';
      const storedPatientId = sessionStorage.getItem('verifiedPatientId');

      if (isVerified && storedPatientId) {
        return {
          patientId: Number(storedPatientId), // Ensure it's a number
          contact: sessionStorage.getItem('verifiedPatientContact') || '',
          email: sessionStorage.getItem('verifiedPatientEmail') || '',
          patientFullName: sessionStorage.getItem('verifiedPatientFullName') || '',
        };
      }
      // If not verified, or stored data is missing, props will be null/empty,
      // and beforeEnter would have redirected. This ensures default fallback.
      return { patientId: null, contact: '', email: '', patientFullName: '' };
    },
    // MODIFIED: beforeEnter guard to only check, not modify 'to' object
    beforeEnter: (to, from, next) => {
      const isVerified = sessionStorage.getItem('isPatientVerified') === 'true';
      const storedPatientId = sessionStorage.getItem('verifiedPatientId');
      // to.query.patientId will be a string from URL or undefined
      const routePatientId = to.query.patientId; 

      // If patient is verified and we have a stored ID, and (no ID in URL OR URL ID matches stored ID)
      if (isVerified && storedPatientId && (!routePatientId || routePatientId === storedPatientId)) {
        next(); // Allow navigation
      } else {
        // Not verified, or ID mismatch/missing: Redirect to request code page
        console.warn("Access to /my-appointments blocked: User not verified or ID mismatch.");
        next({ name: 'RequestCode', query: { redirectFrom: to.fullPath } }); // Redirect with info
        
        // Clear potentially stale verification data when blocking access
        sessionStorage.removeItem('isPatientVerified');
        sessionStorage.removeItem('verifiedPatientId');
        sessionStorage.removeItem('verifiedPatientContact');
        sessionStorage.removeItem('verifiedPatientEmail');
        sessionStorage.removeItem('verifiedPatientFullName');
      }
    }
  },
  // Redirect old /view-appointments path to the new request code flow
  {
    path: '/view-appointments', 
    redirect: { name: 'RequestCode' }, 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;