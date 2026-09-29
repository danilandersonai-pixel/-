CREATE TABLE `memberships` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`total` integer NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`notes` text,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `memberships_client_idx` ON `memberships` (`client_id`);