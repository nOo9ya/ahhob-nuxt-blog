/**
 * 기능: slugValidator 유틸리티 단위 테스트
 * 경로: tests/unit/slugValidator.test.ts
 * 권한: 개발자 전용
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateSlugAvailability } from '../../server/utils/slugValidator';

// ========== Mocks ==========

const mocks = vi.hoisted(() => {
    const findFirst = vi.fn();
    return {
        findFirst,
        query: {
            pages: { findFirst },
            categories: { findFirst },
            articles: { findFirst },
            tags: { findFirst },
        },
    };
});

// server/database 모듈 Mock
vi.mock('../../server/database', () => ({
    getDB: vi.fn().mockResolvedValue({
        query: mocks.query,
    }),
    // 스키마 객체는 필드 접근용이므로 단순 객체로 모킹
    schema: {
        pages: { id: {}, slug: {} },
        categories: { id: {}, slug: {} },
        articles: { id: {}, slug: {} },
        tags: { id: {}, slug: {} },
    },
}));

// drizzle-orm 연산자 Mock (실제 동작 불필요, 호출 여부만 확인 가능하면 됨)
vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    ne: vi.fn(),
    and: vi.fn(),
    sql: vi.fn(),
}));

describe('validateSlugAvailability', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // 1. Format Check Tests
    describe('Format Check', () => {
        it('should return valid for correct slug format', async () => {
            const result = await validateSlugAvailability(
                'valid-slug-123',
                'page'
            );
            expect(result.isValid).toBe(true);
        });

        it('should return valid for Korean slug', async () => {
            const result = await validateSlugAvailability(
                '한글-슬러그-테스트',
                'page'
            );
            expect(result.isValid).toBe(true);
        });

        it('should return valid for slug with @', async () => {
            const result = await validateSlugAvailability('user@name', 'page');
            expect(result.isValid).toBe(true);
        });

        it('should return invalid for uppercase letters', async () => {
            const result = await validateSlugAvailability(
                'Invalid-Slug',
                'page'
            );
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('영문 소문자');
        });

        it('should return invalid for other special characters', async () => {
            const result = await validateSlugAvailability('slug!check', 'page');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('영문 소문자');
        });
    });

    // 2. Reserved Word Check Tests
    describe('Reserved Word Check', () => {
        it('should return invalid for reserved words', async () => {
            const result = await validateSlugAvailability('admin', 'page');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('예약어');
        });

        it('should return invalid for "api" reserved word', async () => {
            const result = await validateSlugAvailability('api', 'category');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('예약어');
        });
    });

    // 3. Collision Check Tests
    describe('Collision Check', () => {
        // --- Page Tests ---
        describe('Type: Page', () => {
            it('should fail if slug exists in categories', async () => {
                // Category collision setup
                mocks.findFirst.mockResolvedValueOnce({
                    id: 1,
                    name: 'Existing Category',
                });

                const result = await validateSlugAvailability('tech', 'page');

                expect(result.isValid).toBe(false);
                expect(result.message).toContain('카테고리');
            });

            it('should fail if slug exists in pages', async () => {
                // Category no collision
                mocks.findFirst.mockResolvedValueOnce(null);
                // Page collision setup
                mocks.findFirst.mockResolvedValueOnce({
                    id: 2,
                    title: 'Existing Page',
                });

                const result = await validateSlugAvailability('about', 'page');

                expect(result.isValid).toBe(false);
                expect(result.message).toContain('페이지');
            });

            it('should pass if no collisions', async () => {
                mocks.findFirst.mockResolvedValue(null);
                const result = await validateSlugAvailability(
                    'new-page',
                    'page'
                );
                expect(result.isValid).toBe(true);
            });
        });

        // --- Category Tests ---
        describe('Type: Category', () => {
            it('should fail if slug exists in pages', async () => {
                // Page collision setup
                mocks.findFirst.mockResolvedValueOnce({
                    id: 1,
                    title: 'Existing Page',
                });

                const result = await validateSlugAvailability(
                    'intro',
                    'category'
                );

                expect(result.isValid).toBe(false);
                expect(result.message).toContain('페이지');
            });
        });

        // --- Article Tests ---
        describe('Type: Article', () => {
            it('should fail if slug exists in articles', async () => {
                mocks.findFirst.mockResolvedValueOnce({
                    id: 10,
                    title: 'Existing Article',
                });

                const result = await validateSlugAvailability(
                    'news-1',
                    'article'
                );

                expect(result.isValid).toBe(false);
                expect(result.message).toContain('기사');
            });

            it('should check ONLY articles table', async () => {
                // Even if mocked execution order is articles -> findFirst
                mocks.findFirst.mockResolvedValueOnce(null); // No article found

                const result = await validateSlugAvailability(
                    'news-2',
                    'article'
                );
                expect(result.isValid).toBe(true);
                // 검증: 다른 테이블(page, category) 조회 로직이 호출되지 않았는지 확인은
                // mockFindFirst 호출 횟수로 짐작 가능 (1번만 호출되어야 함)
                expect(mocks.findFirst).toHaveBeenCalledTimes(1);
            });
        });

        // --- Tag Tests ---
        describe('Type: Tag', () => {
            it('should fail if slug exists in tags', async () => {
                mocks.findFirst.mockResolvedValueOnce({
                    id: 5,
                    name: 'Existing Tag',
                });

                const result = await validateSlugAvailability('js', 'tag');

                expect(result.isValid).toBe(false);
                expect(result.message).toContain('태그');
            });
        });
    });
});
