<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '../stores/apiStore'
import PillarBadge from '../components/PillarBadge.vue'

const store = useApiStore()
const { indicators, loading } = storeToRefs(store)

onMounted(() => {
  store.fetchIndicators()
})
</script>
 
<template>
  <div class="max-w-[1151px] mx-auto pb-20">
 
    <!-- Header Section -->
    <header class="mb-8">
      <h1 class="text-[#034EA1] text-3xl font-bold mb-4">Common Indicators</h1>
      <p class="text-slate-600 leading-relaxed text-justify max-w-5xl">
        The Recovery and Resilience Scoreboard includes a set of common indicators related to the objectives of the RRF.
        The common indicators show the progress of the implementation of the recovery and resilience plans towards common
        objectives and the overall performance of the RRF. Member States collect the common indicators data and report
        their numbers to the European Commission twice a year, by the end of February and the end of August.
      </p>
    </header>
 
    <div v-if="loading" class="text-center py-20 flex flex-col items-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#034EA1] mb-4"></div>
      <p class="text-slate-500">Loading indicators...</p>
    </div>
 
    <div v-else>
      <!-- Category Legend Card (top, full-width) -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-8">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div v-for="catId in ['green', 'digital', 'smart-growth', 'social-cohesion', 'health', 'next-gen']" :key="catId">
            <PillarBadge :category="catId" :showName="true" />
          </div>
        </div>
      </div>
 
      <!-- Indicators Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="indicator in indicators"
          :key="indicator.id"
          class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between min-h-[160px]"
        >
          <!-- Category Icons — stacked vertically in top-right corner -->
          <div class="absolute top-4 right-4 flex flex-col gap-1">
            <PillarBadge 
              v-for="catId in indicator.categories" 
              :key="catId" 
              :category="catId" 
            />
          </div>
 
          <!-- Title -->
          <div class="pr-10">
            <p class="text-slate-800 text-sm font-semibold leading-snug">
              <span class="font-bold">({{ indicator.id }})</span> {{ indicator.name }}
            </p>
          </div>
 
          <!-- Value -->
          <div class="mt-4 pt-3 border-t border-slate-100">
            <span class="text-slate-500 text-sm">
              <span class="text-slate-800 font-semibold">{{ indicator.value }}</span> {{ indicator.unit }} 
            </span>
          </div>
        </div>
      </div>
    </div>
 
  </div>
</template>
 
<style scoped>
/* nothing extra needed — Tailwind covers it all */
</style>