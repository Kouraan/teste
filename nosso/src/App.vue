<script setup>
import { ref } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const sidebarOpen = ref(true)

const navItems = [
  { to: '/', icon: '🏠', label: 'Visão Geral', name: 'overview' },
  { to: '/paises', icon: '🗺️', label: 'Países', name: 'paises' },
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
        <div class="grid grid-cols-4 gap-1">
          <span v-for="i in 12" :key="i" class="text-prr-gold text-[8px]">★</span>
        </div>
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group"
          :class="[
            route.name === item.name || (route.name === 'pais-detalhe' && item.name === 'paises')
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
