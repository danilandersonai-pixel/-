CREATE TABLE `parq_forms` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`date` text NOT NULL,
	`version` text NOT NULL,
	`answers` text NOT NULL,
	`notes` text,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `parq_forms_client_idx` ON `parq_forms` (`client_id`);