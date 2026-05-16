<script setup>
import { ref, onMounted, computed } from 'vue'
import { LMap, LGeoJson } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import * as topojson from 'topojson-client'
import { storeToRefs } from 'pinia'
import { usePrrStore } from '../stores/prrStore'

const { paises, desembolsos } = storeToRefs(usePrrStore())

// Props & Emits
const props = defineProps({
  paisSelecionado: { type: String, default: null },
})
const emit = defineEmits(['selecionar-pais'])

// Nome do país no topojson -> id de país no db.json
const mapaNomeParaId = {
  Austria: 'austria',
  Belgium: 'belgica',
  Bulgaria: 'bulgaria',
  Croatia: 'croacia',
  Cyprus: 'chipre',
  Czechia: 'republica-checa',
  Denmark: 'dinamarca',
  Estonia: 'estonia',
  Finland: 'finlandia',
  France: 'franca',
  Germany: 'alemanha',
  Greece: 'grecia',
  Hungary: 'hungria',
  Ireland: 'irlanda',
  Italy: 'italia',
  Latvia: 'letonia',
  Lithuania: 'lituania',
  Luxembourg: 'luxemburgo',
  Malta: 'malta',
  Netherlands: 'paises-baixos',
  Poland: 'polonia',
  Portugal: 'portugal',
  Romania: 'romenia',
  Slovakia: 'eslovaquia',
  Slovenia: 'eslovenia',
  Spain: 'espanha',
  Sweden: 'suecia',
}

const paisesPorId = computed(() => new Map(paises.value.map((p) => [p.id, p])))

const desembolsadoPorPaisId = computed(() => {
  return desembolsos.value.reduce((acc, d) => {
    acc[d.paisId] = (acc[d.paisId] ?? 0) + Number(d.montante ?? 0)
    return acc
  }, {})
})

function infoPrrPorNome(nomePais) {
  const id = mapaNomeParaId[nomePais]
  if (!id) return null

  const pais = paisesPorId.value.get(id)
  if (!pais) return null

  return {
    id,
    alocacao: Number(pais.alocacao ?? 0),
    desembolsado: Number(desembolsadoPorPaisId.value[id] ?? 0),
  }
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
  const info = infoPrrPorNome(nomePais)
  if (!info) return '#B3CCE8' // UE sem dados — azul claro
  if (info.alocacao <= 0) return '#B3CCE8'
  const pct = (info.desembolsado / info.alocacao) * 100
  if (pct >= 40) return '#1B3A6B'
  if (pct >= 25) return '#2E5FAD'
  if (pct >= 15) return '#4A7FC1'
  return '#7AAAD6'
}

const geojson = ref(null)
const tooltip = ref(null)
const geoJsonRenderKey = computed(() => {
  const total = desembolsos.value.reduce((s, d) => s + Number(d.montante ?? 0), 0)
  return `${paises.value.length}-${desembolsos.value.length}-${total.toFixed(2)}`
})

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
  const info = infoPrrPorNome(nome)
  const temPRR = !!info
  const selecionado = props.paisSelecionado === info?.id

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
  const info = infoPrrPorNome(nome)

  layer.on({
    click() {
      if (!eUE) return
      if (info) {
        emit('selecionar-pais', props.paisSelecionado === info.id ? null : info.id)
      }
    },
    mouseover(e) {
      if (eUE) layer.setStyle({ fillColor: '#F9A825' })
      const pct = info && info.alocacao > 0
        ? ((info.desembolsado / info.alocacao) * 100).toFixed(1) + '% desembolsado'
        : 'Sem dados PRR'
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
        :key="geoJsonRenderKey"
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
