// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Import the router instance

import './style.css'; // Your global CSS

const app = createApp(App);
app.use(router); // Use Vue Router

app.mount('#app');