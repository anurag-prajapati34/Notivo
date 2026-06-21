CREATE TABLE `emails` (
	`email_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint,
	`template_id` bigint,
	`to_email` varchar(255),
	`subject` varchar(500),
	`body` text,
	`email_status` varchar(100),
	`attempts` bigint DEFAULT 0,
	`last_error_message` varchar(1000),
	`queued_at` timestamp,
	`sent_at` timestamp,
	`status` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `emails_email_id` PRIMARY KEY(`email_id`)
);
--> statement-breakpoint
ALTER TABLE `emails` ADD CONSTRAINT `fk_emails_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `idx_emails_to_email` ON `emails` (`to_email`);--> statement-breakpoint
CREATE INDEX `idx_email_status` ON `emails` (`email_status`);--> statement-breakpoint
CREATE INDEX `idx_emails_user_id` ON `emails` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_emails_created_at` ON `emails` (`created_at`);