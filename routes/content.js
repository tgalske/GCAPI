let express = require('express');
let router = express.Router();
let mongoUtil = require( '../mongoConfig' );
const uuidv1 = require('uuid/v1');
let bodyParser = require('body-parser');
let jsonParser = bodyParser.json({type: 'application/json'});
let colName = 'content'; // collection name
let path = require('path');
let Fuse = require('fuse.js'); // search
const sharp = require('sharp'); // image manipulation
let fs = require('fs');
let AWS = require('aws-sdk');
let s3 = new AWS.S3();

function isImage(fileType) {
  switch (fileType) {
    case ".jpg":
    return true;
    case ".png":
    return true;
    case ".gif":
    return true;
    case ".mov":
    return false;
    case ".mp4":
    return false;
    default:
    return true;
  }
}

router.get('/', function(req, res, next) {
  mongoUtil.getDb().collection(colName).find().toArray(function (err, content) {
    if (err) throw err;
    res.send(content);
  });
});

router.get('/id/:fileId', function (req, res) {
  mongoUtil.getDb().collection(colName).findOne({fileId: req.params.fileId}, function (err, content) {
    if (err) throw err;
    res.send(content);
  })
});

router.get('/search', function(req, res) {
  let query = req.query.query;
  let options = {
    shouldSort: true,
    threshold: 0.5,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      "title",
      "tags"
    ]
  };
  mongoUtil.getDb().collection(colName).find().toArray(function (err, result) {
    if (err) throw err
    var fuse = new Fuse(result, options);
    res.send(fuse.search(query));
  })
});

router.post('/', jsonParser, function (req, res) {
  let fileId = req.body.fileId
  let file = req.files.file;
  let fileType = path.extname(file.name);
  req.body.fileType = fileType;
  req.body.fileId = fileId;
  req.body.isImage = isImage(fileType);

  // Save file locally
  let filePathWithNameWithType = 'public/' + fileId + fileType;

  file.mv(filePathWithNameWithType, function(err) {
    if (err) {
      console.log(err)
    } else {
      // Upload file to s3
      let bucketName = "s3-gc-media";
      let fileStream = fs.createReadStream(filePathWithNameWithType);
      fileStream.on('error', function(err) {
        console.log('File Error', err);
      });

      let contentType = (req.body.isImage) ? 'image/' + fileType.substring(1, fileType.length) : 'video/' + fileType.substring(1, fileType.length)

      let uploadParams = {
        Bucket: bucketName,
        Key: fileId + fileType,
        Body: fileStream,
        ContentType: contentType
      };
      // Upload file to S3
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          /* On S3 upload success, insert metadata to DB */
          /* If one tag is sent, it will be as a String (not array)
             So, create an array and add tag to array */
          if (!Array.isArray(req.body.tags)) {
              let tags = [req.body.tags];
              req.body.tags = tags;
          }
          mongoUtil.getDb().collection(colName).insertOne(req.body, function (err, res) {
              if (err) throw err;
          });
        }
        // delete local file on success and on failure
        fs.unlink(filePathWithNameWithType, (err) => {
            if (err) throw err;
        });
      });
    }
  });
  // TODO: Ensure there is always a response (not empty response)
  res.redirect('content/id/' + req.body.fileId);
});

module.exports = router;
