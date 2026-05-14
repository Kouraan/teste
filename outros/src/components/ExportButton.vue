<script setup>
import { ref } from 'vue'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const props = defineProps({
  targetId: { type: String, default: null },
  data: { type: Array, default: () => [] },
  filename: { type: String, default: 'export' },
  formats: { type: Array, default: () => ['PNG', 'PDF', 'CSV', 'JSON'] }
})

const isOpen = ref(false)

const warnNoData = () => {
  alert('No structured data available for this export format.')
  isOpen.value = false
}

const downloadCSV = () => {
  if (!props.data || props.data.length === 0) return warnNoData()
  const keys = Object.keys(props.data[0])
  const csvContent = [
    keys.join(','),
    ...props.data.map(row => keys.map(k => {
      let val = row[k] === null || row[k] === undefined ? '' : String(row[k])
      val = val.replace(/"/g, '""')
      if (val.search(/("|,|\n)/g) >= 0) val = `"${val}"`
      return val
    }).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${props.filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  isOpen.value = false
}

const downloadJSON = () => {
  if (!props.data || props.data.length === 0) return warnNoData()
  const dataStr = JSON.stringify(props.data, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.filename}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  isOpen.value = false
}

const captureElement = async () => {
  if (!props.targetId) {
    alert('No visual target defined for image export.')
    return null
  }
  const el = document.getElementById(props.targetId)
  if (!el) {
    alert(`Could not find the visual element (${props.targetId}).`)
    return null
  }
  try {
    return await html2canvas(el, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#ffffff',
      logging: false
    })
  } catch (error) {
    console.error('Export error:', error)
    alert('Failed to capture the visual element. Some content might be blocking the export.')
    return null
  }
}

const downloadPNG = async () => {
  try {
    const canvas = await captureElement()
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${props.filename}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (error) {
    console.error('PNG Export error:', error)
    alert('Failed to generate PNG image.')
  } finally {
    isOpen.value = false
  }
}

const downloadPDF = async () => {
  try {
    const canvas = await captureElement()
    if (!canvas) return
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('l', 'mm', 'a4')
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`${props.filename}.pdf`)
  } catch (error) {
    console.error('PDF Export error:', error)
    alert('Failed to generate PDF document.')
  } finally {
    isOpen.value = false
  }
}

const handleExport = (format) => {
  if (format === 'CSV') downloadCSV()
  if (format === 'JSON') downloadJSON()
  if (format === 'PNG') downloadPNG()
  if (format === 'PDF') downloadPDF()
}
</script>

<template>
  <div class="relative inline-block text-left z-20" @mouseleave="isOpen = false" data-html2canvas-ignore="true">
    <button 
      @click="isOpen = !isOpen"
      class="inline-flex items-center gap-2 px-4 py-2 bg-eu-blue hover:bg-blue-800 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 border border-transparent"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Export
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 ml-1 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div 
      v-if="isOpen" 
      class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden"
    >
      <div class="py-1">
        <button 
          v-for="fmt in formats" 
          :key="fmt"
          @click="handleExport(fmt)"
          class="text-slate-700 block w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-blue-50 hover:text-eu-blue transition-colors"
        >
          Download as {{ fmt }}
        </button>
      </div>
    </div>
    
    <!-- Transparent overlay to close dropdown when clicking outside -->
    <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 z-[-1]"></div>
  </div>
</template>
