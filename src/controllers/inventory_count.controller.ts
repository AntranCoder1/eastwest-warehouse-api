import { work_listId } from "./../models/work_list.model";
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
import * as inventoryCountRepo from "../repositories/inventory_count.repo";
import * as activeRepo from "../repositories/active.repo";
import * as productLocationRepo from "../repositories/product_location.repo";
import * as inventScanRepo from "../repositories/inventory_scan.repo";
import * as productManagermentRepo from "../repositories/product_managerment.repo";
import * as locationManagermentRepo from "../repositories/location_managerment.repo";
import * as workerManagermentRepo from "../repositories/worker_managerment.repo";
import * as inventoryPalletRepo from "../repositories/inventoryPalletRepo";
import * as activePalletRepo from "../repositories/active_pallet.repo";
import * as userRepo from "../repositories/user.repo";

initModels(sequelize);

export const importFile = async (req, res) => {
  try {
    const files = req.file.filename;
    const userId = req.body.user._id;

    const host = "workList/getFile/";
    const urls = host.concat(files);

    const dataAvatar = { originalName: files, filePath: urls };

    const url = path.join(
      __dirname,
      `../assets/upload/${dataAvatar.originalName}`
    );

    const file = xlsx.readFile(url);

    const sheetNames = file.SheetNames;
    const totalSheets = sheetNames.length;

    let parsedData = [];

    for (let i = 0; i < totalSheets; i++) {
      const tempData = xlsx.utils.sheet_to_json(file.Sheets[sheetNames[i]]);
      parsedData.push(...tempData);
    }

    if (parsedData.length > 0) {
      for (const i of parsedData) {
        const findProducts: any =
          await productManagermentRepo.getProductWithSkus(i.SKU);

        if (findProducts) {
          const qtyFromApp = findProducts.product_location.reduce(
            (acc, val) => acc + val.Quantity,
            0
          );
          const data = {
            SKU: i.SKU,
            QBQty: i.QBQty,
            Counted_Qty: 0,
            active: 0,
          };

          const createInvent = await inventoryCountRepo.createInventImport(
            data,
            qtyFromApp
          );
        }
      }

      const getInventoryCount = await inventoryCountRepo.finAll();

      // create active
      const createActive = await activeRepo.createActiveInventoryCount(userId);

      res.status(200).send({ status: "success", data: getInventoryCount });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getInventCounts = async (req: Request, res: Response) => {
  try {
    const gets = await inventoryCountRepo.finAll();

    if (gets) {
      res.status(200).send({ status: "success", data: gets });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const createInventoryCount = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const title = req.body.title;
    const desc = req.body.desc;
    const arrInvent = req.body.arrInvent;

    const createWorkList = await work_listRepo.createInvent(
      userId,
      title,
      desc
    );

    const createWorkListDetail = await work_list_detailRepo.createInvent(
      createWorkList.id,
      arrInvent
    );

    // create active
    const createActive = await activeRepo.createActiveInventoryCountCr(userId);

    // add workListId for inventory count
    for (const i of arrInvent) {
      const active = 1;

      const addWorkListInventoryCount = await inventoryCountRepo.addWorkListId(
        i.id,
        createWorkList.id,
        active
      );
    }

    if (createWorkListDetail) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllInventory = async (req: Request, res: Response) => {
  try {
    const getInventory: any = await work_listRepo.findInvent();
    const page = req.body.page - 1;
    const pageSize = 10;

    for (const i of getInventory) {
      const checkStatusComplete = i.work_list_detail.every(
        (item) => item.status === "complete"
      );

      if (checkStatusComplete === true) {
        // update status
        const updateStatus = await work_listRepo.updateStatus(i.id);
      } else {
        const updateStatus = await work_listRepo.updateStatusWorking(i.id);
      }
    }

    const getInventorys: any = await work_listRepo.findInventPagination(
      page,
      pageSize
    );

    const countDocument = await work_listRepo.countDocument();

    if (getInventorys) {
      res.status(200).send({
        status: "success",
        data: getInventorys,
        count: countDocument,
        maxPage: Math.ceil(countDocument / pageSize),
      });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllInventorys = async (req: Request, res: Response) => {
  try {
    const getInventory: any = await work_listRepo.findInvents();

    if (getInventory) {
      res.status(200).send({ status: "success", data: getInventory });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getInventoryId = async (req: Request, res: Response) => {
  try {
    const inventId = req.body.inventId;
    const search = req.body.search;
    const page = req.body.page - 1;
    const pageSize = 10;

    const getInventId: any = await work_listRepo.getWorkListId(inventId);

    const workListDetail =
      await work_list_detailRepo.findInventoryWithWorklistId(
        inventId,
        page,
        pageSize,
        search
      );

    const count = await work_list_detailRepo.countDocument(inventId, search);
    // const arrData = [];

    // for (const i of getInventId.work_list_detail) {
    //   const getQuantityProduct

    //     await productManagermentRepo.getProductWithSkus(i.SKU);

    //   arrData.push(getQuantityProduct);
    // }

    if (getInventId) {
      res.status(200).send({
        status: "success",
        data: getInventId,
        workListDetail: workListDetail,
        total: count,
      });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteInvent = async (req: Request, res: Response) => {
  try {
    const inventId = req.body.inventId;

    const updateInventoryCount =
      await inventoryCountRepo.deleteQuantityWorkLists(inventId);

    const remove = await work_listRepo.deleteInventory(inventId);

    if (remove) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getInventSkuDetail = async (req: Request, res: Response) => {
  try {
    const sku = req.body.sku;
    const workListId = req.body.workListId;

    // const getQuantityProduct = await productLocationRepo.getAllProductWithSku(
    //   sku
    // );

    // const totalQuantity = getQuantityProduct.reduce(
    //   (acc, val) => acc + val.Quantity,
    //   0
    // );

    const getCountedQuantity: any =
      await inventScanRepo.getCountedWithSKUWorkList(workListId, sku);

    // function sortFunction(a, b) {
    //   var dateA = new Date(a.created_at).getTime();
    //   var dateB = new Date(b.created_at).getTime();
    //   return dateA < dateB ? 1 : -1;
    // }

    // const inventoryCountDetail = getCountedQuantity.sort(sortFunction);

    const getWorkListComplete =
      await work_list_detailRepo.getWorkListDetailIdInventory(workListId, sku);

    const totalQuantity = getCountedQuantity.reduce(
      (acc, val) => acc + val.Quantity,
      0
    );

    // if (getWorkListComplete) {
    //   res.status(200).send({
    //     status: "success",
    //     data: inventoryCountDetail,
    //     // total: totalQuantity,
    //     isActive: getWorkListComplete.status,
    //   });
    // } else {
    //   res.status(404).send({ status: "SKU not exist in this WorkList" });
    // }

    const arrInventoryScanId = getCountedQuantity.map((item) => item.id);

    const getCounted: any = await inventoryPalletRepo.getAllPalletWithWorkList(
      workListId,
      arrInventoryScanId
    );

    if (getCountedQuantity) {
      res.status(200).send({
        status: "success",
        data: getCounted,
        total: totalQuantity,
        isActive: getWorkListComplete.status,
      });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editInventScanDetail = async (req: Request, res: Response) => {
  try {
    const inventoryScanId = req.body.inventoryScanId;
    const quantity = req.body.quantity;
    const workListId = req.body.workListId;
    const SKU = req.body.sku;

    const updateInventScan = await inventScanRepo.updateInvent(
      inventoryScanId,
      quantity,
      workListId
    );

    // get inventory scan with sku and workListId
    const getInventoryScan = await inventScanRepo.getCountedWithSKUWorkList(
      workListId,
      SKU
    );

    const totalQuantity = getInventoryScan.reduce(
      (acc, val) => acc + val.Quantity,
      0
    );

    const updateQuantityWorkListDetail =
      await work_list_detailRepo.updateQuantitys(
        workListId,
        SKU,
        totalQuantity
      );

    // update inventory count quantity
    const updateQuantityInventoryCount =
      await inventoryCountRepo.updateQuantity(SKU, workListId, totalQuantity);

    if (updateInventScan && updateQuantityInventoryCount) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editWorkListInventory = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const title = req.body.title;
    const desc = req.body.desc;
    const arrInventAdd = req.body.arrInventAdd;
    const arrInventDelete = req.body.arrInventDelete;

    const updateWorkList = await work_listRepo.updateWorkList(
      workListId,
      title,
      desc
    );

    if (arrInventAdd.length > 0) {
      const addInventoryWorkListDetail =
        await work_list_detailRepo.createInvent(workListId, arrInventAdd);

      for (const i of arrInventAdd) {
        // update inventory count
        const active = 1;
        const updateInventoryCount = await inventoryCountRepo.addWorkListId(
          i.id,
          workListId,
          active
        );
      }
    }

    if (arrInventDelete.length > 0) {
      for (const i of arrInventDelete) {
        const getWorkListDetailId =
          await work_list_detailRepo.getWorkListDetailId(i.workListDetailId);

        // update inventory count
        const updateInventoryCount =
          await inventoryCountRepo.upateQuantityWorkList(
            getWorkListDetailId.SKU,
            workListId
          );

        // delete inventory scan
        const deleteInventoryScan = await inventScanRepo.deleteInventoryScan(
          workListId,
          getWorkListDetailId.SKU
        );

        const deleteWorkListDetailId =
          await work_list_detailRepo.deleteWorkListReceiving(
            i.workListDetailId
          );
      }
    }

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getInventoryCountWorker = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const page = req.body.page - 1;
    const pageSize = 10;

    const gets: any = await work_listRepo.findInventId(workListId);

    const search = "";

    const findWorkListDetail: any =
      await work_list_detailRepo.findInventoryWithWorklistId(
        gets.id,
        page,
        pageSize,
        search
      );

    const countDocument = await work_list_detailRepo.countDocument(
      gets.id,
      search
    );

    const maxPage = Math.ceil(countDocument / pageSize);

    const arr = [];

    for (const i of findWorkListDetail) {
      // const findSku = await productManagermentRepo.getProductWithSkus(i.SKU);
      const findSku = await inventScanRepo.getCountedWithSKUWorkList(
        workListId,
        i.SKU
      );
      arr.push(findSku);
    }

    const arrInventory = [];

    for (const j of arr) {
      if (j.length !== 0) {
        const arrIn = {
          SKU: [...new Set(j.map((item) => item.SKU))].toString(),
          Counted_quantity: 0,
          Location: j.map((item) => item.location),
          isActive: "working",
        };
        arrInventory.push(arrIn);
      }
    }

    let arrInventorys = [];
    let skuSet = new Set();

    for (const l of findWorkListDetail) {
      // Check if SKU is already in the Set
      if (skuSet.has(l.SKU)) {
        continue; // skip the iteration if SKU is already added
      }

      const arrInventoryFilter = arrInventory.filter(
        (item) => item.SKU === l.SKU
      );

      if (arrInventoryFilter.length > 0) {
        const k = arrInventoryFilter[0];
        const arrs = {
          SKU: l.SKU,
          Counted_quantity: l.Counted_Qty,
          Location: k.Location,
          isActive: l.status,
        };

        const arrFilter = arrInventorys.filter((item) => item.SKU === k.SKU);

        if (arrFilter.length === 0) {
          arrInventorys.push(arrs);
        } else {
          const arrFilters = arrInventorys.filter(
            (item) => item.SKU === arrs.SKU
          );

          if (arrFilters) {
            arrInventorys.push(arrs);
          } else {
            arrInventorys[
              arrInventorys.indexOf(
                arrInventorys
                  .filter((item) => item.SKU === k.SKU)[0]
                  .Location.concat(l.Location)
              )
            ];
          }
        }
      } else {
        const arrs = {
          SKU: l.SKU,
          Counted_quantity: l.Counted_Qty,
          Location: [],
          isActive: "working",
        };
        arrInventorys.push(arrs);
      }

      // Add SKU to the Set
      skuSet.add(l.SKU);
    }

    // let arrInventorys = [];

    // for (const l of findWorkListDetail) {
    //   if (arrInventory.length > 0) {
    //     for (const k of arrInventory) {
    //       const arrInventoryFilter = arrInventory.filter(
    //         (item) => item.SKU === l.SKU
    //       );
    //       if (arrInventoryFilter.length > 0) {
    //         if (l.SKU === k.SKU) {
    //           // const getSKU = await productManagermentRepo.findProductWithBars(l.SKU);
    //           const arrs = {
    //             SKU: l.SKU,
    //             Counted_quantity: l.Counted_Qty,
    //             Location: k.Location,
    //             isActive: l.status,
    //           };
    //           const arrFilter = arrInventorys.filter(
    //             (item) => item.SKU === k.SKU
    //           );

    //           if (arrFilter.length === 0) {
    //             arrInventorys.push(arrs);
    //           } else {
    //             const arrFilters = arrInventorys.filter(
    //               (item) => item.SKU === arrs.SKU
    //             );

    //             if (arrFilters) {
    //               arrInventorys.push(arrs);
    //             } else {
    //               arrInventorys[
    //                 arrInventorys.indexOf(
    //                   arrInventorys
    //                     .filter((item) => item.SKU === k.SKU)[0]
    //                     .Location.concat(l.Location)
    //                 )
    //               ];
    //             }
    //           }
    //         }
    //       } else {
    //         const arrs = {
    //           SKU: l.SKU,
    //           Counted_quantity: l.Counted_Qty,
    //           Location: [],
    //           isActive: "working",
    //         };
    //         arrInventorys.push(arrs);
    //       }
    //     }
    //   } else {
    //     const arrs = {
    //       SKU: l.SKU,
    //       Counted_quantity: 0,
    //       Location: [],
    //       isActive: l.status,
    //     };
    //     arrInventorys.push(arrs);
    //   }
    // }

    res.status(200).send({
      status: "success",
      data: arrInventorys,
      count: countDocument,
      maxPage,
    });

    return;

    const arrInventoryId = [];

    for (const k of gets.work_list_detail) {
      for (const l of arrInventorys) {
        if (l.SKU === k.SKU) {
          const arrInId = {
            SKU: l.SKU,
            Counted_quantity: k.Counted_Qty,
            Location: l.Location,
            isActive: k.status,
          };

          arrInventoryId.push(arrInId);
        }
      }
    }

    res.status(200).send({ status: "success", data: arrInventoryId });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const scanInventWorker = async (req: Request, res: Response) => {
  try {
    const SKU = req.body.SKU;
    const location = req.body.location;
    const quantity = req.body.quantity;
    const workListId = req.body.workListId;
    const userId = req.body.user._id;
    const pallet = req.body.pallet;

    const checkExitsts = await productLocationRepo.getPrductWithSKU(
      SKU,
      location
    );

    // if (!checkExitsts) {
    //   return res
    //     .status(400)
    //     .json({ status: "failed", message: "Product not found" });
    // }

    // check inventory scan exists
    const checkExists = await inventScanRepo.findScanExists(
      workListId,
      SKU,
      location
    );

    let scanner;

    if (!checkExists) {
      const data = {
        SKU,
        location,
        quantity,
        workListId,
      };

      const createInventScan = await inventScanRepo.create(data, userId);

      scanner = createInventScan;
    } else {
      const findAllInventorypallet: any =
        await inventScanRepo.getInventoryWithpallet(workListId, SKU);

      const totalQuantityInventoryScan =
        findAllInventorypallet.inventory_pallet.reduce(
          (acc, val) => acc + val.quantity,
          0
        );

      const updateQuantityInventoryScan = await inventScanRepo.upadateQuantity(
        findAllInventorypallet.id,
        SKU,
        totalQuantityInventoryScan
      );

      scanner = checkExists;
    }

    // inventory pallet
    const getWorkListDetailId =
      await work_list_detailRepo.getWorkListDetailIdInventory(workListId, SKU);

    const dataInventoryPallet = {
      pallet,
      workListDetailId: getWorkListDetailId.id,
      workListId,
      quantity,
      SKU,
      inventoryPallet: scanner.id,
    };

    const createInventoryCountPallet =
      await inventoryPalletRepo.createNewPallet(dataInventoryPallet);

    const updateInventScan = updateQuantity(
      SKU,
      workListId,
      getWorkListDetailId.id
    );

    if (scanner && updateInventScan && createInventoryCountPallet) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editInventoryScanWorker = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    // const inventoryScanId = req.body.inventoryScanId;
    const SKU = req.body.sku;
    const quantity = req.body.quantity;
    const palletId = req.body.palletId;
    const location = req.body.location;

    const updatePallet =
      await inventoryPalletRepo.updateQuantityInventoryPallet(
        palletId,
        quantity
      );

    const getAllPallet: any = await inventScanRepo.findScanExists(
      workListId,
      SKU,
      location
    );

    const totalQuantity = getAllPallet.inventory_pallet.reduce(
      (acc, val) => acc + val.quantity,
      0
    );

    const updateQuantityInventoryScan = await inventScanRepo.upadateQuantity(
      getAllPallet.id,
      SKU,
      totalQuantity
    );

    // get inventory scan with sku and workListId
    const getInventoryScan = await inventScanRepo.getCountedWithSKUWorkList(
      workListId,
      SKU
    );

    const totalQuantityScan = getInventoryScan.reduce(
      (acc, val) => acc + val.Quantity,
      0
    );

    const updateQuantityWorkListDetail =
      await work_list_detailRepo.updateQuantitys(
        workListId,
        SKU,
        totalQuantityScan
      );

    // update inventory count quantity
    const updateQuantityInventoryCount =
      await inventoryCountRepo.updateQuantity(
        SKU,
        workListId,
        totalQuantityScan
      );

    if (updatePallet && updateQuantityInventoryScan) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

const updateQuantity = async (SKU, workListId, workListDetailid) => {
  const getsInventScan = await inventScanRepo.getInventWithSkuAndWorkListId(
    SKU,
    workListId
  );

  const getInventoryPallet =
    await inventoryPalletRepo.findAllWithWorkListDetailId(workListDetailid);

  const countQuantity = getInventoryPallet.reduce(
    (acc, val) => acc + val.quantity,
    0
  );

  const updateWorkListDetail = await work_list_detailRepo.updateQuantitys(
    workListId,
    SKU,
    countQuantity
  );
  if (updateWorkListDetail) {
    return true;
  } else {
    return false;
  }
};

export const getInventScanWorker = async (req: Request, res: Response) => {
  try {
    const sku = req.body.sku;
    const workListId = req.body.workListId;

    const gets = await inventScanRepo.getInventWithSkuAndWorkListId(
      sku,
      workListId
    );

    if (gets) {
      res.status(200).send({ status: "success", data: gets });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getIdInventoryCount = async (req: Request, res: Response) => {
  try {
    const inventId = req.body.inventId;

    const getId = await inventoryCountRepo.getInventoryCountId(inventId);

    if (getId) {
      res.status(200).send({ status: "success", data: getId });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const checkIsCompleteWorker = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const sku = req.body.sku;
    const isActive = req.body.isActive;

    if (isActive === true) {
      // check update complete workListDetail
      const checkUpdateWorkListDetail =
        await work_list_detailRepo.getWorkListDetailIdInventory(
          workListId,
          sku
        );

      if (
        checkUpdateWorkListDetail.Counted_Qty === 0 ||
        checkUpdateWorkListDetail.Counted_Qty === null
      ) {
        return res.status(200).send({ status: "success", message: true });
      }

      if (checkUpdateWorkListDetail) {
        // update status
        const updateStatus = await work_list_detailRepo.updateStatus(
          checkUpdateWorkListDetail.id
        );

        // update Quantity inventory count

        const updateQuantityInventoryCount =
          await inventoryCountRepo.updateQuantity(
            sku,
            workListId,
            checkUpdateWorkListDetail.Counted_Qty
          );
      }
    } else {
      // check update complete workListDetail
      const checkUpdateWorkListDetail =
        await work_list_detailRepo.getWorkListDetailIdInventory(
          workListId,
          sku
        );

      if (checkUpdateWorkListDetail) {
        // update status
        const updateStatus = await work_list_detailRepo.updateStatusWorking(
          checkUpdateWorkListDetail.id
        );

        // update Quantity inventory count

        const quantity = 0;

        const updateQuantityInventoryCount =
          await inventoryCountRepo.updateQuantity(sku, workListId, quantity);
      }
    }

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const filterWithYear = async (req: Request, res: Response) => {
  try {
    const year = req.body.year;

    const getInventoryCountWithYear: any =
      await work_listRepo.filterInventWithYear(year);

    for (const i of getInventoryCountWithYear) {
      const checkStatusComplete = i.work_list_detail.every(
        (item) => item.status === "complete"
      );

      if (checkStatusComplete === true) {
        // update status
        const updateStatus = await work_listRepo.updateStatus(i.id);
      } else {
        const updateStatus = await work_listRepo.updateStatusWorking(i.id);
      }
    }

    const getInventorys: any = await work_listRepo.filterInventWithYear(year);

    if (getInventorys) {
      res.status(200).send({ status: "success", data: getInventorys });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllInventotyCountForUpdate = async (
  req: Request,
  res: Response
) => {
  try {
    const workListId = req.body.workListId;

    const findAllInventoryCount = await inventoryCountRepo.finAllNOTNUll();

    const arr = [];

    for (const i of findAllInventoryCount) {
      if (i.workListId === workListId || i.workListId === null) {
        arr.push(i);
      }
    }

    if (findAllInventoryCount) {
      res.status(200).send({ status: "success", data: arr });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const inventoryCountCompared = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const sku = req.body.sku;
    const quantity = req.body.quantity;
    const userId = req.body.user._id;

    // check product exists in product location
    const checkExists = await productLocationRepo.getAllProductWithSku(sku);

    if (!checkExists) {
      return res
        .status(400)
        .json({ status: "failed", message: "Product not found" });
    }

    const getProductWithInventScan =
      await inventScanRepo.getCountedWithSKUWorkList(workListId, sku);

    for (const i of getProductWithInventScan) {
      // check exists
      const checProductExists = await productLocationRepo.getPrductWithSKU(
        sku,
        i.location
      );

      if (checProductExists) {
        const updateQuantity =
          await productLocationRepo.updateQuantityAdjustment(
            i.Quantity,
            sku,
            i.location
          );
      } else {
        const getProduct = await productManagermentRepo.getProductWithSku(sku);

        const getLocation = await locationManagermentRepo.findWithBarcode(
          i.location,
          sku
        );

        const arrLocation = {
          Loc_Barcodes: getLocation.Loc_Barcodes,
          locationId: getLocation.id,
        };

        const data = {
          Quantity: i.Quantity,
          sku_product: getProduct.SKU_product,
          UPC: getProduct.UPC,
        };

        const createProductLocation = await productLocationRepo.create(
          arrLocation,
          data,
          getProduct.id,
          getProduct.Product_Name
        );
      }
    }

    const checkExistss = await productLocationRepo.getAllProductWithSku(sku);

    const totalQuantity = checkExistss.reduce(
      (acc, val) => acc + val.Quantity,
      0
    );

    // update quantity inventory count
    const updateQtyFromApp = await inventoryCountRepo.updateQuantityFromApp(
      sku,
      workListId,
      totalQuantity
    );

    // update workListDetail
    const updateQtyFromAppWorkListDetail =
      await work_list_detailRepo.updateQtyFrom(workListId, sku, totalQuantity);

    // create active
    const createActive = activeRepo.ceateActiveInventoryCountCompared(userId);

    if (updateQtyFromApp && createActive) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const jwtInventoryCount = async (req: Request, res: Response) => {
  try {
    const workerId = req.body.workerId;
    const isInvite = req.body.isInvite;

    const updateInviteWorker = await workerManagermentRepo.updateInvite(
      workerId,
      isInvite
    );

    if (updateInviteWorker) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const test = async (req: Request, res: Response) => {
  try {
    const page = req.body.page - 1;
    const pageSize = 10;
    const locByCount: any = await locationManagermentRepo.getCountByLoc(
      [
        396, 397, 398, 399, 397, 400, 401, 402, 403, 404, 405, 401, 397, 406,
        407, 400, 408, 409, 410, 411, 412, 413, 402, 398, 434, 434, 406,
      ],
      [
        3754, 3754, 3754, 3755, 3755, 3755, 3756, 3756, 3757, 3757, 3758, 3758,
        3758, 3759, 3759, 3759, 3760, 3760, 3761, 3761, 3762, 3763, 3763, 3763,
        3757, 3758, 3761,
      ],
      pageSize,
      page
    );

    res.status(200).send({ status: "success", locByCount });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const inventoryCountByLoc = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const page = req.body.page - 1;
    const pageSize = 10;

    // const getCountByLoc: any = await work_listRepo.findInventId(workListId);

    const search = "";

    const workListDetail: any =
      await work_list_detailRepo.findInventoryWithWorklistId(
        workListId,
        page,
        pageSize,
        search
      );

    const findSku = await productLocationRepo.getInventoryCountByLoc(
      workListDetail.map((item: { SKU: any }) => item.SKU)
    );

    const locByCount: any = await locationManagermentRepo.getCountByLoc(
      findSku.map((item) => item.location_managerment_id),
      findSku.map((item) => item.product_managerment_id),
      pageSize,
      page
    );

    const productLocation = await productLocationRepo.findAllProductLocation(
      findSku.map((item) => item.product_managerment_id)
    );

    const countDocument = await locationManagermentRepo.countDocument(
      findSku.map((item) => item.location_managerment_id)
    );

    let arrLoc = [];
    let countLoc = 0;
    let hashLoc = {};

    for (const i of locByCount) {
      const data = {
        id: i.id,
        Loc_Barcodes: i.Loc_Barcodes,
        product_location: [],
      };
      for (const j of findSku) {
        if (i.Loc_Barcodes.trim() === j.Loc_Barcodes.trim()) {
          data.product_location = data.product_location.concat(j);

          if (hashLoc[i.Loc_Barcodes.trim()] !== i.Loc_Barcodes.trim()) {
            hashLoc[i.Loc_Barcodes.trim()] = i.Loc_Barcodes.trim();
            arrLoc = arrLoc.concat(data);
          }
          countLoc++;
        } else {
        }
      }
    }

    function flatten(arr: any[]) {
      return arr.reduce((pre, cur) => {
        return pre.concat(Array.isArray(cur) ? flatten(cur) : cur);
      }, []);
    }

    const arrProductLocation = flatten(
      arrLoc.map((item: any) => item.product_location)
    );

    let arr = [];
    for (let i of arrProductLocation) {
      for (let j of workListDetail) {
        if (i.SKU_product === j.SKU) {
          const filterPallet: any = await inventScanRepo.findScanExists(
            workListId,
            i.SKU_product,
            i.Loc_Barcodes
          );

          const totalQuantityLoc = filterPallet?.inventory_pallet.reduce(
            (acc, val) => acc + val.quantity,
            0
          );

          let isStatus;

          if (i.Quantity === totalQuantityLoc) {
            const updateStatus = await inventScanRepo.updateStatusComplete(
              workListId,
              i.SKU_product,
              i.Loc_Barcodes
            );

            const filterPallet: any = await inventScanRepo.findScanExists(
              workListId,
              i.SKU_product,
              i.Loc_Barcodes
            );

            isStatus = filterPallet;
          } else {
            const updateStatus = await inventScanRepo.updateStatusWorking(
              workListId,
              i.SKU_product,
              i.Loc_Barcodes
            );

            const filterPallet: any = await inventScanRepo.findScanExists(
              workListId,
              i.SKU_product,
              i.Loc_Barcodes
            );

            isStatus = filterPallet;
          }

          const getAllProductLocation =
            await productLocationRepo.getAllQuantityInLocation(i.SKU_product);

          const data = {
            SKU_product: i.SKU_product,
            Loc_Barcodes: i.Loc_Barcodes,
            Quantity: i.Quantity,
            isActive: isStatus?.status === "complete" ? "complete" : "working",
            QBQty: j.QBQty,
            Counted_Qty: j.Counted_Qty,
            total: getAllProductLocation.reduce(
              (acc, val) => acc + val.Quantity,
              0
            ),
            workListDetailId: j.id,
            CountLoc: isStatus?.inventory_pallet
              ? isStatus?.inventory_pallet?.reduce(
                  (acc: any, val: { quantity: any }) => acc + val.quantity,
                  0
                )
              : 0,
          };
          arr = arr.concat(data);
        } else {
          arr = arr.concat();
        }
      }
    }

    let arrCount = [];
    let count = 0;

    let hash = {};
    for (const l of arrLoc) {
      const data = {
        id: l.id,
        Loc_Barcodes: l.Loc_Barcodes,
        quantity_total: l.product_location.reduce(
          (acc: any, val: { Quantity: any }) => acc + val.Quantity,
          0
        ),
        product_location: [],
      };
      for (const k of arr) {
        if (l.Loc_Barcodes.trim() === k.Loc_Barcodes.trim()) {
          data.product_location = data.product_location.concat(k);

          if (hash[l.Loc_Barcodes.trim()] !== l.Loc_Barcodes.trim()) {
            hash[l.Loc_Barcodes.trim()] = l.Loc_Barcodes.trim();
            arrCount = arrCount.concat(data);
          }
          count++;
        } else {
        }
      }
    }

    if (arrCount.length > 0) {
      res
        .status(200)
        .send({ status: "success", data: arrCount, count: arrLoc.length });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const inventoryRecount = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;

    const getCountByLoc: any = await work_listRepo.findInventId(workListId);

    const getProductInventoryRecount: any =
      await productManagermentRepo.inventoryRecount(
        getCountByLoc.work_list_detail.map((item: any) => item.SKU)
      );

    let arr = [];

    for (let i of getProductInventoryRecount) {
      for (let j of getCountByLoc.work_list_detail) {
        if (i.SKU_product === j.SKU) {
          const newLocal_1 = {
            id: i.id,
            SKU_product: i.SKU_product,
            Product_Name: i.Product_Name,
            Image_URL: i.Image_URL,
            created_at: i.created_at,
            updated_at: i.updated_at,
            UPC: i.UPC,
            workListDetailId: j.id,
            image_type: i.image_type,
            isActive: j.status,
            QBQty: j.QBQty,
            Qty_from_app: j.Qty_from_app,
            Counted_Qty: j.Counted_Qty,
            product_location: i.product_location,
          };
          const data: any = newLocal_1;

          arr = arr.concat(data);
        } else {
          arr = arr.concat();
        }
      }
    }

    const filterPallet: any = await inventScanRepo.getInventoryWithpallets(
      workListId
    );

    const dataProductLocation = arr.map((item) => item.product_location);

    function flatten(arr: any[]) {
      return arr.reduce((pre, cur) => {
        return pre.concat(Array.isArray(cur) ? flatten(cur) : cur);
      }, []);
    }

    const arrProductLocation = flatten(dataProductLocation);

    let arrPalletRecount = [];

    for (const item1 of arrProductLocation) {
      const item2 = filterPallet.find(
        (item) =>
          item.SKU === item1.SKU_product &&
          item.location.trim() === item1.Loc_Barcodes.trim()
      );

      const findPallet: any = await inventScanRepo.findScanExists(
        workListId,
        item1.SKU_product,
        item1.Loc_Barcodes
      );

      const totalQuantityRecount = findPallet?.inventory_pallet.reduce(
        (acc, val) => acc + val.quantity,
        0
      );

      let isStatus;

      if (item1.Quantity === totalQuantityRecount) {
        const updateStatus = await inventScanRepo.updateStatusComplete(
          workListId,
          item1.SKU_product,
          item1.Loc_Barcodes
        );

        const findPallet: any = await inventScanRepo.findScanExists(
          workListId,
          item1.SKU_product,
          item1.Loc_Barcodes
        );

        isStatus = findPallet;
      } else {
        const updateStatus = await inventScanRepo.updateStatusWorking(
          workListId,
          item1.SKU_product,
          item1.Loc_Barcodes
        );

        const findPallet: any = await inventScanRepo.findScanExists(
          workListId,
          item1.SKU_product,
          item1.Loc_Barcodes
        );

        isStatus = findPallet;
      }

      if (item2) {
        const CountLoc = item2.inventory_pallet.reduce(
          (acc, pallet) => acc + pallet.quantity,
          0
        );

        arrPalletRecount.push({
          SKU_product: item1.SKU_product,
          Loc_Barcodes: item1.Loc_Barcodes,
          Quantity: item1.Quantity,
          isActive: isStatus?.status === "complete" ? "complete" : "working",
          CountLoc,
        });
      } else {
        arrPalletRecount.push({
          SKU_product: item1.SKU_product,
          Loc_Barcodes: item1.Loc_Barcodes,
          Quantity: item1.Quantity,
          isActive: isStatus?.status === "complete" ? "complete" : "working",
          CountLoc: 0,
        });
      }
    }
    // arrProductLocation.forEach(async (item1) => {
    //   const item2 = filterPallet.find(
    //     (item) =>
    //       item.SKU === item1.SKU_product &&
    //       item.location.trim() === item1.Loc_Barcodes.trim()
    //   );

    //   const findPallet: any = await inventScanRepo.findScanExists(
    //     workListId,
    //     item1.SKU_product,
    //     item1.Loc_Barcodes
    //   );

    //   const totalQuantityRecount = findPallet?.inventory_pallet.reduce(
    //     (acc, val) => acc + val.quantity,
    //     0
    //   );

    //   let isStatus;

    //   if (item1.Quantity === totalQuantityRecount) {
    //     const updateStatus = await inventScanRepo.updateStatusComplete(
    //       workListId,
    //       item1.SKU_product,
    //       item1.Loc_Barcodes
    //     );

    //     const findPallet: any = await inventScanRepo.findScanExists(
    //       workListId,
    //       item1.SKU_product,
    //       item1.Loc_Barcodes
    //     );

    //     isStatus = findPallet;
    //   } else {
    //     const updateStatus = await inventScanRepo.updateStatusWorking(
    //       workListId,
    //       item1.SKU_product,
    //       item1.Loc_Barcodes
    //     );

    //     const findPallet: any = await inventScanRepo.findScanExists(
    //       workListId,
    //       item1.SKU_product,
    //       item1.Loc_Barcodes
    //     );

    //     isStatus = findPallet;
    //   }

    //   if (item2) {
    //     const CountLoc = item2.inventory_pallet.reduce(
    //       (acc, pallet) => acc + pallet.quantity,
    //       0
    //     );

    //     arrPalletRecount.push({
    //       SKU_product: item1.SKU_product,
    //       Loc_Barcodes: item1.Loc_Barcodes,
    //       Quantity: item1.Quantity,
    //       isActive: isStatus?.status === "complete" ? "complete" : "working",
    //       CountLoc,
    //     });

    //     console.log("arrPalletRecount", arrPalletRecount);
    //   } else {
    //     arrPalletRecount.push({
    //       SKU_product: item1.SKU_product,
    //       Loc_Barcodes: item1.Loc_Barcodes,
    //       Quantity: item1.Quantity,
    //       // isActive: isStatus?.status === "complete" ? "complete" : "working",
    //       CountLoc: 0,
    //     });
    //   }
    // });

    let recountDetail = [];
    let count = 0;
    let hash = {};

    for (const k of arr) {
      const data = {
        id: k.id,
        SKU_product: k.SKU_product,
        isActive: k.status,
        QBQty: k.QBQty,
        workListDetailId: k.workListDetailId,
        Qty_from_app: k.Qty_from_app,
        Counted_Qty: k.Counted_Qty,
        Quantity: k.product_location.reduce(
          (acc: any, val: { Quantity: any }) => acc + val.Quantity,
          0
        ),
        product_location: [],
      };

      for (const l of arrPalletRecount) {
        if (k.SKU_product === l.SKU_product) {
          const filterRecount = recountDetail.filter(
            (item) => item.SKU_product === k.SKU_product
          );

          if (filterRecount.length === 0) {
            data.product_location = data.product_location.concat(l);

            if (hash[l.Loc_Barcodes.trim()] !== l.Loc_Barcodes.trim()) {
              hash[l.Loc_Barcodes.trim()] = l.Loc_Barcodes.trim();
              recountDetail = recountDetail.concat(data);
            }
            count++;
          } else {
            data.product_location = data.product_location.concat(l);
          }
        } else {
        }
      }
    }

    // check recount status complete
    const getInventoryScanPallet: any =
      await inventScanRepo.getInventoryWithpallets(workListId);

    const checkStatusComplete = getInventoryScanPallet.every(
      (item) => item.status === "complete"
    );

    if (checkStatusComplete === true) {
      const arr = [];
      for (const i of recountDetail) {
        const item2 = getInventoryScanPallet.find(
          (item) => item.SKU === i.SKU_product
        );

        if (!item2) {
          arr.push({
            id: i.Id,
            SKU_product: i.SKU_product,
            QBQty: i.QBQty,
            Qty_from_app: i.Qty_from_app,
            Counted_Qty: i.Counted_Qty,
            Quantity: i.Quantity,
            product_location: i.product_location,
          });
        } else {
        }
      }
      res.status(200).send({ status: "success", data: arr });
    } else {
      if (recountDetail.length > 0) {
        res.status(200).send({ status: "success", data: recountDetail });
      } else {
        res.status(400).send({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const inventoryPallet = async (req: Request, res: Response) => {
  try {
    const sku = req.body.sku;
    const workListDetailId = req.body.workListDetailId;
    const workListId = req.body.workListId;

    const getInventoryPalletWorkListDetail =
      await work_list_detailRepo.inventoryPallet(
        workListId,
        workListDetailId,
        sku
      );

    if (getInventoryPalletWorkListDetail) {
      res
        .status(200)
        .send({ status: "success", data: getInventoryPalletWorkListDetail });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editInventoryPallet = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const workListDetailId = req.body.workListDetailId;
    const sku = req.body.sku;
    const palletNumber = req.body.pallet_number;
    const palletQuantity = req.body.pallet_quantity;
    const location = req.body.location;
    const userId = req.body.user._id;

    const checkInventoryScanExists: any = await inventScanRepo.findScanExists(
      workListId,
      sku,
      location
    );

    let scanner;

    if (!checkInventoryScanExists) {
      const newLocal = {
        SKU: sku,
        location,
        quantity: palletQuantity,
        workListId,
      };
      const data = newLocal;

      const createInventScan = await inventScanRepo.create(data, userId);

      const checkInventoryScanExists: any = await inventScanRepo.findScanExists(
        workListId,
        sku,
        location
      );

      scanner = checkInventoryScanExists;
    } else {
      scanner = checkInventoryScanExists;
    }

    console.log("scanner", scanner);

    const filterPallet = scanner.inventory_pallet.filter(
      (item) => item.pallet_number === palletNumber
    );

    // check pallet number exists
    if (filterPallet.length > 0) {
      const updateQuantityPallet =
        await inventoryPalletRepo.updateQuantityInventoryPallet(
          filterPallet[0].id,
          palletQuantity
        );

      // const findAllInventorypallet: any =
      //   await inventScanRepo.getInventoryWithpallet(workListId, sku);

      const checkInventoryScanExists: any = await inventScanRepo.findScanExists(
        workListId,
        sku,
        location
      );

      const totalQuantityInventoryScan =
        checkInventoryScanExists.inventory_pallet.reduce(
          (acc, val) => acc + val.quantity,
          0
        );

      const updateQuantityInventoryScan = await inventScanRepo.upadateQuantity(
        checkInventoryScanExists.id,
        sku,
        totalQuantityInventoryScan
      );

      const updateInventScan = updateQuantity(
        sku,
        workListId,
        workListDetailId
      );
    } else {
      const data = {
        pallet: palletNumber,
        workListDetailId,
        workListId,
        quantity: palletQuantity,
        SKU: sku,
        inventoryPallet: scanner.id,
      };

      const editQuantityPallet = await inventoryPalletRepo.createNewPallet(
        data
      );

      // const findAllInventorypallet: any =
      //   await inventScanRepo.getInventoryWithpallet(workListId, sku);
      const checkInventoryScanExists: any = await inventScanRepo.findScanExists(
        workListId,
        sku,
        location
      );

      const totalQuantityInventoryScan =
        checkInventoryScanExists.inventory_pallet.reduce(
          (acc, val) => acc + val.quantity,
          0
        );

      const updateQuantityInventoryScan = await inventScanRepo.upadateQuantity(
        checkInventoryScanExists.id,
        sku,
        totalQuantityInventoryScan
      );

      const updateInventScan = updateQuantity(
        sku,
        workListId,
        workListDetailId
      );
    }

    // create active
    const dataActive = {
      sku,
      location,
    };
    const createActive = await activeRepo.createActiveEditPalletAdminAdd(
      userId,
      dataActive
    );

    // create active pallet
    const dataPalletedit = {
      pallet_number: palletNumber,
      quantity: palletQuantity,
      active_id: createActive.id,
    };
    const createActivePalletAdd = await activePalletRepo.createActiveAdd(
      dataPalletedit
    );

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deletePallet = async (req: Request, res: Response) => {
  try {
    const inventoryPalletId = req.body.inventoryPalletId;
    const workListId = req.body.workListId;
    const workListDetailId = req.body.workListDetailId;
    const sku = req.body.sku;
    const location = req.body.location;
    const userId = req.body.user_id;

    const findPalletWithId = await inventoryPalletRepo.findByInventoryPalletId(
      inventoryPalletId
    );

    // create active
    const dataActive = {
      sku,
      location,
    };
    const createActive = await activeRepo.createActiveEditPalletAdminDelete(
      userId,
      dataActive
    );

    // create active pallet
    const dataPalletDelete = {
      pallet_number: findPalletWithId.pallet_number,
      // quantity: i.quantity,
      active_id: createActive.id,
    };
    const createActivePalletAdd = await activePalletRepo.createActiveAdd(
      dataPalletDelete
    );

    const deleteInventoryPallet = await inventoryPalletRepo.deletePalletWithId(
      inventoryPalletId
    );

    const findPalletWithInventoryScan: any =
      await inventScanRepo.findScanExists(workListId, sku, location);

    const totalQuantity = findPalletWithInventoryScan.inventory_pallet.reduce(
      (acc: any, val: { quantity: any }) => acc + val.quantity,
      0
    );

    const updateQuantityInventoryScan = await inventScanRepo.upadateQuantity(
      findPalletWithInventoryScan.id,
      sku,
      totalQuantity
    );

    const updateInventScan = updateQuantity(sku, workListId, workListDetailId);

    if (
      deleteInventoryPallet &&
      updateQuantityInventoryScan &&
      updateInventScan
    ) {
      res.status(200).send({ status: true });
    } else {
      res.status(400).send({ status: false });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllPallet = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const sku = req.body.sku;
    const location = req.body.location;

    const findPalletWithInventoryScan: any =
      await inventScanRepo.findScanExists(workListId, sku, location);

    if (findPalletWithInventoryScan) {
      res.status(200).send({ status: true, data: findPalletWithInventoryScan });
    } else {
      res.status(404).send({ status: false });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const addMorePallet = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const workListDetailId = req.body.workListDetailId;
    const palletNumber = req.body.palletNumber;
    const palletQuantity = req.body.palletQuantity;
    const sku = req.body.sku;
    const userId = req.body.user._id;
    const location = req.body.location;

    const checkInventoryScanExists: any = await inventScanRepo.findScanExists(
      workListId,
      sku,
      location
    );

    let scanner: any;

    if (!checkInventoryScanExists) {
      const data = {
        SKU: sku,
        location,
        quantity: palletQuantity,
        workListId,
      };

      const createInventScan = await inventScanRepo.create(data, userId);

      scanner = createInventScan;
    } else {
      scanner = checkInventoryScanExists;
    }

    const data = {
      pallet: palletNumber,
      workListDetailId,
      workListId,
      quantity: palletQuantity,
      SKU: sku,
      inventoryPallet: scanner.id,
    };

    const createPallet = await inventoryPalletRepo.createNewPallet(data);

    const findAllInventorypallet: any =
      await inventScanRepo.getInventoryWithpallet(workListId, sku);

    const totalQuantityInventoryScan =
      findAllInventorypallet.inventory_pallet.reduce(
        (acc: any, val: { quantity: any }) => acc + val.quantity,
        0
      );

    const updateQuantityInventoryScan = await inventScanRepo.upadateQuantity(
      findAllInventorypallet.id,
      sku,
      totalQuantityInventoryScan
    );

    const updateInventScan = updateQuantity(sku, workListId, workListDetailId);

    if (createPallet) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const inventoryPalletStatus = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const sku = req.body.sku;
    const location = req.body.location;
    const status = req.body.status;

    const updateStatus = await inventScanRepo.updateStatus(
      workListId,
      sku,
      location,
      status
    );

    if (updateStatus) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editPalletAdmin = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const workListDetailId = req.body.workListDetailId;
    const sku = req.body.sku;
    const arrPalletAdd = req.body.palletAdd;
    const arrPalletDelete = req.body.palletDelete;
    const location = req.body.location;
    const userId = req.body.user._id;

    const checkInventoryScanExists: any = await inventScanRepo.findScanExists(
      workListId,
      sku,
      location
    );

    let scanner;

    if (!checkInventoryScanExists) {
      const newLocal = {
        SKU: sku,
        location,
        quantity: 0,
        workListId,
      };
      const data = newLocal;

      const createInventScan = await inventScanRepo.createScanAdmin(
        data,
        userId
      );

      scanner = createInventScan;
    } else {
      scanner = checkInventoryScanExists;
    }

    // check pallet exists
    const checkInventoryPalletExists: any = await inventScanRepo.findScanExists(
      workListId,
      sku,
      location
    );

    if (arrPalletDelete.length > 0) {
      for (const i of arrPalletDelete) {
        const deletePallet = await inventoryPalletRepo.deletePalletWithId(
          i.pallet_id
        );

        const checkInventoryPalletExists: any =
          await inventScanRepo.findScanExists(workListId, sku, location);

        const totalQuantityScan =
          checkInventoryPalletExists.inventory_pallet.reduce(
            (acc, val) => acc + val.quantity,
            0
          );

        const updateQuantityScan = await inventScanRepo.upadateQuantity(
          checkInventoryPalletExists.id,
          sku,
          totalQuantityScan
        );

        // update work list detail
        const updateQuantityWorkListDetail = updateQuantity(
          sku,
          workListId,
          workListDetailId
        );
      }
    }

    if (arrPalletAdd.length > 0) {
      const inventoryPalletData = checkInventoryPalletExists.inventory_pallet;

      if (inventoryPalletData.length > 0) {
        for (const i of arrPalletAdd) {
          const checkPalletExists = await inventoryPalletRepo.findPalletWithId(
            i.pallet_number,
            workListId,
            workListDetailId,
            scanner.id
          );

          if (checkPalletExists) {
            const updateQuantityPallet =
              await inventoryPalletRepo.updateQuantityInventoryPallet(
                checkPalletExists.id,
                i.quantity
              );

            // get all pallet with scan
            const checkInventoryPalletExists: any =
              await inventScanRepo.findScanExists(workListId, sku, location);

            const totalQuantityScan =
              checkInventoryPalletExists.inventory_pallet.reduce(
                (acc, val) => acc + val.quantity,
                0
              );

            const updateQuantityScan = await inventScanRepo.upadateQuantity(
              checkInventoryPalletExists.id,
              sku,
              totalQuantityScan
            );

            // update work list detail
            const updateQuantityWorkListDetail = updateQuantity(
              sku,
              workListId,
              workListDetailId
            );
          } else {
            const data = {
              pallet: i.pallet_number,
              workListDetailId,
              workListId,
              quantity: i.quantity,
              SKU: sku,
              inventoryPallet: scanner.id,
            };

            const createPallet = await inventoryPalletRepo.createNewPallet(
              data
            );

            // get all pallet with scan
            const checkInventoryPalletExists: any =
              await inventScanRepo.findScanExists(workListId, sku, location);

            const totalQuantityScan =
              checkInventoryPalletExists.inventory_pallet.reduce(
                (acc, val) => acc + val.quantity,
                0
              );

            const updateQuantityScan = await inventScanRepo.upadateQuantity(
              checkInventoryPalletExists.id,
              sku,
              totalQuantityScan
            );

            // update work list detail
            const updateQuantityWorkListDetail = updateQuantity(
              sku,
              workListId,
              workListDetailId
            );
          }
        }
      } else {
        for (const k of arrPalletAdd) {
          const data = {
            pallet: k.pallet_number,
            workListDetailId,
            workListId,
            quantity: k.quantity,
            SKU: sku,
            inventoryPallet: scanner.id,
          };

          const createPallet = await inventoryPalletRepo.createNewPallet(data);

          // get all pallet with scan
          const checkInventoryPalletExists: any =
            await inventScanRepo.findScanExists(workListId, sku, location);

          const totalQuantityScan =
            checkInventoryPalletExists.inventory_pallet.reduce(
              (acc, val) => acc + val.quantity,
              0
            );

          const updateQuantityScan = await inventScanRepo.upadateQuantity(
            checkInventoryPalletExists.id,
            sku,
            totalQuantityScan
          );

          // update work list detail
          const updateQuantityWorkListDetail = updateQuantity(
            sku,
            workListId,
            workListDetailId
          );
        }
      }
    }

    // create active add

    if (arrPalletAdd.length > 0) {
      const dataActive = {
        sku,
        location,
      };

      const createActive = await activeRepo.createActiveEditPalletAdminAdd(
        userId,
        dataActive
      );

      // create active pallet add
      for (const i of arrPalletAdd) {
        const dataPalletAdd = {
          pallet_number: i.pallet_number,
          quantity: i.quantity,
          active_id: createActive.id,
        };
        const createActivePalletAdd = await activePalletRepo.createActiveAdd(
          dataPalletAdd
        );
      }
    }

    if (arrPalletDelete.length > 0) {
      const dataActive = {
        sku,
        location,
      };

      const createActive = await activeRepo.createActiveEditPalletAdminDelete(
        userId,
        dataActive
      );

      // create active pallet delete
      for (const i of arrPalletDelete) {
        const dataPalletAdd = {
          pallet_number: i.pallet_number,
          // quantity: i.quantity,
          active_id: createActive.id,
        };
        const createActivePalletAdd = await activePalletRepo.createActiveAdd(
          dataPalletAdd
        );
      }
    }

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const applyNewCount = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const password = req.body.password;
    const userId = req.body.user._id;

    if (userId) {
      const findUserById = await userRepo.findById(userId);

      if (findUserById) {
        if (await common.comparePassword(findUserById.password, password)) {
          const checkWorkListExists: any = await work_listRepo.getWorkListSku(
            workListId
          );

          for (const i of checkWorkListExists.work_list_detail) {
            const findInventoryScanWithWorkLisId =
              await inventScanRepo.getInventWithSkuAndWorkListId(
                i.SKU,
                i.work_list_id
              );

            if (findInventoryScanWithWorkLisId.length > 0) {
              for (const j of findInventoryScanWithWorkLisId) {
                const findProductManagerment =
                  await productManagermentRepo.findProductWithBars(j.SKU);

                const findProductLocation =
                  await productLocationRepo.getPrductWithSKU(j.SKU, j.location);

                const updateQuantity =
                  await productLocationRepo.updateFromLocation(
                    findProductManagerment.id,
                    j.Quantity,
                    findProductLocation.id
                  );

                const findProductLocations =
                  await productLocationRepo.getAllQuantityInLocation(j.SKU);

                const totalQuantity = findProductLocations.reduce(
                  (acc, val) => acc + val.Quantity,
                  0
                );

                const updateQuantityInventoryCount =
                  await inventoryCountRepo.updateQuantity(
                    j.SKU,
                    workListId,
                    totalQuantity
                  );

                const updateQuantityInventoryCountApp =
                  await inventoryCountRepo.updateQuantityFromApp(
                    j.SKU,
                    workListId,
                    totalQuantity
                  );

                const updateQuantityWorkListDetailId =
                  await work_list_detailRepo.updateQuantitys(
                    workListId,
                    j.SKU,
                    totalQuantity
                  );

                const updateQuantityWorkListDetailIdApp =
                  await work_list_detailRepo.updateQtyFrom(
                    workListId,
                    j.SKU,
                    totalQuantity
                  );
              }
            }
          }
          res.status(200).send({ status: true });
        } else {
          return res
            .status(400)
            .send({ status: false, message: "Incorrect password" });
        }
      }
    } else {
      res.status(400).send({
        status: false,
        message: "You can apply new quantity only by admin",
      });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getProductsInLocation = async (req: Request, res: Response) => {
  try {
    const getProducts: any = await productManagermentRepo.allProductInventory();

    const dataInvent = [];

    for (const i of getProducts) {
      const qtyFromApp = i.product_location.reduce(
        (acc, val) => acc + val.Quantity,
        0
      );
      const data = {
        SKU: i.SKU_product,
        QBQty: 0,
        Qty_from_app: qtyFromApp,
        Counted_Qty: 0,
      };

      dataInvent.push(data);

      // const createInventoryCount = await inventoryCountRepo.createInventImport(
      //   data,
      //   qtyFromApp
      // );
    }

    // const getInventoryCount = await inventoryCountRepo.finAll();

    if (getProducts) {
      res.status(200).send({ status: "success", data: dataInvent });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
