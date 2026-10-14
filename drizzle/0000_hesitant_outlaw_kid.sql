CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location_id` text NOT NULL,
	`is_essential` integer NOT NULL,
	`is_urgent` integer DEFAULT false,
	`shelf_amount` integer NOT NULL,
	`min_amount` integer NOT NULL,
	`unit` text NOT NULL,
	`stride` integer NOT NULL,
	`stock_amount` integer,
	`pack_capacity` integer
);
--> statement-breakpoint
CREATE TABLE `shopping_list` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text,
	`custom_name` text,
	`is_bought` integer DEFAULT false NOT NULL
);
