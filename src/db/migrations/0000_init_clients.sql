CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text,
	`gender` text,
	`birth_date` text,
	`phone` text,
	`email` text,
	`messenger` text,
	`goal` text,
	`notes` text,
	`photo_uri` text,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
