var express = require('express');
var router = express.Router();
var mongoUtil = require( '../mongoConfig' );
const uuidv1 = require('uuid/v1');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json({type: 'application/json'});
let colName = 'content' // collection name
var path = require('path')

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
  // let token = req.query.token;
  mongoUtil.getDb().collection(colName).find().toArray(function (err, result) {
    if (err) throw err
    res.send(content = { content: result  })
  })
});

router.post('/', jsonParser, function (req, res) {
  let imageId = uuidv1();
  let file = req.files.file;
  let fileType = path.extname(file.name);
  req.body.fileType = fileType;
  req.body.imageId = imageId;
  req.body.isImage = isImage(fileType);

  var filePathWithNameWithType = './public/images/' + imageId + fileType
  file.mv(filePathWithNameWithType, function(err) {
    if (err) { console.log(err) }
  })

  /* If one tag is sent, it will be as a String (not array)
     Create array, add tag to array */
  if (!Array.isArray(req.body.tags)) {
    let tags = [req.body.tags]
    req.body.tags = tags
  }

  mongoUtil.getDb().collection(colName).insertOne(req.body, function (err, res) {
    if (err) throw err;
  });
  res.send("Successful")
});

module.exports = router;
