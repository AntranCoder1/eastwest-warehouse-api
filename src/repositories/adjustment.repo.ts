import { adjustment } from "../models/adjustment.model";
import sequelize, { Op, where } from "sequelize";

export const create = (data) => {
  const created = new Date();
  const updated = new Date();

  const newAdjustment = new adjustment({
    SKU: data.sku,
    Location: data.location,
    current_quantity: data.current_quantity,
    quantity_update: data.quantity,
    created_at: created,
    updated_at: updated,
  });
  return newAdjustment.save();
};

export const findAll = () => {
  return adjustment.findAll({
    order: [["created_at", "DESC"]],
  });
};

export const getAdjustmentId = (adjustmentId) => {
  return adjustment.findOne({ where: { id: adjustmentId } });
};
