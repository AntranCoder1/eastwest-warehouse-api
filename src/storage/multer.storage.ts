import multer from "multer";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "./assets/upload");
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
export let upload = multer({
  storage,
  limits: { files: 200, fileSize: 50 * 1024 * 1024 * 1024 },
});
