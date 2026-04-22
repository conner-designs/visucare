<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

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
      <p class="eyebrow">Post OP Recovery Tool</p>
      <h1>VisuCare</h1>
      <p class="topbar-subtitle">Recovery Tracking Made Easy.</p>
    </div>

    <button
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
  </header>
</template>
