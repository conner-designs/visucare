<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import AppHeader from "./components/AppHeader.vue";
import { useAppStore } from "./stores/appStore";

const appStore = useAppStore();
let intervalId = null;

onMounted(() => {
  appStore.hydrate().then(() => {
    appStore.checkDueMedications();
  });
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
  intervalId = window.setInterval(() => {
    appStore.checkDueMedications();
  }, 60000);
});

onBeforeUnmount(() => {
  if (intervalId) {
    window.clearInterval(intervalId);
  }
});
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="screen-container">
      <div class="app-stage">
        <RouterView />
      </div>
    </main>
  </div>
</template>
