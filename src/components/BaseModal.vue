<script setup>
defineProps({
  open: Boolean,
  title: { type: String, required: true }
});

defineEmits(["close"]);
</script>

<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-panel">
      <div class="modal-header">
        <h3>{{ title }}</h3>
      </div>
      <slot />
    </div>
  </div>
</template>
