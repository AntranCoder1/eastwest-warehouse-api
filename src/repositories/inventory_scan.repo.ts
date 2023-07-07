import { inventory_scan } from "../models/inventory_scan.model";
import { inventory_pallet } from "../models/inventory_pallet.model";
import sequelize, { Op, where } from "sequelize";

export const create = (data: any, userId: any) => {
  const created = new Date();
  const updated = new Date();

  const newInventScan = new inventory_scan({
    work_list_id: data.workListId,
    SKU: data.SKU,
    location: data.location,
    Quantity: data.quantity,
    created_at: created,
    updated_at: updated,
    userId: userId,
  });

  return newInventScan.save();
};

export const createScanAdmin = (data: any, userId: any) => {
  const created = new Date();
  const updated = new Date();

  const newInventScan = new inventory_scan({
    work_list_id: data.workListId,
    SKU: data.SKU,
    location: data.location,
    Quantity: data.quantity,
    created_at: created,
    updated_at: updated,
    admin_id: userId,
  });

  return newInventScan.save();
};

export const getInventWithSkuAndWorkListId = (sku, workListId) => {
  return inventory_scan.findAll({
    where: { work_list_id: workListId, SKU: sku },
  });
};

export const updateInvent = (inventId, quantity, workListId) => {
  const updated = new Date();

  return inventory_scan.update(
    { Quantity: quantity, updated_at: updated },
    { where: { id: inventId, work_list_id: workListId } }
  );
};

export const getCountedWithSKUWorkList = (workListId, sku) => {
  return inventory_scan.findAll({
    where: {
      work_list_id: workListId,
      SKU: sku,
    },
    include: [
      {
        model: inventory_pallet,
        as: "inventory_pallet",
        order: [["updated_at", "DESC"]],
      },
    ],
  });
};

export const getCountedWithSKUId = (inventoryScanId, sku) => {
  return inventory_scan.findAll({
    where: { id: inventoryScanId, SKU: sku },
  });
};

export const upadateQuantity = (
  inventoryScanId: number,
  sku: string,
  quantity: number
) => {
  const updated = new Date();

  return inventory_scan.update(
    { Quantity: quantity, updated_at: updated },
    { where: { id: inventoryScanId, SKU: sku } }
  );
};

export const deleteInventoryScan = (workListId, sku) => {
  return inventory_scan.destroy({
    where: { work_list_id: workListId, SKU: sku },
  });
};

export const findScanExists = (workListId, sku, location) => {
  return inventory_scan.findOne({
    where: {
      work_list_id: workListId,
      SKU: sku,
      location: location,
    },
    include: [
      {
        association: inventory_scan.associations.inventory_pallet,
      },
    ],
  });
};

export const getInventoryWithpallet = (workListId, sku) => {
  return inventory_scan.findOne({
    where: {
      work_list_id: workListId,
      SKU: sku,
    },
    include: [
      {
        association: inventory_scan.associations.inventory_pallet,
      },
    ],
  });
};

export const getInventoryWithpallets = (workListId) => {
  return inventory_scan.findAll({
    where: {
      work_list_id: workListId,
    },
    include: [
      {
        association: inventory_scan.associations.inventory_pallet,
      },
    ],
  });
};

export const updateStatus = (workListId, sku, location, status) => {
  let isActive;

  if (status === true) {
    isActive = "complete";
  } else {
    isActive = "working";
  }
  return inventory_scan.update(
    { status: isActive },
    { where: { work_list_id: workListId, SKU: sku, location } }
  );
};

export const updateStatusComplete = (
  workListId: number,
  sku: string,
  location: string
) => {
  return inventory_scan.update(
    { status: "complete" },
    { where: { work_list_id: workListId, SKU: sku, location } }
  );
};

export const updateStatusWorking = (
  workListId: number,
  sku: string,
  location: string
) => {
  return inventory_scan.update(
    { status: "working" },
    { where: { work_list_id: workListId, SKU: sku, location } }
  );
};
