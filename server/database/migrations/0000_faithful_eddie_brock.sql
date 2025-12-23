CREATE TABLE `admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`role` enum('admin','editor','writer') DEFAULT 'writer',
	`admin_status` enum('pending','active','suspended') DEFAULT 'active',
	`bio` text,
	`avatar` varchar(500),
	`credentials` varchar(255),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `article_likes` (
	`user_id` int NOT NULL,
	`article_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `article_likes_user_id_article_id_pk` PRIMARY KEY(`user_id`,`article_id`)
);
--> statement-breakpoint
CREATE TABLE `article_tags` (
	`article_id` int NOT NULL,
	`tag_id` int NOT NULL,
	CONSTRAINT `article_tags_article_id_tag_id_pk` PRIMARY KEY(`article_id`,`tag_id`)
);
--> statement-breakpoint
CREATE TABLE `article_views` (
	`id` int AUTO_INCREMENT NOT NULL,
	`article_id` int NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `article_views_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` longtext,
	`excerpt` varchar(500),
	`thumbnail` varchar(500),
	`meta_title` varchar(70),
	`meta_description` varchar(160),
	`canonical_url` varchar(500),
	`og_image` varchar(500),
	`og_image_alt` varchar(125),
	`seo_meta` json,
	`social_meta` json,
	`geo_meta` json,
	`admin_id` int,
	`category_id` int,
	`status` enum('draft','review','published') DEFAULT 'draft',
	`is_featured` boolean DEFAULT false,
	`view_count` int DEFAULT 0,
	`like_count` int DEFAULT 0,
	`published_at` timestamp,
	`is_comment_enabled` boolean DEFAULT true,
	`comment_policy` enum('default','disabled','users_only','anyone') DEFAULT 'default',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`user_id` int NOT NULL,
	`article_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `bookmarks_user_id_article_id_pk` PRIMARY KEY(`user_id`,`article_id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`parent_id` int,
	`path` varchar(500),
	`seo_meta` json,
	`social_meta` json,
	`geo_meta` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`article_id` int NOT NULL,
	`user_id` int,
	`guest_name` varchar(100),
	`guest_email` varchar(255),
	`guest_password_hash` varchar(255),
	`content` text NOT NULL,
	`is_private` boolean DEFAULT false,
	`parent_id` int,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscribers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`content` longtext NOT NULL,
	`thumbnail` varchar(500),
	`seo_meta` json,
	`social_meta` json,
	`geo_meta` json,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `pages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` varchar(50) NOT NULL,
	`value` text,
	`description` varchar(255),
	`type` enum('boolean','string','number') DEFAULT 'string',
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `tags_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('google','naver','kakao','apple','microsoft','github') NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`avatar` varchar(500),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `article_likes` ADD CONSTRAINT `article_likes_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `article_likes` ADD CONSTRAINT `article_likes_article_id_articles_id_fk` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `article_tags` ADD CONSTRAINT `article_tags_article_id_articles_id_fk` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `article_tags` ADD CONSTRAINT `article_tags_tag_id_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `article_views` ADD CONSTRAINT `article_views_article_id_articles_id_fk` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_admin_id_admins_id_fk` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `articles` ADD CONSTRAINT `articles_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_article_id_articles_id_fk` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_article_id_articles_id_fk` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_article_id` ON `article_likes` (`article_id`);--> statement-breakpoint
CREATE INDEX `idx_article_id` ON `article_views` (`article_id`);--> statement-breakpoint
CREATE INDEX `idx_identifier` ON `article_views` (`identifier`);--> statement-breakpoint
CREATE INDEX `idx_view_check` ON `article_views` (`article_id`,`identifier`);--> statement-breakpoint
CREATE INDEX `idx_status` ON `articles` (`status`);--> statement-breakpoint
CREATE INDEX `idx_published_at` ON `articles` (`published_at`);--> statement-breakpoint
CREATE INDEX `idx_category` ON `articles` (`category_id`);--> statement-breakpoint
CREATE INDEX `idx_admin` ON `articles` (`admin_id`);--> statement-breakpoint
CREATE INDEX `idx_user_bookmarks` ON `bookmarks` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_parent_id` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_article_id` ON `comments` (`article_id`);--> statement-breakpoint
CREATE INDEX `idx_user_id` ON `comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_parent_id` ON `comments` (`parent_id`);--> statement-breakpoint
CREATE INDEX `idx_guest_email` ON `comments` (`guest_email`);--> statement-breakpoint
CREATE INDEX `unique_provider_user` ON `users` (`provider`,`provider_id`);