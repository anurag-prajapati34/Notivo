CREATE TABLE `emails` (
	`email_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint,
	`template_id` varchar(100),
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
CREATE TABLE `email_creds` (
	`email_creds_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint,
	`email` varchar(255) NOT NULL,
	`pass_key` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` bigint,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` bigint,
	`deleted_at` timestamp,
	`deleted_by` bigint,
	`status` boolean NOT NULL DEFAULT true,
	CONSTRAINT `email_creds_email_creds_id` PRIMARY KEY(`email_creds_id`)
);
--> statement-breakpoint
CREATE TABLE `email_templates` (
	`email_template_id` bigint AUTO_INCREMENT NOT NULL,
	`template_id` varchar(100) NOT NULL,
	`user_id` bigint,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`html` text NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` bigint,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` bigint,
	`deleted_at` timestamp,
	`deleted_by` bigint,
	`status` boolean NOT NULL DEFAULT true,
	CONSTRAINT `email_templates_email_template_id` PRIMARY KEY(`email_template_id`),
	CONSTRAINT `uq_email_templates_template_id` UNIQUE(`template_id`)
);
--> statement-breakpoint
CREATE TABLE `email_template_variables` (
	`email_template_variable_id` bigint AUTO_INCREMENT NOT NULL,
	`template_id` varchar(100) NOT NULL,
	`variable_name` varchar(100) NOT NULL,
	`is_required` boolean NOT NULL DEFAULT true,
	`default_value` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` bigint,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` bigint,
	`deleted_at` timestamp,
	`deleted_by` bigint,
	`status` boolean NOT NULL DEFAULT true,
	CONSTRAINT `email_template_variables_email_template_variable_id` PRIMARY KEY(`email_template_variable_id`),
	CONSTRAINT `uq_email_template_variable` UNIQUE(`template_id`,`variable_name`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(500);--> statement-breakpoint
ALTER TABLE `users` ADD `api_key` varchar(500);--> statement-breakpoint
ALTER TABLE `emails` ADD CONSTRAINT `fk_emails_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `email_creds` ADD CONSTRAINT `fk_email_creds_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_templates` ADD CONSTRAINT `fk_email_templates_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_template_variables` ADD CONSTRAINT `fk_email_template_variables_template` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`template_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_emails_to_email` ON `emails` (`to_email`);--> statement-breakpoint
CREATE INDEX `idx_email_status` ON `emails` (`email_status`);--> statement-breakpoint
CREATE INDEX `idx_emails_user_id` ON `emails` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_emails_created_at` ON `emails` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_email_creds_email` ON `email_creds` (`email`);--> statement-breakpoint
CREATE INDEX `idx_email_templates_slug` ON `email_templates` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_email_template_variables_template` ON `email_template_variables` (`template_id`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_mobile_idx` ON `users` (`mobile`);