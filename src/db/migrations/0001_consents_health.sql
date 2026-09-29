CREATE TABLE `consents` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`signed_at` integer NOT NULL,
	`text_version` text NOT NULL,
	`signed_by` text NOT NULL,
	`revoked_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `consents_client_idx` ON `consents` (`client_id`);--> statement-breakpoint
CREATE TABLE `health` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`contraindications` text,
	`injuries` text,
	`limitations` text,
	`notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `health_client_idx` ON `health` (`client_id`);