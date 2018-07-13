var express = require('express');
var router = express.Router();
var mongoUtil = require( '../mongoConfig' );
const uuidv1 = require('uuid/v1');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json({type: 'application/json'});
let colName = 'content' // collection name

router.get('/', function(req, res, next) {
  // let token = req.query.token;
  mongoUtil.getDb().collection(colName).find().toArray(function (err, result) {
    if (err) throw err
    res.send(content = { content: result  })
  })
});

router.post('/', jsonParser, function (req, res) {
  let imageId = uuidv1();
  req.body.imageId = imageId;
  let file = req.files.file;
  var filePathWithName = './public/images/' + imageId + '.jpg'
  file.mv(filePathWithName, function(err) {
    if (err) { console.log(err) }
  })
  mongoUtil.getDb().collection(colName).insertOne(req.body, function (err, res) {
    if (err) throw err;
  });
  res.send("Successful")
});

module.exports = router;
