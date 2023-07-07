import { Request, Response } from "express";
import { initModels } from "../models/init-models";
import fs from "fs";
import path from "path";
import config from "../config/db.config";
import { sequelize } from "../models/index";
import * as common from "../utils/common.util";
import * as jwtUtil from "../utils/jwt.util";
import xlsx from "xlsx";
import * as work_listRepo from "../repositories/work_list.repo";
import * as work_list_detailRepo from "../repositories/work_list_detail.repo";
import { work_list } from "../models/work_list.model";
import * as productLocationRepo from "../repositories/product_location.repo";
import * as adjustmentRepo from "../repositories/adjustment.repo";

initModels(sequelize);

export const createAdjustment = async (req: Request, res: Response) => {
  try {
    const sku = req.body.sku;
    const location = req.body.location;
    const quantity = req.body.quantity;

    // check product location exit
    const checkExit = await productLocationRepo.getPrductWithSKU(sku, location);

    if (!checkExit) {
      return res
        .status(400)
        .json({ status: "failed", message: "Product not found!!!" });
    }

    // update quantity
    const updateQuantity = await productLocationRepo.updateQuantityAdjustment(
      quantity,
      sku,
      location
    );

    // create adjustment
    const data = {
      sku,
      location,
      quantity,
      current_quantity: checkExit.Quantity,
    };
    const create = await adjustmentRepo.create(data);

    if (updateQuantity && create) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllAdjustment = async (req: Request, res: Response) => {
  try {
    const gets = await adjustmentRepo.findAll();

    if (gets) {
      res.status(200).send({ status: "success", data: gets });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getQuantity = async (req: Request, res: Response) => {
  try {
    const sku = req.body.sku;
    const location = req.body.location;

    const gets = await productLocationRepo.getPrductWithSKU(sku, location);

    if (gets) {
      res
        .status(200)
        .send({ status: "success", currentQuantity: gets.Quantity });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
