CREATE TABLE `site_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` varchar(64) NOT NULL DEFAULT 'info',
	`severity` varchar(32) NOT NULL DEFAULT 'medium',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`affectedService` varchar(64),
	`isActive` boolean NOT NULL DEFAULT true,
	`autoTriggered` boolean NOT NULL DEFAULT false,
	`createdByAdminId` int,
	`dismissedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_alerts_id` PRIMARY KEY(`id`)
);
