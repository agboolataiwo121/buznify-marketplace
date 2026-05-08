ALTER TABLE `virtual_numbers` MODIFY COLUMN `status` enum('active','expired','cancelled','finished','banned') NOT NULL DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `virtual_numbers` ADD `operator` varchar(64);--> statement-breakpoint
ALTER TABLE `virtual_numbers` ADD `apiOrderId` int;