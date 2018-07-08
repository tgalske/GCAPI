var express = require('express');
var router = express.Router();
var mongoUtil = require( '../mongoConfig' );
const uuidv1 = require('uuid/v1');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json({type: 'application/json'});
let colName = 'content' // collection name

router.get('/', function(req, res, next) {
  let token = req.query.token;
  mongoUtil.getDb().collection(colName).find().toArray(function (err, result) {
    if (err) throw err
    res.send(content = { content: result  })
  })
});

router.post('/', jsonParser, function (req, res) {
  if (!req.files)
    return res.status(400).send('No files were upload.');
  let imageId = uuidv1()
  let sampleFile = req.files.sampleFile;
  var filePathWithName = './public/images/' + imageId + '.jpg'
  sampleFile.mv(filePathWithName, function(err) {
    if (err)
      return res.status(500).send(err);
    console.log("Successfully uploaded image")
    req.body.imageId = imageId
    mongoUtil.getDb().collection(colName).insertOne(req.body, function (err, res) {
      if (err) throw err;
    });
    res.redirect(301, 'http://127.0.0.1:3001');
  });
});

module.exports = router;
