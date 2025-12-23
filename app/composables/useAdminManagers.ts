import { ref } from 'vue';
import { useFetch } from '#imports';
import { $fetch } from 'ofetch';

export const useAdminManagers = () => {
    // State
    const managers = ref<any[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    const isModalOpen = ref(false);
    const editingManager = ref<any | null>(null);
    const toast = useToast();

    // Fetch Managers
    const fetchManagers = async () => {
        isLoading.value = true;
        error.value = null;
        try {
            const { data } = await useFetch<{ success: boolean, data: any[] }>('/api/admins');
            if (data.value && data.value.success && Array.isArray(data.value.data)) {
                managers.value = data.value.data;
            } else {
                managers.value = [];
            }
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch managers';
            managers.value = [];
        } finally {
            isLoading.value = false;
        }
    };

    // Open/Close Modal
    const openCreateModal = () => {
        editingManager.value = null;
        isModalOpen.value = true;
    };

    const openEditModal = (manager: any) => {
        editingManager.value = { ...manager };
        isModalOpen.value = true;
    };

    const closeModal = () => {
        isModalOpen.value = false;
        editingManager.value = null;
    };

    // Actions
    const saveManager = async (formData: any) => {
        isLoading.value = true;
        try {
            if (editingManager.value) {
                // Update
                await $fetch(`/api/admins/${editingManager.value.id}`, {
                    method: 'PUT',
                    body: formData,
                });
            } else {
                // Create
                await $fetch('/api/admins', {
                    method: 'POST',
                    body: formData,
                });
            }
            await fetchManagers(); // Refresh list
            toast.success(editingManager.value ? 'Manager updated successfully!' : 'Manager created successfully!');
            closeModal();
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to save manager');
        } finally {
            isLoading.value = false;
        }
    };

    // DELETE function removed (User Request)

    const approveManager = async (manager: any) => {
        if (!confirm(`${manager.name}님을 승인하시겠습니까?`)) return;

        isLoading.value = true;
        try {
            await $fetch(`/api/admins/${manager.id}`, {
                method: 'PUT',
                body: { status: 'active' },
            });
            toast.success('Manager approved successfully!');
            await fetchManagers(); // Refresh list
        } catch (err: any) {
            toast.error(err.data?.message || 'Failed to approve manager');
        } finally {
            isLoading.value = false;
        }
    };

    return {
        managers,
        isLoading,
        error,
        isModalOpen,
        editingManager,
        fetchManagers,
        openCreateModal,
        openEditModal,
        closeModal,
        saveManager,
        approveManager,
    };
};
