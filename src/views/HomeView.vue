<script setup>
import { computed, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import BaseCard from "../components/BaseCard.vue";
import BaseModal from "../components/BaseModal.vue";
import { formatDateTime, formatTime } from "../lib/formatters";
import { useAppStore } from "../stores/appStore";

const appStore = useAppStore();
const noteForm = reactive({
  title: "",
  body: ""
});
const showAddNoteModal = ref(false);
const selectedNoteId = ref(null);

const nextMedication = computed(() => appStore.activeMedications.value[0] || null);
const leftLast = computed(() => appStore.getEntriesForSide("left")[0] || null);
const rightLast = computed(() => appStore.getEntriesForSide("right")[0] || null);
const notes = computed(() => appStore.getAllNotes());
const selectedNote = computed(() => (
  selectedNoteId.value ? appStore.getNote(selectedNoteId.value) : null
));

function openAddNoteModal() {
  noteForm.title = "";
  noteForm.body = "";
  showAddNoteModal.value = true;
}

function saveNote() {
  if (!noteForm.title.trim() || !noteForm.body.trim()) return;
  appStore.addNote({
    title: noteForm.title,
    body: noteForm.body
  });
  showAddNoteModal.value = false;
}

function openNote(noteId) {
  selectedNoteId.value = noteId;
}
</script>

<template>
  <section class="page-shell">
    <div class="screen-heading">
      <div class="home-brand">
        <img class="home-logo" src="/icons/lydie-192.png" alt="Lydie logo" />
        <div class="home-brand-copy">
          <h2>Lydie</h2>
          <p class="muted">Private bedside tracking for medications and drains.</p>
        </div>
      </div>
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

      <div class="home-overview-row">
        <BaseCard v-if="notes.length" class="notes-card feature-card">
          <p class="summary-label">Notes</p>
          <div class="stack compact-stack">
            <button
              v-for="note in notes"
              :key="note.id"
              class="note-title-button"
              type="button"
              @click="openNote(note.id)"
            >
              <span>{{ note.title }}</span>
            </button>
          </div>
        </BaseCard>
        <BaseCard v-else class="overview-card feature-card">
          <p class="summary-label">Notes</p>
          <h3 class="overview-title">No notes yet</h3>
          <p class="overview-line">Add quick reminders or care notes for yourself.</p>
        </BaseCard>

        <button class="nav-tile" type="button" @click="openAddNoteModal">Notes</button>
      </div>
    </div>
  </section>

  <BaseModal :open="showAddNoteModal" title="Add Note" @close="showAddNoteModal = false">
    <div class="field">
      <span>Title</span>
      <input v-model="noteForm.title" type="text" maxlength="80" placeholder="Example: Empty left drain" />
    </div>

    <div class="field">
      <span>Note</span>
      <textarea v-model="noteForm.body" rows="5" maxlength="1200" placeholder="Write the note here."></textarea>
    </div>

    <div class="modal-actions">
      <button class="action-button brand" type="button" :disabled="!noteForm.title.trim() || !noteForm.body.trim()" @click="saveNote">
        Save Note
      </button>
      <button class="action-button subtle" type="button" @click="showAddNoteModal = false">Cancel</button>
    </div>
  </BaseModal>

  <BaseModal :open="Boolean(selectedNote)" :title="selectedNote?.title || 'Note'" @close="selectedNoteId = null">
    <div v-if="selectedNote" class="stack section-gap-sm">
      <p class="muted">{{ formatDateTime(selectedNote.createdAt) }}</p>
      <p class="note-body">{{ selectedNote.body }}</p>
      <button class="action-button subtle" type="button" @click="selectedNoteId = null">Close</button>
    </div>
  </BaseModal>
</template>
