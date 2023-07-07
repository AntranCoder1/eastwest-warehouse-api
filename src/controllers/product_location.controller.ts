import { Request, Response } from "express";
import { initModels } from "../models/init-models";
import fs from "fs";
import path from "path";
import config from "../config/db.config";
import { sequelize } from "../models/index";
import * as common from "../utils/common.util";
import * as jwtUtil from "../utils/jwt.util";
import * as productLocationRepo from "../repositories/product_location.repo";
import * as productManagermentRepo from "../repositories/product_managerment.repo";
import xlsx from "xlsx";
import * as locationManagermentRepo from "../repositories/location_managerment.repo";
import * as activeRepo from "../repositories/active.repo";
import { EXDEV } from "constants";

initModels(sequelize);

export const getAll = async (req: Request, res: Response) => {
  try {
    let limit = req.body.limit || 10;
    let offset = req.body.offset;

    const findCountProduct = await productLocationRepo.findCountAllProduct();

    let page: any = req.query.page;
    let pages = Math.ceil(findCountProduct.count / limit);
    offset = limit * (page - 1);

    const findCountProducts = await productLocationRepo.findCountAllProducts(
      limit,
      offset
    );

    if (findCountProducts) {
      res.status(200).send({
        status: "success",
        data: findCountProducts,
        page: pages,
        count: findCountProduct.count,
      });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllProduct = async (req: Request, res: Response) => {
  try {
    const getAll = await productLocationRepo.findAll();

    if (getAll) {
      res.status(200).send({ status: "success", data: getAll });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const productLocationId = req.body.productLocationId;

    const getId = await productLocationRepo.getProductLocationWithId(
      productLocationId
    );

    if (getId) {
      res.status(200).send({ status: "success", data: getId });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const searchByName = async (req: Request, res: Response) => {
  try {
    const name = req.body.name;

    const searchName = await productLocationRepo.search(name);

    if (searchName) {
      res.status(200).send({ status: "success", data: searchName });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const removeProductLocation = async (req: Request, res: Response) => {
  try {
    const productLocationId = req.body.productLocationId;

    const remove = await productLocationRepo.deleteProductLocation(
      productLocationId
    );

    if (remove) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editProduct = async (req: Request, res: Response) => {
  try {
    const userId = req.body.user._id;
    const productLocationId = req.body.productLocationId;
    const sku_product = req.body.sku_product;
    const product_name = req.body.product_name;
    const imageUrlAdd = req.body.arrImgsAdd;
    const imageUrlRemove = req.body.arrImgsRemove;
    const quantity = req.body.quantity;
    const arrLocationAdd = req.body.locationAdd;
    const arrLocationRemove = req.body.locationRemove;
    const Container = req.body.container;

    console.log("Container", Container);

    console.log("imageUrlRemove", imageUrlRemove);
    console.log("imageUrlAdd", imageUrlAdd);

    const getId: any = await productLocationRepo.getProductLocationWithId(
      productLocationId
    );

    // update product managerment

    const data = {
      sku_product,
      product_name,
      Container,
    };

    const updateProduct = await productManagermentRepo.updateProduct(
      data,
      getId.product_managerment.id
    );

    // update quantity
    const updateProductQuantity = await productLocationRepo.updateFromLocation(
      getId.product_managerment.id,
      quantity,
      getId.id
    );

    // update upc in product location
    const getProductLocationWithProductId =
      await productLocationRepo.findAllWithProductId(
        getId.product_managerment.id
      );

    if (getProductLocationWithProductId.length > 0) {
      for (const i of getProductLocationWithProductId) {
        const updateUpcProductLocation = await productLocationRepo.updateUpc(
          Container,
          i.id
        );
      }
    }

    // update image

    if (imageUrlRemove.length > 0) {
      const img = getId.product_managerment.Image_URL.split(",");

      const filterImage = img.filter((item) => item !== "");

      const filterImageDelete = imageUrlRemove.map((item) => item.url);

      const filterImageDeleteArr = filterImageDelete.filter(
        (item) => item !== ""
      );

      const concatImage = filterImage.concat(filterImageDeleteArr);

      const filterArr = concatImage.filter(
        (c, index) => concatImage.indexOf(c) == concatImage.lastIndexOf(c)
      );

      const filterData = filterArr.filter((item) => item !== undefined);

      console.log("filterArr", filterData);

      const data = {
        imageUrl: filterData.toString(),
      };

      const updateImageProduct =
        await productManagermentRepo.updateImageProduct(
          data,
          getId.product_managerment.id
        );
    }

    if (imageUrlAdd.length > 0) {
      const getIds: any = await productLocationRepo.getProductLocationWithId(
        productLocationId
      );

      const arrImageUrl = imageUrlAdd.map((item) => item.url);

      const img = getIds.product_managerment.Image_URL;

      if (img) {
        const imgArr = img.split(",");

        const concatImg = [...new Set(imgArr.concat(arrImageUrl))];

        const filterImageArr = concatImg.filter((item) => item !== "");

        console.log("filterImageArr", filterImageArr);

        const data = {
          imageUrl: filterImageArr.toString(),
        };

        const updateImageProduct =
          await productManagermentRepo.updateImageProduct(
            data,
            getId.product_managerment.id
          );
      } else {
        const data = {
          imageUrl: arrImageUrl.toString(),
        };
        const updateImageProduct =
          await productManagermentRepo.updateImageProduct(
            data,
            getIds.product_managerment.id
          );
      }
    }

    // update product location

    if (arrLocationRemove.length > 0) {
      for (const i of arrLocationRemove) {
        const checkLocation: any = await productLocationRepo.getPrductWithSKU(
          getId.product_managerment.SKU_product,
          i.Loc_Barcodes
        );

        const createProductLocation =
          await productLocationRepo.deleteProductLocation(checkLocation.id);
      }
    }

    if (arrLocationAdd.length > 0) {
      // find product with location

      for (const i of arrLocationAdd) {
        const checkLocation: any = await productLocationRepo.getPrductWithSKU(
          getId.product_managerment.SKU_product,
          i.Loc_Barcodes
        );

        if (checkLocation === null) {
          console.log("vao day ---------------");

          const dataProductLocationAdd = {
            sku_product,
            Quantity: Number(quantity),
            Container: Container,
          };

          const createProductLocation = await productLocationRepo.create(
            i,
            dataProductLocationAdd,
            getId.product_managerment.id,
            getId.product_managerment.Product_Name
          );
        } else {
          const totalAmount = checkLocation.Quantity + Number(quantity);

          const updateQuantity = await productLocationRepo.updateFromLocation(
            getId.product_managerment.id,
            totalAmount,
            checkLocation.id
          );
        }
      }
    }

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const importInventory = async (req, res) => {
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

    // res.status(200).json(parsedData);

    if (parsedData.length > 0) {
      for (const i of parsedData) {
        // check sku exit
        const checkSkuLocation = await productLocationRepo.getPrductWithSKU(
          i["Item Codes"],
          i["Location ID"]
        );

        if (checkSkuLocation) {
          // get location
          const getLocation = await locationManagermentRepo.findWithBarcode(
            i["Location ID"],
            checkSkuLocation.id
          );

          //update quantity
          const updateQuantity = await productLocationRepo.updateFromLocation(
            checkSkuLocation.SKU_product,
            i["Counted Qty"],
            getLocation.id
          );

          const data = {
            workerId: userId,
            sku: i["Item Codes"],
            location: i["Location ID"],
            quantity: checkSkuLocation.Quantity,
            count_qty: i["Counted Qty"],
          };

          // add active
          const addActive = await activeRepo.createActiveInventory(data);
        } else {
          // check product exit
          const checkProduct = await productManagermentRepo.getProductWithSku(
            i["Item Codes"]
          );

          // get location
          const getLocation = await locationManagermentRepo.findWithBarcode(
            i["Location ID"],
            i["Item Codes"]
          );

          if (getLocation) {
            if (checkProduct) {
              // create new product location

              const arrLocation = {
                Loc_Barcodes: i["Location ID"],
                locationId: getLocation.id,
                type: "Inventory",
              };

              const data = {
                sku_product: i["Item Codes"],
                Quantity: i["Counted Qty"],
                UPC: i.UPC,
              };

              const create = await productLocationRepo.create(
                arrLocation,
                data,
                checkProduct.id,
                checkProduct.Product_Name
              );

              const dataActive = {
                workerId: userId,
                sku: i["Item Codes"],
                location: i["Location ID"],
                quantity: i["Counted Qty"],
              };

              // add active
              const addActive = await activeRepo.createActiveInventory(
                dataActive
              );
            } else {
              // create product
              const dataProduct = {
                sku_product: i["Item Codes"],
                UPC: i.UPC,
              };

              const create = await productManagermentRepo.createProduct(
                dataProduct
              );

              // create product location
              const dataProductLocation = {
                Loc_Barcodes: i["Location ID"],
                locationId: getLocation.id,
                type: "Inventory",
              };

              const arrLocation = {
                sku_product: i["Item Codes"],
                Quantity: i["Counted Qty"],
                UPC: i.UPC,
              };

              const createProductLocation = await productLocationRepo.create(
                arrLocation,
                dataProductLocation,
                create.id,
                create.Product_Name
              );

              const dataActive = {
                workerId: userId,
                sku: i["Item Codes"],
                location: i["Location ID"],
                quantity: i["Counted Qty"],
              };

              // add active
              const addActive = await activeRepo.createActiveInventory(
                dataActive
              );
            }
          } else {
            // create location
            const data = {
              locBarcodes: i["Location ID"],
            };

            const createLocation = await locationManagermentRepo.createLocation(
              data
            );

            if (checkProduct) {
              // create new product location

              const arrLocation = {
                Loc_Barcodes: i["Location ID"],
                locationId: createLocation.id,
                type: "Inventory",
              };

              const data = {
                sku_product: i["Item Codes"],
                Quantity: i["Counted Qty"],
                UPC: i.UPC,
              };

              const create = await productLocationRepo.create(
                arrLocation,
                data,
                checkProduct.id,
                checkProduct.Product_Name
              );

              const dataActive = {
                workerId: userId,
                sku: i["Item Codes"],
                location: i["Location ID"],
                quantity: i["Counted Qty"],
              };

              // add active
              const addActive = await activeRepo.createActiveInventory(
                dataActive
              );
            } else {
              // create product
              const dataProduct = {
                sku_product: i["Item Codes"],
                UPC: i.UPC,
              };

              const create = await productManagermentRepo.createProduct(
                dataProduct
              );

              // create product location
              const arrLocation = {
                Loc_Barcodes: i["Location ID"],
                locationId: createLocation.id,
                type: "Inventory",
              };

              const dataProductLocation = {
                sku_product: i["Item Codes"],
                Quantity: i["Counted Qty"],
                UPC: i.UPC,
              };

              const createProductLocation = await productLocationRepo.create(
                arrLocation,
                dataProductLocation,
                create.id,
                create.Product_Name
              );

              const dataActive = {
                workerId: userId,
                sku: i["Item Codes"],
                location: i["Location ID"],
                quantity: i["Counted Qty"],
              };

              // add active
              const addActive = await activeRepo.createActiveInventory(
                dataActive
              );
            }
          }
        }
      }

      res.status(200).send({ status: "success" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getAllInventory = async (req: Request, res: Response) => {
  try {
    const getInventory =
      await productLocationRepo.getAllProductLocationInventory();

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
    const productId = req.body.productId;

    const getId = await productLocationRepo.getInvenId(productId);

    if (getId) {
      res.status(200).send({ status: "success", data: getId });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateProductLocationInventory = async (
  req: Request,
  res: Response
) => {
  try {
    const productId = req.body.productId;
    const quantity = req.body.quantity;

    const getProductWithProductId = await productLocationRepo.getInvenId(
      productId
    );

    const updateQuantity = await productLocationRepo.updateFromLocation(
      getProductWithProductId.product_managerment_id,
      quantity,
      getProductWithProductId.id
    );

    // update active
    const getProductActive = await activeRepo.getProductWithSkuLoc(
      getProductWithProductId.SKU_product,
      getProductWithProductId.Loc_Barcodes
    );

    const updateActive = await activeRepo.updateQuantity(
      getProductActive.id,
      quantity
    );

    if (updateQuantity && updateActive) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const searchInventory = async (req: Request, res: Response) => {
  try {
    const search = req.body.search;

    const searchSku = await productLocationRepo.searchInvenSku(search);
    const searchLoc = await productLocationRepo.searchInvenLoc(search);

    if (searchSku.length > 0) {
      res.status(200).send({ status: "success", data: searchSku });
    }

    if (searchLoc.length > 0) {
      res.status(200).send({ status: "success", data: searchLoc });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
