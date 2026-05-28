ALTER TABLE `users` ADD `password` varchar(500);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_mobile_idx` ON `users` (`mobile`);