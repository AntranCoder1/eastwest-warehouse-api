import express from "express";
import * as worker_managermentController from "../controllers/worker_managerment.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import jwtMiddleware from "../middlewares/jwt.middleware";
import * as multer from "../storage/multer.storage";
const router = express.Router();

router.post("/createWorker", worker_managermentController.createNewWorker);

router.get("/listWorker", worker_managermentController.showListWorker);

router.post(
  "/getWorkerById",
  jwtMiddleware,
  worker_managermentController.workerManagermentId
);

router.post("/edit", jwtMiddleware, worker_managermentController.editWorker);

router.post(
  "/search",
  jwtMiddleware,
  worker_managermentController.searchByName
);

router.post(
  "/delete",
  jwtMiddleware,
  worker_managermentController.deleteWorker
);

router.post(
  "/uploadFile",
  multer.upload.single("file"),
  jwtMiddleware,
  worker_managermentController.uploadFile
);

router.get("/getFile/:url", worker_managermentController.getFile);

router.post(
  "/importFile",
  multer.upload.single("file"),
  worker_managermentController.importFile
);

router.post("/login", worker_managermentController.login);

router.get("/logout", jwtMiddleware, worker_managermentController.logout);

router.post(
  "/removeDelete",
  jwtMiddleware,
  worker_managermentController.RemoveDeleteWorker
);

router.get(
  "/getUserRemove",
  jwtMiddleware,
  worker_managermentController.getUserRemove
);

router.post("/forgotpassword", worker_managermentController.forgotPassword);

router.post("/newPassword", worker_managermentController.newPassword);

router.post(
  "/confirmPassword",
  jwtMiddleware,
  worker_managermentController.confirmPassword
);

router.get("/getUserId", jwtMiddleware, worker_managermentController.getUserId);

router.post(
  "/changePassword",
  jwtMiddleware,
  worker_managermentController.changePassword
);

router.post("/checkVerify", worker_managermentController.checkVerify);

export default router;
