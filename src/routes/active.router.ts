import express from "express";
import * as activeController from "../controllers/active.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import jwtMiddleware from "../middlewares/jwt.middleware";
import * as multer from "../storage/multer.storage";
const router = express.Router();

// router.post("/", jwtMiddleware, activeController.getAll);
router.get("/", jwtMiddleware, activeController.getAllActives);

router.post("/getId", jwtMiddleware, activeController.getId);

router.post("/getActiveWithDate", jwtMiddleware, activeController.filterDate);

router.post("/filterType", jwtMiddleware, activeController.filterActive);

router.post("/delete", jwtMiddleware, activeController.deleteActive);

export default router;
