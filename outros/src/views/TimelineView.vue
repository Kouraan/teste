<script setup>
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '../stores/apiStore'
import SelectCountry from '../components/SelectCountry.vue'
import SelectYear from '../components/SelectYear.vue'
import SelectCategory from '../components/SelectCategory.vue'

const store = useApiStore()
const { timelineEvents, loading } = storeToRefs(store)

const selectedCountry = ref('')
const selectedYear = ref('')
const selectedCategory = ref('')

onMounted(() => {
  store.fetchAll()
})

const filteredEvents = computed(() => {
  return timelineEvents.value.filter(event => {
    const countryMatch = !selectedCountry.value || event.country === selectedCountry.value
    const categoryMatch = !selectedCategory.value || event.category === selectedCategory.value
    
    let yearMatch = true
    if (selectedYear.value) {
      const year = event.date.match(/\d{4}/)
      yearMatch = year && year[0] === selectedYear.value
    }

    return countryMatch && categoryMatch && yearMatch
  })
})
</script>

<template>
  <div class="max-w-6xl mx-auto p-6 bg-white min-h-screen">
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-[#004494]">Timeline</h2>
      <p class="text-slate-600 text-sm mt-2 max-w-5xl leading-relaxed">
        The Recovery and Resilience Facility entered into force on 19 February 2021 and provides funds to Member States for the implementation of the reforms and investments in their recovery and resilience plans until the end of 2026.
      </p>
    </div>

    <div class="flex flex-wrap gap-3 mb-12 justify-center bg-slate-50 p-6 rounded-lg border border-slate-100">
      <SelectCountry v-model="selectedCountry" />
      <SelectYear v-model="selectedYear" />
      <SelectCategory v-model="selectedCategory" />
      
      <button 
        v-if="selectedCountry || selectedYear || selectedCategory"
        @click="selectedCountry = ''; selectedYear = ''; selectedCategory = ''"
        class="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase px-2 py-1 transition-colors"
      >
        Clear Filters
      </button>
    </div>

    <div v-if="loading" class="text-center py-20">
      <p class="text-slate-400 animate-pulse">Loading timeline...</p>
    </div>

    <div v-else-if="filteredEvents.length === 0" class="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
      <p class="text-slate-500 font-medium">No events found matching your filters.</p>
      <button @click="selectedCountry = ''; selectedYear = ''; selectedCategory = ''" class="mt-4 text-blue-600 text-sm font-bold uppercase hover:underline">Show all events</button>
    </div>

    <div v-else class="relative ml-4">
      <div class="absolute left-[100px] top-0 bottom-0 w-px bg-slate-200"></div>

      <div class="space-y-8">
        <div v-for="(event, index) in filteredEvents" :key="index" class="relative flex items-start">
          
          <div class="w-[85px] pt-1 text-right pr-4 text-[11px] font-medium text-slate-500 whitespace-nowrap">
            {{ event.date }}
          </div>

          <div class="absolute left-[100px] top-2 w-3 h-3 rounded-full border-2 border-white shadow-sm -translate-x-1/2 z-10" :style="{ backgroundColor: event.color }"></div>

          <div class="ml-8 flex-1 bg-white p-5 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-shadow border-l-0">
            <div class="flex items-center gap-2 mb-3">
              <span :style="{ backgroundColor: event.color }" class="text-[10px] uppercase font-bold text-white px-2 py-0.5 rounded shadow-sm">
                {{ event.category }}
              </span>
              <span v-if="event.isNew" class="bg-[#ffcc00] text-[10px] font-bold px-2 py-0.5 rounded uppercase">New</span>
              <span v-if="event.isHistoric" class="bg-[#ffcc00] text-[10px] font-bold px-2 py-0.5 rounded uppercase">Historic</span>
              <span v-if="event.country" class="ml-auto text-[9px] font-bold text-slate-400 uppercase tracking-wider">{{ event.country }}</span>
            </div>
            
            <h3 class="text-[14px] font-bold text-slate-800 mb-2 leading-tight">
              {{ event.title }}
            </h3>
            <p class="text-[13px] text-slate-600 leading-relaxed font-normal">
              {{ event.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
div {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
</style>