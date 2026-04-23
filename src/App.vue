<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import { ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import BaseModal from "./components/BaseModal.vue";
import { useAppStore } from "./stores/appStore";

const appStore = useAppStore();
const activeFooterModal = ref(null);
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

    <footer class="app-footer" aria-label="App information">
      <button class="footer-link" type="button" @click="activeFooterModal = 'privacy'">
        Privacy
      </button>
      <button class="footer-link" type="button" @click="activeFooterModal = 'donate'">
        Donate
      </button>
    </footer>

    <BaseModal :open="activeFooterModal === 'privacy'" title="Privacy" @close="activeFooterModal = null">
      <div class="stack section-gap-sm">
        <section class="privacy-section">
          <h4>Privacy & Data Use</h4>
          <p>Lydie is designed to keep your information private.</p>
          <p>All data you enter in the app, including medications, drain entries, and reminders, is stored only on your device.</p>
          <p>Your information is not sent to any server, database, or third party.</p>
          <p>The app does not require an account and does not collect personal information such as your name, email, or location.</p>
          <p>No data is shared, sold, or used for analytics or advertising.</p>
        </section>

        <section class="privacy-section">
          <h4>Notifications</h4>
          <p>If you choose to enable reminders, the app may request permission to send local notifications.</p>
          <p>These reminders are generated on your device only and are not sent through any external service.</p>
        </section>

        <section class="privacy-section">
          <h4>Data Control</h4>
          <p>You have full control of your data.</p>
          <p>Removing entries or clearing your browser data will permanently delete stored information.</p>
          <p>Because data is stored locally, it may be lost if you clear browser storage, uninstall the app, or switch devices.</p>
        </section>

        <section class="privacy-section">
          <h4>Medical Disclaimer</h4>
          <p>Lydie is a support tool only and is not a medical device.</p>
          <p>It does not provide medical advice, diagnosis, or treatment.</p>
          <p>Always follow guidance from your doctor or care team.</p>
          <p>If you have concerns about your recovery, contact a medical professional.</p>
        </section>

        <button class="action-button subtle" type="button" @click="activeFooterModal = null">Close</button>
      </div>
    </BaseModal>

    <BaseModal :open="activeFooterModal === 'donate'" title="Donate" @close="activeFooterModal = null">
      <div class="stack section-gap-sm">
        <p class="note-body">
          Lydie is free to use. Donations are optional and are not needed to use any tracking feature.
        </p>
        <p class="note-body">
          A donation link can be added later as a separate optional button.
        </p>
        <button class="action-button subtle" type="button" @click="activeFooterModal = null">Close</button>
      </div>
    </BaseModal>
  </div>
</template>
