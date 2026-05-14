<script setup>
defineProps({
  label: String,
  valor: [String, Number],
  sub: String,
  cor: { type: String, default: '#1B3A6B' },
  icone: String,
})
</script>

<template>
  <div class="bg-white rounded-xl border border-prr-border p-5 shadow-sm flex items-start gap-4">
    <div
      v-if="icone"
      class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
      :style="{ backgroundColor: cor + '18' }"
    >
      {{ icone }}
    </div>
    <div>
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{{ label }}</p>
      <p class="text-2xl font-black leading-none" :style="{ color: cor }">{{ valor }}</p>
      <p v-if="sub" class="text-xs text-slate-400 mt-1">{{ sub }}</p>
    </div>
  </div>
</template>
