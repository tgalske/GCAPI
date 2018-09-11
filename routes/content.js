let express = require('express');
let router = express.Router();
let mongoUtil = require('../mongoConfig');
let bodyParser = require('body-parser');
let jsonParser = bodyParser.json({type: 'application/json'});
let path = require('path');
let Fuse = require('fuse.js'); // search
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

// get all content
router.get('/', function (req, res, next) {
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.CONTENT_COLLECTION_NAME).find().sort({_id: -1}).toArray(function (err, content) {
    if (err) throw err;
    res.send(content);
  });
});

// get one item based on its ID
router.get('/id/:fileId', function (req, res) {
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.CONTENT_COLLECTION_NAME).findOne({fileId: req.params.fileId}, function (err, content) {
    if (err) throw err;
    res.send(content);
  })
});

// get 0 or many items based on search query
router.get('/search', function (req, res) {
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
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.CONTENT_COLLECTION_NAME).find().toArray(function (err, result) {
    if (err) throw err;
    var fuse = new Fuse(result, options);
    res.send(fuse.search(query));
  })
});

router.post('/', jsonParser, function (req, res) {
  if (!req.body.fileId || !req.files.file || !req.body.title) {
    res.send({error: req.app.locals.bootstrapConfigs.ERR_MISSING_FIELDS});
    return;
  }
  let fileId = req.body.fileId;
  let file = req.files.file;
  let fileType = path.extname(file.name);
  req.body.fileType = fileType;
  req.body.isImage = isImage(fileType);
  req.body.isVisible = true;

  // Save file locally
  let filePathWithNameWithType = 'public/' + fileId + fileType;
  file.mv(filePathWithNameWithType, function (err) {
    if (err) {
      console.log("Error saving file to local storage: " + err);
    } else {
      // Upload file to s3
      let bucketName = req.app.locals.bootstrapConfigs.S3_CONTENT_BUCKET_NAME;
      let fileStream = fs.createReadStream(filePathWithNameWithType);
      fileStream.on('error', function (err) {
        console.log('File Error', err);
      });

      let contentType = (req.body.isImage) ? 'image/' + fileType.substring(1, fileType.length) : 'video/' + fileType.substring(1, fileType.length);

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
             So, create an array and add the one tag */
          if (req.body.tags != null && !Array.isArray(req.body.tags)) {
            req.body.tags = [req.body.tags];
          }
          mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.CONTENT_COLLECTION_NAME).insertOne(req.body, function (err, res) {
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
  res.send(req.body)
});

module.exports = router;
