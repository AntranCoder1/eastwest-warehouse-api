import express from "express";
import * as inventoryCountController from "../controllers/inventory_count.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import jwtMiddleware from "../middlewares/jwt.middleware";
import * as multer from "../storage/multer.storage";
const router = express.Router();

router.post(
  "/importFile",
  multer.upload.single("file"),
  jwtMiddleware,
  inventoryCountController.importFile
);

router.get("/", jwtMiddleware, inventoryCountController.getInventCounts);

router.post(
  "/createInvent",
  jwtMiddleware,
  inventoryCountController.createInventoryCount
);

router.post("/getAll", jwtMiddleware, inventoryCountController.getAllInventory);

router.get(
  "/getAllInventWorker",
  jwtMiddleware,
  inventoryCountController.getAllInventorys
);

router.post("/getId", jwtMiddleware, inventoryCountController.getInventoryId);

router.post("/delete", jwtMiddleware, inventoryCountController.deleteInvent);

router.post(
  "/getDetailId",
  jwtMiddleware,
  inventoryCountController.getInventSkuDetail
);

router.post(
  "/scanInvent",
  jwtMiddleware,
  inventoryCountController.scanInventWorker
);

router.post(
  "/getInventScan",
  jwtMiddleware,
  inventoryCountController.getInventScanWorker
);

router.post(
  "/editInventScan",
  jwtMiddleware,
  inventoryCountController.editInventScanDetail
);

router.post(
  "/getInventoryCountId",
  jwtMiddleware,
  inventoryCountController.getIdInventoryCount
);

router.post(
  "/getInventoryIdWorker",
  jwtMiddleware,
  inventoryCountController.getInventoryCountWorker
);

router.post(
  "/editInventoryScan",
  jwtMiddleware,
  inventoryCountController.editInventoryScanWorker
);

router.post(
  "/isChecked",
  jwtMiddleware,
  inventoryCountController.checkIsCompleteWorker
);

router.post(
  "/editWorkListInvent",
  jwtMiddleware,
  inventoryCountController.editWorkListInventory
);

router.post(
  "/filterYear",
  jwtMiddleware,
  inventoryCountController.filterWithYear
);

router.post(
  "/findAllInventoryCount",
  jwtMiddleware,
  inventoryCountController.getAllInventotyCountForUpdate
);

router.post(
  "/inventoryCountCompared",
  jwtMiddleware,
  inventoryCountController.inventoryCountCompared
);

router.post(
  "/isInvite",
  jwtMiddleware,
  inventoryCountController.jwtInventoryCount
);

router.post(
  "/inVentoryCountByLoc",
  jwtMiddleware,
  inventoryCountController.inventoryCountByLoc
);

router.post(
  "/inventoryRecount",
  jwtMiddleware,
  inventoryCountController.inventoryRecount
);

router.post(
  "/inventoryPallet",
  jwtMiddleware,
  inventoryCountController.inventoryPallet
);

router.post(
  "/editPallet",
  jwtMiddleware,
  inventoryCountController.editInventoryPallet
);

router.post(
  "/deletePallet",
  jwtMiddleware,
  inventoryCountController.deletePallet
);

router.post(
  "/getAllPallet",
  jwtMiddleware,
  inventoryCountController.getAllPallet
);

router.post(
  "/addMorePallet",
  jwtMiddleware,
  inventoryCountController.addMorePallet
);

router.post(
  "/palletCheck",
  jwtMiddleware,
  inventoryCountController.inventoryPalletStatus
);

router.post(
  "/editPalletAdmin",
  jwtMiddleware,
  inventoryCountController.editPalletAdmin
);

router.post(
  "/applyNewCount",
  jwtMiddleware,
  inventoryCountController.applyNewCount
);

router.get(
  "/allProduct",
  jwtMiddleware,
  inventoryCountController.getProductsInLocation
);

export default router;
