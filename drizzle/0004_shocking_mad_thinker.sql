ALTER TABLE `growth_orders` ADD `apiOrderId` varchar(64);--> statement-breakpoint
ALTER TABLE `growth_orders` ADD `panel` enum('smmkings','peakerr','manual') DEFAULT 'manual';--> statement-breakpoint
ALTER TABLE `growth_orders` ADD `apiServiceId` int;--> statement-breakpoint
ALTER TABLE `growth_orders` ADD `startCount` int;--> statement-breakpoint
ALTER TABLE `growth_orders` ADD `remains` int;