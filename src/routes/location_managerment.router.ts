import express from "express";
import * as location_managermentController from "../controllers/location_managerment.controller";
import adminMiddleware from "../middlewares/admin.middleware";
import jwtMiddleware from "../middlewares/jwt.middleware";
import * as multer from "../storage/multer.storage";
const router = express.Router();

router.post(
  "/createLocation",
  jwtMiddleware,
  location_managermentController.createNewLocation
);

router.post(
  "/updateLocation",
  jwtMiddleware,
  location_managermentController.editLocation
);

router.post("/search", jwtMiddleware, location_managermentController.search);

// router.post("/", jwtMiddleware, location_managermentController.showLists);
router.get(
  "/",
  jwtMiddleware,
  location_managermentController.showListsLocation
);

router.post(
  "/getLocationId",
  jwtMiddleware,
  location_managermentController.getLocationById
);

router.post(
  "/deleteLocation",
  jwtMiddleware,
  location_managermentController.deleteLocation
);

router.post(
  "/importFile",
  multer.upload.single("file"),
  location_managermentController.importFile
);

router.get("/getFile/:url", location_managermentController.getFile);

// router.post(
//   "/filterLocation",
//   jwtMiddleware,
//   location_managermentController.filterLocation
// );

router.post(
  "/createNew",
  jwtMiddleware,
  location_managermentController.addLocation
);

router.get(
  "/showList",
  jwtMiddleware,
  location_managermentController.showLists
);

router.get("/getAll", jwtMiddleware, location_managermentController.getAlls);

router.post(
  "/deleteMutipleLocation",
  jwtMiddleware,
  location_managermentController.deleteLocationArr
);

export default router;
