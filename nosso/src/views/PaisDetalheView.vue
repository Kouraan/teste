<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePrrStore } from '../stores/prrStore'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EstadoBadge from '../components/EstadoBadge.vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler,
)

const route = useRoute()
const router = useRouter()
const store = usePrrStore()
const { loading, pilares } = storeToRefs(store)

onMounted(() => store.carregarTudo())

const pais = computed(() => store.getPaisPorId(route.params.id))

// Gráfico de linha — desembolsos cumulativos
const lineData = computed(() => {
  if (!pais.value) return { labels: [], datasets: [] }
  let cum = 0
  return {
    labels: pais.value.desembolsosLinha.map((d) => d.data),
    datasets: [
      {
        label: 'Cumulativo (€B)',
        data: pais.value.desembolsosLinha.map((d) => {
          cum += d.montante
          return parseFloat(cum.toFixed(2))
        }),
        borderColor: '#1B3A6B',
        backgroundColor: 'rgba(27,58,107,0.07)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1B3A6B',
        pointRadius: 5,
      },
    ],
  }
})

const lineOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callbacks: { label: (c) => `€${c.parsed.y}B` } },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (v) => `€${v}B`, font: { size: 11 } },
      grid: { color: '#F1F5F9' },
    },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
}

// Gráfico de barras — milestones por pilar
const barData = computed(() => {
  if (!pais.value?.msPorPilar) return { labels: [], datasets: [] }
  const mp = pais.value.msPorPilar
  const labels = [],
    total = [],
    concluidos = [],
    bgs = [],
    bgsc = []
  pilares.value.forEach((p) => {
    if (mp[p.id]?.total > 0) {
      labels.push(p.shortName)
      total.push(mp[p.id].total)
      concluidos.push(mp[p.id].concluidos)
      bgs.push(p.cor + '44')
      bgsc.push(p.cor)
    }
  })
  return {
    labels,
    datasets: [
      { label: 'Total', data: total, backgroundColor: bgs, borderRadius: 3 },
      { label: 'Concluídos', data: concluidos, backgroundColor: bgsc, borderRadius: 3 },
    ],
  }
})

const barOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
    y: {
      beginAtZero: true,
      ticks: { stepSize: 1, font: { size: 11 } },
      grid: { color: '#F1F5F9' },
    },
  },
}

// Alocação por pilar (barra manual)
const pilaresAlocacao = computed(() => {
  if (!pais.value) return []
  return pilares.value
    .map((p) => ({
      ...p,
      pct: pais.value.pilaresAlocacao[p.id] ?? 0,
    }))
    .filter((p) => p.pct > 0)
})
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-slate-400 mb-5">
      <button @click="router.push('/paises')" class="hover:text-prr-blue transition-colors">
        🗺️ Países
      </button>
      <span>/</span>
      <span class="text-prr-blue font-medium">{{ pais?.nome ?? route.params.id }}</span>
    </div>

    <LoadingSpinner v-if="loading" />
    <div v-else-if="!pais" class="text-center py-20 text-slate-400">País não encontrado.</div>

    <div v-else>
      <!-- Hero -->
      <div class="bg-prr-blue text-white rounded-xl p-6 mb-6 shadow">
        <div class="flex items-center gap-4 mb-4">
          <span class="text-5xl">{{ pais.bandeira }}</span>
          <div>
            <h1 class="text-2xl font-black">{{ pais.nome }}</h1>
            <p class="text-white/70 text-sm">{{ pais.planNome }}</p>
            <p class="text-white/50 text-xs mt-0.5">
              Aprovado: {{ pais.planAprovado }} · Atualizado: {{ pais.ultimaAtualizacao }}
            </p>
          </div>
        </div>
        <p class="text-white/80 text-sm leading-relaxed">{{ pais.sobre }}</p>
        <div
          class="mt-3 bg-prr-gold/20 border border-prr-gold/30 rounded-lg px-4 py-2 text-sm text-prr-gold"
        >
          ⚡ REPowerEU: {{ pais.repowereu }}
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-prr-border p-4 text-center shadow-sm">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Total RRF</p>
          <p class="text-xl font-black text-prr-blue">€{{ pais.alocacao }}B</p>
          <p class="text-xs text-slate-400">{{ pais.pibShare }} do PIB</p>
        </div>
        <div class="bg-white rounded-xl border border-prr-border p-4 text-center shadow-sm">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Subvenções</p>
          <p class="text-xl font-black text-green-700">€{{ pais.subvencoes }}B</p>
          <p class="text-xs text-slate-400">Não reembolsável</p>
        </div>
        <div class="bg-white rounded-xl border border-prr-border p-4 text-center shadow-sm">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Desembolsado</p>
          <p class="text-xl font-black text-purple-700">€{{ pais.stats.totalDesembolsado }}B</p>
          <p class="text-xs text-slate-400">{{ pais.stats.pctDesembolsado }}% do total</p>
        </div>
        <div class="bg-white rounded-xl border border-prr-border p-4 text-center shadow-sm">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Milestones</p>
          <p class="text-xl font-black text-orange-600">
            {{ pais.stats.concluidos }}/{{ pais.stats.totalMs }}
          </p>
          <p class="text-xs text-slate-400">{{ pais.stats.pctMs }}% concluídos</p>
        </div>
      </div>

      <!-- Barras de progresso -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-prr-border shadow-sm p-4">
          <div class="flex justify-between text-sm mb-2">
            <span class="font-semibold text-slate-700">Execução financeira</span>
            <span class="font-black text-prr-blue">{{ pais.stats.pctDesembolsado }}%</span>
          </div>
          <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-3 rounded-full bg-prr-blue"
              :style="{ width: pais.stats.pctDesembolsado + '%' }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-slate-400 mt-1">
            <span>€{{ pais.stats.totalDesembolsado }}B desembolsados</span>
            <span>€{{ pais.alocacao }}B total</span>
          </div>
        </div>
        <div class="bg-white rounded-xl border border-prr-border shadow-sm p-4">
          <div class="flex justify-between text-sm mb-2">
            <span class="font-semibold text-slate-700">Milestones & Targets</span>
            <span class="font-black text-orange-600">{{ pais.stats.pctMs }}%</span>
          </div>
          <div class="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-3 rounded-full bg-orange-500"
              :style="{ width: pais.stats.pctMs + '%' }"
            ></div>
          </div>
          <div class="flex justify-between text-xs text-slate-400 mt-1">
            <span>{{ pais.stats.concluidos }} concluídos</span>
            <span>{{ pais.stats.totalMs }} total</span>
          </div>
        </div>
      </div>

      <!-- Alocação por pilar -->
      <div class="bg-white rounded-xl border border-prr-border shadow-sm p-5 mb-6">
        <h3 class="text-sm font-bold text-prr-blue mb-4">Alocação por Pilar Temático (%)</h3>
        <div class="space-y-3">
          <div v-for="p in pilaresAlocacao" :key="p.id" class="flex items-center gap-3">
            <span class="text-base w-6 text-center flex-shrink-0">{{ p.icone }}</span>
            <span class="text-xs text-slate-600 w-32 flex-shrink-0 truncate">{{
              p.shortName
            }}</span>
            <div class="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                class="h-4 rounded-full flex items-center justify-end pr-1.5 text-white text-[10px] font-bold"
                :style="{ width: p.pct + '%', backgroundColor: p.cor, minWidth: '2rem' }"
              >
                {{ p.pct }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-xl border border-prr-border shadow-sm p-5">
          <h3 class="text-sm font-bold text-prr-blue mb-4">📈 Desembolsos Cumulativos (€B)</h3>
          <div class="h-52">
            <Line :data="lineData" :options="lineOpts" />
          </div>
        </div>
        <div class="bg-white rounded-xl border border-prr-border shadow-sm p-5">
          <h3 class="text-sm font-bold text-prr-blue mb-4">🎯 Milestones por Pilar</h3>
          <div class="h-52">
            <Bar :data="barData" :options="barOpts" />
          </div>
        </div>
      </div>

      <!-- Tabela pedidos de pagamento -->
      <div class="bg-white rounded-xl border border-prr-border shadow-sm mb-6 overflow-hidden">
        <div class="px-5 py-3 border-b border-prr-border bg-prr-light">
          <h3 class="text-sm font-bold text-prr-blue">💳 Pedidos de Pagamento</h3>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-xs text-slate-400 font-semibold uppercase border-b border-prr-border">
              <th class="px-4 py-2 text-left">Pedido</th>
              <th class="px-4 py-2 text-left">Data</th>
              <th class="px-4 py-2 text-left">Montante</th>
              <th class="px-4 py-2 text-center">Milestones</th>
              <th class="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="p in pais.pedidos" :key="p.nome" class="hover:bg-slate-50">
              <td class="px-4 py-2.5 font-medium text-slate-700">{{ p.nome }}</td>
              <td class="px-4 py-2.5 text-slate-500">{{ p.data }}</td>
              <td class="px-4 py-2.5 font-bold text-prr-blue">{{ p.montante }}</td>
              <td class="px-4 py-2.5 text-center text-slate-600">{{ p.milestones }}</td>
              <td class="px-4 py-2.5"><EstadoBadge :estado="p.estado" /></td>
            </tr>
            <tr class="bg-prr-light border-t-2 border-prr-border">
              <td colspan="2" class="px-4 py-2.5 font-bold text-slate-700">Total desembolsado</td>
              <td class="px-4 py-2.5 font-black text-prr-blue">{{ pais.totalPedidos.montante }}</td>
              <td class="px-4 py-2.5 text-center text-slate-500 text-xs">
                {{ pais.totalPedidos.milestones }} ms
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reformas e investimentos -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="bg-white rounded-xl border border-prr-border shadow-sm p-5">
          <h3 class="text-sm font-bold text-prr-blue mb-4">🔧 Reformas Estruturais Chave</h3>
          <ul class="space-y-2">
            <li
              v-for="r in pais.reformasChave"
              :key="r"
              class="flex gap-2 items-start text-sm text-slate-600"
            >
              <span class="text-prr-blue mt-0.5 flex-shrink-0">●</span>
              <span>{{ r }}</span>
            </li>
          </ul>
        </div>
        <div class="bg-white rounded-xl border border-prr-border shadow-sm p-5">
          <h3 class="text-sm font-bold text-prr-blue mb-4">💡 Investimentos Chave</h3>
          <ul class="space-y-2">
            <li
              v-for="inv in pais.investimentosChave"
              :key="inv.descricao"
              class="flex gap-2 items-start text-sm"
            >
              <span class="font-black text-prr-orange flex-shrink-0">{{ inv.valor }}</span>
              <span class="text-slate-600">{{ inv.descricao }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Indicadores de output -->
      <div class="bg-white rounded-xl border border-prr-border shadow-sm p-5">
        <h3 class="text-sm font-bold text-prr-blue mb-4">📌 Indicadores de Output</h3>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="ind in pais.indicadores"
            :key="ind.label"
            class="bg-prr-light rounded-lg p-3 text-center"
          >
            <div class="text-2xl mb-1">{{ ind.icone }}</div>
            <p class="text-lg font-black text-prr-blue">{{ ind.valor }}</p>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {{ ind.unidade }}
            </p>
            <p class="text-xs text-slate-400 mt-0.5">{{ ind.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
