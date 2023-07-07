import express from "express";
import * as adjustmentController from "../controllers/adjustment.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import jwtMiddleware from "../middlewares/jwt.middleware";
import * as multer from "../storage/multer.storage";
const router = express.Router();

router.post("/create", jwtMiddleware, adjustmentController.createAdjustment);

router.get("/", jwtMiddleware, adjustmentController.getAllAdjustment);

router.post("/getQuantity", jwtMiddleware, adjustmentController.getQuantity);

export default router;
