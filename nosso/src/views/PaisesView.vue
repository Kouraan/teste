<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePrrStore } from '../stores/prrStore'
import { useRouter } from 'vue-router'
import PageHeader from '../components/PageHeader.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

const store = usePrrStore()
const { paises, loading } = storeToRefs(store)
const router = useRouter()

onMounted(() => store.carregarTudo())
</script>

<template>
  <div>
    <PageHeader
      icone="🗺️"
      titulo="Países"
      descricao="Selecione um país para ver o seu dashboard detalhado de execução do PRR."
    />

    <LoadingSpinner v-if="loading" />

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="p in paises"
        :key="p.id"
        @click="router.push('/paises/' + p.id)"
        class="bg-white rounded-xl border border-prr-border shadow-sm p-6 cursor-pointer hover:border-prr-blue hover:shadow-lg transition-all group"
      >
        <!-- Cabeçalho -->
        <div class="flex items-start gap-4 mb-5">
          <span class="text-5xl">{{ p.bandeira }}</span>
          <div>
            <h2 class="text-lg font-bold text-prr-blue group-hover:underline">{{ p.nome }}</h2>
            <p class="text-xs text-slate-400">{{ p.planNome }}</p>
            <p class="text-xs text-slate-400 mt-0.5">Aprovado: {{ p.planAprovado }}</p>
          </div>
        </div>

        <!-- Stats grid -->
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="text-center p-2 bg-prr-light rounded-lg">
            <p class="text-xs text-slate-500 mb-0.5">Total RRF</p>
            <p class="font-bold text-prr-blue text-sm">€{{ p.alocacao }}B</p>
          </div>
          <div class="text-center p-2 bg-prr-light rounded-lg">
            <p class="text-xs text-slate-500 mb-0.5">Subvenções</p>
            <p class="font-bold text-green-700 text-sm">€{{ p.subvencoes }}B</p>
          </div>
          <div class="text-center p-2 bg-prr-light rounded-lg">
            <p class="text-xs text-slate-500 mb-0.5">% PIB</p>
            <p class="font-bold text-slate-700 text-sm">{{ p.pibShare }}</p>
          </div>
        </div>

        <!-- Barra de progresso -->
        <div class="flex justify-between text-xs text-slate-500 mb-1">
          <span>Execução financeira</span>
          <span class="font-bold text-prr-blue"
            >{{ ((p.desembolsado / p.alocacao) * 100).toFixed(1) }}%</span
          >
        </div>
        <div class="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            class="h-2.5 rounded-full transition-all"
            :style="{
              width: (p.desembolsado / p.alocacao) * 100 + '%',
              backgroundColor: '#1B3A6B',
            }"
          ></div>
        </div>
        <p class="text-xs text-slate-400 mt-1">€{{ p.desembolsado }}B desembolsados</p>

        <div class="mt-4 flex justify-end">
          <span class="text-xs font-semibold text-prr-blue group-hover:underline"
            >Ver detalhes →</span
          >
        </div>
      </div>
    </div>
  </div>
</template>
