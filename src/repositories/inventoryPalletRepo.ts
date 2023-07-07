import { inventory_pallet } from "../models/inventory_pallet.model";
import sequelize, { Op, where } from "sequelize";

export const createNewPallet = (data: any) => {
  const date = new Date();

  const newPallet = new inventory_pallet({
    pallet_number: data.pallet,
    work_list_detail_id: data.workListDetailId,
    work_list_id: data.workListId,
    quantity: data.quantity,
    created_at: date,
    updated_at: date,
    sku: data.SKU,
    inventory_scan_id: data.inventoryPallet,
  });

  return newPallet.save();
};

export const updateQuantityInventoryPallet = (
  palletId: number,
  quantity: number
) => {
  const updated = new Date();

  return inventory_pallet.update(
    { quantity: quantity, updated_at: updated },
    { where: { id: palletId } }
  );
};

export const findAllWithWorkListDetailId = (workListDetailId) => {
  return inventory_pallet.findAll({
    where: {
      work_list_detail_id: workListDetailId,
    },
  });
};

export const deletePalletWithId = (inventoryPalletId) => {
  return inventory_pallet.destroy({
    where: {
      id: inventoryPalletId,
    },
  });
};

export const getAllPalletWithWorkList = (workListId, arrInventoryScanId) => {
  return inventory_pallet.findAll({
    where: {
      [Op.and]: [
        { work_list_id: workListId },
        { inventory_scan_id: { [Op.in]: arrInventoryScanId } },
      ],
    },
    include: [
      {
        association: inventory_pallet.associations.inventory_scan,
      },
    ],
    order: [["updated_at", "DESC"]],
  });
};

export const findPalletWithId = (
  palletNumber,
  workListId,
  workListDetailId,
  inventoryScanId
) => {
  return inventory_pallet.findOne({
    where: {
      pallet_number: palletNumber,
      work_list_detail_id: workListDetailId,
      work_list_id: workListId,
      inventory_scan_id: inventoryScanId,
    },
  });
};

export const findByInventoryPalletId = (inventoryPalletId) => {
  return inventory_pallet.findOne({
    where: {
      id: inventoryPalletId,
    },
  });
};
