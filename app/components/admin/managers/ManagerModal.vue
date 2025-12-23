<script setup lang="ts">
/**
 * 관리자 초대/수정 모달 (Manager Modal)
 * Path: app/components/admin/managers/ManagerModal.vue
 */
const props = defineProps<{
    isOpen: boolean; // 모달 표시 여부
    manager?: any;      // 수정할 관리자 데이터
}>();

const emit = defineEmits<{
    (e: 'close'): void;           // 닫기 요청
    (e: 'save', data: any): void; // 저장 요청
}>();

// 내부 폼 상태
const form = ref({
    name: '',
    email: '',
    password: '',
    role: 'writer', // 기본값 writer
    bio: '',
    status: 'active',
});

/**
 * 폼 초기화 감시자
 */
watch(() => props.manager, (newManager) => {
    if (newManager) {
        // Edit Mode
        form.value = {
            name: newManager.name || '',
            email: newManager.email || '',
            password: '', 
            role: newManager.role || 'writer',
            bio: newManager.bio || '',
            status: newManager.status || 'active', 
        };
    } else {
        // Create Mode
        form.value = {
            name: '',
            email: '',
            password: '',
            role: 'writer',
            bio: '',
            status: 'active',
        };
    }
}, { immediate: true });

const handleSubmit = () => {
    emit('save', { ...form.value });
};
</script>

<template>
    <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="emit('close')">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
                <!-- Header -->
                <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 class="text-lg font-bold text-gray-900">
                        {{ manager ? 'Edit Manager' : 'Invite Manager' }}
                    </h3>
                    <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Body -->
                <div class="p-6 space-y-4">
                    <!-- Name -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input 
                            v-model="form.name" 
                            type="text" 
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300" 
                            placeholder="John Doe"
                        />
                    </div>

                    <!-- Email -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            v-model="form.email" 
                            type="email" 
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300" 
                            placeholder="john@example.com"
                        />
                    </div>

                    <!-- Password -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Password
                            <span v-if="manager" class="text-xs text-gray-400 font-normal ml-1">(Leave blank to keep current)</span>
                        </label>
                        <input 
                            v-model="form.password" 
                            type="password" 
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300" 
                            placeholder="••••••••"
                        />
                    </div>

                    <!-- Role -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select 
                            v-model="form.role" 
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                        >
                            <option value="writer">Writer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <!-- Status (New) -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select 
                            v-model="form.status" 
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                        >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                     <!-- Bio -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea 
                            v-model="form.bio" 
                            rows="3"
                            class="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300 resize-none" 
                            placeholder="Short bio..."
                        ></textarea>
                    </div>
                </div>

                <!-- Footer -->
                <div class="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                    <button @click="emit('close')" class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                        Cancel
                    </button>
                    <button @click="handleSubmit" class="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                        {{ manager ? 'Save Changes' : 'Invite Manager' }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>
