import multer, { FileFilterCallback, Options } from "multer";
import path from "path";
import fs from "fs";

function getDate() {
  let date = new Date().toLocaleString("pt-BR");
  return date.replace(/\//g, "-").substring(0, 10);
}

export const multerConfig: Options = {
  dest: path.resolve(__dirname, "..", "..", "tmp", "uploads"),
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const destFolder = path.resolve(
        __dirname,
        "..",
        "..",
        "tmp",
        "uploads",
        getDate()
      );
      !fs.existsSync(destFolder) && fs.mkdirSync(destFolder);
      cb(null, destFolder);
    },
    filename: (req, file, cb) => {
      const filename = file.originalname;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 1 * 1024 * 1024, //1MB
  },
  fileFilter: (
    req: Express.Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    const allowedMimes = ["application/pdf"];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type."));
    }
  },
};
