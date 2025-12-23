export const useArticleEditor = () => {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    // State
    const article = ref({
        title: '',
        content: '',
        categoryId: null as number | null,
        tagNames: [] as string[],
        status: 'draft', // 'draft' | 'published' | 'archived'
        thumbnail: '',
        seoMeta: {
            title: '',
            description: '',
            keywords: [],
        },
    });

    const isSaving = ref(false);
    const isPublishing = ref(false);
    const lastSavedAt = ref<Date | null>(null);
    const hasUnsavedChanges = ref(false);

    // Load Article (for Edit mode)
    const loadArticle = async (id: number | string) => {
        try {
            const { data } = await useFetch<any>(`/api/articles/${id}`);
            if (data.value && data.value.article) {
                const fetched = data.value.article;
                article.value = {
                    title: fetched.title,
                    content: fetched.content,
                    categoryId: fetched.categoryId,
                    tagNames: fetched.tags ? fetched.tags.map((t: any) => t.name) : [],
                    status: fetched.status,
                    thumbnail: fetched.thumbnail || '',
                    seoMeta: fetched.seoMeta || { title: '', description: '', keywords: [] },
                };
            }
        } catch (err) {
            console.error('Failed to load article', err);
            // Handle 404 or other errors
        }
    };

    // Save Draft
    const saveArticle = async () => {
        if (!article.value.title) {
            toast.error('Title is required');
            return;
        }

        isSaving.value = true;
        try {
            const id = route.params.id;
            let result;

            if (id) {
                // Update
                result = await $fetch(`/api/articles/${id}`, {
                    method: 'PUT',
                    body: article.value,
                });
            } else {
                // Create
                result = await $fetch('/api/articles', {
                    method: 'POST',
                    body: article.value,
                });
                // If created, redirect to edit page to prevent duplicate creation on subsequent saves
                if (result && (result as any).article?.id) {
                    router.replace(`/admin/articles/edit/${(result as any).article.id}`);
                }
            }

            lastSavedAt.value = new Date();
            hasUnsavedChanges.value = false;
            toast.success('Article saved successfully!');
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to save article');
        } finally {
            isSaving.value = false;
        }
    };

    // Publish
    const publishArticle = async () => {
        if (!confirm('Are you sure you want to publish this article?')) return;

        isPublishing.value = true;
        try {
            const id = route.params.id;
            if (!id) {
                // Must save first if it's new
                await saveArticle();
                // After save, id should be available in route params if we redirected, 
                // but if we are in new.vue, we need to handle the redirection flow first.
                // For simplicity, let's assume saveArticle handles redirection and we might need to wait or user clicks publish again.
                // Or better, return the ID from saveArticle.
                return; 
            }

            await $fetch(`/api/articles/${id}/publish`, {
                method: 'POST',
            });

            article.value.status = 'published';
            toast.success('Article published successfully!');
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to publish article');
        } finally {
            isPublishing.value = false;
        }
    };

    // Upload Image
    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const result = await $fetch<{ url: string }>('/api/upload', {
                method: 'POST',
                body: formData,
            });
            return result.url;
        } catch (err) {
            console.error('Upload failed', err);
            throw err;
        }
    };

    // Watch for changes to set dirty state
    watch(article, () => {
        hasUnsavedChanges.value = true;
    }, { deep: true });

    return {
        article,
        isSaving,
        isPublishing,
        lastSavedAt,
        hasUnsavedChanges,
        loadArticle,
        saveArticle,
        publishArticle,
        uploadImage,
    };
};
