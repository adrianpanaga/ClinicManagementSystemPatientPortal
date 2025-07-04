<template>
  <header>
    <h1>Clinic Patient Portal</h1>
  </header>
  <main>
    <router-view /> </main>
</template>

<script setup>
// No component imports or data properties for router-view
</script>

<style>
/* This style block remains untouched as it's for global elements like body, header, main */
body {
  margin: 0;
  padding: 0;
  font-family: 'PT Sans', sans-serif;
  background-color: #f2f2f2;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

header {
  text-align: center;
  padding: 10px 20px;
  background-color: #f2f2f2;
  border-bottom: 1px solid #ddd;
  margin-bottom: 0;
}

header h1 {
  color: #333;
  font-size: 1.8em;
  margin-top: 0;
  margin-bottom: 0;
}

main {
  padding: 10px 20px;
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>

<style scoped>
/* App.vue specific scoped styles (should be minimal or empty) */
</style>