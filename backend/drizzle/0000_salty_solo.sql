CREATE TABLE `users` (
	`user_id` bigint AUTO_INCREMENT NOT NULL,
	`user_type` varchar(100),
	`first_name` varchar(100),
	`middle_name` varchar(100),
	`last_name` varchar(100),
	`dial_code` varchar(100),
	`mobile` varchar(100),
	`email` varchar(255),
	`password` varchar(500),
	`api_key` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` bigint,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` bigint,
	`deleted_at` timestamp,
	`deleted_by` bigint,
	`status` boolean NOT NULL DEFAULT true,
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `emails` (
	`email_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint,
	`template_id` varchar(100),
	`provider` varchar(100),
	`to_email` varchar(255),
	`subject` varchar(500),
	`body` text,
	`email_status` varchar(100),
	`attempts` bigint DEFAULT 0,
	`last_error_message` varchar(1000),
	`delivered_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` bigint,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` bigint,
	`deleted_at` timestamp,
	`deleted_by` bigint,
	`status` boolean NOT NULL DEFAULT true,
	CONSTRAINT `emails_email_id` PRIMARY KEY(`email_id`)
);
--> statement-breakpoint
CREATE TABLE `smtp_email_creds` (
	`smtp_email_creds_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint,
	`username` varchar(255) NOT NULL,
	`pass_key` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`host` varchar(255) NOT NULL,
	`port` bigint NOT NULL,
	`secure` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` bigint,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` bigint,
	`deleted_at` timestamp,
	`deleted_by` bigint,
	`status` boolean NOT NULL DEFAULT true,
	CONSTRAINT `smtp_email_creds_smtp_email_creds_id` PRIMARY KEY(`smtp_email_creds_id`)
);
--> statement-breakpoint
CREATE TABLE `sendgrid_email_creds` (
	`sendgrid_email_creds_id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint,
	`api_key` varchar(255) NOT NULL,
	`from` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` bigint,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`updated_by` bigint,
	`deleted_at` timestamp,
	`deleted_by` bigint,
	`status` boolean NOT NULL DEFAULT true,
	CONSTRAINT `sendgrid_email_creds_sendgrid_email_creds_id` PRIMARY KEY(`sendgrid_email_creds_id`)
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
ALTER TABLE `emails` ADD CONSTRAINT `fk_emails_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `smtp_email_creds` ADD CONSTRAINT `fk_smtp_email_creds_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sendgrid_email_creds` ADD CONSTRAINT `fk_sendgrid_email_creds_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_templates` ADD CONSTRAINT `fk_email_templates_users` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_template_variables` ADD CONSTRAINT `fk_email_template_variables_template` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`template_id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `email_attempts` ADD CONSTRAINT `fk_attempts_emails` FOREIGN KEY (`email_id`) REFERENCES `emails`(`email_id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_mobile_idx` ON `users` (`mobile`);--> statement-breakpoint
CREATE INDEX `users_user_type_idx` ON `users` (`user_type`);--> statement-breakpoint
CREATE INDEX `idx_emails_to_email` ON `emails` (`to_email`);--> statement-breakpoint
CREATE INDEX `idx_email_status` ON `emails` (`email_status`);--> statement-breakpoint
CREATE INDEX `idx_emails_user_id` ON `emails` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_emails_created_at` ON `emails` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_email_provider` ON `emails` (`provider`);--> statement-breakpoint
CREATE INDEX `idx_smtp_email_creds_email` ON `smtp_email_creds` (`email`);--> statement-breakpoint
CREATE INDEX `idx_email_templates_slug` ON `email_templates` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_email_template_variables_template` ON `email_template_variables` (`template_id`);--> statement-breakpoint
CREATE INDEX `idx_attempts_email_id` ON `email_attempts` (`email_id`);