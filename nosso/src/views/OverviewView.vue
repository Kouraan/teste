<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePrrStore } from '../stores/prrStore'
import { useRouter } from 'vue-router'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import PageHeader from '../components/PageHeader.vue'
import KpiCard from '../components/KpiCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const store = usePrrStore()
const { globalStats, paises, pilares, loading } = storeToRefs(store)
const router = useRouter()

onMounted(() => store.carregarTudo())

const resumo = computed(() => store.resumoDesembolsos)

const chartPaises = computed(() => ({
  labels: paises.value.map((p) => p.bandeira + ' ' + p.nome),
  datasets: [
    {
      label: 'Total Alocado (€B)',
      data: paises.value.map((p) => p.alocacao),
      backgroundColor: '#1B3A6B33',
      borderColor: '#1B3A6B',
      borderWidth: 1.5,
      borderRadius: 4,
    },
    {
      label: 'Desembolsado (€B)',
      data: paises.value.map((p) => p.desembolsado),
      backgroundColor: '#2E7D3288',
      borderColor: '#2E7D32',
      borderWidth: 1.5,
      borderRadius: 4,
    },
  ],
}))

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
  scales: {
    y: { ticks: { callback: (v) => `€${v}B`, font: { size: 11 } }, grid: { color: '#F1F5F9' } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
}
</script>

<template>
  <div>
    <PageHeader
      icone="🏠"
      titulo="Visão Geral"
      descricao="Panorama global do Mecanismo de Recuperação e Resiliência (RRF) — NextGenerationEU."
    />

    <LoadingSpinner v-if="loading" />

    <div v-else-if="globalStats">
      <!-- KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          icone="💰"
          label="Total RRF"
          :valor="`€${globalStats.totalRRF}B`"
          sub="Fundo total disponível"
          cor="#1B3A6B"
        />
        <KpiCard
          icone="🎁"
          label="Subvenções"
          :valor="`€${globalStats.grants}B`"
          sub="Não reembolsáveis"
          cor="#2E7D32"
        />
        <KpiCard
          icone="🏦"
          label="Empréstimos"
          :valor="`€${globalStats.loans}B`"
          sub="Reembolsáveis"
          cor="#E65100"
        />
        <KpiCard
          icone="✅"
          label="Desembolsado"
          :valor="`€${globalStats.disbursed}B`"
          :sub="`${resumo.taxa}% do total`"
          cor="#6A1B9A"
        />
      </div>

      <!-- Gráfico de barras países -->
      <div class="bg-white rounded-xl border border-prr-border shadow-sm p-6 mb-8">
        <h3 class="text-sm font-bold text-prr-blue mb-4">
          Alocação vs. Desembolso por País (€ Mil Milhões)
        </h3>
        <div class="h-64">
          <Bar :data="chartPaises" :options="chartOpts" />
        </div>
      </div>

      <!-- Pilares -->
      <h3 class="text-sm font-bold text-prr-blue mb-3">Pilares Temáticos</h3>
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div
          v-for="p in pilares"
          :key="p.id"
          class="bg-white rounded-xl border border-prr-border shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow cursor-default"
        >
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
            :style="{ backgroundColor: p.cor + '22' }"
          >
            {{ p.icone }}
          </div>
          <div>
            <p class="text-sm font-bold text-slate-800 leading-tight">{{ p.nome }}</p>
            <p class="text-xs text-slate-400 mt-0.5">
              {{ p.milestones.toLocaleString('pt-PT') }} milestones
            </p>
            <p class="text-xs font-semibold mt-1" :style="{ color: p.cor }">
              €{{ (p.orcamento / 1e9).toFixed(0) }}B
            </p>
          </div>
        </div>
      </div>

      <!-- Países cards -->
      <h3 class="text-sm font-bold text-prr-blue mb-3">Países — Resumo</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="p in paises"
          :key="p.id"
          @click="router.push('/paises/' + p.id)"
          class="bg-white rounded-xl border border-prr-border shadow-sm p-4 cursor-pointer hover:border-prr-blue hover:shadow-md transition-all"
        >
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">{{ p.bandeira }}</span>
            <div>
              <p class="font-bold text-prr-blue">{{ p.nome }}</p>
              <p class="text-xs text-slate-400">{{ p.planNome }}</p>
            </div>
          </div>
          <div class="flex justify-between text-xs text-slate-500 mb-1">
            <span>Desembolso</span>
            <span class="font-semibold text-prr-blue"
              >{{ ((p.desembolsado / p.alocacao) * 100).toFixed(1) }}%</span
            >
          </div>
          <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-2 rounded-full bg-prr-blue transition-all"
              :style="{ width: Math.min((p.desembolsado / p.alocacao) * 100, 100) + '%' }"
            ></div>
          </div>
          <p class="text-xs text-slate-400 mt-1">€{{ p.desembolsado }}B de €{{ p.alocacao }}B</p>
        </div>
      </div>
    </div>
  </div>
</template>
