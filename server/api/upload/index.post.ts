import { uploadFile } from '../../utils/fileUpload';
import { getUserSession } from '../../utils/session';

/**
 * 파일 업로드 API 엔드포인트
 * server/api/upload/index.post.ts
 *
 * 권한: Writer 권한 이상 (admin, writer)
 *
 * 데이터 흐름:
 * 1. 세션 및 권한 확인 (Security First)
 * 2. 업로드 유틸리티 호출 (server/utils/fileUpload.ts)
 * 3. 저장된 파일 정보 응답 반환
 */
export default defineEventHandler(async (event) => {
    // 1. 인증 및 권한 확인
    const user = await getUserSession(event);

    if (!user) {
        throw createError({
            statusCode: 401,
            message: 'Unauthorized',
        });
    }

    if (user.role !== 'admin' && user.role !== 'writer') {
        throw createError({
            statusCode: 403,
            message: 'Forbidden',
        });
    }
    
    // console.log('Upload request received');

    // 2. 파일 업로드 실행
    // uploadFile 유틸리티 함수 호출 (userId 전달)
    const results = await uploadFile(event, { userId: user.userId });

    // 3. 결과 반환
    return {
        success: true,
        files: results,
        count: results.length,
    };
});
