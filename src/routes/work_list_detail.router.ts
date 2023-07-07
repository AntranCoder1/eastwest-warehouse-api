import express from "express";
import * as work_list_detailController from "../controllers/work_list_detail.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import jwtMiddleware from "../middlewares/jwt.middleware";
import * as multer from "../storage/multer.storage";
const router = express.Router();

router.post(
  "/edit",
  jwtMiddleware,
  work_list_detailController.editWorkListDetailReceving
);

router.post(
  "/delete",
  jwtMiddleware,
  work_list_detailController.deteleWorkListDetailReceving
);

router.post("/create", jwtMiddleware, work_list_detailController.create);

router.post("/getId", jwtMiddleware, work_list_detailController.getId);

router.post(
  "/getReceiving",
  jwtMiddleware,
  work_list_detailController.receivingDetail
);

router.post(
  "/getPicking",
  jwtMiddleware,
  work_list_detailController.pickingDetail
);

router.post(
  "/getTransfering",
  jwtMiddleware,
  work_list_detailController.transferingDetail
);

router.post(
  "/isCheck",
  jwtMiddleware,
  work_list_detailController.isCompleteReceiving
);

router.post(
  "/getReceivingActive",
  jwtMiddleware,
  work_list_detailController.getReceivingWithId
);

export default router;
