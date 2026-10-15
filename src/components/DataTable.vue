<script setup lang="ts">
import type { Table } from '../data/builds'
defineProps<{ table: Table }>()
</script>

<template>
  <div class="dt">
    <h3 v-if="table.title" class="dt-t">{{ table.title }}</h3>
    <div class="tbl-wrap">
      <table class="tbl">
        <thead><tr><th v-for="h in table.head" :key="h">{{ h }}</th></tr></thead>
        <tbody>
          <tr v-for="(r, i) in table.rows" :key="i" :class="{ hl: table.highlight?.includes(i) }">
            <td v-for="(c, j) in r" :key="j" v-html="c" />
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="table.note" class="dt-n">{{ table.note }}</p>
  </div>
</template>

<style scoped>
.dt-t { margin-bottom: 10px; }
.dt-n { font-size: 13px; color: var(--muted); margin: 10px 0 0; }
</style>
