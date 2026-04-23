<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import BaseCard from "../components/BaseCard.vue";
import BaseModal from "../components/BaseModal.vue";
import { formatDate, formatTime, titleCase } from "../lib/formatters";
import { useAppStore } from "../stores/appStore";

const appStore = useAppStore();
const router = useRouter();

const entries = computed(() => appStore.getAllDrainEntries());
const entryToRemove = ref(null);

function drainLabel(entry) {
  return `${titleCase(entry.side)} ${entry.drainNumber}`;
}

function openEntry(entry) {
  router.push(`/drains/summary/${entry.id}`);
}

function confirmRemove(entry) {
  entryToRemove.value = entry;
}

function removeEntry() {
  if (!entryToRemove.value) return;
  appStore.removeDrainEntry(entryToRemove.value.id);
  entryToRemove.value = null;
}
</script>

<template>
  <section class="page-shell">
    <div class="screen-heading">
      <h2>Drain Summary</h2>
      <p class="muted">A simple history of what you have logged, newest entries first.</p>
    </div>

    <div class="summary-grid">
      <BaseCard class="feature-card">
        <div class="totals-stack">
          <p class="summary-value">
            Today: {{ appStore.getTotalForDay("left", 0) + appStore.getTotalForDay("right", 0) }} mL
          </p>
          <p class="summary-sub">
            All entries: {{ appStore.getCompleteTotal() }} mL
          </p>
        </div>
      </BaseCard>
    </div>

    <BaseCard v-if="!entries.length" class="empty-state">
      No drain entries yet. Add one from the left or right drain screen.
    </BaseCard>

    <BaseCard v-else class="summary-table-card">
      <div class="summary-table-wrap">
        <table class="summary-table">
          <thead>
            <tr>
              <th class="summary-col-drain">Drain</th>
              <th class="summary-col-date">Date</th>
              <th class="summary-col-time">Time</th>
              <th class="summary-col-color">Color</th>
              <th class="summary-col-amount">Amount</th>
              <th class="summary-actions-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="entry in entries"
              :key="entry.id"
              class="summary-row-link"
              @click="openEntry(entry)"
            >
              <td class="summary-col-drain">{{ drainLabel(entry) }}</td>
              <td class="summary-col-date">{{ formatDate(entry.loggedAt) }}</td>
              <td class="summary-col-time">{{ formatTime(entry.loggedAt) }}</td>
              <td class="summary-col-color">{{ entry.color }}</td>
              <td class="summary-col-amount"><strong>{{ entry.amountML }} mL</strong></td>
              <td class="summary-actions-cell">
                <button
                  class="summary-remove-button"
                  type="button"
                  aria-label="Remove drain entry"
                  @click.stop="confirmRemove(entry)"
                >
                  ×
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <BaseModal :open="!!entryToRemove" title="Remove Entry" @close="entryToRemove = null">
      <p class="confirm-text">Remove this drain entry from your history?</p>
      <div class="modal-actions">
        <button class="action-button subtle" type="button" @click="entryToRemove = null">Cancel</button>
        <button class="action-button danger" type="button" @click="removeEntry">Remove</button>
      </div>
    </BaseModal>
  </section>
</template>
