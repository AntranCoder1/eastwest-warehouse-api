import express from "express";
import * as work_listController from "../controllers/work_list.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import jwtMiddleware from "../middlewares/jwt.middleware";
import * as multer from "../storage/multer.storage";
const router = express.Router();

router.post(
  "/createWorkList",
  jwtMiddleware,
  work_listController.addWorkListReceiving
);

router.post(
  "/searchReceiving",
  jwtMiddleware,
  work_listController.searchReceiving
);

router.post("/", jwtMiddleware, work_listController.findAllReceiving);

router.post("/getById", jwtMiddleware, work_listController.getIdReceiving);

router.post(
  "/importFileReceiving",
  multer.upload.single("file"),
  jwtMiddleware,
  work_listController.importFileReceiving
);

router.post(
  "/createWorkListPick",
  jwtMiddleware,
  work_listController.addWorkListPicking
);

router.post(
  "/getAllPicking",
  jwtMiddleware,
  work_listController.findAllPicking
);

router.post("/getPickingById", jwtMiddleware, work_listController.getIdPicking);

router.post("/searchPicking", jwtMiddleware, work_listController.searchPicking);

router.post(
  "/importFilePickingGround",
  multer.upload.single("file"),
  jwtMiddleware,
  work_listController.importFilePickingGround
);

router.post(
  "/importFilePickingLTL",
  multer.upload.single("file"),
  jwtMiddleware,
  work_listController.importFilePickingLTL
);

router.post(
  "/createWorkListTransfer",
  jwtMiddleware,
  work_listController.createNewTransferings
);

router.post(
  "/getAllTransfer",
  jwtMiddleware,
  work_listController.showListTransfer
);

router.post(
  "/getTransferId",
  jwtMiddleware,
  work_listController.getTransferById
);

router.post(
  "/importFileTransfering",
  multer.upload.single("file"),
  jwtMiddleware,
  work_listController.importFileTransfering
);

router.post(
  "/updateTransfer",
  jwtMiddleware,
  work_listController.updateTransfering
);

router.post(
  "/getReceivingWithDate",
  jwtMiddleware,
  work_listController.findAllReceivingWithDate
);

router.post(
  "/getPickingWithDate",
  jwtMiddleware,
  work_listController.findAllPickingWithDate
);

router.post("/editWorkList", jwtMiddleware, work_listController.editWorkList);

router.post("/qr", jwtMiddleware, work_listController.createQR);

router.post("/filterPicking", jwtMiddleware, work_listController.filterPicking);

router.post("/getSku", jwtMiddleware, work_listController.getAllSku);

router.post(
  "/createQRFromTo",
  jwtMiddleware,
  work_listController.createQRFromTo
);

router.post(
  "/getSearch",
  jwtMiddleware,
  work_listController.searchWorkListWithSKU
);

router.post("/editReceiving", jwtMiddleware, work_listController.editReceiving);

router.post("/editPicking", jwtMiddleware, work_listController.editPicking);

router.get(
  "/getPickings",
  jwtMiddleware,
  work_listController.findAllPickingDash
);

router.get(
  "/getPickingsAdmin",
  jwtMiddleware,
  work_listController.findAllPickingDashAdmin
);

router.get(
  "/getReceivings",
  jwtMiddleware,
  work_listController.findAllReceivingDash
);

router.get(
  "/getReceivingsAdmin",
  jwtMiddleware,
  work_listController.findAllReceivingDashAdmin
);

router.post(
  "/ReceivingWorkerComplete",
  jwtMiddleware,
  work_listController.ReceivingWorkerComplete
);

router.post(
  "/getPickingByIdLTL",
  jwtMiddleware,
  work_listController.getPickingLtl
);

export default router;
