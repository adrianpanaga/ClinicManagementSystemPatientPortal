Clinic Management System - Patient Portal (Frontend)
Project Overview
This repository contains the frontend application for the Patient Portal module of a larger Clinic Management System. Its primary function is to provide a user-friendly interface for patients to book appointments online and view their verified appointment details. This application is built with Vue.js and communicates with a separate ASP.NET Core API backend.

Key Features
Intuitive Multi-Step Appointment Booking Wizard: A guided, responsive 6-step process for scheduling appointments.

Choose Service: Patients can select from various clinic services, displayed in a clear card-based layout with icons.

Choose Doctor: Option to select a specific specialist doctor or choose "Any Available Doctor," with assigned doctor details confirmed post-booking.

Select Date: An interactive calendar allows easy date selection, with the current date selected by default.

Select Time: Displays available time slots in a grid, dynamically filtering out booked times and clinic-defined breaks (e.g., lunch breaks).

Patient Details: A form to securely provide or confirm patient information (Full Name, Date of Birth, Contact, Email, Reason for Visit), with pre-fill capabilities if data is already known (e.g., from a verification process).

Review & Confirm: A comprehensive summary of all appointment and patient details for final review before confirmation.

Patient Appointment Verification: Allows patients to view their appointments securely using a verification code (OTP) without a traditional login.

User-Friendly Design: Features consistent styling, clear navigation, and a focus on optimal user experience.

Responsive Layout: Adapts seamlessly to various screen sizes (desktop, tablet, mobile).

Frontend-Backend Integration: Communicates with a separate Clinic Management API for dynamic data (services, doctors, available slots, booking).

Technologies Used
Vue.js 3: Progressive JavaScript framework.

Vite: Fast frontend tooling for development.

Axios: Promise-based HTTP client for API requests.

Sass/SCSS: CSS preprocessor for organized and maintainable styling, utilized with Vue's scoped CSS.

Font Awesome 6: Popular icon library for clear and consistent iconography.

Vue Router: Official routing library for single-page applications.

Google Fonts: Specifically "PT Sans" for typography.

Getting Started
Follow these instructions to set up and run the Patient Portal frontend locally.

Prerequisites
Node.js (LTS version recommended)

npm (comes with Node.js)

The Clinic Management API Backend must be running and accessible. (Expected URL: https://localhost:7129/api)

Installation & Local Development
Clone the Repository:

Bash

git clone https://github.com/adrianpanaga/ClinicManagementSystemPatientPortal.git
cd ClinicManagementSystemPatientPortal # Navigate into the project root
(Replace YOUR-USERNAME with your actual GitHub username).

Install Dependencies:

Bash

npm install
Configure API Base URL:

Open src/services/api.js.

Ensure API_BASE_URL is set to the correct address of your running backend API (e.g., https://localhost:7129/api).

Run the Development Server:

Bash

npm run dev
The application will typically open in your browser at http://localhost:5173/.

Usage
Once the frontend development server and the backend API are both running:

1. Open your browser to http://localhost:5173/.

2. You will be presented with the Appointment Booking Wizard (Step 1: Choose a Service).

3. Follow the on-screen steps to select a service, doctor, date, time, and enter your details.

4. Click "Confirm Appointment" on Step 6 to finalize the booking via the backend API.

5. After successful booking, you will be directed to the Confirmation Page.

Project Structure (Frontend Specific)
ClinicManagementSystemPatientPortal/ # Frontend Project Root
├── public/                 # Public assets, main index.html file
│   └── index.html          # HTML entry point, includes Font Awesome CDN
├── src/
│   ├── assets/
│   │   └── styles/         # Global Sass/SCSS files
│   │       └── _common.scss# Common variables and mixins
│   ├── components/
│   │   ├── steps/          # Individual wizard step components
│   │   │   ├── ChooseService.vue
│   │   │   ├── ChooseDoctor.vue
│   │   │   ├── ChooseDate.vue
│   │   │   ├── ChooseTime.vue
│   │   │   ├── PatientDetailsForm.vue
│   │   │   └── ReviewAndConfirm.vue
│   │   └── AppointmentBookingWizard.vue
│   ├── router/             # Vue Router configuration
│   │   └── index.js
│   ├── services/           # API service layer (Axios configuration)
│   │   └── api.js
│   ├── views/              # Top-level view components (e.g., AppointmentVerification)
│   │   └── AppointmentVerification.vue
│   ├── App.vue             # Main Vue application component
│   ├── main.js             # Vue app entry point (initializes Vue, Router)
│   └── style.css           # Global CSS (imports _common.scss)
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration
└── ... (other config files)
Backend API Repository
This frontend application requires the Clinic Management API Backend to function. You can find its source code and setup instructions in its separate GitHub repository:

[Link to your Backend API GitHub Repository Here](https://github.com/adrianpanaga/ClinicManagementSystem.git)

Contact
https://github.com/adrianpanaga