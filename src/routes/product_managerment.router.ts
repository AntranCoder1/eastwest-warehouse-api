import express from "express";
import * as product_managermentController from "../controllers/product_managerment.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import jwtMiddleware from "../middlewares/jwt.middleware";
import * as multer from "../storage/multer.storage";
const router = express.Router();

router.post(
  "/createProduct",
  jwtMiddleware,
  product_managermentController.CreateNewProduct
);

router.post("/search", product_managermentController.searchByName);

router.get("/getFile/:url", product_managermentController.getFile);

router.post(
  "/importFile",
  multer.upload.single("file"),
  product_managermentController.importFileProduct
);

router.get(
  "/showLists",
  jwtMiddleware,
  product_managermentController.showLists
);

router.post(
  "/getProductId",
  jwtMiddleware,
  product_managermentController.getProductById
);

router.post(
  "/updateProduct",
  jwtMiddleware,
  product_managermentController.editProduct
);

router.post(
  "/deleteProduct",
  jwtMiddleware,
  product_managermentController.deleteProduct
);

router.post(
  "/upload",
  multer.upload.array("file"),
  product_managermentController.upload
);

router.post(
  "/updateMultipleUPC",
  jwtMiddleware,
  product_managermentController.updateMultipleUpc
);

router.get("/", jwtMiddleware, product_managermentController.showAllProduct);

export default router;
