<script setup>
import { computed } from "vue";
import BaseCard from "../components/BaseCard.vue";
import { formatDate, formatTime, titleCase } from "../lib/formatters";
import { useAppStore } from "../stores/appStore";

const appStore = useAppStore();

const entries = computed(() => appStore.getAllDrainEntries());

function drainLabel(entry) {
  return `${titleCase(entry.side)} ${entry.drainNumber}`;
}
</script>

<template>
  <section class="page-shell">
    <div class="screen-heading">
      <h2>Drain Summary</h2>
      <p class="muted">Easy-to-read drain history by side, drain number, time, color, and amount.</p>
    </div>

    <div class="summary-grid">
      <BaseCard class="feature-card">
        <p class="summary-label">Entries</p>
        <p class="summary-value">{{ entries.length }}</p>
      </BaseCard>
      <BaseCard class="feature-card">
        <p class="summary-label">Today Total</p>
        <p class="summary-value">{{ appStore.getTotalForDay("left", 0) + appStore.getTotalForDay("right", 0) }} mL</p>
      </BaseCard>
    </div>

    <BaseCard v-if="!entries.length" class="empty-state">
      No drain entries yet.
    </BaseCard>

    <BaseCard v-else class="summary-table-card">
      <div class="summary-table-wrap">
        <table class="summary-table">
          <thead>
            <tr>
              <th>Drain</th>
              <th>Date</th>
              <th>Time</th>
              <th>Color</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries" :key="entry.id">
              <td>{{ drainLabel(entry) }}</td>
              <td>{{ formatDate(entry.loggedAt) }}</td>
              <td>{{ formatTime(entry.loggedAt) }}</td>
              <td>{{ entry.color }}</td>
              <td><strong>{{ entry.amountML }} mL</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>
  </section>
</template>
