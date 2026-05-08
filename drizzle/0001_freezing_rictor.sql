CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` decimal(10,2) NOT NULL,
	`minOrderAmount` decimal(10,2) DEFAULT '0.00',
	`usageLimit` int NOT NULL DEFAULT 100,
	`usedCount` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `growth_services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('instagram','tiktok','youtube','telegram','twitter','facebook') NOT NULL,
	`serviceType` enum('followers','subscribers','views','likes','comments','members','page_likes') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`quantity` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`deliveryTime` varchar(64) DEFAULT '24-48 hours',
	`isActive` boolean NOT NULL DEFAULT true,
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `growth_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('order_completed','order_failed','wallet_credit','wallet_debit','referral_reward','ticket_reply','system','promotion') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`referenceId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`vendorId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`discountAmount` decimal(10,2) DEFAULT '0.00',
	`couponId` int,
	`status` enum('pending','processing','completed','failed','refunded','cancelled') NOT NULL DEFAULT 'pending',
	`deliveryData` json,
	`deliveredAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vendorId` int NOT NULL,
	`category` enum('social_media_accounts','streaming_accounts','gaming_accounts','virtual_numbers','growth_services') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`originalPrice` decimal(10,2),
	`stock` int NOT NULL DEFAULT 0,
	`platform` varchar(64),
	`deliveryType` enum('instant','manual') NOT NULL DEFAULT 'instant',
	`deliveryData` json,
	`imageUrl` text,
	`tags` json,
	`status` enum('active','inactive','pending','rejected') NOT NULL DEFAULT 'pending',
	`totalSold` int NOT NULL DEFAULT 0,
	`avgRating` decimal(3,2) DEFAULT '0.00',
	`reviewCount` int NOT NULL DEFAULT 0,
	`featured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredId` int NOT NULL,
	`rewardAmount` decimal(10,2) NOT NULL DEFAULT '5.00',
	`status` enum('pending','credited','cancelled') NOT NULL DEFAULT 'pending',
	`creditedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` int NOT NULL,
	`orderId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`isVerified` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sms_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numberId` int NOT NULL,
	`sender` varchar(64),
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sms_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`subject` varchar(255) NOT NULL,
	`category` enum('billing','technical','account','order','other') NOT NULL DEFAULT 'other',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`orderId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticketId` int NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`isStaff` boolean NOT NULL DEFAULT false,
	`attachmentUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `virtual_numbers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`number` varchar(20) NOT NULL,
	`countryCode` varchar(4) NOT NULL,
	`countryName` varchar(64) NOT NULL,
	`service` varchar(64),
	`price` decimal(10,2) NOT NULL,
	`status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `virtual_numbers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallet_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('deposit','withdrawal','purchase','refund','referral_reward','admin_credit') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`balanceBefore` decimal(10,2) NOT NULL,
	`balanceAfter` decimal(10,2) NOT NULL,
	`description` text,
	`referenceId` varchar(64),
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','vendor') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `balance` decimal(10,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `referralCode` varchar(16);--> statement-breakpoint
ALTER TABLE `users` ADD `referredBy` int;--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_referralCode_unique` UNIQUE(`referralCode`);