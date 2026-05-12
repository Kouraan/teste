<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useApiStore } from '../stores/apiStore'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'Select Category' }
})

const emit = defineEmits(['update:modelValue'])

const store = useApiStore()
const { timelineEvents } = storeToRefs(store)

const isOpen = ref(false)
const dropdownRef = ref(null)

const categories = computed(() => {
  const cats = timelineEvents.value.map(e => e.category)
  return [...new Set(cats)].sort()
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (cat) => {
  emit('update:modelValue', cat)
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
  return props.modelValue || props.label
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
        class="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 origin-top-left overflow-hidden"
      >
        <div class="py-1 max-h-60 overflow-y-auto">
          <button
            @click="selectOption('')"
            class="w-full text-left px-4 py-2 text-xs font-bold uppercase hover:bg-slate-50 transition-colors"
            :class="modelValue === '' ? 'text-blue-600 bg-blue-50' : 'text-slate-700'"
          >
            All Categories
          </button>
          <button
            v-for="cat in categories"
            :key="cat"
            @click="selectOption(cat)"
            class="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 transition-colors"
            :class="modelValue === cat ? 'text-blue-600 bg-blue-50' : 'text-slate-700'"
          >
            {{ cat }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
