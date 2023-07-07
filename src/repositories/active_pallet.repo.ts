import { active_pallet } from "../models/active_pallet.model";
import sequelize, { Op, where } from "sequelize";

export const createActiveAdd = (data) => {
  const date = new Date();

  const newActivePallet = new active_pallet({
    pallet_number: data.pallet_number,
    quantity: data.quantity,
    active_id: data.active_id,
    created_at: date,
    updated_at: date,
  });

  return newActivePallet.save();
};
