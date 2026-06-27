ALTER TABLE `email_creds` ADD `username` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `email_creds` ADD `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `email_creds` ADD `host` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `email_creds` ADD `port` bigint NOT NULL;--> statement-breakpoint
ALTER TABLE `email_creds` ADD `secure` boolean DEFAULT false NOT NULL;