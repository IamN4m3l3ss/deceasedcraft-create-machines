<script setup lang="ts">
withDefaults(defineProps<{ title: string; tone?: 'info' | 'warn' | 'ok' }>(), { tone: 'info' })
</script>

<template>
  <div class="callout" :class="tone">
    <span class="ic">{{ tone === 'warn' ? '!' : tone === 'ok' ? '✓' : 'i' }}</span>
    <div><h4>{{ title }}</h4><p><slot /></p></div>
  </div>
</template>
