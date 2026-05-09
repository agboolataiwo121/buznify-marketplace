CREATE TABLE `uptime_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`service` varchar(64) NOT NULL,
	`date` varchar(10) NOT NULL,
	`uptimePct` decimal(5,2) NOT NULL DEFAULT '100.00',
	`incidentCount` int NOT NULL DEFAULT 0,
	`responseTimeMs` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `uptime_stats_id` PRIMARY KEY(`id`)
);
