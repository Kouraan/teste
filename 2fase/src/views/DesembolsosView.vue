<script setup>
import { onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { usePrrStore } from '../stores/prrStore'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import PageHeader from '../components/PageHeader.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ExportButton from '../components/ExportButton.vue'

ChartJS.register(ArcElement, Tooltip, Legend)

const store = usePrrStore()
const { loading } = storeToRefs(store)
onMounted(() => store.carregarTudo())

const resumo = computed(() => store.resumoDesembolsos)

const doughnutData = computed(() => ({
  labels: resumo.value.porPais.map((p) => p.bandeira + ' ' + p.nome),
  datasets: [
    {
      data: resumo.value.porPais.map((p) => p.desembolsado),
      backgroundColor: ['#1B3A6B', '#2E7D32', '#E65100', '#6A1B9A'],
      borderWidth: 0,
    },
  ],
}))

const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } },
    tooltip: { callbacks: { label: (c) => ` €${c.parsed.toFixed(2)}B` } },
  },
}
</script>

<template>
  <div>
    <div class="flex items-start justify-between mb-8 gap-4">
      <PageHeader
        icone="💶"
        titulo="Desembolsos"
        descricao="Acompanhe os desembolsos realizados aos Estados-Membros no âmbito do RRF."
      />
      <div class="pt-1 flex-shrink-0">
        <ExportButton :data="resumo.porPais" filename="desembolsos-por-pais" />
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else>
      <!-- KPIs -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-prr-border p-5 text-center shadow-sm">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Desembolsado</p>
          <p class="text-3xl font-black text-prr-blue">€{{ resumo.totalDesembolsado }}B</p>
          <p class="text-xs text-slate-400 mt-1">Em todos os EM</p>
        </div>
        <div class="bg-white rounded-xl border border-prr-border p-5 text-center shadow-sm">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Alocado RRF</p>
          <p class="text-3xl font-black text-prr-blue">€{{ resumo.totalAlocado }}B</p>
          <p class="text-xs text-slate-400 mt-1">Subvenções + Empréstimos</p>
        </div>
        <div class="bg-white rounded-xl border border-prr-border p-5 text-center shadow-sm">
          <p class="text-xs text-slate-500 uppercase tracking-wide mb-1">Taxa de Execução</p>
          <p class="text-3xl font-black text-prr-orange">{{ resumo.taxa }}%</p>
          <p class="text-xs text-slate-400 mt-1">Do total desembolsado</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Doughnut -->
        <div class="bg-white rounded-xl border border-prr-border shadow-sm p-5">
          <h3 class="text-sm font-bold text-prr-blue mb-4">Distribuição por País</h3>
          <div class="h-56">
            <Doughnut :data="doughnutData" :options="doughnutOpts" />
          </div>
        </div>

        <!-- Tabela países -->
        <div
          class="lg:col-span-2 bg-white rounded-xl border border-prr-border shadow-sm overflow-hidden"
        >
          <div class="px-5 py-3 bg-prr-light border-b border-prr-border">
            <h3 class="text-sm font-bold text-prr-blue">Desembolsos por País</h3>
          </div>
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-slate-400 font-semibold uppercase border-b border-prr-border">
                <th class="px-4 py-2 text-left">País</th>
                <th class="px-4 py-2 text-right">Subvenções</th>
                <th class="px-4 py-2 text-right">Empréstimos</th>
                <th class="px-4 py-2 text-right">Desembolsado</th>
                <th class="px-4 py-2 text-left">Taxa</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="p in resumo.porPais" :key="p.nome" class="hover:bg-prr-light">
                <td class="px-4 py-3 font-medium text-slate-700 flex items-center gap-2">
                  <span class="text-lg">{{ p.bandeira }}</span> {{ p.nome }}
                </td>
                <td class="px-4 py-3 text-right text-green-700 font-semibold">
                  €{{ p.subvencoes.toFixed(1) }}B
                </td>
                <td class="px-4 py-3 text-right text-orange-600 font-semibold">
                  {{ p.emprestimos > 0 ? '€' + p.emprestimos.toFixed(1) + 'B' : '—' }}
                </td>
                <td class="px-4 py-3 text-right font-bold text-prr-blue">
                  €{{ p.desembolsado.toFixed(2) }}B
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        class="h-2 rounded-full"
                        :class="p.taxa >= 50 ? 'bg-green-500' : 'bg-prr-blue'"
                        :style="{ width: Math.min(p.taxa, 100) + '%' }"
                      ></div>
                    </div>
                    <span class="text-xs font-semibold text-slate-600"
                      >{{ p.taxa.toFixed(1) }}%</span
                    >
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
