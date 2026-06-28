CREATE TABLE `email_attempts` (
	`attempt_id` bigint AUTO_INCREMENT NOT NULL,
	`email_id` bigint NOT NULL,
	`attempt_number` bigint NOT NULL,
	`email_status` varchar(100) NOT NULL,
	`error_message` text,
	`attempted_at` timestamp DEFAULT (now()),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` bigint,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` bigint,
	`deleted_at` timestamp,
	`deleted_by` bigint,
	`status` boolean NOT NULL DEFAULT true,
	CONSTRAINT `email_attempts_attempt_id` PRIMARY KEY(`attempt_id`)
);
--> statement-breakpoint
ALTER TABLE `emails` MODIFY COLUMN `status` boolean NOT NULL DEFAULT true;--> statement-breakpoint
ALTER TABLE `emails` MODIFY COLUMN `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `emails` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `emails` ADD `delivered_at` timestamp;--> statement-breakpoint
ALTER TABLE `emails` ADD `created_by` bigint;--> statement-breakpoint
ALTER TABLE `emails` ADD `updated_by` bigint;--> statement-breakpoint
ALTER TABLE `emails` ADD `deleted_at` timestamp;--> statement-breakpoint
ALTER TABLE `emails` ADD `deleted_by` bigint;--> statement-breakpoint
ALTER TABLE `email_attempts` ADD CONSTRAINT `fk_attempts_emails` FOREIGN KEY (`email_id`) REFERENCES `emails`(`email_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `idx_attempts_email_id` ON `email_attempts` (`email_id`);--> statement-breakpoint
ALTER TABLE `emails` DROP COLUMN `queued_at`;--> statement-breakpoint
ALTER TABLE `emails` DROP COLUMN `sent_at`;