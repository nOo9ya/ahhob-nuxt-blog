<script setup lang="ts">
/**
 * 간편 마크다운 에디터 (Markdown Editor)
 * 경로: app/components/admin/editor/MarkdownEditor.vue
 *
 * 설명:
 * 텍스트 영역(Textarea)과 미리보기(Preview)가 나뉜 2-Pane 방식의 마크다운 에디터입니다.
 * Tiptap 같은 위지윅 에디터 대신 가볍게 마크다운 문법을 직접 쓰고 싶을 때 사용합니다.
 *
 * 기능:
 * - 마크다운 텍스트 입력 및 실시간 미리보기 (marked 라이브러리 사용)
 * - 드래그 앤 드롭을 통한 파일 업로드 이벤트 지원
 * - XSS 방지를 위한 HTML 새니타이제이션
 *
 * 데이터 흐름:
 * - Parent → Props (modelValue: 마크다운 원문)
 * - User Input → Emit (update:modelValue, upload)
 *
 * 참고:
 * 현재 메인 기사 작성은 Tiptap(`ArticleEditor`)을 사용하므로, 이 컴포넌트는 보조용 혹은 레거시입니다.
 */
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

const props = defineProps<{
    modelValue: string; // 마크다운 원문
}>();

const emit = defineEmits<{
    'update:modelValue': [value: string];
    'upload': [file: File]; // 파일 드롭 이벤트
}>();

// v-model 구현을 위한 Computed Property (양방향 바인딩)
const localValue = computed({
    get: () => props.modelValue,
    set: (val: string) => emit('update:modelValue', val),
});

/**
 * 마크다운 렌더링 및 XSS 방지
 * - `marked` 라이브러리를 통해 마크다운 문자열을 HTML로 변환
 * - `DOMPurify`로 HTML 새니타이제이션하여 XSS 공격 방지
 * - 에러 발생 시 원문을 그대로 표시
 */
const renderedContent = computed(() => {
    try {
        const rawHtml = marked(localValue.value || '') as string;
        return DOMPurify.sanitize(rawHtml); // XSS 방지
    } catch (e) {
        console.error('Markdown rendering error:', e);
        return localValue.value;
    }
});

/**
 * 드래그 앤 드롭 파일 업로드 핸들러
 * - 드롭된 첫 번째 파일을 부모 컴포넌트로 emit
 */
const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
        const file = files[0];
        if (file) {
            emit('upload', file);
        }
    }
};

/**
 * 드래그 오버 핸들러
 * - 기본 동작 방지 (파일이 브라우저에서 열리는 것 방지)
 */
const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
};
</script>

<template>
    <div class="flex flex-col h-full border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <!-- Toolbar (도구 모음) -->
        <div class="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50 text-sm text-gray-600">
            <span class="font-bold text-gray-400 text-xs uppercase tracking-wider">Markdown Editor</span>
            <div class="flex-1"></div>
            <span class="text-xs text-gray-400">Supports Drag & Drop Images</span>
        </div>

        <!-- Editor Area (에디터 영역) -->
        <div class="flex-1 flex min-h-[500px]">
            <!-- Input (입력 영역) -->
            <textarea
                v-model="localValue"
                class="flex-1 p-6 resize-none focus:outline-none focus:bg-gray-50/30 transition-colors font-mono text-sm leading-relaxed"
                placeholder="# Start writing your story..."
                @drop="handleDrop"
                @dragover="handleDragOver"
            ></textarea>

            <!-- Divider (구분선) -->
            <div class="w-px bg-gray-100"></div>

            <!-- Preview (미리보기) -->
            <div
                class="flex-1 p-6 prose prose-indigo prose-sm max-w-none overflow-y-auto bg-gray-50/30"
                v-html="renderedContent"
            ></div>
        </div>
    </div>
</template>

<style scoped>
/* 에디터 커스텀 스크롤바 (Custom scrollbar for editor) */
textarea::-webkit-scrollbar {
    width: 8px;
}
textarea::-webkit-scrollbar-track {
    background: transparent;
}
textarea::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 4px;
}
</style>
