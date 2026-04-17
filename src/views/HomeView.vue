<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import BaseCard from "../components/BaseCard.vue";
import { formatTime } from "../lib/formatters";
import { useAppStore } from "../stores/appStore";

const appStore = useAppStore();

const nextMedication = computed(() => appStore.activeMedications.value[0] || null);
const leftLast = computed(() => appStore.getEntriesForSide("left")[0] || null);
const rightLast = computed(() => appStore.getEntriesForSide("right")[0] || null);
</script>

<template>
  <section class="page-shell">
    <div class="screen-heading">
      <h2>Home</h2>
      <p class="muted">Clear bedside shortcuts for medications and drains.</p>
    </div>

    <div class="stack">
      <div class="home-overview-row">
        <BaseCard class="overview-card feature-card">
          <p class="summary-label">Medications</p>
          <h3 class="overview-title">{{ nextMedication ? nextMedication.name : "No medications yet" }}</h3>
          <p v-if="nextMedication" class="overview-line">
            <strong>{{ appStore.activeMedications.value.length }}</strong>
            active medication{{ appStore.activeMedications.value.length === 1 ? "" : "s" }}
          </p>
          <p class="overview-line">
            {{
              !nextMedication
                ? "Add a medication once, then use Actions when it is time."
                : appStore.nextScheduledMedication.value
                  ? `Next due: ${formatTime(appStore.nextScheduledMedication.value.nextDueAt)}`
                  : "Next due: Not started yet"
            }}
          </p>
        </BaseCard>
        <RouterLink class="nav-tile" to="/medications">Medications</RouterLink>
      </div>

      <div class="home-overview-row">
        <BaseCard class="overview-card feature-card">
          <p class="summary-label">Drains</p>
          <h3 class="overview-title">{{ appStore.getTotalForDay("left", 0) + appStore.getTotalForDay("right", 0) }} mL today</h3>
          <p class="overview-line">
            Left: {{ appStore.getTotalForDay("left", 0) }} mL{{ leftLast ? `, last ${leftLast.amountML} mL at ${formatTime(leftLast.loggedAt)}` : ", no entries yet" }}
          </p>
          <p class="overview-line">
            Right: {{ appStore.getTotalForDay("right", 0) }} mL{{ rightLast ? `, last ${rightLast.amountML} mL at ${formatTime(rightLast.loggedAt)}` : ", no entries yet" }}
          </p>
        </BaseCard>
        <RouterLink class="nav-tile" to="/drains">Drains</RouterLink>
      </div>
    </div>
  </section>
</template>
