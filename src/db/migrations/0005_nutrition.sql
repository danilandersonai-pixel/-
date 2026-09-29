CREATE TABLE `nutrition_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`start_date` text NOT NULL,
	`calories` integer,
	`protein` real,
	`fat` real,
	`carbs` real,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `nutrition_plans_client_idx` ON `nutrition_plans` (`client_id`,`start_date`);