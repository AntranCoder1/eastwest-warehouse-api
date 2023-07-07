import { inventory_count } from "../models/inventory_count.model";
import sequelize, { Op, where } from "sequelize";

export const createInventImport = (data: any, totalQuantity: any) => {
  const created = new Date();
  const updated = new Date();

  const newInvent = new inventory_count({
    SKU: data.SKU,
    QBQty: data.QBQty,
    Qty_from_app: totalQuantity,
    Counted_Qty: null,
    created_at: created,
    updated_at: updated,
    active: data.active,
  });

  return newInvent.save();
};

export const finAll = () => {
  return inventory_count.findAll({
    where: {
      workListId: {
        [Op.eq]: null,
      },
      active: 0,
    },
  });
};

export const finAllNOTNUll = () => {
  return inventory_count.findAll();
};

export const getInventoryCountId = (inventId) => {
  return inventory_count.findOne({ where: { id: inventId } });
};

export const addWorkListId = (inventoryCountId, worListId, active) => {
  return inventory_count.update(
    { workListId: worListId, active: active },
    { where: { id: inventoryCountId } }
  );
};

export const updateQuantity = (sku, workListId, quantity) => {
  return inventory_count.update(
    { Counted_Qty: quantity },
    { where: { SKU: sku, workListId: workListId } }
  );
};

export const upateQuantityWorkList = (sku, workListId) => {
  return inventory_count.update(
    { Counted_Qty: 0, workListId: null },
    { where: { SKU: sku, workListId: workListId } }
  );
};

// export const upateQuantityWorkLists = (workListId) => {
//   return inventory_count.update(
//     { Counted_Qty: 0, workListId: null, active: 0 },
//     { where: { workListId: workListId } }
//   );
// };

export const deleteQuantityWorkLists = (workListId) => {
  return inventory_count.destroy({ where: { workListId: workListId } });
};

export const updateQuantityFromApp = (sku, workListId, quantity) => {
  return inventory_count.update(
    { Qty_from_app: quantity },
    { where: { SKU: sku, workListId: workListId } }
  );
};

export const updateQBQty = (sku: string, quantity: number) => {
  return inventory_count.update({ QBQty: quantity }, { where: { SKU: sku } });
};
