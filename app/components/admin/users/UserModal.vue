<script setup lang="ts">
/**
 * 사용자 초대/수정 모달 (User Modal)
 * Path: app/components/admin/users/UserModal.vue
 * 
 * 설명:
 * 사용자를 새로 생성(초대)하거나 기존 정보를 수정하는 폼 모달입니다.
 * `props.user`의 유무에 따라 'Create Mode'와 'Edit Mode'로 동작이 달라집니다.
 * 
 * 데이터 흐름:
 * 1. 부모로부터 `user` 객체를 받으면 내부 `form` 상태에 복사(Deep Copy Pattern)합니다.
 * 2. 사용자가 입력을 마치고 저장하면 `save` 이벤트와 함께 `form` 데이터를 부모에게 보냅니다.
 * 3. 비밀번호 필드는 보안상 수정 모드에서는 기본적으로 비워둡니다.
 */
const props = defineProps<{
    isOpen: boolean; // 모달 표시 여부
    user?: any;      // 수정할 사용자 데이터 (없으면 생성 모드)
}>();

const emit = defineEmits<{
    (e: 'close'): void;           // 닫기 요청
    (e: 'save', data: any): void; // 저장 요청
}>();

// 내부 폼 상태 (Reactivity)
const form = ref({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
    bio: '',
});

/**
 * 폼 초기화 감시자
 * - 모달이 열리거나 대상 사용자가 바뀔 때마다 폼을 리셋하거나 채웁니다.
 * - immediate: true를 통해 컴포넌트 마운트 시에도 실행됩니다.
 */
watch(() => props.user, (newUser) => {
    if (newUser) {
        // Edit Mode: 기존 데이터 매핑
        form.value = {
            name: newUser.name || '',
            email: newUser.email || '',
            password: '', // 보안상 비밀번호는 불러오지 않음
            role: newUser.role || 'viewer',
            bio: newUser.bio || '',
        };
    } else {
        // Create Mode: 초기화
        form.value = {
            name: '',
            email: '',
            password: '',
            role: 'viewer',
            bio: '',
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
                        {{ user ? 'Edit User' : 'Invite User' }}
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

                    <!-- Password (Optional for Edit) -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Password
                            <span v-if="user" class="text-xs text-gray-400 font-normal ml-1">(Leave blank to keep current)</span>
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
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
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
                        {{ user ? 'Save Changes' : 'Invite User' }}
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>
