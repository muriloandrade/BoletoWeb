"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
function getDate() {
    let date = new Date().toLocaleString("pt-BR");
    return date.replace(/\//g, "-").substring(0, 10);
}
exports.multerConfig = {
    dest: path_1.default.resolve(__dirname, "..", "..", "tmp", "uploads"),
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const destFolder = path_1.default.resolve(__dirname, "..", "..", "tmp", "uploads", getDate());
            !fs_1.default.existsSync(destFolder) && fs_1.default.mkdirSync(destFolder);
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
    fileFilter: (req, file, cb) => {
        const allowedMimes = ["application/pdf"];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Invalid file type."));
        }
    },
};
