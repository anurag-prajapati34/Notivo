CREATE TABLE `users` (
	`user_id` bigint AUTO_INCREMENT NOT NULL,
	`first_name` varchar(100),
	`middle_name` varchar(100),
	`last_name` varchar(100),
	`dial_code` varchar(100),
	`mobile` varchar(100),
	`email` varchar(255),
	`status` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`)
);
