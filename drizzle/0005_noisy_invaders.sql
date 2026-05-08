CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reference` varchar(128) NOT NULL,
	`amountNaira` decimal(10,2) NOT NULL,
	`amountUsd` decimal(10,6),
	`currency` varchar(10) NOT NULL DEFAULT 'NGN',
	`status` enum('pending','success','failed','abandoned') NOT NULL DEFAULT 'pending',
	`channel` varchar(64),
	`paystackId` varchar(64),
	`accessCode` varchar(128),
	`gatewayResponse` text,
	`paidAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_reference_unique` UNIQUE(`reference`)
);
