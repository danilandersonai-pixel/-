CREATE TABLE `measurements` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`date` text NOT NULL,
	`weight` real NOT NULL,
	`height` real,
	`neck` real,
	`chest` real,
	`waist` real,
	`hips` real,
	`arm` real,
	`thigh` real,
	`calf` real,
	`skinfold_chest` real,
	`skinfold_abdomen` real,
	`skinfold_thigh` real,
	`skinfold_triceps` real,
	`skinfold_suprailiac` real,
	`skinfold_calf` real,
	`resting_heart_rate` integer,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `measurements_client_date_idx` ON `measurements` (`client_id`,`date`);