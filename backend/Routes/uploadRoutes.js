import path from "path";
import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${extname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = path.extname(file.originalname);
  const mimetype = file.mimetype;

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ─── Single Image Upload (for Artwork) ───────────────────────────────────────
const uploadSingle = upload.single("image");

router.post("/", (req, res) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      res.status(400).send({ message: err.message });
    } else if (req.file) {
      res.status(200).send({
        message: "Image uploaded successfully",
        image: `/${req.file.path}`,
      });
    } else {
      res.status(400).send({ message: "No image file provided" });
    }
  });
});

// ─── Multiple Images Upload (for Exhibition) ─────────────────────────────────
const uploadMultiple = upload.array("images", 10); // max 10 images

router.post("/multiple", (req, res) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      res.status(400).send({ message: err.message });
    } else if (req.files && req.files.length > 0) {
      res.status(200).send({
        message: "Images uploaded successfully",
        images: req.files.map((file) => `/${file.path}`),
      });
    } else {
      res.status(400).send({ message: "No image files provided" });
    }
  });
});

export default router;
