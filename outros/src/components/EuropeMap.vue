<!-- EuropeMap.vue -->
<!-- Requires: npm install @vue-leaflet/vue-leaflet leaflet topojson-client -->

<script setup>
import { ref, onMounted } from 'vue'
import { LMap, LGeoJson } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import * as topojson from 'topojson-client'
import db from '../../db.json'

// ── GDP lookup from db.json ───────────────────────────────────────────────────
function parseGdpShare(raw) {
  if (!raw) return 0
  return parseFloat(String(raw).replace('%', '').trim()) || 0
}
const countries = Object.fromEntries(
  db.countries.map(c => [c.name, { gdpShare: parseGdpShare(c.stats?.gdp_share) }])
)

// ── Props & Emits ─────────────────────────────────────────────────────────────
const props = defineProps({
  selectedCountry: { type: String, default: null },
})
const emit = defineEmits(['country-select'])

// ── EU country sets ───────────────────────────────────────────────────────────
const euCountryNames = new Set([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece',
  'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg',
  'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia',
  'Slovenia', 'Spain', 'Sweden',
])

const europeanCountries = new Set([
  ...euCountryNames,
  'United Kingdom', 'Norway', 'Switzerland', 'Iceland', 'Albania',
  'Bosnia and Herz.', 'Serbia', 'Montenegro', 'North Macedonia',
  'Moldova', 'Ukraine', 'Belarus', 'Turkey',
])

// ── Colour scale ──────────────────────────────────────────────────────────────
function getColorByGDP(gdpShare) {
  if (gdpShare >= 10) return '#003079'
  if (gdpShare >= 7)  return '#034ea1'
  if (gdpShare >= 4)  return '#3a7abf'
  if (gdpShare >= 2)  return '#7ab0d9'
  if (gdpShare >= 0.5) return '#b3d4ed'
  return '#d4e8f8'
}

// ── State ─────────────────────────────────────────────────────────────────────
const geojson = ref(null)
const tooltip = ref(null)

const legendItems = [
  { color: '#d4e8f8', label: '< 0.5%' },
  { color: '#b3d4ed', label: '0.5–2%' },
  { color: '#7ab0d9', label: '2–4%' },
  { color: '#3a7abf', label: '4–7%' },
  { color: '#034ea1', label: '7–10%' },
  { color: '#003079', label: '> 10%' },
]

// ── Fetch & convert TopoJSON → GeoJSON on mount ───────────────────────────────
onMounted(async () => {
  const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
  const topo = await res.json()
  // Convert TopoJSON → GeoJSON and filter to European countries only
  const world = topojson.feature(topo, topo.objects.countries)
  world.features = world.features.filter(f => europeanCountries.has(f.properties.name))
  geojson.value = world
})

// ── Style function ────────────────────────────────────────────────────────────
function featureStyle(feature) {
  const name = feature?.properties?.name ?? ''
  const isEU = euCountryNames.has(name)
  const isSelected = props.selectedCountry === name

  if (!isEU) {
    return { fillColor: '#e8e8e8', color: '#ffffff', weight: 0.8, fillOpacity: 1 }
  }
  return {
    fillColor: isSelected ? '#ffd617' : getColorByGDP(countries[name]?.gdpShare ?? 0),
    color: '#ffffff',
    weight: 0.8,
    fillOpacity: 1,
  }
}

// ── Per-feature interactions ──────────────────────────────────────────────────
function onEachFeature(feature, layer) {
  const name = feature?.properties?.name ?? ''
  const isEU = euCountryNames.has(name)

  layer.on({
    click() {
      if (!isEU) return
      emit('country-select', props.selectedCountry === name ? null : name)
    },
    mouseover(e) {
      if (isEU) layer.setStyle({ fillColor: '#ffd617' })
      tooltip.value = { x: e.originalEvent.clientX, y: e.originalEvent.clientY, name }
    },
    mouseout() {
      if (isEU) {
        layer.setStyle({
          fillColor: props.selectedCountry === name
            ? '#ffd617'
            : getColorByGDP(countries[name]?.gdpShare ?? 0),
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
      :max-zoom="8"
      :zoom-control="true"
      :attribution-control="false"
      :use-global-leaflet="false"
      style="height: 620px; width: 100%;"
    >
      <l-geo-json
        v-if="geojson"
        :geojson="geojson"
        :options-style="featureStyle"
        :options="{ onEachFeature }"
      />
    </l-map>

    <!-- Loading state -->
    <div
      v-if="!geojson"
      class="absolute inset-0 flex items-center justify-center text-slate-500 text-sm"
    >
      A carregar mapa…
    </div>

    <!-- Tooltip (aparece ACIMA do cursor) -->
    <div
      v-if="tooltip"
      class="fixed z-50 bg-gray-800 text-white text-xs px-2 py-1 rounded pointer-events-none"
      :style="{ left: `${tooltip.x + 12}px`, top: `${tooltip.y - 32}px` }"
    >
      {{ tooltip.name }}
    </div>

    <!-- Legend -->
    <div class="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-600 justify-center">
      <span class="text-gray-500 font-medium">% of GDP:</span>
      <div v-for="item in legendItems" :key="item.label" class="flex items-center gap-1">
        <div class="w-4 h-3 rounded-sm" :style="{ background: item.color }" />
        <span>{{ item.label }}</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-4 h-3 rounded-sm border border-gray-300" style="background:#ffd617" />
        <span>Selected</span>
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
/* Send map tile/vector panes to the back so outside UI elements render on top */
:deep(.leaflet-map-pane) {
  z-index: 0 !important;
}
:deep(.leaflet-tile-pane) {
  z-index: 1 !important;
}
:deep(.leaflet-overlay-pane) {
  z-index: 2 !important;
}
:deep(.leaflet-shadow-pane) {
  z-index: 3 !important;
}
:deep(.leaflet-marker-pane) {
  z-index: 4 !important;
}
:deep(.leaflet-tooltip-pane) {
  z-index: 5 !important;
}
:deep(.leaflet-popup-pane) {
  z-index: 6 !important;
}
</style>
