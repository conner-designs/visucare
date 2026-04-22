<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import BaseCard from "../components/BaseCard.vue";
import BaseModal from "../components/BaseModal.vue";
import { formatDate, formatTime, titleCase } from "../lib/formatters";
import { useAppStore } from "../stores/appStore";

const props = defineProps({
  entryId: { type: String, required: true }
});

const router = useRouter();
const appStore = useAppStore();
const showRemoveConfirm = ref(false);

const entry = computed(() => appStore.getDrainEntry(props.entryId));
const drainLabel = computed(() =>
  entry.value ? `${titleCase(entry.value.side)} ${entry.value.drainNumber}` : ""
);

function removeEntry() {
  if (!entry.value) return;
  appStore.removeDrainEntry(entry.value.id);
  showRemoveConfirm.value = false;
  router.push("/drains/summary");
}
</script>

<template>
  <section class="page-shell">
    <div class="screen-heading">
      <h2>Drain Detail</h2>
      <p class="muted">Full details for one drain entry.</p>
    </div>

    <BaseCard v-if="!entry" class="empty-state">
      This drain entry is no longer available.
    </BaseCard>

    <template v-else>
      <BaseCard class="feature-card detail-card">
        <p class="summary-label">Drain</p>
        <p class="detail-value">{{ drainLabel }}</p>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="summary-label">Date</span>
            <strong>{{ formatDate(entry.loggedAt) }}</strong>
          </div>
          <div class="detail-item">
            <span class="summary-label">Time</span>
            <strong>{{ formatTime(entry.loggedAt) }}</strong>
          </div>
          <div class="detail-item">
            <span class="summary-label">Color</span>
            <strong>{{ entry.color }}</strong>
          </div>
          <div class="detail-item">
            <span class="summary-label">Amount</span>
            <strong>{{ entry.amountML }} mL</strong>
          </div>
        </div>
      </BaseCard>

      <button class="action-button danger" type="button" @click="showRemoveConfirm = true">
        Remove Entry
      </button>
    </template>

    <BaseModal :open="showRemoveConfirm" title="Remove Drain Entry" @close="showRemoveConfirm = false">
      <p class="confirm-text">Remove this drain entry from the summary?</p>
      <div class="modal-actions">
        <button class="action-button subtle" type="button" @click="showRemoveConfirm = false">Cancel</button>
        <button class="action-button danger" type="button" @click="removeEntry">Remove</button>
      </div>
    </BaseModal>
  </section>
</template>
