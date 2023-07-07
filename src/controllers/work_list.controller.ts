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
import * as locationListRepo from "../repositories/location_list_managerment.repo";
import * as workerManagerRepo from "../repositories/worker_managerment.repo";
import * as productManagermentRepo from "../repositories/product_managerment.repo";
import * as locationManagerRepo from "../repositories/location_managerment.repo";
import * as productTransferRepo from "../repositories/product_transfer.repo";
import * as activeRepo from "../repositories/active.repo";
import * as workListPickingLTLRepo from "../repositories/work_list_pickingltl.repo";
import * as productLocationRepo from "../repositories/product_location.repo";
import * as workListDetailRepo from "../repositories/work_list_detail.repo";
import e from "cors";
import * as workListPickingLtl from "../repositories/work_list_pickingltl.repo";

initModels(sequelize);

export const createQR = async (req: Request, res: Response) => {
  try {
    const qr = req.body.qr;

    const checkQrLocation = await locationManagerRepo.getLocationWithLoc(qr);
    const checkQrSku = await productManagermentRepo.findProductWithBar(qr);

    let loc = "";
    let UPC = "";

    if (checkQrLocation) {
      // const qr_loc = [
      //   ...new Set(checkQrLocation.map((item) => item.Loc_Barcodes)),
      // ];

      loc = checkQrLocation.Loc_Barcodes;
    }

    if (checkQrSku) {
      // const qr_UPC = [...new Set(checkQrSku.map((item) => item.UPC))];

      UPC = checkQrSku.SKU_product;
    }

    if (loc || UPC) {
      res.status(200).send({ status: "success", QRCode: loc, BarCode: UPC });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const createQRFromTo = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const location = req.body.location;

    const checkLocationFrom: any = await work_listRepo.getQRLocationFrom(
      workListId,
      location
    );
    const checkLocationTo: any = await work_listRepo.getQRLocationTo(
      workListId,
      location
    );

    let from = "";
    let to = "";

    if (checkLocationFrom) {
      for (const i of checkLocationFrom) {
        const work_list_detailArr = i.work_list_detail.map(
          (item) => item.fromLocation
        );

        from = work_list_detailArr.toString();
      }
    }

    if (checkLocationTo) {
      for (const i of checkLocationTo) {
        const work_list_detailArr = i.work_list_detail.map(
          (item) => item.toLocation
        );

        to = work_list_detailArr.toString();
      }
    }

    if (from || to) {
      res.status(200).send({ status: "success", from: from, to: to });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

function flatten(arr) {
  return arr.reduce((pre, cur) => {
    return pre.concat(Array.isArray(cur) ? flatten(cur) : cur);
  }, []);
}

export const addWorkListReceiving = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const barCode = req.body.barCode;
    const location = req.body.location;
    const quantity = req.body.quantity;
    const workListId = req.body.workListId;
    // const Container = req.body.Container;

    // const createWorkListReceiving =
    //   await work_listRepo.createNewWorkListReceiving(userId);

    const checkProductWithBarcode: any = await work_listRepo.findSku();

    const work_list_detailArr = checkProductWithBarcode.map(
      (item) => item.work_list_detail
    );

    const arrData = flatten(work_list_detailArr);

    const filterData = arrData.filter((item) => {
      if (item.SKU === barCode) {
        return item;
      }
    });

    if (filterData.length < 0) {
      return res
        .status(400)
        .json({ status: "failed", message: "SKU not found!" });
    }

    const getQuantityProduct = await workListDetailRepo.getWorklistWithSku(
      barCode,
      workListId
    );

    if (
      getQuantityProduct.Quantity < quantity ||
      getQuantityProduct.quantity_transfer >= getQuantityProduct.Quantity
    ) {
      // const updateStatus = await work_list_detailRepo.updateStatus(
      //   getQuantityProduct.id
      // );
      return res.status(404).json({
        status: "failed",
        message: "Not enough products to add to stock!!!",
      });
    } else {
      const createProductWithBarCode =
        await productManagermentRepo.findProductWithBars(barCode);

      const checkLocation = await locationManagerRepo.getLocationWithLoc(
        location
      );

      // check size in location
      const checkSizeProductLocation =
        await productLocationRepo.findAllProductWithLoc(checkLocation.id);

      // const totalQuantity = checkSizeProductLocation.reduce(
      //   (acc, val) => acc + val.Quantity,
      //   0
      // );

      // const remainingAmount = checkLocation.limit_size - totalQuantity;

      const data = {
        sku_product: barCode,
        Quantity: quantity,
        UPC: createProductWithBarCode.UPC,
      };

      const arrLocation = {
        Loc_Barcodes: location,
        locationId: checkLocation.id,
      };

      // check product exist

      const checkProductExist = await productLocationRepo.getPrductWithSKUId(
        barCode,
        checkLocation.id
      );

      if (checkProductExist) {
        // update quantity in location

        const totalQuantity = checkProductExist.Quantity + quantity;

        const updateQuantity = await productLocationRepo.updateFromLocation(
          checkProductExist.product_managerment_id,
          totalQuantity,
          checkProductExist.id
        );
      } else {
        const createProductLocation = await productLocationRepo.create(
          arrLocation,
          data,
          createProductWithBarCode.id,
          createProductWithBarCode.Product_Name
        );
      }

      // update quantity transfer
      const totalTransfer = getQuantityProduct.quantity_transfer + quantity;

      // find location with workListDetail
      const findLocationWorkListDetail =
        await workListDetailRepo.getWorklistWithSku(barCode, workListId);

      // let arrLocationReceiving = [];
      // if (findLocationWorkListDetail.location === null) {
      //   arrLocationReceiving = [];
      // } else {
      //   arrLocationReceiving = findLocationWorkListDetail.location.split(",");
      // }

      // const aLR = arrLocationReceiving.concat(location);

      const updateQuantityAfterReceiving =
        await work_list_detailRepo.updateQuantityReceiving(
          getQuantityProduct.id,
          totalTransfer,
          location
        );

      const createActiveReceiving = await activeRepo.createActiveReceiving(
        userId,
        barCode,
        quantity,
        location,
        getQuantityProduct.id,
        workListId
      );

      if (createActiveReceiving) {
        res.status(200).send({ status: "success" });
      } else {
        res.status(400).send({ status: "failed" });
      }

      // update status
      // const getQuantityProducts = await workListDetailRepo.getWorklistWithSku(
      //   barCode,
      //   workListId
      // );

      // if (
      //   getQuantityProducts.Quantity === getQuantityProducts.quantity_transfer
      // ) {
      //   const updateStatus = await work_list_detailRepo.updateStatus(
      //     getQuantityProducts.id
      //   );
      // }
      // if (updateQuantityAfterReceiving && createActiveReceiving) {
      //   res.status(200).send({ status: "success" });
      // } else {
      //   res.status(400).send({ status: "failed" });
      // }

      // if (quantity > remainingAmount) {
      //   return res.status(400).json({
      //     status: "failed",
      //     message: "Insufficient stock!!!",
      //     totalAfter: remainingAmount,
      //   });
      // } else {
      //   const data = {
      //     sku_product: barCode,
      //     Quantity: quantity,
      //     UPC: createProductWithBarCode.UPC,
      //   };

      //   const arrLocation = {
      //     Loc_Barcodes: location,
      //     locationId: checkLocation.id,
      //   };

      //   // check product exist

      //   const checkProductExist = await productLocationRepo.getPrductWithSKUId(
      //     barCode,
      //     checkLocation.id
      //   );

      //   if (checkProductExist) {
      //     // update quantity in location

      //     const totalQuantity = checkProductExist.Quantity + quantity;

      //     const updateQuantity = await productLocationRepo.updateFromLocation(
      //       checkProductExist.product_managerment_id,
      //       totalQuantity,
      //       checkProductExist.id
      //     );
      //   } else {
      //     const createProductLocation = await productLocationRepo.create(
      //       arrLocation,
      //       data,
      //       createProductWithBarCode.id,
      //       createProductWithBarCode.Product_Name
      //     );
      //   }

      //   // update quantity transfer
      //   const totalTransfer = getQuantityProduct.quantity_transfer + quantity;

      //   const updateQuantityAfterReceiving =
      //     await work_list_detailRepo.updateQuantityReceiving(
      //       getQuantityProduct.id,
      //       totalTransfer,
      //       location
      //     );

      //   const createActiveReceiving = await activeRepo.createActiveReceiving(
      //     userId,
      //     barCode,
      //     quantity,
      //     location,
      //     getQuantityProduct.id,
      //     workListId
      //   );

      //   // update status
      //   const getQuantityProducts = await workListDetailRepo.getWorklistWithSku(
      //     barCode,
      //     workListId
      //   );

      //   if (
      //     getQuantityProducts.Quantity === getQuantityProducts.quantity_transfer
      //   ) {
      //     const updateStatus = await work_list_detailRepo.updateStatus(
      //       getQuantityProducts.id
      //     );
      //   }
      //   if (updateQuantityAfterReceiving && createActiveReceiving) {
      //     res.status(200).send({ status: "success" });
      //   } else {
      //     res.status(400).send({ status: "failed" });
      //   }
      // }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const searchReceiving = async (req: Request, res: Response) => {
  try {
    const containerNumber = req.body.containerNumber;

    const searchType = await work_listRepo.searchReceiving(containerNumber);

    if (searchType) {
      res.status(200).send({ status: "success", data: searchType });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const findAllReceiving = async (req: Request, res: Response) => {
  try {
    // const type = req.body.type;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    if (startDate === "" && endDate === "") {
      const getAll: any = await work_listRepo.getAllReceiving();

      for (const i of getAll) {
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

      const getAlls: any = await work_listRepo.getAllReceiving();

      if (getAlls) {
        res.status(200).send({ status: "success", data: getAlls });
      } else {
        res.status(400).send({ status: "failed" });
      }
    } else {
      const data = {
        startDate,
        endDate,
      };

      const get = await work_listRepo.getReceivingWithDate(data);

      if (get) {
        res.status(200).send({ status: "success", data: get });
      } else {
        res.status(400).send({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const findAllReceivingDash = async (req: Request, res: Response) => {
  try {
    const getAll: any = await work_listRepo.getAllReceiving();

    for (const i of getAll) {
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

    const getAlls: any = await work_listRepo.getAllReceiving();

    if (getAlls) {
      res.status(200).send({ status: "success", data: getAlls });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const findAllReceivingDashAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const getAll: any = await work_listRepo.getAllReceiving();

    if (getAll) {
      res.status(200).send({ status: "success", data: getAll });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const findAllReceivingWithDate = async (req: Request, res: Response) => {
  try {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    const data = {
      startDate,
      endDate,
    };

    const get = await work_listRepo.getReceivingWithDate(data);

    if (get) {
      res.status(200).send({ status: "success", data: get });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getIdReceiving = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;

    const get: any = await work_listRepo.findById(workListId);

    const work_list_detailArr = get.map((item) => item.work_list_detail);

    const flatArr = flatten(work_list_detailArr);

    // for (const i of flatArr) {
    //   if (i.quantity_transfer >= i.Quantity) {
    //     const updateStatus = await workListDetailRepo.updateStatus(i.id);
    //   }
    // }

    if (get) {
      res.status(200).send({ status: "success", data: get });
    } else {
      res.status(400).send({ status: "falied" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const importFileReceiving = async (req, res) => {
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

    // const workerManager = parsedData.map((item) => item.Worke_Management);
    const containerNumbers = [];
    for (let data of parsedData) {
      if (containerNumbers.indexOf(data["Container Number"]) < 0) {
        containerNumbers.push(data["Container Number"]);
      }
    }

    const dataToCreate = [];
    for (let cNum of containerNumbers) {
      const tempData = [];
      for (let data of parsedData) {
        if (data["Container Number"] === cNum) {
          tempData.push(data);
        }
      }
      dataToCreate.push({
        containerNumber: cNum,
        data: tempData,
      });
    }

    if (dataToCreate.length > 0) {
      for (const i of dataToCreate) {
        // const userId = await workerManagerRepo.getIdUser(i.Worke_Management);

        const createWorkListReceiving = await work_listRepo.importWorkList(
          userId,
          i.containerNumber
        );

        for (let detail of i.data) {
          const createWorkListDetail =
            await work_list_detailRepo.createNewWorkListDetailReceiving(
              detail,
              createWorkListReceiving.id
            );

          // create active history
          const createActiveTransfering =
            await activeRepo.createActiveRecevingImport(
              userId,
              detail.SKU,
              detail.Quantity
            );

          // const data = {
          //   sku_product: detail.SKU,
          //   workListDetailId: createWorkListDetail.id,
          // };

          // const createNewProduct = productManagermentRepo.createProduct(data);
        }

        // const Sku = i.SKU;

        // const convertString = Sku.toString();

        // const findSku = await locationListRepo.findBySKU(convertString);

        // const totalQuantity = findSku.Quantity - i.Quantity;

        // const updateLocationList = await locationListRepo.updateQuantity(
        //   convertString,
        //   totalQuantity
        // );
      }

      return res.status(200).send({ status: "success" });
    } else {
      return res
        .status(200)
        .send({ status: "success", message: "no data added" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// Picking

export const addWorkListPicking = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const barCode = req.body.barCode;
    const location = req.body.location;
    const quantity = req.body.quantity;
    const workListId = req.body.workListId;

    // check exit
    const getLoc = await locationManagerRepo.findWithBarcode(location, barCode);

    const checkProductExit = await productLocationRepo.getPrductWithSKU(
      barCode,
      location
    );

    const workListDetailId = await workListDetailRepo.getWorklistWithSku(
      barCode,
      workListId
    );

    const getOriginalQuantity =
      await productLocationRepo.updateQuantityOriginal(
        barCode,
        location,
        checkProductExit.Quantity
      );

    if (checkProductExit && workListDetailId) {
      // update quantity
      const quantityAfterPicking = checkProductExit.Quantity - quantity;

      if (quantity > workListDetailId.Quantity) {
        return res.status(400).json({
          status: "failed",
          message: "The quantity taken is not correct!!!",
        });
      } else {
        const updateQuantity = await productLocationRepo.updateFromLocation(
          checkProductExit.product_managerment_id,
          quantityAfterPicking,
          checkProductExit.id
        );

        if (workListDetailId.quantity_transfer > 0) {
          const quantityAfterPicking =
            workListDetailId.quantity_transfer + quantity;

          // update quantity_transfer work_list_detail
          const updateQuantityTransfer =
            await workListDetailRepo.updateQuantityPicking(
              workListDetailId.id,
              quantityAfterPicking,
              location
            );
        } else {
          // update quantity_transfer work_list_detail
          const updateQuantityTransfer =
            await workListDetailRepo.updateQuantityPicking(
              workListDetailId.id,
              quantity,
              location
            );
        }

        // create active
        const createActive = await activeRepo.createActivePicking(
          userId,
          barCode,
          quantity,
          location,
          workListDetailId.id,
          workListId
        );

        // update status
        const getWorkListDetail =
          await workListDetailRepo.getWorkListPickingWithSku(
            workListDetailId.id
          );

        if (
          getWorkListDetail.Quantity === getWorkListDetail.quantity_transfer
        ) {
          const updateStatus = await workListDetailRepo.updateStatus(
            workListDetailId.id
          );
        }
      }

      res.status(200).send({ status: "success" });
    } else {
      res
        .status(400)
        .json({ status: "failed", message: "Product not found!!!" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const findAllPicking = async (req: Request, res: Response) => {
  try {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    if (startDate === "" && endDate === "") {
      const findAll: any = await work_listRepo.getAllPicking();

      for (const i of findAll) {
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

      const findAlls: any = await work_listRepo.getAllPicking();

      if (findAlls) {
        res.status(200).send({ status: "success", data: findAlls });
      } else {
        res.status(400).send({ status: "failed" });
      }
    } else {
      const data = {
        startDate,
        endDate,
      };

      const get = await work_listRepo.getPickingWithDate(data);

      if (get) {
        res.status(200).send({ status: "success", data: get });
      } else {
        res.status(400).send({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const findAllPickingDash = async (req: Request, res: Response) => {
  try {
    const findAll: any = await work_listRepo.getAllPicking();

    for (const i of findAll) {
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

    const findAlls: any = await work_listRepo.getAllPicking();

    if (findAlls) {
      res.status(200).send({ status: "success", data: findAlls });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const findAllPickingDashAdmin = async (req: Request, res: Response) => {
  try {
    const findAll: any = await work_listRepo.getAllPicking();

    if (findAll) {
      res.status(200).send({ status: "success", data: findAll });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const findAllPickingWithDate = async (req: Request, res: Response) => {
  try {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    const data = {
      startDate,
      endDate,
    };

    const get = await work_listRepo.getPickingWithDate(data);

    if (get) {
      res.status(200).send({ status: "success", data: get });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getIdPicking = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;

    const get = await work_listRepo.findByIdPicking(workListId);

    if (get) {
      res.status(200).send({ status: "success", data: get });
    } else {
      res.status(400).send({ status: "falied" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const searchPicking = async (req: Request, res: Response) => {
  try {
    const containerNumber = req.body.containerNumber;

    const searchType = await work_listRepo.searchPicking(containerNumber);

    if (searchType) {
      res.status(200).send({ status: "success", data: searchType });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const importFilePickingGround = async (req, res) => {
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
      let worklistId = "";
      for (let i in parsedData[0]) {
        if (i !== "Work List ID") {
          worklistId = i;
          break;
        }
      }
      const createWorkListReceiving = await work_listRepo.importWorkListPicking(
        userId,
        worklistId
      );
      for (let i = 1; i < parsedData.length; i++) {
        const createWorkListDetail =
          await work_list_detailRepo.createNewWorkListDetailPicking(
            parsedData[i],
            createWorkListReceiving.id,
            worklistId
          );

        // create active history
        const createActiveTransfering =
          await activeRepo.createActivePickingImport(
            userId,
            parsedData[i]["Work List ID"],
            parsedData[i][worklistId]
          );
        // const Sku = i.SKU;

        // const convertString = Sku.toString();

        // const findSku = await locationListRepo.findBySKU(convertString);

        // const totalQuantity = findSku.Quantity + i.Quantity;

        // console.log("totalQuantity", totalQuantity);

        // const updateLocationList = await locationListRepo.updateQuantity(
        //   convertString,
        //   totalQuantity
        // );
      }

      return res.status(200).send({ status: "success" });
    } else {
      return res
        .status(200)
        .send({ status: "success", message: "no data added" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const importFilePickingLTL = async (req, res) => {
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
      // create workList_picking_ltl
      const createWorkListPickingLtl = await workListPickingLTLRepo.create({
        name: Object.keys(parsedData[0])[0],
      });

      for (const i of parsedData) {
        const createWorkList =
          await work_listRepo.createImportWorkListPickingLTL(
            userId,
            i["PICK LIST LTL 1"],
            i.__EMPTY_1,
            i["Total Qty"],
            createWorkListPickingLtl.id
          );

        const arrData = Object.values(i);

        const slices = arrData.slice(4);

        let tempRight = [];
        let tempLeft = [];
        for (let i = 0; i <= slices.length - 1; i++) {
          if (i % 2 === 0) {
            tempRight.push(slices[i]);
          } else {
            tempLeft.push(slices[i]);
          }
        }
        let result = [];
        for (let i = 0; i <= tempRight.length - 1; i++) {
          let newObj = { SKU: tempRight[i], Qty: tempLeft[i] };
          result.push(newObj);
        }

        for (const i of result) {
          const createWorkListDetail =
            await work_list_detailRepo.createNewWorkListDetailPickingLTL(
              i,
              createWorkList.id
            );
        }
      }

      return res.status(200).send({ status: "success" });
    } else {
      return res
        .status(200)
        .send({ status: "success", message: "no data added" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// export const createNewTransfering = async (req: Request, res: Response) => {
//   try {
//     const userId = req.body.user._id;
//     const formLocationBarcode = req.body.formLocationBarcode;
//     const toLocationBarcode = req.body.toLocationBarcode;
//     const SKU = req.body.SKU;
//     const quantity = req.body.quantity;
//     const workListId = req.body.workListId;

//     const checkProductWithSku: any = await productLocationRepo.getPrductWithSKU(
//       SKU,
//       formLocationBarcode
//     );

//     // check product in work list detail

//     let checkWorkListDetail;

//     if (workListId === "") {
//       const checkWorkList = await workListDetailRepo.getWorklistWithSkuNull(
//         SKU,
//         formLocationBarcode,
//         toLocationBarcode
//       );
//       checkWorkListDetail = checkWorkList;
//     } else {
//       const checkWorkList = await workListDetailRepo.getWorklistWithSku(
//         SKU,
//         workListId
//       );
//       checkWorkListDetail = checkWorkList;
//     }

//     if (!checkWorkListDetail) {
//       return res
//         .status(400)
//         .send({ status: "failed", message: "Product not found to work!" });
//     }

//     if (!checkProductWithSku) {
//       return res
//         .status(400)
//         .send({ status: "failed", message: "Product not found!" });
//     }

//     const quantityOriginal = checkProductWithSku.Quantity;

//     // const transfer = await work_listRepo.createNewWorkListTransfering(userId);

//     const data = {
//       SKU: checkProductWithSku.SKU_product,
//       formLocationBarcode: formLocationBarcode,
//       toLocationBarcode: toLocationBarcode,
//       quantity: quantity,
//       productName: checkProductWithSku.product_name,
//     };

//     const totalAmountAfterMoving = quantityOriginal - quantity;

//     const createTransferProduct =
//       await productTransferRepo.createNewProductTransfer(
//         data,
//         checkProductWithSku.product_managerment_id,
//         totalAmountAfterMoving,
//         checkWorkListDetail.work_list_id,
//         quantityOriginal
//       );

//     // Quantity product from location after transfer

//     const updateQuantityForm = await productLocationRepo.updateFromLocation(
//       checkProductWithSku.product_managerment_id,
//       totalAmountAfterMoving,
//       checkProductWithSku.id
//     );

//     // Quantity product to location after transfer

//     const checkProductWithSkuTo: any =
//       await productLocationRepo.getPrductWithSKU(SKU, toLocationBarcode);

//     if (checkProductWithSkuTo === null) {
//       const productLocationData = {
//         sku_product: checkProductWithSku.SKU_product,
//         Quantity: quantity,
//         Container: checkProductWithSku.Container,
//       };

//       const arrLocation = {
//         Loc_Barcodes: toLocationBarcode,
//       };

//       const createProductLocation = await productLocationRepo.createProduct(
//         arrLocation,
//         productLocationData,
//         checkProductWithSku.product_managerment_id,
//         checkProductWithSku.product_name
//       );
//     } else {
//       const totalAmountAfterMoving = checkProductWithSkuTo.Quantity + quantity;

//       console.log("checkProductWithSkuTo", checkProductWithSkuTo);

//       const updateQuantityTo = await productLocationRepo.updateFromLocation(
//         checkProductWithSku.product_managerment_id,
//         totalAmountAfterMoving,
//         checkProductWithSkuTo.id
//       );
//     }

//     const getWorkListDetailId = await workListDetailRepo.getWorklistWithSku(
//       SKU,
//       workListId
//     );
//     const createActiveTransfering = await activeRepo.createActiveTransfering(
//       userId,
//       SKU,
//       quantity,
//       formLocationBarcode,
//       toLocationBarcode,
//       workListId,
//       getWorkListDetailId.id
//     );

//     // update status

//     const updateQuantity = await workListDetailRepo.updateQuantity(
//       checkWorkListDetail.id,
//       quantity
//     );

//     const checkWorkListDetails =
//       await workListDetailRepo.getWorklistWithSkuNull(
//         SKU,
//         formLocationBarcode,
//         toLocationBarcode
//       );

//     if (
//       checkWorkListDetails.Quantity === checkWorkListDetails.quantity_transfer
//     ) {
//       const updateStatus = await workListDetailRepo.updateStatus(
//         checkWorkListDetail.id
//       );
//     }

//     res
//       .status(200)
//       .send({ status: "success", data: checkWorkListDetails.work_list_id });
//   } catch (error) {
//     res.status(400).json({ message: (error as Error).message });
//   }
// };

export const createNewTransferings = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const formLocationBarcode = req.body.formLocationBarcode;
    const toLocationBarcode = req.body.toLocationBarcode;
    const SKU = req.body.SKU;
    const quantity = req.body.quantity;

    const checkProductWithSku: any = await productLocationRepo.getPrductWithSKU(
      SKU,
      formLocationBarcode
    );

    if (!checkProductWithSku) {
      return res
        .status(400)
        .send({ status: "failed", message: "Product not found!" });
    }

    const quantityOriginal = checkProductWithSku.Quantity;

    // const transfer = await work_listRepo.createNewWorkListTransfering(userId);

    const data = {
      SKU: checkProductWithSku.SKU_product,
      formLocationBarcode: formLocationBarcode,
      toLocationBarcode: toLocationBarcode,
      quantity: quantity,
      productName: checkProductWithSku.product_name,
    };

    const totalAmountAfterMoving = quantityOriginal - quantity;

    const createTransferProduct =
      await productTransferRepo.createNewProductTransfers(
        data,
        checkProductWithSku.product_managerment_id,
        totalAmountAfterMoving,
        quantityOriginal
      );

    // Quantity product from location after transfer

    const updateQuantityForm = await productLocationRepo.updateFromLocation(
      checkProductWithSku.product_managerment_id,
      totalAmountAfterMoving,
      checkProductWithSku.id
    );

    // Quantity product to location after transfer

    const checkProductWithSkuTo: any =
      await productLocationRepo.getPrductWithSKU(SKU, toLocationBarcode);

    if (checkProductWithSkuTo === null) {
      const productLocationData = {
        sku_product: checkProductWithSku.SKU_product,
        quantity: quantity,
        Container: checkProductWithSku.UPC,
      };

      //get location id
      const getLocationId = await locationManagerRepo.findWithBarcode(
        toLocationBarcode,
        SKU
      );

      const arrLocation = {
        Loc_Barcodes: toLocationBarcode,
        id: getLocationId.id,
      };

      const createProductLocation =
        await productLocationRepo.createProductEditPicking(
          arrLocation,
          productLocationData,
          checkProductWithSku.product_managerment_id,
          checkProductWithSku.product_name
        );
    } else {
      const totalAmountAfterMoving = checkProductWithSkuTo.Quantity + quantity;

      console.log("checkProductWithSkuTo", checkProductWithSkuTo);

      const updateQuantityTo = await productLocationRepo.updateFromLocation(
        checkProductWithSku.product_managerment_id,
        totalAmountAfterMoving,
        checkProductWithSkuTo.id
      );
    }

    const createActiveTransfering = await activeRepo.createActiveTransferings(
      userId,
      SKU,
      quantity,
      formLocationBarcode,
      toLocationBarcode
    );

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const showListTransfer = async (req: Request, res: Response) => {
  try {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    if (startDate === "" && endDate === "") {
      const getAll: any = await activeRepo.getTransferActive();

      // for (const i of getAll) {
      //   const checkStatusComplete = i.work_list_detail.every(
      //     (item) => item.status === "complete"
      //   );

      //   if (checkStatusComplete === true) {
      //     // update status
      //     const updateStatus = await work_listRepo.updateStatus(i.id);
      //   } else {
      //     const updateStatus = await work_listRepo.updateStatusWorking(i.id);
      //   }
      // }

      if (getAll) {
        res.status(200).send({ status: "success", data: getAll });
      } else {
        res.status(400).send({ status: "failed" });
      }
    } else {
      const data = {
        startDate,
        endDate,
      };

      const get = await activeRepo.getTransferActiveWithDate(data);

      if (get) {
        res.status(200).send({ status: "success", data: get });
      } else {
        res.status(400).send({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getTransferById = async (req: Request, res: Response) => {
  try {
    const transferId = req.body.transferId;

    const getId = await work_listRepo.getTransferById(transferId);

    if (getId) {
      res.status(200).send({ status: "success", data: getId });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const importFileTransfering = async (req, res) => {
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
        const createWorkList = await work_listRepo.importTransfering(
          userId,
          i["#"]
        );

        const createWorkListDetail =
          await workListDetailRepo.createNewWorkListDetailTransfer(
            i,
            createWorkList.id
          );
      }

      // for (const i of parsedData) {
      //   const checkProductWithSku: any =
      //     await productLocationRepo.getPrductWithSKU(i.SKU, i.FROM);

      //   if (checkProductWithSku === null) {
      //     return res
      //       .status(400)
      //       .send({ status: "failed", message: "product not found" });
      //   }

      //   const quantityOriginal = checkProductWithSku.Quantity;

      //   const transfer = await work_listRepo.createNewWorkListTransfering(
      //     userId
      //   );

      //   const data = {
      //     SKU: checkProductWithSku.SKU_product,
      //     formLocationBarcode: i.FROM,
      //     toLocationBarcode: i.TO,
      //     quantity: i.QTY,
      //     productName: checkProductWithSku.product_name,
      //   };
      //   const totalAmountAfterMoving = quantityOriginal - i.QTY;

      //   const createTransferProduct =
      //     await productTransferRepo.createNewProductTransfer(
      //       data,
      //       checkProductWithSku.product_managerment_id,
      //       totalAmountAfterMoving,
      //       transfer.id,
      //       quantityOriginal
      //     );

      //   // Quantity product from location after transfer

      //   const updateQuantityForm = await productLocationRepo.updateFromLocation(
      //     checkProductWithSku.product_managerment_id,
      //     totalAmountAfterMoving,
      //     checkProductWithSku.id
      //   );

      //   // Quantity product to location after transfer

      //   const checkProductWithSkuTo: any =
      //     await productLocationRepo.getPrductWithSKU(i.SKU, i.TO);

      //   if (checkProductWithSkuTo === null) {
      //     const productLocationData = {
      //       sku_product: checkProductWithSku.SKU_product,
      //       Quantity: i.QTY,
      //       Container: checkProductWithSku.Container,
      //     };

      //     const arrLocation = {
      //       Loc_Barcodes: i.TO,
      //     };

      //     const createProductLocation = await productLocationRepo.createProduct(
      //       arrLocation,
      //       productLocationData,
      //       checkProductWithSku.product_managerment_id,
      //       checkProductWithSku.product_name
      //     );
      //   } else {
      //     const totalAmountAfterMoving = checkProductWithSkuTo.Quantity + i.QTY;

      //     const updateQuantityTo = await productLocationRepo.updateFromLocation(
      //       checkProductWithSku.product_managerment_id,
      //       totalAmountAfterMoving,
      //       checkProductWithSkuTo.id
      //     );
      //   }

      //   const createActiveTransfering =
      //     await activeRepo.createActiveTransferingImport(
      //       userId,
      //       i.SKU,
      //       i.QTY,
      //       i.FROM,
      //       i.TO
      //     );
      // }

      return res.status(200).send({ status: "success" });
    } else {
      return res
        .status(200)
        .send({ status: "success", message: "no data added" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateTransfering = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const transferId = req.body.transferId;
    const formLocationBarcode = req.body.formLocationBarcode;
    const toLocationBarcode = req.body.toLocationBarcode;
    const SKU = req.body.SKU;
    const productName = req.body.product_name;
    const quantity = req.body.quantity;

    const getTransferId: any = await work_listRepo.getTransferById(transferId);

    if (getTransferId === null) {
      return res
        .status(400)
        .send({ status: "failed", message: "Transfering not found!" });
    }

    const createActiveTransfering = await activeRepo.updateActiveTransfering(
      userId,
      SKU,
      quantity,
      formLocationBarcode,
      toLocationBarcode
    );

    const locationFrom = getTransferId.product_transfer.map(
      (item) => item.From_Location_Barcodes
    );

    const locationTo = getTransferId.product_transfer.map(
      (item) => item.To_Location_Barcodes
    );

    // update product_transfer

    // productId
    const transferDetailProductId = getTransferId.product_transfer.map(
      (item) => item.product_Id
    );

    // workListId
    const transferDetailWorkListId = getTransferId.product_transfer.map(
      (item) => item.work_list_id
    );

    // product_transfer_id
    const transferDetailId = getTransferId.product_transfer.map(
      (item) => item.id
    );

    const data = {
      formLocationBarcode,
      toLocationBarcode,
      SKU,
      productName,
      quantity,
      productId: transferDetailProductId[0],
      workListId: transferDetailWorkListId[0],
      // quantityQriginal: transferDetailQuantity[0],
      transferDetailId,
    };

    const createTransferProduct =
      await productTransferRepo.updateProductTransfer(data);

    // find with location from
    const findLocationFrom = await productLocationRepo.getPrductWithSKU(
      SKU,
      formLocationBarcode
    );

    // quantity after transfer
    const transferDetailQuantity = getTransferId.product_transfer.map(
      (item) => item.Quantity_Transfer
    );

    const totalQuantity = findLocationFrom.Quantity + transferDetailQuantity[0];

    const updateLocationtionFrom = await productLocationRepo.updateFromLocation(
      transferDetailProductId[0],
      totalQuantity,
      findLocationFrom.id
    );

    // transfer again

    const findLocationFromAgain = await productLocationRepo.getPrductWithSKU(
      SKU,
      formLocationBarcode
    );
    const totalTransferUpdate = findLocationFromAgain.Quantity - quantity;

    const updateLocationtionFromAgain =
      await productLocationRepo.updateFromLocation(
        transferDetailProductId[0],
        totalTransferUpdate,
        findLocationFromAgain.id
      );

    // find with location to

    if (locationTo[0] === toLocationBarcode) {
      const findLocationTo = await productLocationRepo.getPrductWithSKU(
        SKU,
        toLocationBarcode
      );
      const totalQuantity = findLocationTo.Quantity + transferDetailQuantity[0];

      const updateLocationtionTo = await productLocationRepo.updateFromLocation(
        transferDetailProductId[0],
        totalQuantity,
        findLocationTo.id
      );

      const findLocationTo_ = await productLocationRepo.getPrductWithSKU(
        SKU,
        toLocationBarcode
      );

      const totalQuantityTrans = findLocationTo_.Quantity - quantity;

      const updateLocationtionTo_ =
        await productLocationRepo.updateFromLocation(
          transferDetailProductId[0],
          totalQuantityTrans,
          findLocationTo_.id
        );
    } else {
      // cap nhat lai to location cu
      const findLocationTo = await productLocationRepo.getPrductWithSKU(
        SKU,
        locationTo[0]
      );
      const totalQuantity = findLocationTo.Quantity + transferDetailQuantity[0];

      const updateLocationtionTo = await productLocationRepo.updateFromLocation(
        transferDetailProductId[0],
        totalQuantity,
        findLocationTo.id
      );

      // tao product location moi

      const arrLocation = {
        Loc_Barcodes: toLocationBarcode,
      };

      const productLocationData = {
        sku_product: SKU,
        Quantity: quantity,
        UPC: findLocationFrom.UPC,
      };
      const createProductLocation = await productLocationRepo.createProduct(
        arrLocation,
        productLocationData,
        findLocationFrom.product_managerment_id,
        findLocationFrom.product_name
      );
    }

    // update status
    const getTransferIds: any = await work_listRepo.getTransferById(transferId);

    if (
      getTransferIds.work_list_detail[0].Quantity ===
      getTransferIds.work_list_detail[0].quantity_transfer
    ) {
      // update work list detail
      const updateStatus = await workListDetailRepo.updateStatus(
        getTransferIds.work_list_detail[0].id
      );

      // update work list
      const updateWorkList = await work_listRepo.updateStatus(
        getTransferIds.id
      );
    } else {
      // update work list detail
      const updateStatus = await workListDetailRepo.updateStatusWorking(
        getTransferIds.work_list_detail[0].id
      );

      // update work list
      const updateWorkList = await work_listRepo.updateStatusWorking(
        getTransferIds.id
      );
    }

    res.status(200).send({ statsu: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// export const updateTransfering = async (req: Request, res: Response) => {
//   try {
//     const userId = req.body.user._id;
//     const workListId = req.body.workListId;
//     const quantity = req.body.quantity;
//     const workListDetailId = req.body.workListDetailId;

//     const getTransferId: any = await work_listRepo.getTransferById(workListId);

//     const getProductTransfer: any = await work_listRepo.getProductTransfer(
//       workListId
//     );

//     const getWorkListDetail = await workListDetailRepo.getWorkListDetailId(
//       workListDetailId
//     );

//     if (getTransferId === null) {
//       return res
//         .status(400)
//         .send({ status: "failed", message: "Transfering not found!" });
//     }

//     // get Product with from location
//     const getProductFrom = await productLocationRepo.getPrductWithSKU(
//       getTransferId.work_list_detail[0].SKU,
//       getTransferId.work_list_detail[0].fromLocation
//     );

//     // get Product with from location
//     const getProductTo = await productLocationRepo.getPrductWithSKU(
//       getTransferId.work_list_detail[0].SKU,
//       getTransferId.work_list_detail[0].toLocation
//     );

//     // get product transfer
//     // const getProductTransfer = await work_listRepo.findById()

//     if (quantity > getTransferId.work_list_detail[0].Quantity) {
//       return res.status(400).send({
//         status: "failed",
//         message: "The quantity transferring is not correct!!!",
//       });
//     }

//     // update work list detail
//     const totalQuantity =
//       getTransferId.work_list_detail[0].quantity_transfer + quantity;

//     const updateQuantity = await workListDetailRepo.updateQuantity(
//       workListDetailId,
//       quantity
//     );

//     // update quantity from
//     const totalQuantityFrom =
//       getProductTransfer[0].product_transfer[0].original_number - quantity;

//     const updateQuantityFrom = await productLocationRepo.updateFromLocation(
//       getProductFrom.product_managerment_id,
//       totalQuantityFrom,
//       getProductFrom.id
//     );

//     // update quantity to
//     const totalQuantityToOrigin =
//       getProductTo.Quantity - getWorkListDetail.quantity_transfer;

//     // get work list detail again
//     const getWorkListDetails = await workListDetailRepo.getWorkListDetailId(
//       workListDetailId
//     );

//     const totalQuantityTo =
//       totalQuantityToOrigin + getWorkListDetails.quantity_transfer;

//     const updateQuantityTo = await productLocationRepo.updateFromLocation(
//       getProductTo.product_managerment_id,
//       totalQuantityTo,
//       getProductTo.id
//     );

//     // create active
//     const create = await activeRepo.updateActiveTransfering(
//       userId,
//       getTransferId.work_list_detail[0].SKU,
//       quantity,
//       getTransferId.work_list_detail[0].fromLocation,
//       getTransferId.work_list_detail[0].toLocation,
//       workListId,
//       workListDetailId
//     );

//     // update status
//     const getTransferIds: any = await work_listRepo.getTransferById(workListId);

//     if (
//       getTransferIds.work_list_detail[0].Quantity ===
//       getTransferIds.work_list_detail[0].quantity_transfer
//     ) {
//       // update work list detail
//       const updateStatus = await workListDetailRepo.updateStatus(
//         getTransferIds.work_list_detail[0].id
//       );

//       // update work list
//       const updateWorkList = await work_listRepo.updateStatus(
//         getTransferIds.id
//       );
//     } else {
//       // update work list detail
//       const updateStatus = await workListDetailRepo.updateStatusWorking(
//         getTransferIds.work_list_detail[0].id
//       );

//       // update work list
//       const updateWorkList = await work_listRepo.updateStatusWorking(
//         getTransferIds.id
//       );
//     }

//     res.status(200).send({ statsu: "success" });
//   } catch (error) {
//     res.status(400).json({ message: (error as Error).message });
//   }
// };

export const editWorkList = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;
    const conatinerNumber = req.body.containerNumber;
    const status = req.body.Status;

    // CAAU5433893

    const updateWorkList = await work_listRepo.updateContainerNumber(
      workListId,
      conatinerNumber
    );

    if (status === "complete") {
      const updateStatusComplete = await work_listRepo.updateStatus(workListId);

      if (updateStatusComplete) {
        res.status(200).send({ status: "success" });
      } else {
        res.status(400).send({ status: "failed" });
      }
    } else {
      const updateStatusWorking = await work_listRepo.updateStatusWorking(
        workListId
      );
      if (updateStatusWorking) {
        res.status(200).send({ status: "success" });
      } else {
        res.status(400).send({ status: "failed" });
      }
    }

    if (updateWorkList) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const filterPicking = async (req: Request, res: Response) => {
  try {
    const type = req.body.type;

    if (type === 1) {
      const findWorkListPicking = await work_listRepo.filterPickingWithType();

      if (findWorkListPicking) {
        res.status(200).send({ status: "success", data: findWorkListPicking });
      } else {
        res.status(400).send({ status: "failed" });
      }
    } else {
      const getAll = await workListPickingLTLRepo.findPickingLtl();

      if (getAll) {
        res.status(200).send({ status: "success", data: getAll });
      } else {
        res.status(400).send({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllSku = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;

    const getSku = await work_listRepo.getWorkListSku(workListId);

    if (getSku) {
      res.status(200).send({ status: "success", data: getSku });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const searchWorkListWithSKU = async (req: Request, res: Response) => {
  try {
    const search = req.body.search;

    const getSearchSKU = await productManagermentRepo.searchWithSku(search);
    const getSearchLoc = await locationManagerRepo.searchWithLoc(search);

    if (getSearchSKU) {
      res.status(200).send({ status: "success", data: getSearchSKU });
    }

    if (getSearchLoc) {
      res.status(200).send({ status: "success", data: getSearchLoc });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// edit quantity receiving

export const editReceiving = async (req: Request, res: Response) => {
  try {
    const workListDetailId = req.body.workListDetailId;
    const workListId = req.body.workListId;
    const quantity = req.body.quantity;
    const location = req.body.location;
    const userId = req.body.user._id;

    const checkWorkList: any = await work_listRepo.findById(workListId);

    let idWorkListDetai;

    for (const i of checkWorkList) {
      for (const j of i.work_list_detail) {
        if (j.id === workListDetailId) {
          idWorkListDetai = j.id;
        }
      }
    }

    const getAllLocation: any = await workListDetailRepo.getReceivingDetail(
      idWorkListDetai
    );

    const filterProductLocation = getAllLocation.active.filter(
      (item) => item.location === location
    );

    const checkProductLocation = await productLocationRepo.getPrductWithSKU(
      getAllLocation.SKU,
      filterProductLocation[0].location
    );

    // if decrease
    // if (quantity > checkProductLocation.Quantity) {
    //   // if increase

    //   // increase quantity product location

    //   const totalQuantityPL = checkProductLocation.Quantity + quantity;

    //   const updateQuantity = await productLocationRepo.updateFromLocation(
    //     checkProductLocation.product_managerment_id,
    //     quantity,
    //     checkProductLocation.id
    //   );

    //   // decrease quantity work list detail
    //   const totalQuantity = getAllLocation.quantity_transfer + quantity;

    //   const updateQuantityWorkListDetail =
    //     await workListDetailRepo.increaseQuantity(getAllLocation.id, quantity);
    // } else {
    //   // decrease quantity product location
    //   const updateQuantity = await productLocationRepo.updateFromLocation(
    //     checkProductLocation.product_managerment_id,
    //     quantity,
    //     checkProductLocation.id
    //   );

    //   // increase quantity work list detail
    //   const totalQuantity = getAllLocation.quantity_transfer - quantity;

    //   const updateQuantityWorkListDetail =
    //     await workListDetailRepo.increaseQuantity(getAllLocation.id, quantity);
    // }

    // if increase

    // increase quantity product location

    const totalQuantityPL = checkProductLocation.Quantity + quantity;

    const updateQuantity = await productLocationRepo.updateFromLocation(
      checkProductLocation.product_managerment_id,
      quantity,
      checkProductLocation.id
    );

    // decrease quantity work list detail
    // const totalQuantity = getAllLocation.quantity_transfer + quantity;

    // create active
    const create = await activeRepo.createActiveUpdateReceiving(
      userId,
      getAllLocation.SKU,
      quantity,
      location,
      getAllLocation.id,
      workListId
    );

    const getAllLocations: any = await workListDetailRepo.getReceivingDetail(
      idWorkListDetai
    );

    let arrActive = [];
    let l = 0;
    let map = new Map();

    for (const i of getAllLocations.active) {
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

    const totalQuantity = arrWorkListDetailActive.reduce(
      (acc, val) => acc + val.Quantity,
      0
    );

    const updateQuantityWorkListDetail =
      await workListDetailRepo.increaseQuantity(
        getAllLocation.id,
        totalQuantity
      );

    // update status
    // const getAllLocations = await workListDetailRepo.getReceivingDetail(
    //   idWorkListDetai
    // );

    // if (getAllLocations.Quantity === getAllLocations.quantity_transfer) {
    //   const updateStatus = await work_list_detailRepo.updateStatus(
    //     getAllLocations.id
    //   );
    // }

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editPicking = async (req: Request, res: Response) => {
  try {
    const workListDetailId = req.body.workListDetailId;
    const workListId = req.body.workListId;
    const quantity = req.body.quantity;
    const location = req.body.location;
    const userId = req.body.user._id;

    const checkWorkList: any = await work_listRepo.findByIdPicking(workListId);

    let idWorkListDetai;

    for (const i of checkWorkList) {
      for (const j of i.work_list_detail) {
        if (j.id === workListDetailId) {
          idWorkListDetai = j.id;
        }
      }
    }

    const getAllLocation: any = await workListDetailRepo.getReceivingDetail(
      idWorkListDetai
    );

    const checkProductLocation = await productLocationRepo.getPrductWithSKU(
      getAllLocation.SKU,
      location
    );

    if (quantity > getAllLocation.quantity_transfer) {
      const totalQuantity = checkProductLocation.Quantity_Transfer - quantity;

      // update quantity product location
      const updateQuantity = await productLocationRepo.updateFromLocation(
        checkProductLocation.product_managerment_id,
        totalQuantity,
        checkProductLocation.id
      );

      // update quantity transfer work list detail
      const updateQuantityWorkListDetail =
        await workListDetailRepo.increaseQuantity(getAllLocation.id, quantity);
    } else {
      const totalQuantity = checkProductLocation.Quantity + quantity;

      // update quantity product location
      const updateQuantity = await productLocationRepo.updateFromLocation(
        checkProductLocation.product_managerment_id,
        totalQuantity,
        checkProductLocation.id
      );

      // update quantity transfer work list detail
      const updateQuantityWorkListDetail =
        await workListDetailRepo.increaseQuantity(getAllLocation.id, quantity);
    }

    const getAllLocations: any = await workListDetailRepo.getReceivingDetail(
      idWorkListDetai
    );
    // update status
    if (getAllLocations.quantity_transfer === getAllLocations.Quantity) {
      const updateStatus = await workListDetailRepo.updateStatus(
        getAllLocations.id
      );
    } else {
      const updateStatus = await workListDetailRepo.updateStatusWorking(
        getAllLocations.id
      );
    }

    // create active
    const create = await activeRepo.createActiveUpdatePicking(
      userId,
      getAllLocation.SKU,
      quantity,
      location,
      getAllLocation.id,
      workListId
    );

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const ReceivingWorkerComplete = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;

    const updateStatusComplete = await work_listRepo.updateStatus(workListId);

    if (updateStatusComplete) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getPickingLtl = async (req: Request, res: Response) => {
  try {
    const workListId = req.body.workListId;

    const checkComplete: any =
      await work_listRepo.getWorkListWithWorkListPickingLTLID(workListId);

    let number;

    for (const i of checkComplete) {
      const checkStatusComplete = i.work_list_detail.every(
        (item) => item.status === "complete"
      );

      if (checkStatusComplete === true) {
        // update status
        number = 1;
        const updateStatus = await work_listRepo.updateStatusLTL(i.id, number);
      } else {
        number = 2;
        const updateStatus = await work_listRepo.updateStatusLTL(i.id, number);
      }
    }

    const updateStatusLTL: any =
      await workListPickingLTLRepo.getDetailPickingLtl(workListId);

    for (const i of updateStatusLTL) {
      const checkStatusLTLComplete = i.work_list.every(
        (item) => item.statusLTL === "complete"
      );

      if (checkStatusLTLComplete === true) {
        // update status
        number = 1;
        const updateStatus = await workListPickingLTLRepo.updateStatus(
          i.id,
          number
        );
      } else {
        number = 2;
        const updateStatus = await workListPickingLTLRepo.updateStatus(
          i.id,
          number
        );
      }
    }

    const getAll = await workListPickingLTLRepo.getDetailPickingLtl(workListId);

    if (getAll) {
      res.status(200).send({ status: "success", data: getAll });
    } else {
      res.status(400).send({ status: "falied" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
