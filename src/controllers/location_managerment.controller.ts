import { Request, Response } from "express";
import { initModels } from "../models/init-models";
import fs from "fs";
import path from "path";
import config from "../config/db.config";
import { sequelize } from "../models/index";
import * as common from "../utils/common.util";
import * as jwtUtil from "../utils/jwt.util";
import xlsx from "xlsx";
import * as location_managermentRepo from "../repositories/location_managerment.repo";
import { location_managermenrt } from "../models/location_managermenrt.model";
import * as location_list_managermentRepo from "../repositories/location_list_managerment.repo";
import * as productLocationRepo from "../repositories/product_location.repo";
import * as productManagermentRepo from "../repositories/product_managerment.repo";

initModels(sequelize);

export const addLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const loc_Barcode = req.body.loc_Barcode;
    const Position = req.body.position;

    const data = {
      loc_Barcode,
      Position,
    };

    const createNewLocation = await location_managermentRepo.createLocation(
      data
    );

    if (createNewLocation) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const createNewLocation = async (req: Request, res: Response) => {
  try {
    const locBarcodes = req.body.locBarcodes;
    const position = req.body.position;
    const skuProduct = req.body.skuProduct;
    const limit_size = req.body.limit_size;

    const checkLocationExists = await location_managermentRepo.findWithBarcode(
      locBarcodes,
      locBarcodes
    );

    let create;

    if (checkLocationExists) {
      create = checkLocationExists;
    } else {
      const data = {
        locBarcodes,
        position,
        limit_size,
      };

      const addLocation = await location_managermentRepo.createLocation(data);

      create = addLocation;
    }

    if (skuProduct.length > 0) {
      for (const i of skuProduct) {
        // const sku = i.SKU[0].SKU_product;

        const checkProductExists = await productLocationRepo.getPrductWithSKU(
          i.SKU[0].SKU_product,
          locBarcodes
        );

        if (checkProductExists) {
          const total = checkProductExists.Quantity + i.Quantity;

          const getProductId = await productManagermentRepo.findProductWithBars(
            i.SKU[0].SKU_product
          );

          const updateQtyProductLocation =
            await productLocationRepo.updateFromLocation(
              getProductId.id,
              total,
              checkProductExists.id
            );
        } else {
          const arrLocation = {
            Loc_Barcodes: locBarcodes,
            locationId: create.id,
          };

          const data = {
            sku_product: i.SKU[0].SKU_product,
            Quantity: i.Quantity,
          };

          const getProductId = await productManagermentRepo.findProductWithBars(
            i.SKU[0].SKU_product
          );

          const createNewPL = await productLocationRepo.create(
            arrLocation,
            data,
            getProductId.id,
            getProductId.Product_Name
          );
        }

        // res.status(200).json(checkProductExists);
        // return;

        // const checkContainer =
        //   await location_list_managermentRepo.getLocationListWithSku(sku);

        // const checkProductName = await productManagermentRepo.getProductWithSku(
        //   sku
        // );

        // const createProduct = await productLocationRepo.createLocation(
        //   i,
        //   locBarcodes,
        //   checkProductName.UPC,
        //   checkProductName.id,
        //   checkProductName.Product_Name,
        //   create.id
        // );

        // const updateLoc = checkContainer.Loc_Barcode;

        // const newString = updateLoc + "," + locBarcodes;

        // const quantity = checkContainer.Quantity + i.Quantity;

        // const data = {
        //   sku_product: newString.toString(),
        //   quantity,
        // };

        // const upateLocationList =
        //   await location_list_managermentRepo.updateProductLocationLoc(
        //     data,
        //     checkContainer.product_managerment_id
        //   );
      }
    }

    if (create) {
      res.status(200).send({ status: "success", data: create });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editLocation = async (req: Request, res: Response) => {
  try {
    const locationId = req.body.locationId;
    const locBarcodes = req.body.locBarcodes;
    const skuProductAdd = req.body.skuProductAdd;
    const skuProductRemove = req.body.skuProductRemove;
    const skuProductEdit = req.body.skuProductEdit;
    const limit = req.body.limit;
    const position = req.body.position;

    console.log("skuProductAdd", skuProductAdd);
    console.log("skuProductRemove", skuProductRemove);
    console.log("skuProductEdit", skuProductEdit);

    const data = {
      locBarcodes,
      position,
      limit,
    };

    const update = await location_managermentRepo.updateLocation(
      locationId,
      data
    );

    if (skuProductAdd.length > 0) {
      // get all total quantity in location
      const getId: any = await location_managermentRepo.getLocationId(
        locationId
      );

      const totalQuantity = getId.product_location.reduce(
        (acc, val) => acc + val.Quantity,
        0
      );

      console.log("skuProductAdd", skuProductAdd);

      for (const i of skuProductAdd) {
        for (const j of i.SKU) {
          const getProduct = await productManagermentRepo.getProductWithSku(
            j.SKU_product
          );

          const getLocation = await location_managermentRepo.getLocationWithLoc(
            locBarcodes
          );

          const arrLocation = {
            Loc_Barcodes: locBarcodes,
            locationId: locationId,
          };

          const data = {
            sku_product: j.SKU_product,
            Quantity: i.Quantity,
            UPC: getProduct.UPC,
          };

          const createProductLocation = await productLocationRepo.create(
            arrLocation,
            data,
            getProduct.id,
            getProduct.Product_Name
          );

          // const createProductLocation =
          //   await productLocationRepo.updateProductLocationInfo(
          //     j,
          //     i,
          //     locBarcodes,
          //     getProduct.UPC,
          //     getProduct.id,
          //     getProduct.Product_Name,
          //     getLocation.id
          //   );
        }
      }

      // if (getId.limit_size > totalQuantity) {
      //   for (const i of skuProductAdd) {
      //     for (const j of i.SKU) {
      //       const getProduct = await productManagermentRepo.getProductWithSku(
      //         j.SKU_product
      //       );

      //       const getLocation =
      //         await location_managermentRepo.getLocationWithLoc(locBarcodes);

      //       const createProductLocation =
      //         await productLocationRepo.updateProductLocationInfo(
      //           j,
      //           i,
      //           locBarcodes,
      //           getProduct.UPC,
      //           getProduct.id,
      //           getProduct.Product_Name,
      //           getLocation.id
      //         );
      //     }
      //   }
      // } else {
      //   return res.status(400).json({
      //     status: "failed",
      //     message: "The quantity in stock is not enough!",
      //   });
      // }
    }

    if (skuProductRemove.length > 0) {
      const arrId = skuProductRemove.map((item) => item.id);

      for (const i of skuProductRemove) {
        const updateSkuAdd = await productLocationRepo.deleteProductLocation(
          i.location
        );
      }
    }

    if (skuProductEdit.length > 0) {
      // get all total quantity in location
      const getId: any = await location_managermentRepo.getLocationId(
        locationId
      );

      const totalQuantity = getId.product_location.reduce(
        (acc, val) => acc + val.Quantity,
        0
      );

      for (const i of skuProductEdit) {
        // let arrSKU;
        for (const j of i.SKU) {
          const checkProductInLocation =
            await productLocationRepo.getPrductWithSKUId(
              j.SKU_product,
              getId.id
            );

          console.log("j.SKU_productj.SKU_productj.SKU_product", j.SKU_product);

          if (checkProductInLocation === null) {
            // find product with sku
            const getProduct = await productManagermentRepo.getProductWithSku(
              j.SKU_product
            );

            const getLocation =
              await location_managermentRepo.getLocationWithLoc(locBarcodes);

            const createProductLocation =
              await productLocationRepo.updateProductLocationInfo(
                j,
                i,
                locBarcodes,
                getProduct.UPC,
                getProduct.id,
                getProduct.Product_Name,
                getLocation.id
              );
          } else {
            const getProduct = await productManagermentRepo.getProductWithSku(
              j.SKU_product
            );

            const totalQuantity = checkProductInLocation.Quantity + i.Quantity;

            const updateQuantity = await productLocationRepo.updateFromLocation(
              getProduct.id,
              i.Quantity,
              i.id
            );
          }
        }
      }
    }

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

export const search = async (req: Request, res: Response) => {
  try {
    const Loc_Barcodes = req.body.Loc_Barcodes;

    const search = await location_managermentRepo.seachName(Loc_Barcodes);

    if (search) {
      res.status(200).send({ status: "success", data: search });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const showLists = async (req: Request, res: Response) => {
  try {
    let limit = req.body.limit || 20;
    let offset;

    const search = req.query.search;

    const findCountLocation =
      await location_managermentRepo.findAllCountLocation();

    let page: any = req.query.page;
    let pages = Math.ceil(findCountLocation / limit);
    offset = limit * (page - 1);

    const lists = await location_managermentRepo.findAllCountLocations(
      limit,
      offset,
      search
    );

    if (lists) {
      res.status(200).send({
        status: "success",
        data: lists,
        page: pages,
        count: findCountLocation,
      });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const showListsLocation = async (req: Request, res: Response) => {
  try {
    const lists: any = await location_managermentRepo.findAlls();

    const arr = [];

    for (const i of lists) {
      const arrLocation = {
        id: i.id,
        Loc_Barcodes: i.Loc_Barcodes,
        Position: i.Position,
        created_at: i.created_at,
        updated_at: i.updated_at,
        limit_size: i.limit_size,
        product_location: i.product_location.sort((a, b) =>
          a.SKU_product.localeCompare(b.SKU_product)
        ),
      };

      arr.push(arrLocation);
    }

    if (lists) {
      res.status(200).send({ status: "success", data: arr });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getLocationById = async (req: Request, res: Response) => {
  try {
    const locationId = req.body.locationId;

    const getId = await location_managermentRepo.getLocationId(locationId);

    if (getId) {
      res.status(200).send({
        status: "success",
        data: getId,
      });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const locationId = req.body.locationId;

    const removeLocation = await location_managermentRepo.deleteLocation(
      locationId
    );

    if (removeLocation) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getFile = (req: Request, res: Response) => {
  const url = path.join(__dirname, "../assets/upload", req.params.url);
  res.sendFile(url);
};

export const importFile = async (req, res) => {
  try {
    const files = req.file.filename;

    const host = "locationManagerment/getFile/";
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
        const addLocation = await location_managermentRepo.importFile(i);
      }
      res.status(200).send({ status: "success" });
    } else {
      return res
        .status(200)
        .send({ status: "success", message: "no data added" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// export const filterLocation = async (req: Request, res: Response) => {
//   try {
//     const location = req.body.location;

//     const filterLoca = await location_managermentRepo.filterLo(location);

//     if (filterLoca) {
//       res.status(200).send({ status: "success", data: filterLoca });
//     } else {
//       res.status(400).send({ status: "failed" });
//     }
//   } catch (error) {
//     res.status(400).json({ message: (error as Error).message });
//   }
// };

export const getAllLocation = async (req: Request, res: Response) => {
  try {
    const get = await location_managermentRepo.findAlls();

    if (get) {
      res.status(200).send({ status: "success", data: get });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAlls = async (req: Request, res: Response) => {
  try {
    const getAllLocation = await location_managermentRepo.getAlls();

    if (getAllLocation) {
      res.status(200).send({ status: "success", data: getAllLocation });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const deleteLocationArr = async (req: Request, res: Response) => {
  try {
    const locationArr = req.body.locationArr;

    for (const i of locationArr) {
      const removeLocation = await location_managermentRepo.deleteLocation(
        i.locationId
      );
    }

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
