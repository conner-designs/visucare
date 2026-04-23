<script setup>
import { RouterLink } from "vue-router";
import BaseCard from "../components/BaseCard.vue";
import { useAppStore } from "../stores/appStore";

const appStore = useAppStore();
</script>

<template>
  <section class="page-shell">
    <div class="screen-heading">
      <h2>Drains</h2>
      <p class="muted">Choose a side and check today at a glance.</p>
    </div>

    <RouterLink class="summary-link" to="/drains/summary">
      <BaseCard class="drains-summary-button feature-card">
        <span class="summary-label">Drain Summary</span>
        <span class="drains-summary-content">
          <span class="drains-summary-row"><span>Left</span><strong>{{ appStore.getTotalForDay("left", 0) }} mL today</strong></span>
          <span class="drains-summary-row"><span>Right</span><strong>{{ appStore.getTotalForDay("right", 0) }} mL today</strong></span>
          <span class="drains-summary-row muted">
            <span>Yesterday</span>
            <span>{{ appStore.getTotalForDay("left", 1) }} mL left, {{ appStore.getTotalForDay("right", 1) }} mL right</span>
          </span>
        </span>
      </BaseCard>
    </RouterLink>

    <div class="stack section-gap-sm">
      <RouterLink class="nav-tile" to="/drains/left">Left Drain</RouterLink>
      <RouterLink class="nav-tile" to="/drains/right">Right Drain</RouterLink>
    </div>
  </section>
</template>
