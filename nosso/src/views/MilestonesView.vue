<script setup>
import { onMounted, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePrrStore } from '../stores/prrStore'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import PageHeader from '../components/PageHeader.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EstadoBadge from '../components/EstadoBadge.vue'
import PilarBadge from '../components/PilarBadge.vue'
import ExportButton from '../components/ExportButton.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const store = usePrrStore()
const { milestones, loading } = storeToRefs(store)
onMounted(() => store.carregarTudo())

const filtroPais = ref('')
const filtroPilar = ref('')

const stats = computed(() => store.estatsMilestones)

const chartData = computed(() => ({
  labels: stats.value.grafico.map((d) => d.nome),
  datasets: [
    {
      label: 'Taxa de conclusão (%)',
      data: stats.value.grafico.map((d) => d.pct.toFixed(1)),
      backgroundColor: stats.value.grafico.map((d) => (d.pct > 50 ? '#2E7D3299' : '#E6510099')),
      borderColor: stats.value.grafico.map((d) => (d.pct > 50 ? '#2E7D32' : '#E65100')),
      borderWidth: 1.5,
      borderRadius: 4,
    },
  ],
}))

const chartOpts = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (c) => ` ${c.parsed.x.toFixed(1)}%` } },
  },
  scales: {
    x: {
      min: 0,
      max: 100,
      ticks: { callback: (v) => v + '%', font: { size: 11 } },
      grid: { color: '#F1F5F9' },
    },
    y: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
}

const paises = computed(() => [...new Set(milestones.value.map((m) => m.pais))].sort())
const pilares = computed(() => [...new Set(milestones.value.map((m) => m.pilar))].sort())

const filtrados = computed(() =>
  milestones.value.filter((m) => {
    const cp = !filtroPais.value || m.pais === filtroPais.value
    const cpi = !filtroPilar.value || m.pilar === filtroPilar.value
    return cp && cpi
  }),
)
</script>

<template>
  <div>
    <div class="flex items-start justify-between mb-8 gap-4">
      <PageHeader
        icone="🎯"
        titulo="Milestones & Targets"
        descricao="Os Estados-Membros devem cumprir os milestones e targets acordados antes de cada desembolso."
      />
      <div class="pt-1 flex-shrink-0">
        <ExportButton :data="filtrados" filename="milestones" />
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else>
      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div
          class="bg-white rounded-xl border border-prr-border p-4 text-center shadow-sm border-b-4 border-b-prr-blue"
        >
          <p class="text-2xl font-black text-prr-blue">{{ stats.total }}</p>
          <p class="text-xs text-slate-500 uppercase mt-1">Total</p>
        </div>
        <div
          class="bg-white rounded-xl border border-prr-border p-4 text-center shadow-sm border-b-4 border-b-green-500"
        >
          <p class="text-2xl font-black text-green-700">{{ stats.concluidos }}</p>
          <p class="text-xs text-slate-500 uppercase mt-1">Concluídos</p>
        </div>
        <div
          class="bg-white rounded-xl border border-prr-border p-4 text-center shadow-sm border-b-4 border-b-amber-500"
        >
          <p class="text-2xl font-black text-amber-600">{{ stats.emCurso }}</p>
          <p class="text-xs text-slate-500 uppercase mt-1">Em curso</p>
        </div>
        <div
          class="bg-white rounded-xl border border-prr-border p-4 text-center shadow-sm border-b-4 border-b-slate-300"
        >
          <p class="text-2xl font-black text-slate-500">{{ stats.pendentes }}</p>
          <p class="text-xs text-slate-500 uppercase mt-1">Pendentes</p>
        </div>
      </div>

      <!-- Gráfico -->
      <div class="bg-white rounded-xl border border-prr-border shadow-sm p-5 mb-6">
        <h3 class="text-sm font-bold text-prr-blue mb-4">Taxa de conclusão por País (%)</h3>
        <div class="h-48">
          <Bar :data="chartData" :options="chartOpts" />
        </div>
      </div>

      <!-- Filtros + Tabela -->
      <div class="bg-white rounded-xl border border-prr-border shadow-sm overflow-hidden">
        <div
          class="px-5 py-3 bg-prr-light border-b border-prr-border flex items-center justify-between flex-wrap gap-2"
        >
          <span class="text-sm font-bold text-prr-blue">Lista de milestones</span>
          <div class="flex items-center gap-2">
            <select
              v-model="filtroPais"
              class="text-xs border border-prr-border rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-prr-blue"
            >
              <option value="">Todos os países</option>
              <option v-for="p in paises" :key="p" :value="p">{{ p }}</option>
            </select>
            <select
              v-model="filtroPilar"
              class="text-xs border border-prr-border rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-prr-blue"
            >
              <option value="">Todos os pilares</option>
              <option v-for="p in pilares" :key="p" :value="p">{{ p }}</option>
            </select>
            <button
              v-if="filtroPais || filtroPilar"
              @click="filtroPais = ''; filtroPilar = ''"
              class="text-xs text-prr-blue hover:underline font-semibold"
            >
              Limpar
            </button>
          </div>
        </div>

        <table class="w-full text-sm">
          <thead>
            <tr class="text-xs text-slate-400 font-semibold uppercase border-b border-prr-border">
              <th class="px-4 py-2 text-left">País</th>
              <th class="px-4 py-2 text-left">Pilar</th>
              <th class="px-4 py-2 text-left">Descrição</th>
              <th class="px-4 py-2 text-left">CSR</th>
              <th class="px-4 py-2 text-left">Prazo</th>
              <th class="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-if="filtrados.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-slate-400 italic">
                Nenhum milestone encontrado.
              </td>
            </tr>
            <tr v-for="m in filtrados" :key="m.id" class="hover:bg-prr-light">
              <td class="px-4 py-2.5 font-medium text-slate-700">{{ m.pais }}</td>
              <td class="px-4 py-2.5"><PilarBadge :pilar-id="m.pilar" /></td>
              <td class="px-4 py-2.5 text-slate-600">{{ m.descricao }}</td>
              <td class="px-4 py-2.5 text-xs text-slate-400">{{ m.csr }}</td>
              <td class="px-4 py-2.5 text-xs text-slate-500">{{ m.prazo }}</td>
              <td class="px-4 py-2.5"><EstadoBadge :estado="m.estado" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
