var express = require('express');
var router = express.Router();
var mongoUtil = require( '../mongoConfig' );
const uuidv1 = require('uuid/v1');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json({type: 'application/json'});
let colName = 'content' // collection name
var path = require('path')
var Fuse = require('fuse.js'); // search
const sharp = require('sharp'); // image manipulation
var fs = require('fs');
var zlib = require('zlib');
var AWS = require('aws-sdk');
var s3 = new AWS.S3();

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
    if (err) throw err
    res.send(content)
  });
});

router.get('/id/:fileId', function (req, res) {
  mongoUtil.getDb().collection(colName).findOne({fileId: req.params.fileId}, function (err, content) {
    if (err) throw err;
    res.send(content)
  })
});

router.get('/search', function(req, res) {
  let query = req.query.query;
  var options = {
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
  var filePathWithNameWithType = 'public/images/' + fileId + fileType
  file.mv(filePathWithNameWithType, function(err) {
    if (err) {
      console.log(err)
    } else {
      // Upload file to s3
      var bucketName = "s3-gc-media"
      var fileStream = fs.createReadStream(filePathWithNameWithType);
      fileStream.on('error', function(err) {
        console.log('File Error', err);
      });

      let contentType = (req.body.isImage) ? 'image/' + fileType.substring(1, fileType.length) : 'video/' + fileType.substring(1, fileType.length)

      var uploadParams = {
        Bucket: bucketName,
        Key: fileId + fileType,
        Body: fileStream,
        ContentType: contentType
      };
      // Upload file to S3 bucket
      s3.upload(uploadParams, function (err, data) {
        if (err) {
          console.log("Error", err);
        }
      });
    }
  })



  /* If one tag is sent, it will be as a String (not array)
  So, create an array and add tag to array */
  if (!Array.isArray(req.body.tags)) {
    let tags = [req.body.tags]
    req.body.tags = tags
  }

  mongoUtil.getDb().collection(colName).insertOne(req.body, function (err, res) {
    if (err) throw err;
  });
  console.log(fileId)
  res.redirect('content/id/' + req.body.fileId);
});

module.exports = router;
