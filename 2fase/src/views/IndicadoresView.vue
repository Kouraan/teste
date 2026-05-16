<script setup>
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePrrStore } from '../stores/prrStore'
import PageHeader from '../components/PageHeader.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import PilarBadge from '../components/PilarBadge.vue'
import ExportButton from '../components/ExportButton.vue'

const store = usePrrStore()
const { indicadoresComuns, loading } = storeToRefs(store)
onMounted(() => store.carregarTudo())

const filtro = ref('')

const filtrados = computed(() =>
  indicadoresComuns.value.filter((i) => !filtro.value || i.categorias.includes(filtro.value)),
)

const categorias = computed(() => {
  const cats = new Set()
  indicadoresComuns.value.forEach((i) => i.categorias.forEach((c) => cats.add(c)))
  return [...cats]
})
</script>

<template>
  <div>
    <div class="flex items-start justify-between mb-8 gap-4">
      <PageHeader
        icone="📊"
        titulo="Indicadores Comuns"
        descricao="Indicadores de output comuns do RRF, reportados pelos Estados-Membros duas vezes por ano à Comissão Europeia."
      />
      <div class="pt-1 flex-shrink-0">
        <ExportButton :data="filtrados" filename="indicadores-comuns" />
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else>
      <!-- Filtro por categoria -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          @click="filtro = ''"
          class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
          :class="
            filtro === ''
              ? 'bg-prr-blue text-white border-prr-blue'
              : 'bg-white text-slate-600 border-prr-border hover:border-prr-blue'
          "
        >
          Todos
        </button>
        <button
          v-for="cat in categorias"
          :key="cat"
          @click="filtro = cat"
          class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
          :class="
            filtro === cat
              ? 'bg-prr-blue text-white border-prr-blue'
              : 'bg-white text-slate-600 border-prr-border hover:border-prr-blue'
          "
        >
          {{ cat }}
        </button>
      </div>

      <!-- Grid de indicadores -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="ind in filtrados"
          :key="ind.id"
          class="bg-white rounded-xl border border-prr-border shadow-sm p-5 hover:shadow-md transition-shadow"
        >
          <!-- Badges categoria -->
          <div class="flex flex-wrap gap-1 mb-3">
            <PilarBadge v-for="cat in ind.categorias" :key="cat" :pilar-id="cat" />
          </div>

          <!-- ID + Nome -->
          <p class="text-sm font-semibold text-slate-800 leading-snug mb-3">
            <span class="text-prr-blue font-black">({{ ind.id }})</span> {{ ind.nome }}
          </p>

          <!-- Valor -->
          <div class="pt-3 border-t border-prr-border">
            <span class="text-xl font-black text-prr-blue">{{ ind.valor }}</span>
            <span class="text-xs text-slate-400 ml-1">{{ ind.unidade }}</span>
          </div>
        </div>
      </div>

      <p class="text-xs text-slate-400 italic mt-6 text-center">
        Dados reportados pelos EM até fim de 2023. Fonte: Scoreboard RRF da Comissão Europeia.
      </p>
    </div>
  </div>
</template>
