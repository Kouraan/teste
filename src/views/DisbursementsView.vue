<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '../stores/apiStore'
import ExportButton from '../components/ExportButton.vue'

const store = useApiStore()
const { loading } = storeToRefs(store)

onMounted(() => {
  store.fetchAll()
})

const summary = computed(() => store.getDisbursementsSummary)

const totalGrantsDisbursed = computed(() => '€' + summary.value.totalDisbursed + 'B')
const totalRRFAllocation = computed(() => '€' + summary.value.totalAllowed + 'B')
const overallAllocationRate = computed(() => summary.value.rate + '%')

const countryRows = computed(() => {
  return summary.value.countries.map(c => ({
    country: c.country,
    flag: c.flag,
    grantsAllocated: '€' + c.grants.toFixed(1) + 'B',
    loansAllocated: c.loans > 0 ? '€' + c.loans.toFixed(1) + 'B' : '—',
    total: '€' + c.total.toFixed(1) + 'B',
    disbursed: '€' + c.disbursed.toFixed(1) + 'B',
    rateValue: c.rate,
    rate: c.rate.toFixed(1) + '%'
  }))
})

// Pillar statistics aggregated from all countries
const pillars = computed(() => {
  const pillarAggs = {}
  store.pillars.forEach(p => {
    pillarAggs[p.id] = { 
      id: p.id, 
      name: p.name, 
      shortName: p.shortName, 
      color: p.color, 
      icon: p.icon,
      total: 0, 
      disbursed: 0 
    }
  })
  
  store.countries.forEach(c => {
    const countryDisb = store.disbursements
      .filter(d => d.country === c.id)
      .reduce((sum, d) => sum + d.amount, 0)
      
    store.pillars.forEach(p => {
      if (c.pillar_allocation?.[p.id]) {
        const share = c.pillar_allocation[p.id] / 100
        pillarAggs[p.id].total += c.stats.allocation * share
        pillarAggs[p.id].disbursed += countryDisb * share
      }
    })
  })
  
  return Object.values(pillarAggs).map(p => ({
    ...p,
    total: p.total.toFixed(1),
    disbursed: p.disbursed.toFixed(1)
  }))
})

const maxPillarValue = computed(() =>
  Math.max(...pillars.value.map(p => parseFloat(p.total) || 0), 1)
)

const tableDataForExport = computed(() => {
  return countryRows.value.map(r => ({
    Country: r.country,
    Grants_Allocated: r.grantsAllocated,
    Loans_Allocated: r.loansAllocated,
    Total: r.total,
    Disbursed: r.disbursed,
    Rate: r.rate
  }))
})

const pillarStatsForExport = computed(() => {
  return pillars.value.map(p => ({
    Pillar: p.name,
    Disbursed_EB: p.disbursed,
    Total_EB: p.total
  }))
})
</script>

<template>
  <div class="max-w-[1151px] mx-auto pb-20">

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <header class="mb-8">
      <h1 class="text-[#034EA1] text-3xl font-bold mb-3">Disbursements</h1>
      <p class="text-slate-600 leading-relaxed max-w-xl text-sm">
        Track the disbursements made to EU Member States under the Recovery and Resilience
        Facility. Disbursements are made upon successful assessment of milestones and targets.
      </p>
    </header>

    <div v-if="loading" class="text-center py-20 flex flex-col items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034EA1] mb-4"></div>
      <p class="text-slate-500">Loading disbursements...</p>
    </div>

    <div v-else>

      <!-- ── Summary Cards ─────────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        <!-- Card 1 -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
          <div class="text-[#034EA1] text-4xl font-extrabold mb-1">{{ totalGrantsDisbursed }}</div>
          <div class="text-slate-700 text-sm font-semibold">Total grants disbursed (approx.)</div>
          <div class="text-slate-400 text-xs mt-1">Across all Member States</div>
        </div>

        <!-- Card 2 -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
          <div class="text-[#034EA1] text-4xl font-extrabold mb-1">{{ totalRRFAllocation }}</div>
          <div class="text-slate-700 text-sm font-semibold">Total RRF allocation (approx.)</div>
          <div class="text-slate-400 text-xs mt-1">Grants + loans committed</div>
        </div>

        <!-- Card 3 -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
          <div class="text-[#E17100] text-4xl font-extrabold mb-1">{{ overallAllocationRate }}</div>
          <div class="text-slate-700 text-sm font-semibold">Overall allocation rate</div>
          <div class="text-slate-400 text-xs mt-1">Of loans disbursed</div>
        </div>

      </div>

      <!-- ── Country Table ──────────────────────────────────────────────────── -->
      <div id="disbursements-table-container" class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">

        <div class="flex justify-end px-4 py-3 border-t border-slate-100">
          <ExportButton :data="tableDataForExport" targetId="disbursements-table-container" filename="Disbursements_By_Country" />
        </div>

        <table class="w-full text-sm text-left">
          <thead>
            <tr class="bg-[#034EA1] text-white">
              <th class="px-4 py-3 font-semibold">Country</th>
              <th class="px-4 py-3 font-semibold">Grants allocated</th>
              <th class="px-4 py-3 font-semibold">Loans allocated</th>
              <th class="px-4 py-3 font-semibold">Total</th>
              <th class="px-4 py-3 font-semibold">Disbursed</th>
              <th class="px-4 py-3 font-semibold">Rate</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="row in countryRows"
              :key="row.country"
              class="hover:bg-slate-50 transition-colors"
            >
              <!-- Country -->
              <td class="px-4 py-3 font-medium text-slate-800 flex items-center gap-2 whitespace-nowrap">
                <span class="text-lg leading-none">{{ row.flag }}</span>
                {{ row.country }}
              </td>
              <!-- Grants -->
              <td class="px-4 py-3 text-[#00875A] font-medium">{{ row.grantsAllocated }}</td>
              <!-- Loans -->
              <td class="px-4 py-3 text-[#E17100] font-medium">
                {{ row.loansAllocated ?? '—' }}
              </td>
              <!-- Total -->
              <td class="px-4 py-3 text-slate-800 font-semibold">{{ row.total }}</td>
              <!-- Disbursed -->
              <td class="px-4 py-3 text-slate-800 font-semibold">{{ row.disbursed }}</td>
              <!-- Rate with mini bar -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <!-- progress track -->
                  <div class="w-16 h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                    <div
                      class="h-2 rounded-full"
                      :class="row.rateValue >= 50 ? 'bg-[#00875A]' : 'bg-[#155DFC]'"
                      :style="{ width: Math.min(row.rateValue, 100) + '%' }"
                    ></div>
                  </div>
                  <span class="text-slate-600 text-xs font-semibold whitespace-nowrap">{{ row.rate }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Pillar Bar Chart ────────────────────────────────────────────────── -->
      <div id="pillar-chart-container" class="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

        <div class="flex items-start justify-between mb-1">
          <div>
            <p class="text-slate-500 text-sm italic text-center w-full">
              Estimated disbursements per policy pillar (EUR billion)
            </p>
            <p class="text-slate-400 text-xs text-center mt-0.5">
              Based on each pillar's share of total RRF funds. Each measure contributes to two pillars, so shares sum to 200%.
            </p>
          </div>
          <ExportButton :data="pillarStatsForExport" targetId="pillar-chart-container" filename="Pillar_Disbursements_Summary" />
        </div>

        <div class="mt-6 space-y-3">
          <div
            v-for="pillar in pillars"
            :key="pillar.id"
            class="flex items-center gap-3"
          >
            <!-- Icon badge -->
            <div
              class="w-8 h-8 rounded flex items-center justify-center text-white text-base flex-shrink-0 shadow-sm"
              :style="{ backgroundColor: pillar.color }"
            >
              {{ pillar.icon }}
            </div>

            <!-- Label -->
            <span class="text-slate-600 text-sm font-medium w-16 flex-shrink-0">
              {{ pillar.shortName }}
            </span>

            <!-- Bar track -->
            <div class="flex-1 relative h-8 bg-slate-100 rounded-md overflow-hidden">
              <!-- Disbursed fill -->
              <div
                class="absolute inset-y-0 left-0 rounded-md flex items-center justify-end pr-2 transition-all duration-500"
                :style="{ backgroundColor: pillar.color, width: ((pillar.disbursed / maxPillarValue) * 100) + '%' }"
              >
                <span class="text-white text-xs font-bold whitespace-nowrap">
                  €{{ pillar.disbursed }}B
                </span>
              </div>
            </div>

            <!-- Total label -->
            <span class="text-slate-400 text-xs flex-shrink-0 w-20 text-right">
              of €{{ pillar.total }}B
            </span>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
