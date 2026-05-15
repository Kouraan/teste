<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
  },
  filename: {
    type: String,
    default: 'export',
  },
})

const isOpen = ref(false)

const exportToCSV = () => {
  if (!props.data || props.data.length === 0) return

  // Get headers from first object
  const headers = Object.keys(props.data[0])
  
  // Create CSV header row
  const csvHeader = headers.map(h => `"${h}"`).join(',')
  
  // Create CSV data rows
  const csvRows = props.data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // Handle nested objects and arrays
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      return `"${String(value).replace(/"/g, '""')}"`
    }).join(',')
  })

  const csv = [csvHeader, ...csvRows].join('\n')
  
  // Trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${props.filename}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  isOpen.value = false
}

const exportToJSON = () => {
  if (!props.data || props.data.length === 0) return

  const json = JSON.stringify(props.data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${props.filename}.json`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  isOpen.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Main button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-4 py-2 bg-prr-blue text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
      :title="`Exportar ${data.length} registos`"
    >
      <span>📥</span>
      <span>Exportar</span>
      <span class="text-xs opacity-70">({{ data.length }})</span>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-prr-border z-50 w-48"
    >
      <button
        @click="exportToCSV"
        class="w-full text-left px-4 py-3 hover:bg-prr-light transition-colors text-sm font-medium text-prr-blue flex items-center gap-2 border-b border-prr-border"
      >
        <span>📄</span>
        <div>
          <p>Exportar para CSV</p>
          <p class="text-xs text-slate-500 font-normal">Compatível com Excel</p>
        </div>
      </button>
      <button
        @click="exportToJSON"
        class="w-full text-left px-4 py-3 hover:bg-prr-light transition-colors text-sm font-medium text-prr-blue flex items-center gap-2"
      >
        <span>{ }</span>
        <div>
          <p>Exportar para JSON</p>
          <p class="text-xs text-slate-500 font-normal">Formato estruturado</p>
        </div>
      </button>
    </div>

    <!-- Close on outside click -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false"></div>
  </div>
</template>
