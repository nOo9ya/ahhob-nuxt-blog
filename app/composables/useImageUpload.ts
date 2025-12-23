import { ref, $fetch } from '#imports';

/**
 * 이미지 업로드 처리 Composable
 * 
 * 기능:
 * - 파일 선택 및 검증
 * - API 업로드 요청
 * - 로딩 상태 및 에러 관리
 */
export const useImageUpload = () => {
    const uploading = ref(false);
    const error = ref<string | null>(null);

    /**
     * 파일 업로드 함수
     * @param file 업로드할 파일 객체 (File)
     * @returns 업로드된 이미지 URL
     */
    const uploadImage = async (file: File): Promise<string | null> => {
        if (!file) return null;

        // 검증: 이미지 타입
        if (!file.type.startsWith('image/')) {
            error.value = '이미지 파일만 업로드 가능합니다.';
            return null;
        }

        // 검증: 크기 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            error.value = '파일 크기는 5MB 이하여야 합니다.';
            return null;
        }

        uploading.value = true;
        error.value = null;

        const formData = new FormData();
        formData.append('image', file);
        // formData.append('type', 'article'); // 필요시 타입 구분

        try {
            const response: any = await $fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (response && response.url) {
                return response.url;
            } else {
                throw new Error('Upload failed');
            }
        } catch (err: any) {
            error.value = err.message || '이미지 업로드 중 오류가 발생했습니다.';
            return null;
        } finally {
            uploading.value = false;
        }
    };

    /**
     * input[type="file"] change 핸들러 헬퍼
     */
    const handleFileChange = async (event: Event) => {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            return await uploadImage(input.files[0]);
        }
        return null;
    };

    return {
        uploading,
        error,
        uploadImage,
        handleFileChange
    };
};
