import { computed, reactive, readonly, toRaw } from "vue";
import { isSameDay } from "../lib/formatters";
import { loadAppState, saveAppState } from "../lib/localDb";

const state = reactive({
  medications: [],
  drainEntries: [],
  hydrated: false,
  persistentStorageGranted: false
});

const notifiedDueMedicationIds = new Set();

export function useAppStore() {
  const activeMedications = computed(() =>
    state.medications
      .filter((medication) => medication.isActive)
  );

  const nextScheduledMedication = computed(() =>
    state.medications
      .filter((medication) => medication.isActive && medication.nextDueAt)
      .reduce((closest, medication) => {
        if (!closest) return medication;
        return new Date(medication.nextDueAt).getTime() < new Date(closest.nextDueAt).getTime()
          ? medication
          : closest;
      }, null)
  );

  async function hydrate() {
    const loaded = await loadAppState();
    state.medications = loaded.medications;
    state.drainEntries = loaded.drainEntries;
    state.hydrated = true;
    await updatePersistenceStatus();
  }

  function addMedication({ name, doseLabel, intervalHours }) {
    state.medications.push({
      id: crypto.randomUUID(),
      name: name.trim(),
      doseLabel: doseLabel.trim(),
      intervalHours,
      nextDueAt: null,
      lastActionAt: null,
      lastActionType: null,
      isActive: true,
      history: []
    });
    persist();
  }

  function markMedicationTaken(medicationId) {
    const medication = state.medications.find((item) => item.id === medicationId);
    if (!medication) return;
    const now = new Date();
    medication.lastActionAt = now.toISOString();
    medication.lastActionType = "taken";
    medication.nextDueAt = new Date(now.getTime() + medication.intervalHours * 60 * 60 * 1000).toISOString();
    medication.history.unshift({ id: crypto.randomUUID(), type: "taken", timestamp: now.toISOString() });
    notifiedDueMedicationIds.delete(medication.id);
    persist();
  }

  function markMedicationNotNeeded(medicationId) {
    const medication = state.medications.find((item) => item.id === medicationId);
    if (!medication) return;
    const now = new Date();
    medication.lastActionAt = now.toISOString();
    medication.lastActionType = "notNeeded";
    if (medication.nextDueAt) {
      const previousDue = new Date(medication.nextDueAt);
      medication.nextDueAt = new Date(previousDue.getTime() + medication.intervalHours * 60 * 60 * 1000).toISOString();
    } else {
      medication.nextDueAt = new Date(now.getTime() + medication.intervalHours * 60 * 60 * 1000).toISOString();
    }
    medication.history.unshift({ id: crypto.randomUUID(), type: "notNeeded", timestamp: now.toISOString() });
    notifiedDueMedicationIds.delete(medication.id);
    persist();
  }

  function removeMedication(medicationId) {
    const medication = state.medications.find((item) => item.id === medicationId);
    if (!medication) return;
    medication.isActive = false;
    notifiedDueMedicationIds.delete(medication.id);
    persist();
  }

  function addDrainEntry({ side, drainNumber, amountML, color, loggedAt }) {
    state.drainEntries.push({
      id: crypto.randomUUID(),
      side,
      drainNumber,
      amountML,
      color,
      loggedAt
    });
    persist();
  }

  function removeDrainEntry(entryId) {
    const index = state.drainEntries.findIndex((entry) => entry.id === entryId);
    if (index === -1) return;
    state.drainEntries.splice(index, 1);
    persist();
  }

  function getEntriesForSide(side) {
    return state.drainEntries
      .filter((entry) => entry.side === side)
      .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
  }

  function getEntriesForSideAndNumber(side, drainNumber) {
    return state.drainEntries
      .filter((entry) => entry.side === side && entry.drainNumber === drainNumber)
      .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
  }

  function getAllDrainEntries() {
    return [...state.drainEntries]
      .sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
  }

  function getDrainEntry(entryId) {
    return state.drainEntries.find((entry) => entry.id === entryId) || null;
  }

  function getTotalForDay(side, daysAgo) {
    const target = new Date();
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() - daysAgo);

    return state.drainEntries
      .filter((entry) => entry.side === side && isSameDay(new Date(entry.loggedAt), target))
      .reduce((sum, entry) => sum + entry.amountML, 0);
  }

  function getTotalForDayAndNumber(side, drainNumber, daysAgo) {
    const target = new Date();
    target.setHours(0, 0, 0, 0);
    target.setDate(target.getDate() - daysAgo);

    return state.drainEntries
      .filter((entry) => entry.side === side && entry.drainNumber === drainNumber && isSameDay(new Date(entry.loggedAt), target))
      .reduce((sum, entry) => sum + entry.amountML, 0);
  }

  async function requestNotificationPermission() {
    if (!("Notification" in window)) {
      return "unavailable";
    }
    return Notification.requestPermission();
  }

  function notificationStatus() {
    if (!("Notification" in window)) return "unavailable";
    return Notification.permission;
  }

  async function requestPersistentStorage() {
    if (!navigator.storage?.persist) return "unsupported";
    const granted = await navigator.storage.persist();
    state.persistentStorageGranted = granted;
    return granted ? "granted" : "not-granted";
  }

  async function updatePersistenceStatus() {
    if (!navigator.storage?.persisted) {
      state.persistentStorageGranted = false;
      return;
    }
    state.persistentStorageGranted = await navigator.storage.persisted();
  }

  function checkDueMedications() {
    activeMedications.value
      .filter((medication) => medication.nextDueAt && new Date(medication.nextDueAt).getTime() <= Date.now())
      .forEach((medication) => {
        if (notifiedDueMedicationIds.has(medication.id)) return;
        notifiedDueMedicationIds.add(medication.id);

        if ("Notification" in window && Notification.permission === "granted" && document.visibilityState === "hidden") {
          new Notification(medication.name, {
            body: "Medication reminder",
            tag: medication.id
          });
        }
      });
  }
  
  function getCompleteTotal() {
    return state.drainEntries.reduce((sum, entry) => sum + entry.amountML, 0);
  }

  return {
    state: readonly(state),
    activeMedications,
    nextScheduledMedication,
    hydrate,
    addMedication,
    markMedicationTaken,
    markMedicationNotNeeded,
    removeMedication,
    addDrainEntry,
    removeDrainEntry,
    getAllDrainEntries,
    getDrainEntry,
    getEntriesForSide,
    getEntriesForSideAndNumber,
    getTotalForDay,
    getTotalForDayAndNumber,
    requestNotificationPermission,
    notificationStatus,
    requestPersistentStorage,
    updatePersistenceStatus,
    getCompleteTotal,
    checkDueMedications
  };
}

function persist() {
  const snapshot = {
    medications: state.medications.map((medication) => ({
      ...toRaw(medication),
      history: Array.isArray(medication.history)
        ? medication.history.map((item) => ({ ...toRaw(item) }))
        : []
    })),
    drainEntries: state.drainEntries.map((entry) => ({
      ...toRaw(entry)
    }))
  };

  saveAppState(snapshot);
}

