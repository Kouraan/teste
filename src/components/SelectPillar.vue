<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '../stores/apiStore'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Select Pillar' }
})

const emit = defineEmits(['update:modelValue'])

const store = useApiStore()
const { pillars } = storeToRefs(store)

const isOpen = ref(false)
const dropdownRef = ref(null)

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (id) => {
  emit('update:modelValue', id)
  isOpen.value = false
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const getSelectedLabel = () => {
  if (!props.modelValue) return props.label
  const selected = pillars.value.find(p => p.id === props.modelValue)
  return selected ? selected.shortName || selected.name : props.label
}
</script>

<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <div>
      <button
        type="button"
        @click="toggleDropdown"
        class="bg-[#ffcc00] hover:bg-yellow-500 text-[10px] font-bold px-4 py-1.5 rounded uppercase shadow-sm transition-colors flex items-center gap-2 min-w-[120px] justify-between"
      >
        <span>{{ getSelectedLabel() }}</span>
        <svg class="w-2.5 h-2.5 transition-transform" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    </div>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 origin-top-left overflow-hidden"
      >
        <div class="py-1 max-h-60 overflow-y-auto">
          <button
            @click="selectOption('')"
            class="w-full text-left px-4 py-2 text-xs font-bold uppercase hover:bg-slate-50 transition-colors"
            :class="modelValue === '' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'"
          >
            All Pillars
          </button>
          <button
            v-for="pillar in pillars"
            :key="pillar.id"
            @click="selectOption(pillar.id)"
            class="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            :class="modelValue === pillar.id ? 'text-blue-600 bg-blue-50' : 'text-slate-700'"
          >
            <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: pillar.color }"></span>
            <span>{{ pillar.name }}</span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
