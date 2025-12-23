<script setup lang="ts">
/**
 * Tiptap 에디터 공통 컴포넌트
 * Path: app/components/common/TiptapEditor.vue
 * 
 * 설명:
 * Tiptap 라이브러리를 래핑한 재사용 가능한 에디터 컴포넌트입니다.
 * 기본 서식 도구(Bold, Heading 등)와 이미지 업로드 기능을 포함합니다.
 * 
 * 주의:
 * 현재 관리자 기사 관리(`ArticleEditor.vue`)에서는 이 컴포넌트 대신 
 * 커스터마이징된 자체 Tiptap 인스턴스를 사용하고 있습니다.
 * 이 컴포넌트는 다른 곳(예: 댓글, 간단한 메모 등)에서 재사용하기 위해 남겨둠.
 */
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
    modelValue: string            // v-model (HTML Content)
    placeholder?: string          // 플레이스홀더 텍스트
    uploadContext?: {             // 이미지 업로드 시 필요한 메타데이터
        categoryPath: string
        slug: string
    }
}>()

const emit = defineEmits(['update:modelValue'])
const toast = useToast();

const editor = useEditor({
    content: props.modelValue,
    extensions: [
        StarterKit,
        Link.configure({
            openOnClick: false,
        }),
        Image.configure({
            inline: true,
        }),
        Placeholder.configure({
            placeholder: props.placeholder || 'Write something...',
        }),
    ],
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none max-w-none min-h-[300px]',
        },
        handleDrop: (view, event, slice, moved) => {
            if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                const file = event.dataTransfer.files[0];
                if (file.type.startsWith('image/')) {
                    uploadImage(file).then(url => {
                         const { schema } = view.state
                         if (schema.nodes.image) {
                            const node = schema.nodes.image.create({ src: url })
                            const transaction = view.state.tr.replaceSelectionWith(node)
                            view.dispatch(transaction)
                         }
                    });
                    return true;
                }
            }
            return false;
        }
    },
    onUpdate: () => {
        emit('update:modelValue', editor.value?.getHTML())
    },
})

// Watch for external model changes
watch(() => props.modelValue, (newValue) => {
    if (editor.value && newValue !== editor.value.getHTML()) {
        editor.value.commands.setContent(newValue, { emitUpdate: false })
    }
})

const uploadImage = async (file: File): Promise<string> => {
    if (!props.uploadContext?.categoryPath || !props.uploadContext?.slug) {
        toast.error('Category and Slug must be set before uploading images.');
        throw new Error('Missing upload context');
    }

    const formData = new FormData();
    formData.append('files', file);
    formData.append('categoryPath', props.uploadContext.categoryPath);
    formData.append('slug', props.uploadContext.slug);
    formData.append('type', 'body');
    formData.append('optimize', 'true');

    try {
        const { files } = await $fetch<{ files: any[] }>('/api/upload', {
            method: 'POST',
            body: formData,
        });
        return files[0].url;
    } catch (e) {
        console.error('Image upload failed', e);
        toast.error('Image upload failed');
        return '';
    }
}

const addImage = () => {
    const url = window.prompt('URL')
    if (url) {
        editor.value?.chain().focus().setImage({ src: url }).run()
    }
}

const uploadImageButton = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const url = await uploadImage(file);
            if (url) {
                editor.value?.chain().focus().setImage({ src: url }).run();
            }
        }
    };
    input.click();
}

onBeforeUnmount(() => {
    editor.value?.destroy()
})
</script>

<template>
    <div class="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-black focus-within:border-transparent transition-all">
        <div v-if="editor" class="border-b border-gray-100 bg-gray-50/50 p-2 flex flex-wrap gap-1 items-center">
            <!-- Basic Formatting -->
            <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'bg-gray-200 text-black': editor.isActive('bold') }" class="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Bold" aria-label="텍스트를 굵게 만들기">
                <span class="font-bold" aria-hidden="true">B</span>
            </button>
            <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'bg-gray-200 text-black': editor.isActive('italic') }" class="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Italic" aria-label="텍스트를 기울이기">
                <span class="italic" aria-hidden="true">I</span>
            </button>
            <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'bg-gray-200 text-black': editor.isActive('strike') }" class="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Strike" aria-label="텍스트에 취소선 추가">
                <span class="line-through" aria-hidden="true">S</span>
            </button>
            
            <div class="w-px h-6 bg-gray-300 mx-2"></div>

            <!-- Headings -->
            <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'bg-gray-200 text-black': editor.isActive('heading', { level: 1 }) }" class="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="H1" aria-label="제목 1 스타일 적용">
                <span aria-hidden="true">H1</span>
            </button>
            <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'bg-gray-200 text-black': editor.isActive('heading', { level: 2 }) }" class="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="H2" aria-label="제목 2 스타일 적용">
                <span aria-hidden="true">H2</span>
            </button>
            <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'bg-gray-200 text-black': editor.isActive('heading', { level: 3 }) }" class="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="H3" aria-label="제목 3 스타일 적용">
                <span aria-hidden="true">H3</span>
            </button>

            <div class="w-px h-6 bg-gray-300 mx-2"></div>

            <!-- Lists -->
            <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'bg-gray-200 text-black': editor.isActive('bulletList') }" class="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Bullet List" aria-label="글머리 기호 목록 추가">
                <span aria-hidden="true">• List</span>
            </button>
            <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'bg-gray-200 text-black': editor.isActive('orderedList') }" class="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors" title="Ordered List" aria-label="번호 매기기 목록 추가">
                <span aria-hidden="true">1. List</span>
            </button>

            <div class="w-px h-6 bg-gray-300 mx-2"></div>

            <!-- Media -->
            <button @click="uploadImageButton" class="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors flex items-center gap-1" title="Upload Image" aria-label="이미지 업로드">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span class="text-xs" aria-hidden="true">Image</span>
            </button>
             <button @click="editor.chain().focus().unsetAllMarks().run()" class="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors ml-auto text-xs" aria-label="모든 서식 지우기">
                <span aria-hidden="true">Clear Format</span>
            </button>
        </div>
        
        <editor-content :editor="editor" />
        
        <div v-if="editor" class="px-3 py-2 text-xs text-gray-400 border-t border-gray-100 flex justify-between">
            <span>{{ editor.storage.characterCount?.words() || 0 }} words</span>
            <span>Markdown supported</span>
        </div>
    </div>
</template>

<style scoped>
/* Prose Mirror Custom Styles if needed, mostly handled by Tailwind Typography */
:deep(.ProseMirror) {
    min-height: 300px;
    padding: 1rem;
    outline: none;
}
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
</style>
