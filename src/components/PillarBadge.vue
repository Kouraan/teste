<script setup>
import { computed } from 'vue'
import { useApiStore } from '../stores/apiStore'
import { storeToRefs } from 'pinia'

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  showName: {
    type: Boolean,
    default: false
  }
})

const store = useApiStore()
const { pillars } = storeToRefs(store)

const config = computed(() => {
  const cat = props.category.toLowerCase();
  
  // Find pillar in store by id or name
  const pillar = pillars.value.find(p => 
    p.id.toLowerCase() === cat || 
    p.name.toLowerCase() === cat ||
    p.shortName?.toLowerCase() === cat
  )

  if (pillar) {
    return {
      name: pillar.name,
      color: pillar.color.startsWith('#') ? pillar.color : `bg-[${pillar.color}]`, // Tailwind class vs hex
      icon: pillar.icon,
      isHex: pillar.color.startsWith('#')
    }
  }
  
  return { name: 'Other', color: 'bg-slate-400', icon: '❓', isHex: false };
})
</script>

<template>
  <div class="inline-flex items-center gap-2">
    <div 
      :class="[!config.isHex ? config.color : '', 'w-6 h-6 rounded-full flex items-center justify-center text-[12px] shadow-sm']"
      :style="config.isHex ? { backgroundColor: config.color } : {}"
      :title="config.name"
    >
      {{ config.icon }}
    </div>
    <span v-if="showName" class="text-xs font-medium text-slate-700">
      {{ config.name }}
    </span>
  </div>
</template>