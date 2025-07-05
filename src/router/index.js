// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
//import AppointmentVerification from '../views/AppointmentVerification.vue';
import AppointmentBookingWizard from '../components/AppointmentBookingWizard.vue';
import RequestCodeView from '../views/RequestCodeView.vue';
import VerifyCodeView from '../views/VerifyCodeView.vue';
import AppointmentsListView from '../views/AppointmentsListView.vue'; 

const routes = [
  // Existing route for booking wizard (default)
  {
    path: '/',
    name: 'BookAppointment',
    component: AppointmentBookingWizard,
  },
  // NEW: Route for requesting verification code
  {
    path: '/request-code',
    name: 'RequestCode',
    component: RequestCodeView,
  },
  // NEW: Route for verifying code (expects query params from request-code)
  {
    path: '/verify-code',
    name: 'VerifyCode',
    component: VerifyCodeView,
  },
  // NEW: Route for displaying patient's appointments after verification
  {
    path: '/my-appointments',
    name: 'MyAppointments',
    component: AppointmentsListView,
    // Add props: true if AppointmentsListView will consume query params as props
    props: (route) => ({ patientId: route.query.patientId, contact: route.query.contact, email: route.query.email }),
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