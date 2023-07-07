import { Request, Response } from "express";
import { initModels } from "../models/init-models";
import fs from "fs";
import path from "path";
import config from "../config/db.config";
import { sequelize } from "../models/index";
import * as common from "../utils/common.util";
import * as jwtUtil from "../utils/jwt.util";
import xlsx from "xlsx";
import * as product_managermentRepo from "../repositories/product_managerment.repo";
import { product_managerment } from "../models/product_managerment.model";
import qr from "qrcode";
import * as locationListManagermentRepo from "../repositories/location_list_managerment.repo";
import * as locationManagermentRepo from "../repositories/location_managerment.repo";
import * as activeRepo from "../repositories/active.repo";
import * as productLocationRepo from "../repositories/product_location.repo";
import * as productManagermentImageRepo from "../repositories/product_menagerment_image.repo";

initModels(sequelize);

export const CreateNewProduct = async (req: Request, res: Response) => {
  try {
    const sku_product = req.body.sku_product;
    const product_name = req.body.product_name;
    const imageUrl = req.body.arrImgs;
    const imageLink = req.body.arrImgUrl;
    const arrLocation = req.body.location;
    const UPC = req.body.Container;
    const userId = req.body.user._id;

    const arrImageUrl = imageUrl.map((item) => item.url);

    // const locationArr = arrLocation.map((item) => item.location);

    // check exists
    const checkProductExists =
      await product_managermentRepo.findProductWithSkuAndUPC(sku_product, UPC);

    if (checkProductExists) {
      return res
        .status(400)
        .json({ status: "failed", message: "product already exists" });
    }

    const checkSkuExists = await product_managermentRepo.findProductWithBars(
      sku_product
    );

    if (checkSkuExists) {
      return res
        .status(400)
        .json({ status: "failed", message: "product already exists" });
    }

    const checkUPCExists = await product_managermentRepo.findProductWithUPC(
      UPC
    );

    if (checkUPCExists) {
      return res
        .status(400)
        .json({ status: "failed", message: "product already exists" });
    }

    const data = {
      sku_product,
      product_name,
      imageUrl: arrImageUrl.toString(),
      UPC,
    };

    const dataLocationList = {
      sku_product,
      UPC,
    };

    const create = await product_managermentRepo.createProduct(data);

    // const createLocationListManagerment =
    //   await locationListManagermentRepo.createLocationListProduct(
    //     dataLocationList,
    //     create.id,
    //     UPC
    //   );

    for (const i of arrLocation) {
      const createProductLocation = await productLocationRepo.createProduct(
        i,
        dataLocationList,
        create.id,
        product_name
      );
    }

    if (imageLink.length > 0) {
      const arrImage = imageLink.map((item) => item.url);

      const getProductId = await product_managermentRepo.findById(create.id);

      const image = getProductId.Image_URL + arrImage.toString();

      const data = {
        imageUrl: image,
      };

      const createPMU = await product_managermentRepo.updateImageProduct(
        data,
        create.id
      );
    }

    const createActive = await activeRepo.createActiveProduct(userId);

    if (create) {
      res.status(200).send({ status: "success", data: create });
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

    if (name === "") {
      const getAll = await product_managermentRepo.finAll();

      if (getAll) {
        res.status(200).send({ status: "success", data: getAll });
      } else {
        res.status(400).send({ status: "failed" });
      }
    } else {
      const search = await product_managermentRepo.seachName(name);

      if (search) {
        res.status(200).send({ status: "success", data: search });
      } else {
        res.status(400).send({ status: "failed" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export let upload = (req, res) => {
  const file = req.files;

  const arrImgs = [];
  const host = "productManagerment/getFile/";

  for (const i of file) {
    arrImgs.push({
      url: host.concat(i.filename),
      filename: host.concat(i.filename),
      typeFile: i.mineType,
    });
  }
  res.status(200).send({ status: "success", file: arrImgs });
};

export const getFile = (req: Request, res: Response) => {
  const url = path.join(__dirname, "../assets/upload", req.params.url);
  res.sendFile(url);
};

export const importFile = async (req, res) => {
  try {
    const files = req.file.filename;

    const host = "productManagerment/getFile/";
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
        // check product exists
        let addImportFile;
        const getProduct = await product_managermentRepo.findProductWithBars(
          i.SKU
        );
        if (getProduct) {
          addImportFile = getProduct;
        } else {
          addImportFile = await product_managermentRepo.createProductImport(i);
        }

        let arrLocations;

        if (!i.Locations) {
          arrLocations = [];
        } else {
          arrLocations = i.Locations.split(",");
        }

        if (arrLocations.length > 0) {
          for (const j of arrLocations) {
            const checkLocation: any =
              await locationManagermentRepo.findWithBarcode(j, j);

            if (!checkLocation) {
              const data = {
                locBarcodes: j,
              };

              const createLocation =
                await locationManagermentRepo.createLocation(data);

              const createProductLocation =
                await productLocationRepo.importFileProduct(
                  j,
                  addImportFile.id,
                  i,
                  createLocation.id
                );
            } else {
              // check product location exists
              const checkProduct = await productLocationRepo.getPrductWithSKU(
                i.SKU,
                checkLocation.Loc_Barcodes
              );

              if (!checkProduct) {
                const createProductLocation =
                  await productLocationRepo.importFileProduct(
                    j,
                    addImportFile.id,
                    i,
                    checkLocation.id
                  );
              } else {
                const getQuantity = checkProduct.Quantity + i.Quantity;

                const updateQuantityProductLocation =
                  await productLocationRepo.updateFromLocation(
                    checkProduct.product_managerment_id,
                    getQuantity,
                    checkProduct.id
                  );
              }
            }
          }
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

// import

export const importFileProduct = async (req, res) => {
  try {
    const files = req.file.filename;

    const host = "productManagerment/getFile/";
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

    const newDataImport = parsedData.map((item) => {
      const arrLocation = [];
      for (let i = 0; i < Object.keys(item).length; i++) {
        if (Object.keys(item)[i].startsWith("Locations")) {
          const location = Object.keys(item)[i];
          const quantity = Object.keys(item)[i].replace(
            "Locations",
            "Quantity"
          );
          arrLocation.push({
            // [location]: item[location],
            // [quantity]: item[quantity],
            Locations: item[location],
            Quantity: item[quantity],
          });
        }
      }

      return {
        SKU: item.SKU,
        "Product Name": item["Product Name"],
        UPC: item.UPC,
        arrLocation,
        images: item.images,
      };
    });

    if (newDataImport.length > 0) {
      for (const i of newDataImport) {
        // check product exists
        let addImportFile;
        const getProduct = await product_managermentRepo.findProductWithBars(
          i.SKU
        );
        if (getProduct) {
          // check exists upc product
          const findUPCProduct =
            await product_managermentRepo.findProductWithBar(i.UPC);

          if (findUPCProduct) {
            addImportFile = getProduct;
          } else {
            // update upc product
            const updateUPCProduct = await product_managermentRepo.upateUPC(
              getProduct.id,
              i.UPC
            );

            addImportFile = await product_managermentRepo.findProductWithBars(
              i.SKU
            );
          }
        } else {
          const data = {
            SKU: i.SKU,
            productName: i["Product Name"],
            Images: i.images,
            UPC: i.UPC,
          };
          addImportFile = await product_managermentRepo.createProductImport(
            data
          );
        }

        if (i.arrLocation.length > 0) {
          for (const j of i.arrLocation) {
            const checkLocation: any =
              await locationManagermentRepo.findWithBarcode(j.Locations, j);

            if (!checkLocation) {
              const data = {
                locBarcodes: j.Locations,
              };

              const createLocation =
                await locationManagermentRepo.createLocation(data);

              const dataPL = {
                SKU: i.SKU,
                Quantity: j.Quantity,
                productName: i["Product Name"],
              };

              const createProductLocation =
                await productLocationRepo.importFileProduct(
                  j.Locations,
                  addImportFile.id,
                  dataPL,
                  createLocation.id
                );
            } else {
              // check product location exists

              const checkProduct = await productLocationRepo.getPrductWithSKU(
                i.SKU,
                j.Locations
              );

              if (!checkProduct) {
                const dataPL = {
                  SKU: i.SKU,
                  Quantity: j.Quantity,
                  productName: i["Product Name"],
                };

                const createProductLocation =
                  await productLocationRepo.importFileProduct(
                    j.Locations,
                    addImportFile.id,
                    dataPL,
                    checkLocation.id
                  );
              } else {
                const getQuantity = checkProduct.Quantity + j.Quantity;
                const updateQuantityProductLocation =
                  await productLocationRepo.updateFromLocation(
                    checkProduct.product_managerment_id,
                    getQuantity,
                    checkProduct.id
                  );
              }
            }
          }
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

// end of import

export const showLists = async (req: Request, res: Response) => {
  try {
    const lists = await product_managermentRepo.finAll();

    if (lists) {
      res.status(200).send({ status: "success", data: lists });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const productId = req.body.productId;

    const getId = await product_managermentRepo.findById(productId);

    if (getId) {
      res.status(200).send({ status: "success", data: getId });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const editProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.body.productId;
    const sku_product = req.body.sku_product;
    const product_name = req.body.product_name;
    const imageUrlAdd = req.body.arrImgsAdd;
    const imageUrlRemove = req.body.arrImgsRemove;
    const arrLocationEdit = req.body.locationEdit;
    const arrLocationAdd = req.body.locationAdd;
    const arrLocationRemove = req.body.locationRemove;
    const UPC = req.body.container;
    const imageLinkAdd = req.body.arrImgsUrlAdd;
    const imageLinkDelete = req.body.arrImgsUrlDelete;

    const getProductId = await product_managermentRepo.findById(productId);

    if (UPC !== "") {
      const checkUPCExists = await product_managermentRepo.findProductWithUPC(
        UPC
      );

      // const checkProductUPCExists =
      //   await product_managermentRepo.findProductWithUPCEdit(UPC, sku_product);

      if (!checkUPCExists) {
        const data = {
          sku_product,
          product_name,
          UPC,
        };

        const updateProduct = await product_managermentRepo.updateProduct(
          data,
          productId
        );
      } else {
        return res
          .status(400)
          .json({ status: "failed", message: "UPC already exists" });
      }
    }

    // let img;

    // if (getProductId.Image_URL === "") {
    //   img = [];
    // } else {
    //   img = getProductId.Image_URL.split(",");
    // }

    const data = {
      sku_product,
      product_name,
    };

    const updateProduct = await product_managermentRepo.updateProduct(
      data,
      productId
    );

    const updateLocationList =
      await locationListManagermentRepo.updateProductLocation(data, productId);

    if (imageUrlAdd.length > 0) {
      const arrImageUrl = imageUrlAdd.map((item) => item.url);

      const img = getProductId.Image_URL;

      let imgArr;
      if (img === null) {
        imgArr = [];
      } else {
        imgArr = img.split(",");
      }

      const concatImg = [...new Set(imgArr.concat(arrImageUrl))];

      const filterImageArr = concatImg.filter((item) => item !== "");

      console.log("filterImageArr", filterImageArr);

      const data = {
        imageUrl: filterImageArr.toString(),
      };

      const updateImageProduct =
        await product_managermentRepo.updateImageProduct(data, productId);

      // const img = getProductId.Image_URL.split(",");

      // const concatImg = [...new Set(img.concat(arrImageUrl))];

      // const data = {
      //   imageUrl: concatImg.toString(),
      // };

      // const updateImageProduct =
      //   await product_managermentRepo.updateImageProduct(data, productId);
    }
    // const filterData = imageUrlRemove.every((item) => item.url !== "");

    if (imageUrlRemove.length > 0) {
      const img = getProductId.Image_URL.split(",");

      const filterImage = img.filter((item) => item !== "");

      const filterImageDelete = imageUrlRemove.map(
        (item) => item.url.imageItem
      );

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
        await product_managermentRepo.updateImageProduct(data, productId);
    }

    if (imageLinkAdd.length > 0) {
      const getProduct = await product_managermentRepo.findById(productId);

      const arrImage = imageLinkAdd.map((item) => item.url);

      const img = getProductId.Image_URL;

      let imgArr;
      if (img === null) {
        imgArr = [];
      } else {
        imgArr = img.split(",");
      }

      const concatImg = [...new Set(imgArr.concat(arrImage))];

      const filterImageArr = concatImg.filter((item) => item !== "");

      console.log("filterImageArr", filterImageArr);

      const data = {
        imageUrl: filterImageArr.toString(),
      };

      const updateImageProduct =
        await product_managermentRepo.updateImageProduct(data, productId);
    }

    if (imageLinkDelete.length > 0) {
      const getProduct = await product_managermentRepo.findById(productId);

      const img = getProduct.Image_URL.split(",");

      const filterImage = img.filter((item) => item !== "");

      const filterImageDelete = imageLinkDelete.map((item) => item.url);

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
        await product_managermentRepo.updateImageProduct(data, productId);
    }

    if (arrLocationAdd.length > 0) {
      // const createLocation = await productLocationRepo.createLocationProduct(
      //   arrLocationAdd,
      //   productId,
      //   quantity,
      //   Container,
      //   sku_product
      // );

      const dataLocationList = {
        sku_product,
        UPC: getProductId.UPC,
      };

      for (const i of arrLocationAdd) {
        console.log("vao day add");

        const getProduct = await product_managermentRepo.findById(productId);
        const checkExit = await productLocationRepo.getPrductWithSKU(
          getProduct.SKU_product,
          i.location[0].Loc_Barcodes
        );

        if (checkExit !== null) {
          const totalQuantity = checkExit.Quantity + i.quantity;

          // update quantity
          const updateQuantity = await productLocationRepo.updateFromLocation(
            productId,
            totalQuantity,
            checkExit.id
          );
        } else {
          const createProductLocation = await productLocationRepo.createProduct(
            i,
            dataLocationList,
            productId,
            product_name
          );
        }
      }
    }

    if (arrLocationEdit.length > 0) {
      for (const i of arrLocationEdit) {
        const deleteProductLocation =
          await productLocationRepo.deleteProductLocation(i.id);

        // getLocation
        const getLocation = await locationManagermentRepo.getLocationWithLoc(
          i.location[0].Loc_Barcodes
        );
        const dataLocationList = {
          sku_product,
          UPC,
          locationId: getLocation.id,
        };

        const createProductLocation =
          await productLocationRepo.createProductUpdate(
            i,
            dataLocationList,
            productId,
            product_name
          );
      }
    }

    if (arrLocationRemove.length > 0) {
      const arrId = arrLocationRemove.map((item) => item.location);
      const remove = await productLocationRepo.deleteLocationProduct(arrId);
    }

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productId = req.body.productId;

    const remove = await product_managermentRepo.deleteProduct(productId);

    if (remove) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const updateMultipleUpc = async (req: Request, res: Response) => {
  try {
    const arrProduct = req.body.arrProduct;

    if (arrProduct.length > 0) {
      for (const i of arrProduct) {
        const updateUPCProduct = await product_managermentRepo.upateUPC(
          i.productId,
          i.UPC
        );
      }
    }

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const showAllProduct = async (req: Request, res: Response) => {
  try {
    let limit = req.body.limit || 20;
    let offset;

    const search = req.query.search;

    const findCountProduct =
      await product_managermentRepo.findAllCountProduct();

    let page: any = req.query.page;
    let pages = Math.ceil(findCountProduct / limit);
    offset = limit * (page - 1);

    const lists = await product_managermentRepo.findAllCountProducts(
      limit,
      offset,
      search
    );

    if (lists) {
      res.status(200).send({
        status: "success",
        data: lists,
        page: pages,
        count: findCountProduct,
      });
    } else {
      res.status(400).send({ status: "failed" });
    }
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};
