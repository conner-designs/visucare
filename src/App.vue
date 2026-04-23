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
        <p class="note-body">
          Lydie is built to keep your tracking private. Your medications, drain entries, and notes are stored on this device only.
        </p>
        <p class="note-body">
          There are no accounts, no ads, no analytics, and no cloud sync in this app.
        </p>
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
