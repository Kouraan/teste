<script setup>
defineProps({ titulo: String, descricao: String, icone: String })
</script>

<template>
  <div class="mb-6">
    <div class="flex items-center gap-2 mb-1">
      <span v-if="icone" class="text-xl">{{ icone }}</span>
      <h1 class="text-2xl font-bold text-prr-blue">{{ titulo }}</h1>
    </div>
    <p v-if="descricao" class="text-sm text-slate-500 max-w-2xl">{{ descricao }}</p>
  </div>
</template>
