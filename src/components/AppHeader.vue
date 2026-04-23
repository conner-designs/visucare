<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const deferredInstallPrompt = ref(null);
const isInstalled = ref(false);

const showInstall = computed(() => route.name === "home" && !isInstalled.value);
const showHome = computed(() => route.name !== "home");
const showBackButton = computed(() =>
  route.name === "drain-side" ||
  route.name === "drain-summary" ||
  route.name === "drain-entry-detail"
);

const backTarget = computed(() => {
  if (route.name === "drain-entry-detail") return "/drains/summary";
  return "/drains";
});

const updateInstalledState = () => {
  const isStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  const isIosStandalone = window.navigator.standalone === true;
  isInstalled.value = Boolean(isStandalone || isIosStandalone);
};

const handleBeforeInstallPrompt = (event) => {
  event.preventDefault();
  deferredInstallPrompt.value = event;
};

const handleAppInstalled = () => {
  deferredInstallPrompt.value = null;
  isInstalled.value = true;
};

const installApp = async () => {
  if (deferredInstallPrompt.value) {
    deferredInstallPrompt.value.prompt();
    await deferredInstallPrompt.value.userChoice;
    deferredInstallPrompt.value = null;
    updateInstalledState();
    return;
  }

  window.alert("To add Lydie to your home screen, open your browser menu or Share button and choose Add to Home Screen.");
};

onMounted(() => {
  updateInstalledState();
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.removeEventListener("appinstalled", handleAppInstalled);
});
</script>

<template>
  <header class="topbar">
    <button
      class="icon-button"
      :class="{ hidden: !showBackButton }"
      type="button"
      aria-label="Back to Drains"
      @click="router.push(backTarget)"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" class="header-icon">
        <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" />
      </svg>
    </button>

    <div class="topbar-title">
      <p class="eyebrow">Private Recovery Tracker</p>
      <p class="topbar-subtitle">Simple bedside tracking for meds and drains.</p>
    </div>

    <div class="topbar-actions">
      <button
        v-if="showInstall"
        class="icon-button"
        type="button"
        aria-label="Add to Home Screen"
        @click="installApp"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" class="header-icon">
          <path d="M12 15V4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" />
          <path d="M8.5 7.5L12 4l3.5 3.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" />
          <path d="M5 13.5v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" />
        </svg>
      </button>

      <button
        v-else
        class="icon-button"
        :class="{ hidden: !showHome }"
        type="button"
        aria-label="Home"
        @click="router.push('/')"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" class="header-icon">
          <path d="M4 11.5l8-6 8 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" />
          <path d="M7 10.5v8h10v-8" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" />
        </svg>
      </button>
    </div>
  </header>
</template>
