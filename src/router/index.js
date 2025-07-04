// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import AppointmentVerification from '../views/AppointmentVerification.vue';
import AppointmentBookingWizard from '../components/AppointmentBookingWizard.vue'; // Import the wizard component

const routes = [
  {
    path: '/view-appointments', // The URL path for this component
    name: 'ViewAppointments',
    component: AppointmentVerification,
  },
  {
    path: '/', // Set the root path to the booking wizard
    name: 'BookAppointment',
    component: AppointmentBookingWizard,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;