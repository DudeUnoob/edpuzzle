const express = require('express')
const router = express.Router();
const passport = require('passport');
const path = require('path');
const staticRouter = express.Router();
const fs = require("fs")
const bodyParser = require('body-parser')
staticRouter.use(bodyParser.urlencoded({ extended: true }));
staticRouter.use(express.json())
staticRouter.use(bodyParser.json())

const publicStaticFileDirectory = { root: path.join(__dirname, '../public')}
console.log(publicStaticFileDirectory)


staticRouter.get('/edpuzzle/video', (req, res) => {

  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

 
  const videoPath = path.join(__dirname, '../public/edpuzzlehax1.mp4');
  const videoSize = fs.statSync(path.join(__dirname, '../public/edpuzzlehax1.mp4')).size;

 
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

 
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  
  res.writeHead(206, headers);

  
  const videoStream = fs.createReadStream(videoPath, { start, end });

 
  videoStream.pipe(res);
});


staticRouter.get('/edpuzzle/thumbnail', async(req, res) => {
    const thumbnailPath = path.join(__dirname, '../public/edpuzzlehax1.png');

    res.status(200).sendFile(thumbnailPath)
})


module.exports = staticRouter;