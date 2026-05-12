<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'status' // 'status' or 'target'
  }
})

const badgeConfig = computed(() => {
  const s = props.status.toLowerCase()
  
  // Special Target Style
  if (props.type === 'target' || s.includes('target met')) {
    return 'bg-white border-[#D1F0D9] text-[#2D7D46] font-bold py-0'
  }

  // Standard Statuses
  if (s === 'completed' || s === 'paid' || s === 'success') {
    return 'bg-[#ECFDF3] text-[#027A48] border-[#ABEFC6]'
  }
  if (s === 'in-progress' || s === 'pending' || s === 'ongoing') {
    return 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
  }
  if (s === 'delayed' || s === 'danger') {
    return 'bg-[#FFF1F3] text-[#C01048] border-[#FEE4E2]'
  }
  
  return 'bg-slate-50 text-slate-600 border-slate-200'
})
</script>

<template>
  <span 
    class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] uppercase tracking-wider font-bold border transition-all shadow-sm"
    :class="badgeConfig"
  >
    <span v-if="type === 'target' || status.toLowerCase().includes('target met')" class="mr-1">✓</span>
    {{ status }}
  </span>
</template>
