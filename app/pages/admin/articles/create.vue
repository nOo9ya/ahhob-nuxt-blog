<script setup lang="ts">
/**
 * Create Article Page
 * app/pages/admin/articles/create.vue
 * 
 * 기능: 새로운 게시글 작성
 * 구성: ArticleForm 공통 컴포넌트 재사용
 */
import ArticleForm from '~/app/components/admin/articles/ArticleForm.vue';

definePageMeta({
    layout: 'admin',
});

const router = useRouter();
const toast = useToast();
const isSubmitting = ref(false);

const handleCreate = async (payload: any) => {
    isSubmitting.value = true;
    try {
        await $fetch('/api/articles', {
            method: 'POST',
            body: payload,
        });

        toast.success('Article created successfully!');
        router.push('/admin/articles');
    } catch (error: any) {
        console.error('Failed to create article:', error);
        toast.error(`Error: ${error.statusCode} - ${error.statusMessage || 'Failed to create article'}`);
    } finally {
        isSubmitting.value = false;
    }
};

const handleCancel = () => {
    router.back();
};
</script>

<template>
    <div class="max-w-5xl mx-auto pb-20">
        <ArticleForm 
            :is-submitting="isSubmitting"
            submit-label="Publish Article"
            @submit="handleCreate"
            @cancel="handleCancel"
        />
    </div>
</template>
