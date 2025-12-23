<template>
  <TransitionRoot appear :show="modelValue" as="template">
    <Dialog as="div" @close="close" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              :class="maxWidthClass"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 mb-4"
              >
                {{ title }}
              </DialogTitle>
              
              <div class="mt-2">
                <slot />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
/**
 * 공통 모달 컴포넌트 (UI Modal)
 * Path: app/components/admin/ui/Modal.vue
 * 
 * 설명:
 * Headless UI의 Dialog 컴포넌트를 래핑하여 만든 재사용 가능한 모달 통입니다.
 * 트랜지션 효과와 백드롭(Backdrop), 중앙 정렬 레이아웃을 제공합니다.
 * 
 * Props:
 * - modelValue: 모달 표시 여부 (v-model)
 * - title: 모달 상단 제목
 * - maxWidth: 모달의 최대 너비 제어 (sm, md, lg, xl, 2xl)
 */
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'

const props = defineProps({
  modelValue: Boolean, // v-model 바인딩
  title: String,
  maxWidth: {
    type: String,
    default: 'md'
  }
})

const emit = defineEmits(['update:modelValue'])

const close = () => {
  emit('update:modelValue', false)
}

// 너비 클래스 매핑
const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm': return 'max-w-sm'
    case 'md': return 'max-w-md'
    case 'lg': return 'max-w-lg'
    case 'xl': return 'max-w-xl'
    case '2xl': return 'max-w-2xl'
    default: return 'max-w-md'
  }
})
</script>
