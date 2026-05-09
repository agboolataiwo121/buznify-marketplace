CREATE TABLE `bank_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bankCode` varchar(20) NOT NULL,
	`bankName` varchar(100) NOT NULL,
	`accountNumber` varchar(20) NOT NULL,
	`accountName` varchar(100) NOT NULL,
	`recipientCode` varchar(100) NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `withdrawals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bankAccountId` int NOT NULL,
	`amountUsd` decimal(18,6) NOT NULL,
	`amountNaira` decimal(18,2) NOT NULL,
	`transferReference` varchar(100) NOT NULL,
	`transferCode` varchar(100),
	`status` enum('pending','processing','success','failed','reversed') NOT NULL DEFAULT 'pending',
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `withdrawals_id` PRIMARY KEY(`id`),
	CONSTRAINT `withdrawals_transferReference_unique` UNIQUE(`transferReference`)
);
