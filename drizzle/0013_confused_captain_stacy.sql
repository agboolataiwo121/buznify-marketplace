CREATE TABLE `security_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`adminId` int,
	`action` varchar(64) NOT NULL,
	`metadata` text,
	`ipAddress` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerifyToken` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerifyExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `fraudFlagged` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `fraudFlaggedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `loginAttempts` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lockedUntil` timestamp;