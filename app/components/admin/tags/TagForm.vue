<script setup lang="ts">
/**
 * 태그 생성/수정 폼 (Tag Form)
 * Path: app/components/admin/tags/TagForm.vue
 * 
 * 설명:
 * 태그 정보를 입력받는 양식입니다. 
 * '이름(Name)'을 입력하면 자동으로 URL에 적합한 '슬러그(Slug)'를 생성합니다.
 * 생성(Create)과 수정(Edit) 모드를 모두 지원하며, `initialData` props 유무로 구분합니다.
 * 
 * 데이터 흐름:
 * 1. 부모(Tag Page -> Modal)에서 `initialData` 전달 (수정 시).
 * 2. 내부 `form` state 초기화.
 * 3. 사용자 입력 (Name 입력 시 Slug 자동 생성 감지).
 * 4. Submit 시 `submit` 이벤트로 데이터 내보내기.
 */
import type { Tag } from '~/shared/types/article';

// Props 정의
// initialData가 있으면 수정 모드, 없으면 생성 모드로 동작합니다.
const props = defineProps<{
    initialData?: Tag | null;
    isSubmitting?: boolean;
}>();

// 이벤트 정의
const emit = defineEmits<{
    (e: 'submit', payload: any): void; // 폼 데이터 전송
    (e: 'cancel'): void;               // 취소 버튼 클릭
}>();

// 폼 상태 관리
const form = reactive({
    name: '',
    slug: ''
});

// 슬러그가 수동으로 수정되었는지 여부
const isSlugManuallyChanged = ref(false);

/**
 * 폼 초기화 로직
 * - 모달이 열리거나 initialData가 바뀔 때 실행됩니다.
 * - 데이터가 있으면 필드를 채우고, 없으면 비웁니다.
 */
watch(() => props.initialData, (newData) => {
    isSlugManuallyChanged.value = false; // 리셋
    if (newData) {
        form.name = newData.name;
        form.slug = newData.slug;
    } else {
        form.name = '';
        form.slug = '';
    }
}, { immediate: true });

/**
 * 슬러그 생성 유틸리티
 * 한글, 영문, 숫자, 하이픈(-)만 허용
 */
const generateSlug = (text: string) => {
    return text.toLowerCase()
        .replace(/[^\w\s가-힣-@]/g, '') // 특수문자 제거 (한글, @, -, 영문, 숫자, 공백 허용)
        .trim()
        .replace(/\s+/g, '-'); // 공백 -> 하이픈
};

// 슬러그 중복 체크 상태
const isSlugValid = ref(true);
const slugErrorMessage = ref('');
const isCheckingSlug = ref(false);

/**
 * 슬러그 중복 체크 로직
 */
const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck) {
        isSlugValid.value = false;
        slugErrorMessage.value = '';
        return;
    }

    isCheckingSlug.value = true;
    try {
        const { isValid, message } = await $fetch<{ isValid: boolean; message?: string }>('/api/validation/check-slug', {
            params: {
                slug: slugToCheck,
                type: 'tag',
                excludeId: props.initialData?.id // 수정 시 본인 제외
            }
        });

        isSlugValid.value = isValid;
        slugErrorMessage.value = message || '';
    } catch (e) {
        console.error('Failed to check slug availability:', e);
        // API 오류 시 일단 통과시키고 제출 시 서버에서 다시 검증하도록 유도하거나, 일시적 오류 메시지 표시
        isSlugValid.value = true; 
        slugErrorMessage.value = '';
    } finally {
        isCheckingSlug.value = false;
    }
};

// Debounce 적용 (300ms)
const debouncedCheckSlug = useDebounce(checkSlugAvailability, 300);

/**
 * 슬러그 자동 생성 로직
 * - 생성 모드이거나, 수정 모드여도 슬러그를 수동으로 건드리지 않았다면 자동 갱신
 */
watch(() => form.name, (newName) => {
    if (!isSlugManuallyChanged.value && newName) {
        form.slug = generateSlug(newName);
        // 자동 생성된 슬러그도 검증 필요
        debouncedCheckSlug(form.slug);
    }
});

// 슬러그 수동 입력 감지 & 유효성 검사 트리거
const handleSlugInput = () => {
    isSlugManuallyChanged.value = true;
    debouncedCheckSlug(form.slug);
};

const handleSubmit = () => {
    // 저장 전 최종 유효성 확인
    if (!isSlugValid.value) return;
    emit('submit', { ...form });
};
</script>

<template>
    <form @submit.prevent="handleSubmit" id="tagForm" class="space-y-5">
        <!-- Name & Slug -->
        <div class="space-y-4">
            <div class="space-y-1.5">
                <label class="text-sm font-semibold text-gray-700">Name</label>
                <input v-model="form.name" type="text" required placeholder="e.g. JavaScript" 
                    class="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-300" />
            </div>
            <div class="space-y-1.5">
                <label class="text-sm font-semibold text-gray-700">Slug</label>
                <div class="relative">
                    <input 
                        v-model="form.slug" 
                        @input="handleSlugInput"
                        type="text" 
                        required 
                        pattern="^[a-z0-9가-힣@]+(?:-[a-z0-9가-힣@]+)*$"
                        title="영문 소문자, 숫자, 한글, @, 하이픈(-)만 사용할 수 있으며, 하이픈으로 시작하거나 끝날 수 없습니다."
                        placeholder="e.g. javascript" 
                        :class="[
                            'w-full px-4 py-2 rounded-lg border outline-none transition-all placeholder:text-gray-300 bg-gray-50/50',
                            !isSlugValid ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                        ]"
                    />
                    <!-- Loading Indicator -->
                    <div v-if="isCheckingSlug" class="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
                <!-- Error Message -->
                <p v-if="!isSlugValid && slugErrorMessage" class="text-xs text-red-500 font-medium">
                    {{ slugErrorMessage }}
                </p>
                <p v-else class="text-xs text-gray-500">
                    * 한글, 영문 소문자, 숫자, @, 하이픈(-) 사용 가능
                </p>
            </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-3 w-full sm:w-auto pt-2">
            <button type="button" @click="$emit('cancel')" 
                class="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Cancel
            </button>
            <button type="submit" 
                :disabled="!isSlugValid || isCheckingSlug"
                :class="[
                    'flex-1 sm:flex-none px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors',
                    !isSlugValid || isCheckingSlug ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                ]">
                {{ initialData ? 'Update Tag' : 'Create Tag' }}
            </button>
        </div>
    </form>
</template>
