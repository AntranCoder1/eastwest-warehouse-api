import { Request, Response } from "express";
import { initModels } from "../models/init-models";
import fs from "fs";
import path from "path";
import config from "../config/db.config";
import { sequelize } from "../models/index";
import * as common from "../utils/common.util";
import * as jwtUtil from "../utils/jwt.util";
import xlsx from "xlsx";
import * as activeRepo from "../repositories/active.repo";

initModels(sequelize);

export const getAll = async (req: Request, res: Response) => {
  try {
    let limit = req.body.limit || 10;
    let offset = req.body.offset;

    const findCountActive = await activeRepo.findAllCountActive();

    let page: any = req.query.page;
    let pages = Math.ceil(findCountActive.count / limit);
    offset = limit * (page - 1);

    const findCountActives = await activeRepo.findAllCountActives(
      limit,
      offset
    );

    if (findCountActives) {
      res.status(200).send({
        status: "success",
        data: findCountActives,
        page: pages,
        count: findCountActives.count,
      });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllActives = async (req: Request, res: Response) => {
  try {
    const get = await activeRepo.getAllActive();

    if (get) {
      res.status(200).send({ status: "success", data: get });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getId = async (req: Request, res: Response) => {
  try {
    const activeId = req.body.activeId;

    const getActiveId = await activeRepo.getIdActive(activeId);

    if (getActiveId) {
      res.status(200).send({ status: "success", data: getActiveId });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const filterDate = async (req: Request, res: Response) => {
  try {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    const data = {
      startDate,
      endDate,
    };

    const get = await activeRepo.getActiveWithDate(data);

    if (get) {
      res.status(200).send({ status: "success", data: get });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const filterActive = async (req: Request, res: Response) => {
  try {
    const type = req.body.type;

    const filter = await activeRepo.filterActiveWithType(type);

    if (filter) {
      res.status(200).send({ status: "success", data: filter });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteActive = async (req: Request, res: Response) => {
  try {
    const activeId = req.body.activeId;

    const remove = await activeRepo.removeActive(activeId);

    if (remove) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
