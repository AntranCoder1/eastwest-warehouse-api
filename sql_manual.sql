CREATE TABLE `eastwest_warehouse`.`users` (`id` INT(11) NOT NULL AUTO_INCREMENT , `name` VARCHAR(255) NULL , `email` VARCHAR(255) NULL , `phone` INT(20) NULL , `password` VARCHAR(255) NULL , `profile_image` LONGTEXT NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `users` ADD `isAdmin` INT(11) NOT NULL AFTER `updated_at`;
ALTER TABLE `users` ADD `isInvite` TINYINT(4) NOT NULL AFTER `isAdmin`;
ALTER TABLE `users` ADD `last_login` DATETIME NULL AFTER `isInvite`;
ALTER TABLE `users` ADD `last_active` DATETIME NULL AFTER `last_login`;
ALTER TABLE `users` ADD `reset_password_token` VARCHAR(255) NULL AFTER `last_active`;

CREATE TABLE `eastwest_warehouse`.`worker_managerment` (`id` INT(11) NOT NULL AUTO_INCREMENT , `name` VARCHAR(255) NULL , `email` VARCHAR(255) NULL , `phone` VARCHAR(255) NULL , `password` VARCHAR(255) NULL , `confirm_password` VARCHAR(255) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `worker_managerment` ADD `reset_password_token` VARCHAR(255) NULL AFTER `updated_at`;
ALTER TABLE `worker_managerment` ADD `last_login` DATETIME NULL AFTER `reset_password_token`;
ALTER TABLE `worker_managerment` ADD `last_active` DATETIME NULL AFTER `last_login`;
ALTER TABLE `worker_managerment` ADD `isInvite` TINYINT(4) NOT NULL AFTER `last_active`;

CREATE TABLE `eastwest_warehouse`.`product_managerment` (`id` INT(11) NOT NULL AUTO_INCREMENT , `SKU_product` VARCHAR(255) NULL , `Product_Name` VARCHAR(255) NULL , `Quantity` INT(20) NULL , `Locations` VARCHAR(255) NULL , `Image_URL` VARCHAR(255) NULL , `created_at` DATETIME(255) NULL , `updated_at` DATETIME(255) NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `product_managerment` ADD `qr_code` VARCHAR(20000) NULL AFTER `updated_at`;
ALTER TABLE `location_list_managerment` ADD `product_managerment_id` INT(11) NULL AFTER `Loc_Barcode`;
ALTER TABLE `location_list_managerment` ADD CONSTRAINT `IDX_productManagerId` FOREIGN KEY (`product_managerment_id`) REFERENCES `product_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `eastwest_warehouse`.`location_managermenrt` (`id` INT(11) NOT NULL AUTO_INCREMENT , `Loc_Barcodes` VARCHAR(255) NULL , `Position` VARCHAR(255) NULL , `SKU` VARCHAR(255) NULL , `Quantity` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `location_managermenrt` ADD `Location` VARCHAR(255) NULL AFTER `updated_at`;
ALTER TABLE `location_managermenrt` ADD `product_managerment_id` INT(11) NULL AFTER `Location`;
ALTER TABLE `location_managermenrt` ADD CONSTRAINT `IDX_productManagerMentId` FOREIGN KEY (`product_managerment_id`) REFERENCES `product_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `location_managermenrt` ADD `Quantity` INT(11) NULL AFTER `product_managerment_id`;
ALTER TABLE `location_managermenrt` ADD `product_transfer_id` INT(11) NULL AFTER `Quantity`;

CREATE TABLE `eastwest_warehouse`.`location_list_managerment` (`id` INT(11) NOT NULL AUTO_INCREMENT , `SKU` VARCHAR(255) NULL , `Quantity` INT(11) NULL , `location_managerment_id` INT(11) NOT NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `location_list_managerment` ADD CONSTRAINT `IDX_locationManagerId` FOREIGN KEY (`location_managerment_id`) REFERENCES `location_managermenrt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `location_list_managerment` ADD `Loc_Barcode` VARCHAR(255) NULL AFTER `updated_at`;
ALTER TABLE `location_list_managerment` ADD `product_managerment_id` VARCHAR(255) NULL AFTER `Loc_Barcode`;
ALTER TABLE `product_managerment_id` ADD CONSTRAINT `IDX_productManagerId` FOREIGN KEY (`product_managerment_id`) REFERENCES `product_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `location_list_managerment` ADD `Container` INT(11) NULL AFTER `product_managerment_id`;

CREATE TABLE `eastwest_warehouse`.`work_list` (`id` INT(11) NOT NULL AUTO_INCREMENT , `Type` VARCHAR(255) NULL , `Date` DATETIME NULL , `Title` VARCHAR(255) NULL , `Description` VARCHAR(255) NULL , `Status` VARCHAR(255) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `work_list` ADD `worker_managerment_id` INT(11) NULL AFTER `updated_at`;
ALTER TABLE `work_list` ADD CONSTRAINT `IDX_workerManagermentId` FOREIGN KEY (`worker_managerment_id`) REFERENCES `worker_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `eastwest_warehouse`.`work_list_detail` (`id` INT(11) NOT NULL AUTO_INCREMENT , `work_list_id` INT(11) NULL , `SKU` VARCHAR(255) NULL , `Quantity` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `work_list_detail` ADD CONSTRAINT `IDX_workListId` FOREIGN KEY (`work_list_id`) REFERENCES `work_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE `eastwest_warehouse`.`product_transfer` (`id` INT(11) NOT NULL AUTO_INCREMENT , `SKU_product` VARCHAR(255) NULL , `Product_Name` VARCHAR(255) NULL , `Quantity_Transfer` INT(11) NULL , `From_Location_Barcodes` VARCHAR(255) NULL , `To_Location_Barcodes` VARCHAR(255) NULL , `Quantity_After_Transfer` INT(11) NULL , `product_Id` INT(11) NULL , `work_list_id` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `product_transfer` ADD CONSTRAINT `IDX_productId` FOREIGN KEY (`product_Id`) REFERENCES `product_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `product_transfer` ADD CONSTRAINT `IDX_workListId` FOREIGN KEY (`work_list_id`) REFERENCES `work_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `work_list_detail` ADD `location` VARCHAR(255) NULL AFTER `updated_at`;

ALTER TABLE `product_transfer` ADD `original_number` INT(11) NULL AFTER `updated_at`;

ALTER TABLE `location_managermenrt` ADD `transfer_product_id` INT(11) NULL AFTER `Quantity_Transfer`;

ALTER TABLE `location_managermenrt` ADD CONSTRAINT `IDX_transferId` FOREIGN KEY (`transfer_product_id`) REFERENCES `product_transfer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `eastwest_warehouse`.`active` (`id` INT(11) NOT NULL AUTO_INCREMENT , `Date` DATETIME NULL , `Type` VARCHAR(255) NULL , `Worker_id` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `active` ADD CONSTRAINT `IDX_activeWorkerId` FOREIGN KEY (`Worker_id`) REFERENCES `worker_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `active` ADD `Active` VARCHAR(255) NULL AFTER `updated_at`;

ALTER TABLE `work_list_detail` ADD `Container` INT(11) NULL AFTER `location`;

ALTER TABLE `location_managermenrt` CHANGE `Location` `Location_List_id` INT(11) NULL DEFAULT NULL;
ALTER TABLE `location_managermenrt` ADD CONSTRAINT `IDX_locationListId` FOREIGN KEY (`Location_List_id`) REFERENCES `location_list_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `eastwest_warehouse`.`product_location` (`id` INT(11) NOT NULL AUTO_INCREMENT , `SKU_product` VARCHAR(255) NULL , `Loc_barcodes` VARCHAR(255) NULL , `Quantity` INT(11) NULL , `Position` VARCHAR(255) NULL , `product_transfer_id` INT(11) NULL , `Quantity_Transfer` INT(11) NULL , `transfer_id` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

ALTER TABLE `product_location` ADD `Container` INT(11) NULL AFTER `updated_at`;

ALTER TABLE `product_location` ADD `product_managerment_id` INT(11) NULL AFTER `Container`;
ALTER TABLE `product_location` ADD CONSTRAINT `IDX_productLocationManagermentId` FOREIGN KEY (`product_managerment_id`) REFERENCES `product_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `product_location` ADD `product_name` VARCHAR(255) NULL AFTER `product_managerment_id`;

ALTER TABLE `work_list_detail` CHANGE `Container` `Container_Number` VARCHAR(255) NULL DEFAULT NULL;

ALTER TABLE `work_list` DROP FOREIGN KEY `IDX_workerManagermentId`; ALTER TABLE `work_list` ADD CONSTRAINT `IDX_workerManagermentId` FOREIGN KEY (`worker_managerment_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `eastwest_warehouse`.`work_list_pickingltl` (`id` INT(11) NOT NULL AUTO_INCREMENT , `SKU1` VARCHAR(255) NULL , `Quantity1` INT(11) NULL , `SKU2` VARCHAR(255) NULL , `Quantity2` INT(11) NULL , `SKU3` VARCHAR(255) NULL , `Quantity3` INT(11) NULL , `SKU4` VARCHAR(255) NULL , `Quantity4` INT(11) NULL , `SKU5` VARCHAR(255) NULL , `Quantity5` INT(11) NULL , `SKU6` VARCHAR(255) NULL , `Quantity6` INT(11) NULL , `SKU7` VARCHAR(255) NULL , `Quantity7` INT(11) NULL , `SKU8` VARCHAR(255) NULL , `Quantity8` INT(11) NULL , `SKU9` VARCHAR(255) NULL , `Quantity9` INT(11) NULL , `work_list_detail_id` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;
ALTER TABLE `work_list_pickingltl` ADD CONSTRAINT `IDX_workListPickingLTLId` FOREIGN KEY (`work_list_detail_id`) REFERENCES `work_list_detail`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `product_location` ADD `location_managerment_id` INT(11) NULL AFTER `product_name`;
ALTER TABLE `product_location` ADD CONSTRAINT `IDX_productLocationId` FOREIGN KEY (`location_managerment_id`) REFERENCES `location_managermenrt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `work_list` ADD `Container_Number` VARCHAR(255) NULL AFTER `worker_managerment_id`;

ALTER TABLE `product_location` CHANGE `Container` `UPC` VARCHAR(255) NULL DEFAULT NULL;

ALTER TABLE `location_list_managerment` CHANGE `Container` `UPC` VARCHAR(255) NULL DEFAULT NULL;

ALTER TABLE `worker_managerment` ADD `username` VARCHAR(255) NULL AFTER `isInvite`;

ALTER TABLE `worker_managerment` ADD `status` INT(11) NOT NULL AFTER `username`;

ALTER TABLE `worker_managerment` ADD `delete_status` INT(11) NOT NULL AFTER `status`;

ALTER TABLE `location_managermenrt` ADD `limit_size` INT(11) NULL AFTER `updated_at`;

ALTER TABLE `active` ADD `SKU` VARCHAR(255) NULL AFTER `Active`, ADD `Quantity` INT(11) NULL AFTER `SKU`, ADD `location` VARCHAR(255) NULL AFTER `Quantity`, ADD `from_location` VARCHAR(255) NULL AFTER `location`, ADD `to_location` VARCHAR(255) NULL AFTER `from_location`;

ALTER TABLE `product_managerment` ADD `UPC` VARCHAR(255) NULL AFTER `updated_at`;

ALTER TABLE `active` ADD `admin_id` INT(11) NULL AFTER `to_location`;
ALTER TABLE `active` ADD CONSTRAINT `IDX_activeAdminId` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `work_list` ADD `SKU_pickingLTL` VARCHAR(255) NULL AFTER `Container_Number`;
ALTER TABLE `work_list` ADD `Quantity_pickingLTL` INT(11) NULL AFTER `SKU_pickingLTL`;
ALTER TABLE `work_list` ADD `picking_type` VARCHAR(255) NULL AFTER `Quantity_pickingLTL`;

ALTER TABLE `work_list_detail` ADD `quantity_transfer` INT(11) NULL AFTER `Container_Number`;
ALTER TABLE `work_list_detail` ADD `status` VARCHAR(255) NULL AFTER `quantity_transfer`;

ALTER TABLE `product_location` ADD `product_location_type` VARCHAR(255) NULL AFTER `location_managerment_id`;

ALTER TABLE `active` ADD `counted_Qty` INT(11) NULL AFTER `admin_id`;

ALTER TABLE `active` ADD `work_list_detail_id` INT(11) NULL AFTER `counted_Qty`;

ALTER TABLE `active` ADD CONSTRAINT `IDX_workListDetailId` FOREIGN KEY (`work_list_detail_id`) REFERENCES `work_list_detail`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `product_managerment` ADD `workListDetailId` INT(11) NULL AFTER `UPC`;

ALTER TABLE `product_managerment` ADD CONSTRAINT `IDX_workDetail` FOREIGN KEY (`workListDetailId`) REFERENCES `work_list_detail`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `product_location` ADD `status` VARCHAR(255) NULL AFTER `product_location_type`;

ALTER TABLE `active` ADD `work_list_id` INT(11) NULL AFTER `work_list_detail_id`;
ALTER TABLE `active` ADD CONSTRAINT `IDX_workListId_` FOREIGN KEY (`work_list_id`) REFERENCES `work_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `work_list` ADD `users` INT(11) NULL AFTER `picking_type`;

ALTER TABLE `work_list` ADD CONSTRAINT `IDX_userId` FOREIGN KEY (`users`) REFERENCES `worker_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `work_list_detail` ADD `fromLocation` VARCHAR(255) NULL AFTER `status`, ADD `toLocation` VARCHAR(255) NULL AFTER `fromLocation`;

ALTER TABLE `product_managerment` CHANGE `Image_URL` `Image_URL` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL;

CREATE TABLE `eastwest_warehouse`.`inventory_count` (`id` INT(11) NOT NULL AUTO_INCREMENT , `SKU` VARCHAR(255) NULL , `QBQty` INT(11) NULL , `Qty_from_app` INT(11) NULL , `Counted_Qty` INT(11) NOT NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

ALTER TABLE `work_list` ADD `Title_invent` VARCHAR(255) NULL AFTER `user`, ADD `desc_invent` VARCHAR(255) NULL AFTER `Title_invent`;

ALTER TABLE `work_list_detail` ADD `QBQty` INT(11) NULL AFTER `toLocation`;

ALTER TABLE `work_list_detail` ADD `Qty_from_app` INT(11) NULL AFTER `QBQty`;

ALTER TABLE `work_list_detail` ADD `Counted_Qty` INT(11) NULL AFTER `Qty_from_app`;

CREATE TABLE `eastwest_warehouse`.`inventory_scan` (`id` INT(11) NOT NULL AUTO_INCREMENT , `work_list_id` INT(11) NULL , `SKU` VARCHAR(255) NULL , `location` VARCHAR(255) NULL , `Quantity` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

ALTER TABLE `inventory_scan` ADD CONSTRAINT `IDX_inventoryWorkListId` FOREIGN KEY (`work_list_id`) REFERENCES `work_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `inventory_scan` ADD `userId` INT(11) NULL AFTER `updated_at`;

ALTER TABLE `inventory_scan` ADD CONSTRAINT `IDX_inventoryUserId` FOREIGN KEY (`userId`) REFERENCES `worker_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `eastwest_warehouse`.`adjustment` (`id` INT(11) NOT NULL AUTO_INCREMENT , `SKU` VARCHAR(255) NULL , `Location` VARCHAR(255) NULL , `current_quantity` INT(11) NULL , `quantity_update` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

ALTER TABLE `inventory_count` ADD `workListId` INT(11) NULL AFTER `updated_at`;

ALTER TABLE `inventory_count` ADD CONSTRAINT `IDX_inventCountWorkListId` FOREIGN KEY (`workListId`) REFERENCES `work_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `worker_managerment` ADD `token` VARCHAR(255) NULL AFTER `image`;

ALTER TABLE `product_managerment` ADD `image_type` VARCHAR(255) NULL AFTER `workListDetailId`;

CREATE TABLE `eastwest_warehouse`.`inventory_pallet` (`id` INT(11) NOT NULL AUTO_INCREMENT , `pallet_number` INT(11) NULL , `work_list_detail_id` INT(11) NULL , `work_list_id` INT(11) NULL , `quantity` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

ALTER TABLE `inventory_pallet` ADD CONSTRAINT `IDX_inventoryPalletWorkListDetailid` FOREIGN KEY (`work_list_detail_id`) REFERENCES `work_list_detail`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `inventory_pallet` ADD CONSTRAINT `IDX_inventoryPalletWorkListId` FOREIGN KEY (`work_list_id`) REFERENCES `work_list`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `inventory_pallet` ADD `sku` VARCHAR(255) NULL AFTER `updated_at`;

ALTER TABLE `inventory_pallet` ADD `inventory_scan_id` INT(11) NULL AFTER `sku`;

ALTER TABLE `inventory_pallet` ADD CONSTRAINT `IDX_inventoryScanId` FOREIGN KEY (`inventory_scan_id`) REFERENCES `inventory_scan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `inventory_scan` ADD `status` VARCHAR(255) NULL AFTER `userId`;

ALTER TABLE `inventory_scan` ADD `status_recount` VARCHAR(255) NULL AFTER `status`;

ALTER TABLE `inventory_scan` ADD `admin_id` INT(11) NULL AFTER `status_recount`;

ALTER TABLE `inventory_scan` ADD CONSTRAINT `IDX_inventoryAdminId` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `eastwest_warehouse`.`active_pallet` (`id` INT(11) NOT NULL AUTO_INCREMENT , `pallet_number` INT(11) NULL , `quantity` INT(11) NULL , `active_id` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

ALTER TABLE `active_pallet` ADD CONSTRAINT `IDX_activeId` FOREIGN KEY (`active_id`) REFERENCES `active`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `worker_managerment` ADD `verify` INT(6) NULL AFTER `token`;

ALTER TABLE `product_managerment` ADD `isDeleted` INT(11) NULL AFTER `image_type`;

CREATE TABLE `eastwest_warehouse`.`product_managerment_image` (`id` INT(11) NOT NULL AUTO_INCREMENT , `image` VARCHAR(255) NULL , `product_managerment_id` INT(11) NULL , `created_at` DATETIME NULL , `updated_at` DATETIME NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;

ALTER TABLE `product_managerment_image` ADD CONSTRAINT `IDX_productManagerMentId` FOREIGN KEY (`product_managerment_id`) REFERENCES `product_managerment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `inventory_count` ADD `active` INT(11) NOT NULL AFTER `workListId`;

ALTER TABLE `work_list_pickingltl` ADD `name` VARCHAR(255) NULL AFTER `updated_at`;

ALTER TABLE `work_list` ADD `workListPickingltlId` INT(11) NULL AFTER `desc_invent`;

ALTER TABLE `work_list` ADD CONSTRAINT `IDX_workListPickingLtlId` FOREIGN KEY (`workListPickingltlId`) REFERENCES `work_list_pickingltl`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `work_list_pickingltl` ADD `Status` VARCHAR(255) NULL AFTER `name`;

ALTER TABLE `work_list` ADD `statusLTL` VARCHAR(255) NULL AFTER `workListPickingltlId`;