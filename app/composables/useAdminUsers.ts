
import { ref } from 'vue';
import { useFetch } from '#imports';
import { $fetch } from 'ofetch';

export const useAdminUsers = () => {
    // State
    const users = ref<any[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const toast = useToast();

    // Fetch Users
    const fetchUsers = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const { data } = await useFetch<{ success: boolean, data: any[] }>('/api/users');
            if (data.value && data.value.success && Array.isArray(data.value.data)) {
                users.value = data.value.data;
            } else {
                users.value = [];
            }
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch users';
            users.value = [];
        } finally {
            isLoading.value = false;
        }
    };

    // Actions
    const deleteUser = async (id: number) => {
        if (!confirm('정말로 이 사용자를 삭제(강제 탈퇴)하시겠습니까?')) return;

        isLoading.value = true;
        try {
            await $fetch(`/api/users/${id}`, {
                method: 'DELETE',
            });
            toast.success('User deleted successfully!');
            await fetchUsers(); // Refresh list
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to delete user');
        } finally {
            isLoading.value = false;
        }
    };

    return {
        users,
        isLoading,
        error,
        fetchUsers,
        deleteUser,
    };
};
