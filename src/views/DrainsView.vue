<script setup>
import { computed, reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import BaseCard from "../components/BaseCard.vue";
import BaseModal from "../components/BaseModal.vue";
import { formatDateTime } from "../lib/formatters";
import { useAppStore } from "../stores/appStore";

const appStore = useAppStore();
const noteForm = reactive({
  title: "",
  body: ""
});
const showAddNoteModal = ref(false);
const selectedNoteId = ref(null);

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

    <div class="stack section-gap-sm">
      <BaseCard v-if="notes.length" class="notes-card">
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

      <button class="nav-tile" type="button" @click="openAddNoteModal">Notes</button>
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
