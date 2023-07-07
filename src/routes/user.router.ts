import express from "express";
import * as userController from "../controllers/user.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import jwtMiddleware from "../middlewares/jwt.middleware";
import * as multer from "../storage/multer.storage";
const router = express.Router();

router.post("/createAdmin", userController.createAdmin);

router.post("/login", userController.login);

router.get("/logout", jwtMiddleware, userController.logout);

router.post("/forgotpassword", userController.forgotPassword);

router.post("/newPassword", userController.newPassword);

router.post(
  "/uploadAvatar",
  multer.upload.single("file"),
  jwtMiddleware,
  userController.uploadImage
);

router.get("/getFile/:url", userController.getFile);

router.post("/changePassword", jwtMiddleware, userController.changePassword);

router.post("/confirmPassword", jwtMiddleware, userController.confirmPassword);

router.post("/changeEmail", jwtMiddleware, userController.changeEmail);

router.get("/getUserId", jwtMiddleware, userController.getUserId);

router.post("/editWorker", jwtMiddleware, userController.editWorker);

export default router;
