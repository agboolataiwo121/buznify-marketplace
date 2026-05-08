CREATE TABLE `growth_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`serviceId` int NOT NULL,
	`targetUrl` varchar(512) NOT NULL,
	`quantity` int NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','processing','completed','partial','cancelled','refunded') NOT NULL DEFAULT 'pending',
	`deliveredCount` int NOT NULL DEFAULT 0,
	`dripFeed` boolean NOT NULL DEFAULT false,
	`dripInterval` int,
	`speedLabel` enum('slow','medium','fast','instant') NOT NULL DEFAULT 'medium',
	`refillRequested` boolean NOT NULL DEFAULT false,
	`cancelRequested` boolean NOT NULL DEFAULT false,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `growth_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recently_viewed` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recently_viewed_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refund_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderId` int,
	`growthOrderId` int,
	`reason` text NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNote` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `refund_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendor_api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`keyHash` varchar(128) NOT NULL,
	`label` varchar(128) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastUsedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendor_api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `vendor_api_keys_keyHash_unique` UNIQUE(`keyHash`)
);
--> statement-breakpoint
CREATE TABLE `vendor_payouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`method` enum('bank','crypto','paypal') NOT NULL DEFAULT 'bank',
	`destination` text NOT NULL,
	`status` enum('pending','processing','paid','rejected') NOT NULL DEFAULT 'pending',
	`notes` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vendor_payouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`)
);
