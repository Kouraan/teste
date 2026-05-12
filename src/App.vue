<script setup>
import { RouterView, RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-white text-slate-900">
    <header class="bg-[#004494] text-white sticky top-0 z-50 shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="h-20 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="relative w-14 h-14 rounded-full flex items-center justify-center">
              <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <g v-for="i in 12" :key="i">
                  <polygon
                    :transform="`rotate(${i * 30} 50 50) translate(0, -45)`"
                    points="50,45 52.5,51 59,51 53.5,55 55.5,61 50,57.5 44.5,61 46.5,55 41,51 47.5,51"
                    fill="#FFD700"
                  />
                </g>
              </svg>
            </div>
            <div class="leading-tight">
              <h1 class="text-lg font-bold tracking-tight">European Union</h1>
              <p class="text-[10px] uppercase tracking-widest opacity-80">Recovery & Resilience Scoreboard</p>
            </div>
          </div>
          
          <nav class="hidden lg:flex items-center gap-5 text-[13px] font-medium">
            <RouterLink to="/milestones" class="hover:underline decoration-[#ffcc00] decoration-2 underline-offset-8 transition-all" active-class="text-[#ffcc00]">Milestones & Targets</RouterLink>
            <RouterLink to="/common-indicators" class="hover:underline decoration-[#ffcc00] decoration-2 underline-offset-8 transition-all" active-class="text-[#ffcc00]">Common Indicators</RouterLink>
            <RouterLink to="/disbursements" class="hover:underline decoration-[#ffcc00] decoration-2 underline-offset-8 transition-all" active-class="text-[#ffcc00]">Disbursements</RouterLink>
            <RouterLink to="/timeline" class="hover:underline decoration-[#ffcc00] decoration-2 underline-offset-8 transition-all" active-class="text-[#ffcc00]">Timeline</RouterLink>
          </nav>

          <RouterLink to="/" class="p-2 hover:bg-blue-700 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="flex-grow w-full">
      <div class="max-w-7xl mx-auto px-4 py-8">
        <RouterView />
      </div>
    </main>

    <footer class="bg-[#1a2533] text-white py-12 border-t-4 border-[#ffcc00]">
      <div class="max-w-7xl mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div>
            <h3 class="text-sm font-bold mb-4 uppercase tracking-wider">About the EU</h3>
            <ul class="space-y-2 text-xs text-slate-300">
              <li><a href="#" class="hover:underline">EU Institutions</a></li>
              <li><a href="#" class="hover:underline">Countries</a></li>
              <li><a href="#" class="hover:underline">History</a></li>
              <li><a href="#" class="hover:underline">Symbols</a></li>
            </ul>
          </div>

          <div class="flex flex-col items-center justify-center border-x border-slate-700 px-4">
            <div class="text-center">
              <div class="flex justify-center mb-2">
                 <div class="relative w-14 h-14 rounded-full flex items-center justify-center">
                    <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                      <g v-for="i in 12" :key="i">
                        <polygon
                          :transform="`rotate(${i * 30} 50 50) translate(0, -45)`"
                          points="50,45 52.5,51 59,51 53.5,55 55.5,61 50,57.5 44.5,61 46.5,55 41,51 47.5,51"
                          fill="#FFD700"
                        />
                      </g>
                    </svg>
                  </div>
              </div>
              <p class="text-lg font-bold leading-tight">European Union</p>
              <p class="text-[10px] text-slate-400 uppercase">Recovery & Resilience Scoreboard</p>
            </div>
          </div>

          <div>
            <h3 class="text-sm font-bold mb-4 uppercase tracking-wider">Contact & Support</h3>
            <ul class="space-y-2 text-xs text-slate-300">
              <li><a href="#" class="hover:underline">Contact EU</a></li>
              <li><a href="#" class="hover:underline">Help & FAQs</a></li>
              <li><a href="#" class="hover:underline">Europe Direct</a></li>
              <li><a href="#" class="hover:underline">Press room</a></li>
            </ul>
          </div>
        </div>
        
        <div class="pt-8 border-t border-slate-700 text-center text-[10px] text-slate-500 uppercase tracking-widest">
          Official website of the European Union © 2026
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* Reset e fontes */
body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

.router-link-active {
  color: #ffcc00 !important;
}
</style>