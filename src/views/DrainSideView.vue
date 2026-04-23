<script setup>
import { computed, ref } from "vue";
import BaseCard from "../components/BaseCard.vue";
import BaseModal from "../components/BaseModal.vue";
import { DRAIN_COLORS } from "../lib/constants";
import { formatTime, titleCase, toDateTimeLocal } from "../lib/formatters";
import { useAppStore } from "../stores/appStore";

const props = defineProps({
  side: { type: String, required: true }
});

const appStore = useAppStore();
const showAdd = ref(false);
const entryToRemove = ref(null);
const form = ref({
  drainNumber: 1,
  amountML: "",
  color: "red",
  loggedAt: toDateTimeLocal(new Date())
});

const entries = computed(() => appStore.getEntriesForSide(props.side));

function openAdd(drainNumber) {
  form.value = {
    drainNumber,
    amountML: "",
    color: "red",
    loggedAt: toDateTimeLocal(new Date())
  };
  showAdd.value = true;
}

function saveEntry() {
  const amount = Number(form.value.amountML);
  if (!Number.isInteger(amount) || amount < 0) return;
  appStore.addDrainEntry({
    side: props.side,
    drainNumber: Number(form.value.drainNumber),
    amountML: amount,
    color: form.value.color,
    loggedAt: new Date(form.value.loggedAt).toISOString()
  });
  showAdd.value = false;
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
      <h2>{{ titleCase(side) }} Drain</h2>
      <p class="muted">Log amounts for the {{ side }} side. You can choose drain 1 or drain 2 when you add an entry.</p>
    </div>

    <section class="list-section">
      <h3>Quick Add</h3>
      <div class="stack">
			  <BaseCard class="drain-unit-card feature-card">
			    <div class="drain-unit-top">
			      <h3 class="drain-unit-title">{{ titleCase(side) }}</h3>
			      <button class="action-button brand compact-button" type="button" @click="openAdd()">
			        Add Entry
			      </button>
			    </div>
          <p class="drain-unit-meta">Today: {{ appStore.getTotalForDayAndNumber(side, drainNumber, 0) }} mL</p>
          <p class="drain-unit-meta">Yesterday: {{ appStore.getTotalForDayAndNumber(side, drainNumber, 1) }} mL</p>
          <p class="drain-unit-meta">
            {{
              appStore.getEntriesForSideAndNumber(side, drainNumber)[0]
                ? `Last entry: ${appStore.getEntriesForSideAndNumber(side, drainNumber)[0].amountML} mL at ${formatTime(appStore.getEntriesForSideAndNumber(side, drainNumber)[0].loggedAt)} (${appStore.getEntriesForSideAndNumber(side, drainNumber)[0].color})`
                : "No entries yet"
            }}
          </p>
        </BaseCard>
      </div>
    </section>

    <div class="summary-grid">
      <BaseCard>
        <p class="summary-label">Today Total</p>
        <p class="summary-value">{{ appStore.getTotalForDay(side, 0) }} mL</p>
      </BaseCard>
      <BaseCard>
        <p class="summary-label">Yesterday Total</p>
        <p class="summary-value">{{ appStore.getTotalForDay(side, 1) }} mL</p>
      </BaseCard>
    </div>

    <section class="list-section">
      <h3>Recent Entries</h3>
      <div v-if="!entries.length" class="stack">
        <BaseCard class="empty-state">No entries yet. Add one when you are ready.</BaseCard>
      </div>
      <div v-else class="stack">
        <BaseCard v-for="entry in entries" :key="entry.id" class="entry-row">
          <div class="entry-top-row">
            <strong>{{ formatTime(entry.loggedAt) }} - {{ entry.amountML }} mL - {{ entry.color }}</strong>
            <button class="action-button subtle compact-button" type="button" @click="confirmRemove(entry)">Remove</button>
          </div>
          <p class="muted">{{ titleCase(side) }} {{ entry.drainNumber }}</p>
        </BaseCard>
      </div>
    </section>

    <BaseModal :open="showAdd" title="Add Drain Entry" @close="showAdd = false">
      <div class="field">
        <span>Drain Number</span>
        <select v-model="form.drainNumber">
          <option :value="1">{{ titleCase(side) }} 1</option>
          <option :value="2">{{ titleCase(side) }} 2</option>
        </select>
      </div>
      <div class="field">
        <span>Amount</span>
        <input v-model="form.amountML" type="number" min="0" step="1" inputmode="numeric">
      </div>
      <div class="field">
        <span>Date and Time</span>
        <input v-model="form.loggedAt" type="datetime-local">
      </div>
      <p class="help-text">This starts with the current time. Tap the date and time if you are entering something from earlier.</p>
      <div class="field">
        <span>Color</span>
        <div class="choice-grid">
          <button
            v-for="color in DRAIN_COLORS"
            :key="color"
            class="choice-pill"
            :class="{ selected: form.color === color }"
            type="button"
            @click="form.color = color"
          >
            {{ titleCase(color) }}
          </button>
        </div>
      </div>
      <div class="modal-actions">
        <button class="action-button subtle" type="button" @click="showAdd = false">Cancel</button>
        <button class="action-button brand" type="button" @click="saveEntry">Save</button>
      </div>
    </BaseModal>

    <BaseModal :open="!!entryToRemove" title="Remove Entry" @close="entryToRemove = null">
      <p class="confirm-text">Remove this drain entry from your history?</p>
      <div class="modal-actions">
        <button class="action-button subtle" type="button" @click="entryToRemove = null">Cancel</button>
        <button class="action-button danger" type="button" @click="removeEntry">Remove</button>
      </div>
    </BaseModal>
  </section>
</template>
