<script setup>
import { ref, onMounted } from 'vue'
import { LMap, LGeoJson } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import * as topojson from 'topojson-client'
import { usePrrStore } from '../stores/prrStore'
import { storeToRefs } from 'pinia'

const store = usePrrStore()
const { paises } = storeToRefs(store)

// Props & Emits
const props = defineProps({
  paisSelecionado: { type: String, default: null },
})
const emit = defineEmits(['selecionar-pais'])

// Países da UE com RRF — 27 países
const paisesPRR = {
  Austria: { id: 'austria', desembolsado: 1.85, alocacao: 3.5 },
  Belgium: { id: 'belgium', desembolsado: 3.25, alocacao: 5.9 },
  Bulgaria: { id: 'bulgaria', desembolsado: 2.89, alocacao: 6.3 },
  Croatia: { id: 'croatia', desembolsado: 5.21, alocacao: 10.0 },
  Cyprus: { id: 'cyprus', desembolsado: 0.62, alocacao: 1.2 },
  Czechia: { id: 'czechia', desembolsado: 3.64, alocacao: 7.0 },
  Denmark: { id: 'denmark', desembolsado: 0.68, alocacao: 1.3 },
  Estonia: { id: 'estonia', desembolsado: 0.51, alocacao: 0.977 },
  Finland: { id: 'finland', desembolsado: 1.09, alocacao: 2.1 },
  France: { id: 'france', desembolsado: 21.68, alocacao: 40.9 },
  Germany: { id: 'germany', desembolsado: 14.84, alocacao: 28.0 },
  Greece: { id: 'greece', desembolsado: 15.87, alocacao: 30.5 },
  Hungary: { id: 'hungary', desembolsado: 3.38, alocacao: 7.2 },
  Ireland: { id: 'ireland', desembolsado: 0.48, alocacao: 0.92 },
  Italy: { id: 'italy', desembolsado: 101.92, alocacao: 191.5 },
  Latvia: { id: 'latvia', desembolsado: 0.95, alocacao: 1.83 },
  Lithuania: { id: 'lithuania', desembolsado: 1.16, alocacao: 2.24 },
  Luxembourg: { id: 'luxembourg', desembolsado: 0.05, alocacao: 0.1 },
  Malta: { id: 'malta', desembolsado: 0.29, alocacao: 0.56 },
  Netherlands: { id: 'netherlands', desembolsado: 3.18, alocacao: 6.0 },
  Poland: { id: 'poland', desembolsado: 30.88, alocacao: 58.1 },
  Portugal: { id: 'portugal', desembolsado: 10.36, alocacao: 19.3 },
  Romania: { id: 'romania', desembolsado: 7.34, alocacao: 14.2 },
  Slovakia: { id: 'slovakia', desembolsado: 3.27, alocacao: 6.3 },
  Slovenia: { id: 'slovenia', desembolsado: 1.46, alocacao: 2.8 },
  Spain: { id: 'spain', desembolsado: 86.79, alocacao: 163.0 },
  Sweden: { id: 'sweden', desembolsado: 1.76, alocacao: 3.3 },
}

// Todos os países EU (sem PRR no nosso dataset — mostrados em azul mais claro)
const paisesUE = new Set([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
  'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden',
])

// Países europeus a mostrar no mapa (inclui não-UE em cinzento)
const paisesEuropeus = new Set([
  ...paisesUE,
  'United Kingdom', 'Norway', 'Switzerland', 'Iceland', 'Albania',
  'Bosnia and Herz.', 'Serbia', 'Montenegro', 'North Macedonia',
  'Moldova', 'Ukraine', 'Belarus', 'Turkey',
])

// Escala de cor por % de desembolso
function corPorDesembolso(nomePais) {
  const info = paisesPRR[nomePais]
  if (!info) return '#B3CCE8' // UE sem dados — azul claro
  const pct = (info.desembolsado / info.alocacao) * 100
  if (pct >= 40) return '#1B3A6B'
  if (pct >= 25) return '#2E5FAD'
  if (pct >= 15) return '#4A7FC1'
  return '#7AAAD6'
}

const geojson = ref(null)
const tooltip = ref(null)

const legendaItens = [
  { cor: '#7AAAD6', label: '< 15%' },
  { cor: '#4A7FC1', label: '15–25%' },
  { cor: '#2E5FAD', label: '25–40%' },
  { cor: '#1B3A6B', label: '> 40%' },
  { cor: '#B3CCE8', label: 'Outros UE' },
]

onMounted(async () => {
  const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
  const topo = await res.json()
  const mundo = topojson.feature(topo, topo.objects.countries)
  mundo.features = mundo.features.filter((f) => paisesEuropeus.has(f.properties.name))
  geojson.value = mundo
})

function estiloFeature(feature) {
  const nome = feature?.properties?.name ?? ''
  const eUE = paisesUE.has(nome)
  const temPRR = !!paisesPRR[nome]
  const selecionado = props.paisSelecionado === paisesPRR[nome]?.id

  if (!eUE) {
    return { fillColor: '#E2EAF2', color: '#ffffff', weight: 0.8, fillOpacity: 1 }
  }
  return {
    fillColor: selecionado ? '#F9A825' : temPRR ? corPorDesembolso(nome) : '#B3CCE8',
    color: '#ffffff',
    weight: 0.8,
    fillOpacity: 1,
  }
}

function porFeature(feature, layer) {
  const nome = feature?.properties?.name ?? ''
  const eUE = paisesUE.has(nome)
  const info = paisesPRR[nome]

  layer.on({
    click() {
      if (!eUE) return
      if (info) {
        emit('selecionar-pais', props.paisSelecionado === info.id ? null : info.id)
      }
    },
    mouseover(e) {
      if (eUE) layer.setStyle({ fillColor: '#F9A825' })
      const pct = info ? ((info.desembolsado / info.alocacao) * 100).toFixed(1) + '% desembolsado' : 'Sem dados PRR'
      tooltip.value = { x: e.originalEvent.clientX, y: e.originalEvent.clientY, nome, pct }
    },
    mouseout() {
      if (eUE) {
        layer.setStyle({
          fillColor: props.paisSelecionado === info?.id
            ? '#F9A825'
            : info ? corPorDesembolso(nome) : '#B3CCE8',
        })
      }
      tooltip.value = null
    },
  })
}
</script>

<template>
  <div class="relative w-full">
    <l-map
      :center="[54, 15]"
      :zoom="4"
      :min-zoom="3"
      :max-zoom="7"
      :zoom-control="true"
      :attribution-control="false"
      :use-global-leaflet="false"
      style="height: 480px; width: 100%; border-radius: 12px;"
    >
      <l-geo-json
        v-if="geojson"
        :geojson="geojson"
        :options-style="estiloFeature"
        :options="{ onEachFeature: porFeature }"
      />
    </l-map>

    <!-- Loading -->
    <div
      v-if="!geojson"
      class="absolute inset-0 flex items-center justify-center text-slate-500 text-sm bg-prr-light rounded-xl"
    >
      <div class="text-center">
        <div class="w-8 h-8 border-4 border-prr-border border-t-prr-blue rounded-full animate-spin mx-auto mb-2"></div>
        <p>A carregar mapa…</p>
      </div>
    </div>

    <!-- Tooltip -->
    <div
      v-if="tooltip"
      class="fixed z-50 bg-prr-blue text-white text-xs px-3 py-2 rounded-lg pointer-events-none shadow-lg"
      :style="{ left: `${tooltip.x + 14}px`, top: `${tooltip.y - 40}px` }"
    >
      <p class="font-bold">{{ tooltip.nome }}</p>
      <p class="text-white/70">{{ tooltip.pct }}</p>
    </div>

    <!-- Legenda -->
    <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 justify-center">
      <span class="font-semibold text-slate-600">% Desembolsado:</span>
      <div v-for="item in legendaItens" :key="item.label" class="flex items-center gap-1.5">
        <div class="w-4 h-3 rounded-sm" :style="{ background: item.cor }" />
        <span>{{ item.label }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-4 h-3 rounded-sm bg-prr-gold" />
        <span>Selecionado</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  background: #D8E9F5 !important;
}
:deep(.leaflet-control-attribution) {
  display: none;
}
:deep(.leaflet-map-pane) { z-index: 0 !important; }
:deep(.leaflet-tile-pane) { z-index: 1 !important; }
:deep(.leaflet-overlay-pane) { z-index: 2 !important; }
:deep(.leaflet-marker-pane) { z-index: 4 !important; }
:deep(.leaflet-popup-pane) { z-index: 6 !important; }
</style>
