CREATE TABLE `goals` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`metric` text NOT NULL,
	`target_value` real NOT NULL,
	`target_date` text,
	`start_date` text NOT NULL,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `goals_client_idx` ON `goals` (`client_id`);