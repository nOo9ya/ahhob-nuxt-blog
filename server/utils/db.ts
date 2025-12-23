export { getDB } from '../database';
import { getDB } from '../database';
import type { MySql2Database } from 'drizzle-orm/mysql2';
import type * as schema from '../database/schema';

// ========================================
// 타입 정의 (Type Definitions)
// ========================================

/**
 * Drizzle DB 타입 정의
 */
type DrizzleDB = MySql2Database<typeof schema>;

/**
 * MySQL2 에러 타입 정의
 * MySQL 데이터베이스 드라이버에서 발생하는 에러 정보를 포함합니다.
 */
interface MySQLError extends Error {
    /** MySQL 에러 코드 (예: 'ER_DUP_ENTRY', 'ER_NO_REFERENCED_ROW_2') */
    code?: string;
    /** MySQL 에러 번호 */
    errno?: number;
    /** SQL 상태 코드 (SQLSTATE) */
    sqlState?: string;
    /** MySQL 에러 메시지 */
    sqlMessage?: string;
    /** 실행된 SQL 쿼리 */
    sql?: string;
}

/**
 * 데이터베이스 작업 옵션 인터페이스
 * 트랜잭션 및 단순 쿼리 모두에서 사용됩니다.
 */
interface DatabaseOperationOptions {
    /**
     * 에러 발생 시 사용자에게 보여줄 커스텀 메시지
     * 기본값: '데이터 처리 중 알 수 없는 오류가 발생했습니다.'
     *
     * @example '회원 가입 중 오류가 발생했습니다.'
     */
    errorMessage?: string;

    /**
     * 디버깅 모드 활성화 여부
     * - true: 에러 원본을 콘솔에 상세히 출력
     * - false: 간단한 로그만 출력
     *
     * 기본값: process.env.NODE_ENV === 'development'
     */
    debug?: boolean;

    /**
     * 작업 컨텍스트 (내부 로깅용)
     * @internal
     */
    context?: 'transaction' | 'query';
}

// ========================================
// 환경 변수 및 상수 (Constants)
// ========================================

/**
 * 개발 환경 여부 (자동 감지)
 * debug 옵션의 기본값으로 사용됩니다.
 */
const isDevMode = process.env.NODE_ENV === 'development';

/**
 * 주요 MySQL 에러 코드 상수
 *
 * @example
 * if (isMySQLError(error, MySQLErrorCodes.DUPLICATE_ENTRY)) {
 *   throw createError({ statusCode: 409, message: '이미 존재합니다.' });
 * }
 */
export const MySQLErrorCodes = {
    /** 중복 키/유니크 제약 위반 (Duplicate Entry) */
    DUPLICATE_ENTRY: 'ER_DUP_ENTRY',
    /** 외래키 제약 위반 - 부모 레코드 없음 (No Referenced Row) */
    NO_REFERENCED_ROW: 'ER_NO_REFERENCED_ROW_2',
    /** 외래키 제약 위반 - 자식 레코드 있음 (Row is Referenced) */
    ROW_IS_REFERENCED: 'ER_ROW_IS_REFERENCED_2',
    /** 데드락 감지 (Lock Deadlock) */
    LOCK_DEADLOCK: 'ER_LOCK_DEADLOCK',
    /** 연결 타임아웃 (Lock Wait Timeout) */
    LOCK_WAIT_TIMEOUT: 'ER_LOCK_WAIT_TIMEOUT',
} as const;

// ========================================
// 헬퍼 함수 (Helper Functions)
// ========================================

/**
 * 데이터베이스 에러 핸들러 (handleDatabaseError)
 *
 * 기능: DB 작업 중 발생한 에러를 분석하여 로깅하고, 클라이언트에게 안전한 에러 응답을 생성하여 던집니다.
 *
 * 데이터 흐름:
 * 1. 옵션 파싱 (메시지, 디버그 모드, 컨텍스트)
 * 2. 디버그 모드인 경우 상세 로깅 (MySQL 에러 코드, SQL 쿼리 등)
 * 3. 프로덕션 모드인 경우 요약 로깅
 * 4. 보안을 위해 내부 상세 정보를 제외한 H3Error 생성 및 throw (500 Internal Server Error)
 *
 * @param error 발생한 에러 객체 (unknown)
 * @param options 에러 처리 옵션 (메시지, 디버그 여부 등)
 * @throws {H3Error} 항상 500 에러를 throw 합니다.
 * @internal
 */
function handleDatabaseError(
    error: unknown,
    options: Required<DatabaseOperationOptions>
): never {
    const { errorMessage, debug, context } = options;

    // [기능 1] 디버그 모드: 상세 에러 로그 출력
    if (debug) {
        const separator = '='.repeat(50);
        console.error(separator);
        console.error(`[Database ${context} Failed]`);
        console.error('Custom Message:', errorMessage);
        console.error('Error Name:', (error as Error)?.name);
        console.error('Error Message:', (error as Error)?.message);

        // MySQL 에러 상세 정보 출력
        const mysqlError = error as MySQLError;
        if (mysqlError.code) {
            console.error('MySQL Error Code:', mysqlError.code);
            console.error('MySQL Error Number:', mysqlError.errno);
            console.error('SQL State:', mysqlError.sqlState);
            console.error('SQL Message:', mysqlError.sqlMessage);
            if (mysqlError.sql) {
                console.error('SQL Query:', mysqlError.sql);
            }
        }

        console.error('Full Error:', error);
        console.error(separator);
    } else {
        // [기능 2] 프로덕션 모드: 간단한 로그만
        console.error(`[Database ${context} Error]:`, errorMessage);
    }

    // [기능 3] 사용자에게는 정제된 에러 메시지 전달 (보안)
    throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: errorMessage,
        // 디버그 모드일 때만 상세 에러 포함
        data: debug
            ? {
                  code: (error as MySQLError).code,
                  errno: (error as MySQLError).errno,
              }
            : undefined,
    });
}

/**
 * MySQL 에러 코드 체크 헬퍼 (isMySQLError)
 *
 * 기능: 발생한 에러가 특정 MySQL 에러 코드(예: 중복 키)에 해당하는지 확인합니다.
 *
 * 데이터 흐름:
 * 1. 에러 객체가 MySQL 에러 형태인지 확인 (code 속성 존재 여부)
 * 2. 주어진 코드와 에러 코드가 일치하는지 비교
 * 3. 일치 여부(boolean) 반환
 *
 * @param error 체크할 에러 객체
 * @param code 확인하려는 MySQL 에러 코드 (ex: 'ER_DUP_ENTRY')
 * @returns 코드가 일치하면 true, 아니면 false
 */
export const isMySQLError = (error: unknown, code: string): boolean => {
    return (error as MySQLError)?.code === code;
};

// ========================================
// 메인 유틸리티 함수 (Main Utilities)
// ========================================

/**
 * 안전한 트랜잭션 핸들러 (useSafeTransaction)
 *
 * 기능: DB 작업을 트랜잭션으로 묶어서 실행하며, 자동 롤백 및 표준화된 에러 처리를 제공합니다.
 *
 * 데이터 흐름:
 * 1. 옵션 초기화 (디버그 모드 자동 감지)
 * 2. DB 커넥션 획득
 * 3. db.transaction() 실행
 *    - 콜백 함수 실행
 *    - 성공 시: 결과 반환 및 커밋
 *    - 실패 시: Drizzle이 자동 롤백 수행
 * 4. 에러 발생 시 handleDatabaseError로 위임하여 처리
 *
 * @template T 트랜잭션 콜백 함수의 반환 타입
 * @param callback 트랜잭션 내에서 실행할 비즈니스 로직 (tx 인자 제공)
 * @param options 에러 메시지 및 디버깅 옵션
 * @returns 트랜잭션 결과값
 * @throws {H3Error} 500 Internal Server Error
 */
export const useSafeTransaction = async <T>(
    callback: (tx: DrizzleDB) => Promise<T>,
    options: DatabaseOperationOptions = {}
): Promise<T> => {
    // 옵션 기본값 설정
    const resolvedOptions: Required<DatabaseOperationOptions> = {
        errorMessage:
            options.errorMessage ||
            '데이터 처리 중 알 수 없는 오류가 발생했습니다.',
        debug: options.debug ?? isDevMode,
        context: 'transaction',
    };

    try {
        // DB 인스턴스 가져오기
        const db = await getDB();

        // Drizzle 트랜잭션 실행
        // 에러 발생 시 Drizzle이 자동으로 롤백합니다.
        return await db.transaction(callback);
    } catch (error: unknown) {
        // 공통 에러 핸들러로 위임
        handleDatabaseError(error, resolvedOptions);
    }
};

/**
 * 안전한 쿼리 핸들러 (useSafeQuery)
 *
 * 기능: 단일 쿼리 실행 시 표준화된 에러 처리 및 로깅을 제공합니다.
 *
 * 데이터 흐름:
 * 1. 옵션 초기화
 * 2. 콜백 함수(쿼리) 실행
 * 3. 성공 시 결과 반환
 * 4. 실패 시 handleDatabaseError로 위임하여 500 에러 처리
 *
 * @template T 쿼리 함수의 반환 타입
 * @param callback 실행할 DB 쿼리 로직
 * @param options 에러 메시지 및 디버깅 옵션
 * @returns 쿼리 결과값
 */
export const useSafeQuery = async <T>(
    callback: () => Promise<T>,
    options: DatabaseOperationOptions = {}
): Promise<T> => {
    // 옵션 기본값 설정
    const resolvedOptions: Required<DatabaseOperationOptions> = {
        errorMessage:
            options.errorMessage ||
            '데이터 처리 중 알 수 없는 오류가 발생했습니다.',
        debug: options.debug ?? isDevMode,
        context: 'query',
    };

    try {
        // 쿼리 실행
        return await callback();
    } catch (error: unknown) {
        // 공통 에러 핸들러로 위임
        handleDatabaseError(error, resolvedOptions);
    }
};
