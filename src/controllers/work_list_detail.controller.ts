import { Request, Response } from "express";
import { initModels } from "../models/init-models";
import fs from "fs";
import path from "path";
import config from "../config/db.config";
import { sequelize } from "../models/index";
import * as common from "../utils/common.util";
import * as jwtUtil from "../utils/jwt.util";
import * as workListDetailRepo from "../repositories/work_list_detail.repo";
import * as workListRepo from "../repositories/work_list.repo";
import * as activeRepo from "../repositories/active.repo";
import * as productManagermentRepo from "../repositories/product_managerment.repo";

initModels(sequelize);

export const editWorkListDetailReceving = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.body.user._id;
    const workListDetailId = req.body.workListDetailId;
    const SKU = req.body.SKU;
    const Quantity = req.body.quantity;
    const containerNumber = req.body.containerNumber;

    const update = await workListDetailRepo.editWorkListReceiving(
      workListDetailId,
      SKU,
      Quantity,
      containerNumber
    );

    if (update) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deteleWorkListDetailReceving = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.body.user._id;
    const workListDetailId = req.body.workListDetailId;

    const removeWorkListDetail =
      await workListDetailRepo.deleteWorkListReceiving(workListDetailId);

    if (removeWorkListDetail) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const arrSKU = req.body.arrSKU;

    const checkWorkList = await workListRepo.getWorkListId(workListId);

    if (!checkWorkList) {
      return res
        .status(400)
        .json({ status: "failed", message: "Work list not found!" });
    }

    if (arrSKU.length > 0) {
      for (const i of arrSKU) {
        const createWorkList = await workListDetailRepo.createWorkListDetail(
          checkWorkList.id,
          i,
          checkWorkList.Container_Number
        );

        const data = {
          sku_product: i.SKU,
        };

        const createNewProduct = await productManagermentRepo.createProduct(
          data
        );
      }

      res.status(200).send({ status: "success" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getId = async (req: Request, res: Response) => {
  try {
    const workListDetailId = req.body.workListDetailId;

    const getWorkListId = await workListDetailRepo.getWorkListDetailId(
      workListDetailId
    );

    if (getWorkListId) {
      res.status(200).send({ status: "success", data: getWorkListId });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// receiving detail

export const receivingDetail = async (req: Request, res: Response) => {
  try {
    const workListDetailId = req.body.workListDetailId;
    const sku = req.body.sku;

    const get: any = await workListDetailRepo.getReceivingDetail(
      workListDetailId
    );

    function sortFunction(a, b) {
      var dateA = new Date(a.created_at).getTime();
      var dateB = new Date(b.created_at).getTime();
      return dateA < dateB ? 1 : -1;
    }

    const receivingDetail = get.active.sort(sortFunction);

    const dataDetail = {
      id: get.id,
      work_list_id: get.work_list_id,
      SKU: get.SKU,
      Quantity: get.Quantity,
      created_at: get.created_at,
      updated_at: get.updated_at,
      location: get.location,
      Container_Number: get.Container_Number,
      quantity_transfer: get.quantity_transfer,
      status: get.status,
      fromLocation: get.fromLocation,
      toLocation: get.toLocation,
      QBQty: get.QBQty,
      Qty_from_app: get.Qty_from_app,
      Counted_Qty: get.Counted_Qty,
      active: receivingDetail,
      product_managerment: get.product_managerment,
    };

    const getImage = await productManagermentRepo.getProductWithSku(sku);

    if (get) {
      res.status(200).send({ status: "success", data: get, image: getImage });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// picking detail

export const pickingDetail = async (req: Request, res: Response) => {
  try {
    const workListDetailId = req.body.workListDetailId;
    const sku = req.body.sku;

    const get: any = await workListDetailRepo.getReceivingDetail(
      workListDetailId
    );

    function sortFunction(a, b) {
      var dateA = new Date(a.created_at).getTime();
      var dateB = new Date(b.created_at).getTime();
      return dateA < dateB ? 1 : -1;
    }

    const pickingDetail = get.active.sort(sortFunction);

    const dataDetail = {
      id: get.id,
      work_list_id: get.work_list_id,
      SKU: get.SKU,
      Quantity: get.Quantity,
      created_at: get.created_at,
      updated_at: get.updated_at,
      location: get.location,
      Container_Number: get.Container_Number,
      quantity_transfer: get.quantity_transfer,
      status: get.status,
      fromLocation: get.fromLocation,
      toLocation: get.toLocation,
      QBQty: get.QBQty,
      Qty_from_app: get.Qty_from_app,
      Counted_Qty: get.Counted_Qty,
      active: pickingDetail,
    };

    const getImage = await productManagermentRepo.getProductWithSku(sku);

    if (get) {
      res
        .status(200)
        .send({ status: "success", data: dataDetail, image: getImage });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// transfering detail

export const transferingDetail = async (req: Request, res: Response) => {
  try {
    const workListDetailId = req.body.workListDetailId;
    const sku = req.body.sku;

    const get = await workListDetailRepo.getTransferDetail(workListDetailId);

    const getImage = await productManagermentRepo.getProductWithSku(sku);

    if (get) {
      res
        .status(200)
        .send({ status: "success", data: get[0], image: getImage });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// check complete receiving
export const isCompleteReceiving = async (req: Request, res: Response) => {
  try {
    const workListDetailId = req.body.workListDetailId;
    const isActive = req.body.isActive;

    if (isActive === true) {
      const updateStatusComplete = await workListDetailRepo.updateStatus(
        workListDetailId
      );

      if (updateStatusComplete) {
        res.status(200).send({ status: "success" });
      } else {
        res.status(400).send({ status: "failed" });
      }
    } else {
      const updateStatusWorking = await workListDetailRepo.updateStatusWorking(
        workListDetailId
      );

      if (updateStatusWorking) {
        res.status(200).send({ status: "success" });
      } else {
        res.status(400).send({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getReceivingWithId = async (req: Request, res: Response) => {
  try {
    const workListDetailId = req.body.workListDetailId;
    const sku = req.body.sku;

    const getAllReceivingActive: any =
      await workListDetailRepo.getWorkListDetailActive(workListDetailId, sku);

    let arrActive = [];
    let l = 0;
    let map = new Map();

    for (const i of getAllReceivingActive.active) {
      if (i.Active === "update receiving") {
        const arrmap = arrActive.filter((item) => {
          if (item.location === i.location) {
            return item;
          }
        });

        let arrss = [];

        for (const j of arrmap) {
          for (const k of arrActive) {
            if (j.location === k.location) {
              arrActive.splice(l, 1);

              arrActive = arrActive.concat(i);
              map.set(j.location, i);
              l++;
              break;
            } else {
              arrss = arrss.concat(k);
            }
            l++;
          }
        }
      } else {
        arrActive = arrActive.concat(i);
        map.set(i.location, i);
      }
    }

    let arrWorkListDetailActive = [];

    for (const [key, value] of map) {
      arrWorkListDetailActive.push(value);
    }

    const {
      id,
      work_list_id,
      SKU,
      Quantity,
      created_at,
      updated_at,
      location,
      Container_Number,
      quantity_transfer,
      status,
      fromLocation,
      toLocation,
      QBQty,
      Qty_from_app,
      Counted_Qty,
    } = getAllReceivingActive;

    const dataValue = {
      id,
      work_list_id,
      SKU,
      Quantity,
      created_at,
      updated_at,
      location,
      Container_Number,
      quantity_transfer,
      status,
      fromLocation,
      toLocation,
      QBQty,
      Qty_from_app,
      Counted_Qty,
      active: arrWorkListDetailActive,
    };

    // const dataValue = {
    //   id: getAllReceivingActive.id,
    //   work_list_id: getAllReceivingActive.work_list_id,
    //   SKU: getAllReceivingActive.SKU,
    //   Quantity: getAllReceivingActive.Quantity,
    //   created_at: getAllReceivingActive.created_at,
    //   updated_at: getAllReceivingActive.updated_at,
    //   location: getAllReceivingActive.location,
    //   Container_Number: getAllReceivingActive.Container_Number,
    //   quantity_transfer: getAllReceivingActive.quantity_transfer,
    //   status: getAllReceivingActive.status,
    //   fromLocation: getAllReceivingActive.fromLocation,
    //   toLocation: getAllReceivingActive.toLocation,
    //   QBQty: getAllReceivingActive.QBQty,
    //   Qty_from_app: getAllReceivingActive.Qty_from_app,
    //   Counted_Qty: getAllReceivingActive.Counted_Qty,
    //   active: arrWorkListDetailActive,
    // };

    if (getAllReceivingActive) {
      res.status(200).send({ status: "success", data: dataValue });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
