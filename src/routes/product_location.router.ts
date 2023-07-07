import express from "express";
import * as product_locationController from "../controllers/product_location.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import jwtMiddleware from "../middlewares/jwt.middleware";
import * as multer from "../storage/multer.storage";
const router = express.Router();

// router.post("/", jwtMiddleware, product_locationController.getAll);
router.get("/", jwtMiddleware, product_locationController.getAllProduct);

router.post("/getId", jwtMiddleware, product_locationController.getById);

router.post("/search", jwtMiddleware, product_locationController.searchByName);

router.post(
  "/delete",
  jwtMiddleware,
  product_locationController.removeProductLocation
);

router.post("/edit", jwtMiddleware, product_locationController.editProduct);

router.post(
  "/importFileInventory",
  multer.upload.single("file"),
  jwtMiddleware,
  product_locationController.importInventory
);

router.get(
  "/getInventory",
  jwtMiddleware,
  product_locationController.getAllInventory
);

router.post(
  "/getInventoryId",
  jwtMiddleware,
  product_locationController.getInventoryId
);

router.post(
  "/editInventory",
  jwtMiddleware,
  product_locationController.updateProductLocationInventory
);

router.post(
  "/searchInventory",
  jwtMiddleware,
  product_locationController.searchInventory
);

export default router;
