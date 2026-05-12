<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiStore } from '../stores/apiStore'
import { storeToRefs } from 'pinia'
import PillarBadge from '../components/PillarBadge.vue'
import ExportButton from '../components/ExportButton.vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const route = useRoute()
const router = useRouter()
const store = useApiStore()
const { pillars } = storeToRefs(store)

const pillarId = route.params.id
const pillar = computed(() => pillars.value.find(p => p.id === pillarId))

const accentColor = computed(() => pillar.value?.color || '#003399')

onMounted(() => {
  store.fetchAll()
})

const breakdownByPolicyArea = computed(() => {
  if (!pillar.value?.breakdown) return []
  const total = pillar.value.breakdown.reduce((sum, i) => sum + i.amount, 0)
  return pillar.value.breakdown.map(item => ({
    ...item,
    pct: Math.round((item.amount / total) * 100)
  }))
})



const policyAreaChartData = computed(() => ({
  labels: breakdownByPolicyArea.value.map(i => i.label),
  datasets: [{
    data: breakdownByPolicyArea.value.map(i => i.pct),
    backgroundColor: accentColor.value,
    borderRadius: 4,
    barThickness: 14
  }]
}))



const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: { label: ctx => ` ${ctx.parsed.x}%` }
    }
  },
  scales: {
    x: {
      min: 0,
      max: 100,
      grid: { color: '#f1f5f9' },
      ticks: { callback: v => v + '%', font: { size: 11 } }
    },
    y: {
      grid: { display: false },
      ticks: { font: { size: 11 } }
    }
  }
}

const keyInvestments = computed(() => pillar.value?.keyInvestments ?? [])

const formatCurrency = (val) => {
  if (val >= 1e9) return `€${(val / 1e9).toFixed(1)}B`
  if (val >= 1e6) return `€${(val / 1e6).toFixed(1)}M`
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR', maximumSignificantDigits: 3 }).format(val)
}

const formatLargeNumber = (val) => new Intl.NumberFormat('en-EU').format(val)
</script>

<template>
  <div class="min-h-screen bg-white">

    <div class="max-w-6xl mx-auto px-6 pt-6">
      <button
        @click="router.back()"
        class="mb-4 text-[#003399] hover:underline flex items-center gap-1 text-sm font-medium"
      >
        <span>&#8592;</span> Back to Home
      </button>
    </div>

    <div v-if="!pillar" class="text-center py-20">
      <h2 class="text-2xl font-bold text-slate-800">Pillar not found</h2>
    </div>

    <div v-else class="max-w-6xl mx-auto px-6 pb-16">

      <!-- Header -->
      <div class="mb-6">
        <div class="flex items-center gap-3 mb-3">
          <h1 class="text-2xl font-bold" :style="{ color: accentColor }">{{ pillar.name }}</h1>
          <PillarBadge :category="pillarId" />
        </div>
        <p class="text-sm text-slate-600 leading-relaxed max-w-4xl">
          {{ pillar.fullDescription }}
        </p>
      </div>

      <!-- Stats row -->
      <div class="flex flex-wrap items-center gap-10 mb-10">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"># Milestones &amp; Targets</p>
          <p class="text-4xl font-bold text-[#003399]">{{ formatLargeNumber(pillar.milestones || 2713) }}</p>
        </div>
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1"># Measures</p>
          <p class="text-4xl font-bold text-[#003399]">{{ formatLargeNumber(pillar.measures || 1200) }}</p>
        </div>
      </div>

      <!-- Card 1: Breakdown by policy area -->
      <div id="pillar-chart-1" class="border border-slate-200 rounded-lg p-6 mb-6 bg-white">
        <div class="flex items-start justify-between mb-1">
          <div>
            <h2 class="text-base font-bold text-slate-800">
              Breakdown of expenditure towards climate objectives per policy area
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">
              Total climate-related expenditure across all Member States: {{ formatCurrency(pillar.budget || 318500000000) }}
            </p>
          </div>
          <ExportButton targetId="pillar-chart-1" :data="breakdownByPolicyArea" :filename="'Pillar_Expenditure_' + pillar.id" />
        </div>

        <div class="mt-5 space-y-3">
          <div v-for="item in breakdownByPolicyArea" :key="item.label" class="flex items-center gap-3">
            <span class="text-sm text-slate-700 w-44 flex-shrink-0">{{ item.label }}</span>
            <div class="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div class="h-3 rounded-full transition-all duration-500"
                :style="{ width: item.pct + '%', backgroundColor: accentColor }"
              ></div>
            </div>
            <span class="text-sm font-semibold text-slate-700 w-28 text-right flex-shrink-0">
              {{ formatCurrency(item.amount) }}
              <span class="text-slate-400 font-normal ml-8"></span>
            </span>
          </div>
        </div>

        <div class="mt-6 h-48">
          <Bar :data="policyAreaChartData" :options="chartOptions" />
        </div>
      </div>



      <!-- Card 3: Key investments -->
      <div class="border border-slate-200 rounded-lg p-6">
        <h2 class="text-base font-bold text-slate-800 mb-5">Key investment examples by Member State</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div v-for="inv in keyInvestments" :key="inv.country" class="flex items-start gap-3">
            <span class="text-2xl leading-none flex-shrink-0 mt-0.5">{{ inv.flag }}</span>
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ inv.country }}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{ inv.description }}</p>
              <p class="text-sm font-bold mt-1" :style="{ color: accentColor }">
                {{ formatCurrency(inv.amount) }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
