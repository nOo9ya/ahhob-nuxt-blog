-- 페이지 뷰 추적 테이블 생성
-- 기능: 모든 페이지 방문 기록 및 유입 경로 분석
-- - Referrer 기반 유입 경로 추적
-- - 검색엔진 및 AI 검색 엔진 감지
-- - 검색 키워드 추출 (가능한 경우)
-- - GEO/SEO 최적화를 위한 트래픽 분석

CREATE TABLE IF NOT EXISTS `page_views` (
    `id` int AUTO_INCREMENT NOT NULL,
    `path` varchar(500) NOT NULL,
    `article_id` int,
    `ip_hash` varchar(64) NOT NULL,
    `user_agent` text,
    `referrer` text,
    `referrer_type` enum('direct','search','ai_search','social','referral') NOT NULL DEFAULT 'direct',
    `search_engine` varchar(50),
    `search_keyword` varchar(255),
    `created_at` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT `page_views_id` PRIMARY KEY(`id`)
);

-- 인덱스 생성 (조회 성능 최적화)
CREATE INDEX `idx_created_at` ON `page_views` (`created_at`);
CREATE INDEX `idx_referrer_type` ON `page_views` (`referrer_type`);
CREATE INDEX `idx_search_engine` ON `page_views` (`search_engine`);
CREATE INDEX `idx_article_id` ON `page_views` (`article_id`);
CREATE INDEX `idx_path` ON `page_views` (`path`);
CREATE INDEX `idx_date_type` ON `page_views` (`created_at`,`referrer_type`);

-- 외래키 제약조건 추가
ALTER TABLE `page_views` ADD CONSTRAINT `page_views_article_id_articles_id_fk` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE set null ON UPDATE no action;
