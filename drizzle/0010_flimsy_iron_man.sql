CREATE TABLE `product_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(64) NOT NULL,
	`label` varchar(128) NOT NULL,
	`icon` varchar(64) NOT NULL DEFAULT 'Tag',
	`description` varchar(255),
	`color` varchar(128) NOT NULL DEFAULT 'from-violet-500/20 to-purple-500/20',
	`borderColor` varchar(128) NOT NULL DEFAULT 'border-violet-500/20 hover:border-violet-500/40',
	`iconColor` varchar(64) NOT NULL DEFAULT 'text-violet-400',
	`enabled` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_categories_slug_unique` UNIQUE(`slug`)
);
