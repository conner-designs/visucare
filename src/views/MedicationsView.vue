<script setup>
import { computed, ref } from "vue";
import BaseCard from "../components/BaseCard.vue";
import BaseModal from "../components/BaseModal.vue";
import { COMMON_POST_SURGERY_PAIN_MEDS } from "../lib/constants";
import { formatDateTime } from "../lib/formatters";
import { useAppStore } from "../stores/appStore";

const appStore = useAppStore();

const showAdd = ref(false);
const pendingAction = ref(null);
const selectedMedication = ref(null);
const form = ref({ selectedName: "", customName: "", doseLabel: "", intervalHours: 4 });

const medications = computed(() => appStore.activeMedications.value);
const notificationStatus = computed(() => appStore.notificationStatus());
const persistentStorageGranted = computed(() => appStore.state.persistentStorageGranted);

function saveMedication() {
  const selectedName = form.value.selectedName;
  const resolvedName = selectedName === "Other" ? form.value.customName.trim() : selectedName.trim();
  if (!resolvedName || Number(form.value.intervalHours) < 1) return;
  appStore.addMedication({
    name: resolvedName,
    doseLabel: form.value.doseLabel,
    intervalHours: Number(form.value.intervalHours)
  });
  form.value = { selectedName: "", customName: "", doseLabel: "", intervalHours: 4 };
  showAdd.value = false;
}

function openAction(medication, action) {
  selectedMedication.value = medication;
  pendingAction.value = action;
}

function confirmAction() {
  if (!selectedMedication.value || !pendingAction.value) return;
  if (pendingAction.value === "taken") appStore.markMedicationTaken(selectedMedication.value.id);
  if (pendingAction.value === "notNeeded") appStore.markMedicationNotNeeded(selectedMedication.value.id);
  if (pendingAction.value === "remove") appStore.removeMedication(selectedMedication.value.id);
  selectedMedication.value = null;
  pendingAction.value = null;
}

async function enableAlerts() {
  await appStore.requestNotificationPermission();
}

async function improveStorage() {
  await appStore.requestPersistentStorage();
}

function lastActionText(medication) {
  if (!medication.lastActionAt || !medication.lastActionType) return "Last action: None yet";
  return `Last action: ${medication.lastActionType === "taken" ? "Taken" : "Not Needed"} at ${formatDateTime(medication.lastActionAt)}`;
}

function dueText(medication) {
  return medication.nextDueAt ? formatDateTime(medication.nextDueAt) : "Not started yet";
}

function dueStateLabel(medication) {
  if (!medication.nextDueAt) return "Waiting";
  return new Date(medication.nextDueAt).getTime() <= Date.now() ? "Due Now" : "Upcoming";
}

function confirmMessage() {
  if (pendingAction.value === "taken") return "Are you sure you took this medication now?";
  if (pendingAction.value === "notNeeded") return "Are you sure this medication was not needed right now?";
  if (pendingAction.value === "remove") return "Remove this medication from your list?";
  return "";
}
</script>

<template>
  <section class="page-shell">
    <div class="screen-heading">
      <h2>Medications</h2>
      <p class="muted">Only local reminders and on-device history.</p>
    </div>

    <div class="toolbar-row">
      <button class="action-button brand" type="button" @click="showAdd = true">Add Medication</button>
      <button class="action-button subtle" type="button" :disabled="notificationStatus === 'granted' || notificationStatus === 'unavailable'" @click="enableAlerts">
        {{ notificationStatus === "granted" ? "Alerts Enabled" : notificationStatus === "unavailable" ? "Alerts Unavailable" : "Enable Alerts" }}
      </button>
    </div>

    <div v-if="!medications.length" class="stack">
      <BaseCard class="empty-state">No medications added yet.</BaseCard>
    </div>
    <div v-else class="stack">
      <BaseCard v-for="medication in medications" :key="medication.id" class="overview-card medication-card">
        <div class="card-title-row">
          <h3 class="card-title">{{ medication.name }}</h3>
          <span class="due-pill" :class="{ overdue: medication.nextDueAt && new Date(medication.nextDueAt).getTime() <= Date.now() }">
            {{ dueStateLabel(medication) }}
          </span>
        </div>
        <p v-if="medication.doseLabel" class="dose-label">{{ medication.doseLabel }}</p>
        <p><strong>Every {{ medication.intervalHours }} hours</strong></p>
        <p>Next due: {{ dueText(medication) }}</p>
        <p class="muted">{{ lastActionText(medication) }}</p>
        <div class="stack compact-stack">
          <button class="action-button brand" type="button" @click="openAction(medication, 'taken')">Taken</button>
          <button class="action-button subtle" type="button" @click="openAction(medication, 'notNeeded')">Not Needed</button>
          <button class="action-button danger" type="button" @click="openAction(medication, 'remove')">Remove</button>
        </div>
      </BaseCard>
    </div>

    <BaseModal :open="showAdd" title="Add Medication" @close="showAdd = false">
      <div class="field">
        <span>Name</span>
        <select v-model="form.selectedName">
          <option disabled value="">Select a medication</option>
          <option v-for="med in COMMON_POST_SURGERY_PAIN_MEDS" :key="med" :value="med">{{ med }}</option>
        </select>
      </div>
      <div v-if="form.selectedName === 'Other'" class="field">
        <span>Medication Name</span>
        <input v-model="form.customName" type="text" autocomplete="off">
      </div>
      <div class="field">
        <span>Dose Label (Optional)</span>
        <input v-model="form.doseLabel" type="text" autocomplete="off">
      </div>
      <div class="field">
        <span>Interval in Hours</span>
        <input v-model="form.intervalHours" type="number" min="1" step="1" inputmode="numeric">
      </div>
      <p class="help-text">Next due will appear after the first time this medication is marked as taken.</p>
      <div class="modal-actions">
        <button class="action-button subtle" type="button" @click="showAdd = false">Cancel</button>
        <button class="action-button brand" type="button" @click="saveMedication">Save</button>
      </div>
    </BaseModal>

    <BaseModal :open="!!pendingAction" title="Confirm" @close="pendingAction = null">
      <p class="confirm-text">{{ confirmMessage() }}</p>
      <div class="modal-actions">
        <button class="action-button subtle" type="button" @click="pendingAction = null">Cancel</button>
        <button class="action-button brand" type="button" @click="confirmAction">Confirm</button>
      </div>
    </BaseModal>
  </section>
</template>
