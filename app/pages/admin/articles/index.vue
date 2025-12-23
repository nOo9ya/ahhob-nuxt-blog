<template>
    <div class="p-6 max-w-7xl mx-auto">
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Articles</h1>
            <p class="text-gray-500 mt-1">Manage your blog posts here.</p>
        </div>

        <AdminArticleList
            :articles="articles"
            :page="page"
            :total-pages="totalPages"
            @search="handleSearch"
            @filter="handleFilter"
            @page-change="handlePageChange"
            @delete="handleDelete"
        />
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const toast = useToast();

const page = ref(1);
const limit = ref(10);
const search = ref('');
const status = ref('all'); // 관리자 페이지에서는 기본적으로 모든 상태의 글 조회

// Fetch articles with reactive query params
const { data, refresh } = await useFetch('/api/articles', {
    query: computed(() => ({
        page: page.value,
        limit: limit.value,
        search: search.value || undefined,
        status: status.value || undefined,
        sort: 'latest',
    })),
});

const articles = computed(() => (data.value as any)?.data || []);
const totalPages = computed(() => (data.value as any)?.pagination?.totalPages || 1);

const handleSearch = (query: string) => {
    search.value = query;
    page.value = 1; // Reset to first page
};

const handleFilter = (filterStatus: string) => {
    status.value = filterStatus;
    page.value = 1;
};

const handlePageChange = (newPage: number) => {
    page.value = newPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
        return;
    }

    try {
        await $fetch(`/api/articles/${id}`, {
            method: 'DELETE',
        });
        toast.success('Article deleted successfully!');
        refresh(); // Refresh list
    } catch (e) {
        console.error('Failed to delete article', e);
        toast.error('Failed to delete article');
    }
};
</script>
