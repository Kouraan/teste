<script setup>
import { ref } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const sidebarOpen = ref(true)

const navItems = [
  { to: '/', icon: '🏠', label: 'Visão Geral', name: 'overview' },
  { to: '/paises', icon: '🗺️', label: 'Países', name: 'paises' },
  { to: '/comparacao', icon: '⚖️', label: 'Comparação', name: 'comparacao' },
  { to: '/milestones', icon: '🎯', label: 'Milestones & Targets', name: 'milestones' },
  { to: '/desembolsos', icon: '💶', label: 'Desembolsos', name: 'desembolsos' },
  { to: '/indicadores', icon: '📊', label: 'Indicadores Comuns', name: 'indicadores' },
  { to: '/cronologia', icon: '📅', label: 'Cronologia', name: 'cronologia' },
]
</script>

<template>
  <div class="flex h-screen bg-prr-light overflow-hidden">
    <!-- ── Sidebar ── -->
    <aside
      class="flex flex-col bg-prr-blue text-white transition-all duration-300 flex-shrink-0 z-30"
      :class="sidebarOpen ? 'w-56' : 'w-16'"
    >
      <!-- Logo / Toggle -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          :title="sidebarOpen ? 'Recolher menu' : 'Expandir menu'"
        >
          <span class="text-lg">{{ sidebarOpen ? '◀' : '▶' }}</span>
        </button>
        <div v-if="sidebarOpen" class="overflow-hidden">
          <p class="text-xs font-bold text-prr-gold uppercase tracking-wider leading-tight">PRR</p>
          <p class="text-[10px] text-white/60 leading-tight">Dashboard EU</p>
        </div>
      </div>

      <!-- Estrelas EU decorativas -->
      <div v-if="sidebarOpen" class="flex justify-center py-4 border-b border-white/10">
        <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" class="w-14 h-14 drop-shadow-md" aria-label="Bandeira da União Europeia">
          <circle cx="28" cy="28" r="27" fill="#003399" stroke="#F9A82555" stroke-width="1"/>
          <g fill="#F9A825">
            <polygon points="28.00,7.80 28.76,9.95 31.04,10.01 29.24,11.40 29.88,13.59 28.00,12.30 26.12,13.59 26.76,11.40 24.96,10.01 27.24,9.95"/>
            <polygon points="36.50,10.08 37.26,12.23 39.54,12.29 37.74,13.68 38.38,15.87 36.50,14.58 34.62,15.87 35.26,13.68 33.46,12.29 35.74,12.23"/>
            <polygon points="42.72,16.30 43.49,18.45 45.77,18.51 43.96,19.90 44.60,22.09 42.72,20.80 40.84,22.09 41.49,19.90 39.68,18.51 41.96,18.45"/>
            <polygon points="45.00,24.80 45.76,26.95 48.04,27.01 46.24,28.40 46.88,30.59 45.00,29.30 43.12,30.59 43.76,28.40 41.96,27.01 44.24,26.95"/>
            <polygon points="42.72,33.30 43.49,35.45 45.77,35.51 43.96,36.90 44.60,39.09 42.72,37.80 40.84,39.09 41.49,36.90 39.68,35.51 41.96,35.45"/>
            <polygon points="36.50,39.52 37.26,41.67 39.54,41.73 37.74,43.12 38.38,45.31 36.50,44.02 34.62,45.31 35.26,43.12 33.46,41.73 35.74,41.67"/>
            <polygon points="28.00,41.80 28.76,43.95 31.04,44.01 29.24,45.40 29.88,47.59 28.00,46.30 26.12,47.59 26.76,45.40 24.96,44.01 27.24,43.95"/>
            <polygon points="19.50,39.52 20.26,41.67 22.54,41.73 20.74,43.12 21.38,45.31 19.50,44.02 17.62,45.31 18.26,43.12 16.46,41.73 18.74,41.67"/>
            <polygon points="13.28,33.30 14.04,35.45 16.32,35.51 14.51,36.90 15.16,39.09 13.28,37.80 11.40,39.09 12.04,36.90 10.23,35.51 12.51,35.45"/>
            <polygon points="11.00,24.80 11.76,26.95 14.04,27.01 12.24,28.40 12.88,30.59 11.00,29.30 9.12,30.59 9.76,28.40 7.96,27.01 10.24,26.95"/>
            <polygon points="13.28,16.30 14.04,18.45 16.32,18.51 14.51,19.90 15.16,22.09 13.28,20.80 11.40,22.09 12.04,19.90 10.23,18.51 12.51,18.45"/>
            <polygon points="19.50,10.08 20.26,12.23 22.54,12.29 20.74,13.68 21.38,15.87 19.50,14.58 17.62,15.87 18.26,13.68 16.46,12.29 18.74,12.23"/>
          </g>
        </svg>
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group"
          :class="[
            route.name === item.name || (route.name === 'pais-detalhe' && (item.name === 'paises' || item.name === 'comparacao'))
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          ]"
          :title="!sidebarOpen ? item.label : ''"
        >
          <span class="text-base flex-shrink-0">{{ item.icon }}</span>
          <span v-if="sidebarOpen" class="truncate">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Footer sidebar -->
      <div class="border-t border-white/10 px-4 py-3">
        <p v-if="sidebarOpen" class="text-[10px] text-white/40 text-center">
          © 2026 NextGenerationEU
        </p>
        <p v-else class="text-[10px] text-white/40 text-center">EU</p>
      </div>
    </aside>

    <!-- ── Main Content ── -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header
        class="bg-white border-b border-prr-border px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm"
      >
        <div>
          <h2 class="text-sm font-semibold text-prr-blue">Plano de Recuperação e Resiliência</h2>
          <p class="text-xs text-slate-400">Recovery and Resilience Facility — Scoreboard</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-400">Última atualização: Jan 2026</span>
          <span class="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full"
            >● Ativo</span
          >
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
