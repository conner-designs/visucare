<script setup>
import { computed, ref } from "vue";
import BaseCard from "../components/BaseCard.vue";
import BaseModal from "../components/BaseModal.vue";
import { formatDate, formatTime, titleCase } from "../lib/formatters";
import { useAppStore } from "../stores/appStore";

const appStore = useAppStore();

const entries = computed(() => appStore.getAllDrainEntries());
const entryToRemove = ref(null);

function drainLabel(entry) {
  return `${titleCase(entry.side)} ${entry.drainNumber}`;
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
      <p class="muted">Easy-to-read drain history by side, drain number, time, color, and amount.</p>
    </div>

    <div class="summary-grid">
      <BaseCard class="feature-card">
			  <div class="totals-stack">
			    <p class="summary-value">
			      Today Total {{ appStore.getTotalForDay("left", 0) + appStore.getTotalForDay("right", 0) }} mL
			    </p>
			    <p class="summary-sub">
			      Total {{ appStore.getCompleteTotal() }} mL
			    </p>
			  </div>
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
              <th class="summary-actions-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="entry in entries" :key="entry.id">
              <td data-label="Drain">{{ drainLabel(entry) }}</td>
              <td data-label="Date">{{ formatDate(entry.loggedAt) }}</td>
              <td data-label="Time">{{ formatTime(entry.loggedAt) }}</td>
              <td data-label="Color">{{ entry.color }}</td>
              <td data-label="Amount"><strong>{{ entry.amountML }} mL</strong></td>
              <td data-label="Remove" class="summary-actions-cell">
                <button
                  class="summary-remove-button"
                  type="button"
                  aria-label="Remove drain entry"
                  @click="confirmRemove(entry)"
                >
                  ×
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </BaseCard>

    <BaseModal :open="!!entryToRemove" title="Remove Drain Entry" @close="entryToRemove = null">
      <p class="confirm-text">Remove this drain entry from the summary?</p>
      <div class="modal-actions">
        <button class="action-button subtle" type="button" @click="entryToRemove = null">Cancel</button>
        <button class="action-button danger" type="button" @click="removeEntry">Remove</button>
      </div>
    </BaseModal>
  </section>
</template>
