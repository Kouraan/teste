<script setup>
import { onMounted, computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '../stores/apiStore'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import StatusBadge from '../components/StatusBadge.vue'
import ExportButton from '../components/ExportButton.vue'
import PillarBadge from '../components/PillarBadge.vue'
import SelectCountry from '../components/SelectCountry.vue'
import SelectPillar from '../components/SelectPillar.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const store = useApiStore()
const { milestones, loading } = storeToRefs(store)

const selectedCountry = ref('')
const selectedPillar = ref('')

onMounted(() => {
  store.fetchAll()
})

const stats = computed(() => store.getMilestonesStats)

const chartData = computed(() => ({
  labels: stats.value.chartLabels,
  datasets: [{
    label: 'Fulfilment %',
    backgroundColor: (context) => {
      const value = context.raw;
      return value > 50 ? '#15803d' : '#f97316';
    },
    data: stats.value.chartValues,
    borderRadius: 5,
    barThickness: 12
  }]
}))

const chartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { callback: (ctx) => `${ctx.parsed.x.toFixed(1)}%` }
  },
  scales: {
    x: { min: 0, max: 100, grid: { display: false } },
    y: { grid: { display: false } }
  }
}

const filteredMilestones = computed(() => {
  return milestones.value.filter(ms => {
    const countryMatch = !selectedCountry.value || ms.country === selectedCountry.value
    const pillarMatch = !selectedPillar.value || ms.pillar === selectedPillar.value
    return countryMatch && pillarMatch
  })
})
</script>

<template>
  <div class="max-w-7xl mx-auto p-6 bg-slate-50 min-h-screen">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-[#004494]">Milestones and Targets</h2>
      <p class="text-slate-600 text-sm mt-1">
        Member States must fulfill agreed milestones and targets before each disbursement is made.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 text-center">
      <div class="bg-white p-6 rounded shadow-sm border-b-4 border-blue-500">
        <div class="text-2xl font-black text-blue-900">{{ stats.total }}</div>
        <div class="text-xs text-slate-500 uppercase">Total milestones & targets</div>
      </div>
      <div class="bg-white p-6 rounded shadow-sm border-b-4 border-green-500">
        <div class="text-2xl font-black text-green-700">{{ stats.completed }}</div>
        <div class="text-xs text-slate-500 uppercase">Completed</div>
      </div>
      <div class="bg-white p-6 rounded shadow-sm border-b-4 border-orange-500">
        <div class="text-2xl font-black text-orange-600">{{ stats.inProgress }}</div>
        <div class="text-xs text-slate-500 uppercase">In progress</div>
      </div>
      <div class="bg-white p-6 rounded shadow-sm border-b-4 border-purple-500">
        <div class="text-2xl font-black text-purple-700">{{ stats.pending }}</div>
        <div class="text-xs text-slate-500 uppercase">Pending assessment</div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">Loading scoreboard data...</div>

    <div v-else>
      <div id="milestones-chart-section" class="bg-white p-6 rounded shadow-sm border border-slate-200 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-sm font-bold text-slate-700 uppercase">Milestones & Targets fulfilment by country</h3>
          <ExportButton targetId="milestones-chart-section" :data="milestones" filename="Milestones_Progress" />
        </div>
        <div class="h-[400px]">
           <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <div class="bg-white rounded shadow-sm border border-slate-200">
        <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <span class="text-sm font-semibold text-slate-700">List of milestones & targets per measure</span>
          <div class="flex items-center gap-3">
            <button 
              v-if="selectedCountry || selectedPillar"
              @click="selectedCountry = ''; selectedPillar = ''"
              class="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase px-2 transition-colors"
            >
              Clear
            </button>
            <SelectPillar v-model="selectedPillar" />
            <SelectCountry v-model="selectedCountry" />
          </div>
        </div>
        <table class="w-full text-left text-xs text-slate-600">
          <thead class="bg-white text-slate-400 border-b border-slate-100">
            <tr>
              <th class="px-6 py-3 font-medium">Country</th>
              <th class="px-6 py-3 font-medium">Policy Pillars</th>
              <th class="px-6 py-3 font-medium">Measure</th>
              <th class="px-6 py-3 font-medium">Country Specific Recommendation (CSR)</th>
              <th class="px-6 py-3 font-medium">Assessment</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="filteredMilestones.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-slate-400 italic">No milestones found matching the selected filters.</td>
            </tr>
            <tr v-for="ms in filteredMilestones" :key="ms.id" class="hover:bg-slate-50">
              <td class="px-6 py-4 flex items-center gap-2">
                <span class="font-medium text-slate-800 justify-center">{{ ms.country || 'Spain' }}</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-1">
                  <PillarBadge :category="ms.pillar" />
                </div>
              </td>
              <td class="px-6 py-4">{{ ms.description }}</td>
              <td class="px-6 py-4 text-slate-600">{{ ms.csr }}</td>
              <td class="px-6 py-4">
                <StatusBadge :status="ms.status" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
