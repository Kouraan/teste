<script setup>
import { computed } from 'vue'
const props = defineProps({ estado: { type: String, required: true } })

const config = computed(() => {
  const e = props.estado.toLowerCase()
  if (e === 'concluido' || e === 'desembolsado')
    return { cls: 'bg-green-50 text-green-700 border-green-200', label: 'Concluído' }
  if (e === 'em-curso')
    return { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Em curso' }
  if (e === 'pendente')
    return { cls: 'bg-slate-50 text-slate-500 border-slate-200', label: 'Pendente' }
  return { cls: 'bg-slate-50 text-slate-500 border-slate-200', label: props.estado }
})
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border uppercase tracking-wide"
    :class="config.cls"
  >
    {{ config.label }}
  </span>
</template>
