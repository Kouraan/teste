<script setup>
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePrrStore } from '../stores/prrStore'
import PageHeader from '../components/PageHeader.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const store = usePrrStore()
const { cronologia, loading } = storeToRefs(store)
onMounted(() => store.carregarTudo())

const filtroPais = ref('')
const filtroCategoria = ref('')

const paises = computed(() => [...new Set(cronologia.value.map((e) => e.pais))].sort())
const categorias = computed(() => [...new Set(cronologia.value.map((e) => e.categoria))].sort())

const filtrados = computed(() =>
  cronologia.value.filter((e) => {
    const cp = !filtroPais.value || e.pais === filtroPais.value
    const cc = !filtroCategoria.value || e.categoria === filtroCategoria.value
    return cp && cc
  }),
)
</script>

<template>
  <div>
    <PageHeader
      icone="📅"
      titulo="Cronologia"
      descricao="Linha de tempo dos principais eventos, avaliações e desembolsos do RRF desde a sua entrada em vigor em fevereiro de 2021."
    />

    <LoadingSpinner v-if="loading" />

    <div v-else>
      <!-- Filtros -->
      <div class="flex flex-wrap gap-3 mb-8 p-4 bg-prr-light rounded-xl border border-prr-border">
        <select
          v-model="filtroPais"
          class="text-xs border border-prr-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-prr-blue"
        >
          <option value="">Todos os países</option>
          <option v-for="p in paises" :key="p" :value="p">{{ p }}</option>
        </select>
        <select
          v-model="filtroCategoria"
          class="text-xs border border-prr-border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-prr-blue"
        >
          <option value="">Todas as categorias</option>
          <option v-for="c in categorias" :key="c" :value="c">{{ c }}</option>
        </select>
        <button
          v-if="filtroPais || filtroCategoria"
          @click="filtroPais = ''; filtroCategoria = ''"
          class="text-xs font-semibold text-prr-blue hover:underline px-2"
        >
          Limpar filtros
        </button>
      </div>

      <!-- Timeline -->
      <div v-if="filtrados.length === 0" class="text-center py-16 text-slate-400 italic">
        Nenhum evento encontrado.
      </div>

      <div v-else class="relative ml-2">
        <!-- Linha vertical -->
        <div class="absolute left-[130px] top-0 bottom-0 w-0.5 bg-prr-border"></div>

        <div class="space-y-6">
          <div v-for="evento in filtrados" :key="evento.id" class="flex items-start gap-0">
            <!-- Data -->
            <div
              class="w-[120px] pt-2 text-right pr-5 text-xs font-medium text-slate-400 whitespace-nowrap flex-shrink-0"
            >
              {{ evento.data }}
            </div>

            <!-- Ponto na linha -->
            <div
              class="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0 mt-2 z-10"
              :style="{ backgroundColor: evento.cor }"
            ></div>

            <!-- Cartão do evento -->
            <div
              class="ml-5 flex-1 bg-white rounded-xl border border-prr-border shadow-sm p-4 hover:shadow-md transition-shadow mb-1"
            >
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  class="text-[10px] uppercase font-bold text-white px-2 py-0.5 rounded"
                  :style="{ backgroundColor: evento.cor }"
                  >{{ evento.categoria }}</span
                >
                <span
                  v-if="evento.novo"
                  class="bg-prr-gold text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  >Novo</span
                >
                <span
                  v-if="evento.historico"
                  class="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase"
                  >Histórico</span
                >
                <span
                  v-if="evento.pais"
                  class="ml-auto text-[10px] text-slate-400 font-medium uppercase tracking-wide"
                  >{{ evento.pais }}</span
                >
              </div>
              <h3 class="text-sm font-bold text-slate-800 mb-1">{{ evento.titulo }}</h3>
              <p class="text-xs text-slate-500 leading-relaxed">{{ evento.descricao }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
