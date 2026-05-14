<script setup>
import { computed } from 'vue'
import { usePrrStore } from '../stores/prrStore'
import { storeToRefs } from 'pinia'

const props = defineProps({ pilarId: { type: String, required: true } })
const { pilares } = storeToRefs(usePrrStore())

const pilar = computed(() => pilares.value.find((p) => p.id === props.pilarId))
</script>

<template>
  <span
    v-if="pilar"
    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[11px] font-semibold"
    :style="{ backgroundColor: pilar.cor }"
    :title="pilar.nome"
  >
    <span>{{ pilar.icone }}</span>
    <span>{{ pilar.shortName }}</span>
  </span>
  <span
    v-else
    class="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[11px]"
  >
    {{ pilarId }}
  </span>
</template>
