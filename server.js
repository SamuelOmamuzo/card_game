const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const crypto = require("crypto");

const multer = require("multer");
const GridFs = require("gridfs-stream");
const { GridFsStorage } = require("multer-gridfs-storage");

const app = express();
const port = 3399;
const url = "mongodb://localhost/vercelDB";

let gfs;

const conn = mongoose.createConnection(url);
conn.once("open", () => {
  gfs = GridFs(conn.db, mongoose.mongo);
  gfs.collection("newUploads");
});

var storage = new GridFsStorage({
  url: url,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "newUploads"
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({ storage }).single("picture");
app.use(express.json());

app.post("/upload", upload, async (req, res) => {
  res.end("uploaded");
});

app.get("/", upload, async (req, res) => {
  gfs.files.find().toArray((err, file)=>{
      return res.json(file)
  })
});

app.listen(port, () => console.log("listening to Vercel"));

module.exports = app