<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '../stores/apiStore'
import PillarBadge from '../components/PillarBadge.vue'
import EuropeMap from '../components/EuropeMap.vue'
import { useRouter } from 'vue-router'

const store = useApiStore()
const { pillars, globalStats, loading } = storeToRefs(store)
const router = useRouter()

const selectedCountry = ref(null)

function handleCountrySelect(name) {
  if (name) {
    selectedCountry.value = name
    router.push(`/country/${name}`)
  } else {
    selectedCountry.value = null
  }
}

onMounted(() => {
  store.fetchAll()
})
</script>

<template>
  <div class="max-w-[1151px] mx-auto bg-white font-inter">

    <!-- ── Hero: What is it? ──────────────────────────────────────────────── -->
    <section
      class="relative min-h-[480px] bg-[#003399] overflow-hidden flex items-center px-12 py-14"
      style="background-image: url('https://www.europarl.europa.eu/resources/library/images/20240528PHT21705/20240528PHT21705_original.jpg'); background-size: cover; background-position: center;"
    >
      <!-- Dark overlay -->
      <div class="absolute inset-0 bg-[#003399]/80 z-0"></div>

      <div class="relative z-10 w-full flex justify-between items-start gap-16 text-white">

        <!-- Left: title + description -->
        <div class="max-w-[480px]">
          <!-- Yellow label -->
          <div class="bg-[#FFCC00] text-[#1a1a1a] font-extrabold text-4xl px-5 py-2 rounded-sm inline-block mb-6 leading-tight">
            What is it?
          </div>
          <p class="text-white text-base leading-relaxed text-justify">
            The <strong>Recovery and Resilience Scoreboard</strong> gives an overview of how the
            implementation of the Recovery and Resilience Facility (RRF) and the national recovery
            and resilience plans is progressing. The RRF entered into force in February 2021 to
            mitigate the economic and social impact of the Covid-19 pandemic. It is the cornerstone
            of NextGenerationEU, an unprecedented EU recovery instrument to help repair the
            immediate economic and social damage of the coronavirus pandemic.
          </p>
        </div>

        <!-- Right: Stats Card -->
        <div v-if="globalStats" class="w-[340px] flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
          <p class="text-white/70 text-xs italic mb-1">Total available RRF funds</p>
          <div class="flex items-baseline gap-1 mb-6">
            <span class="text-5xl font-black text-white">€{{ globalStats.totalRRF }}</span>
            <span class="text-xl text-white font-light">billion</span>
          </div>

          <!-- Bars -->
          <div class="space-y-4">
            <!-- Total RRF -->
            <div>
              <div class="flex justify-between text-xs text-white mb-1">
                <span>Total RRF</span><span class="font-bold">€{{ globalStats.totalRRF }}B</span>
              </div>
              <div class="h-2 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full bg-[#FFCC00] w-full"></div>
              </div>
            </div>
            <!-- Grants -->
            <div>
              <div class="flex justify-between text-xs text-white mb-1">
                <span>Grants</span><span class="font-bold">€{{ globalStats.grants }}B</span>
              </div>
              <div class="h-2 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full bg-[#00C853]" :style="{ width: (globalStats.grants / globalStats.totalRRF * 100) + '%' }"></div>
              </div>
            </div>
            <!-- Loans -->
            <div>
              <div class="flex justify-between text-xs text-white mb-1">
                <span>Loans</span><span class="font-bold">€{{ globalStats.loans }}B</span>
              </div>
              <div class="h-2 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full bg-[#EF4444]" :style="{ width: (globalStats.loans / globalStats.totalRRF * 100) + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="flex gap-5 mt-5 text-xs text-white/80">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-[#00C853]"></span> Grants
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-full bg-[#EF4444]"></span> Loans
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── Pillars ────────────────────────────────────────────────────────── -->
    <section class="bg-[#EEF4FB]/50 py-16 px-12">
      <div class="text-center mb-12">
        <h2 class="text-[#1a1a2e] text-4xl font-bold mb-2">Pillars</h2>
        <p class="text-[#4A5565] text-lg">Explore the key priorities shaping Europe's future</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 justify-items-center">
        <RouterLink 
          v-for="p in pillars" 
          :key="p.id" 
          :to="'/pillar/' + p.id" 
          class="pillar-card group"
        >
          <div class="pillar-image-container">
            <img :src="p.image" :alt="p.name" />
            <PillarBadge :category="p.id" class="absolute top-4 left-4 z-10 scale-125" />
          </div>
          <div class="p-5">
            <h3 class="text-[#101828] font-bold text-base mb-1">{{ p.name }}</h3>
            <p class="text-[#4A5565] text-sm leading-snug">{{ p.description }}</p>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- ── Interactive Map ────────────────────────────────────────────────── -->
    <section class="bg-[#D8E9F5] py-14 px-0 relative overflow-hidden isolate">

      <!-- Info card top-right -->
      <div class="absolute top-8 right-10 bg-white border border-slate-200 rounded-xl shadow-md p-3 flex items-center gap-2 z-10">
        <span class="text-xl">🗺️</span>
        <span class="text-slate-700 text-sm font-medium">
          {{ selectedCountry ? `Selected: ${selectedCountry}` : 'Click on a country to get details' }}
        </span>
      </div>

      <!-- Map Component -->
      <div class="relative w-full">
        <EuropeMap
          :selected-country="selectedCountry"
          @country-select="handleCountrySelect"
        />
      </div>

    </section>

  </div>
</template>

<style scoped>

.pillar-card {
  @apply bg-white rounded-[10px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 w-full max-w-[300px] border border-slate-100;
}
.pillar-image-container {
  @apply relative h-[192px] w-full overflow-hidden;
}
.pillar-image-container img {
  @apply w-full h-full object-cover transition-transform duration-500 group-hover:scale-110;
}
.pillar-icon {
  @apply absolute top-4 left-4 w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl shadow-lg border-2 border-white;
}
  
</style>