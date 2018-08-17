var express = require('express');
var router = express.Router();
var mongoUtil = require( '../mongoConfig' );
const uuidv1 = require('uuid/v1');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json({type: 'application/json'});
let colName = 'members' // collection name

router.get('/', function(req, res, next) {
  let token = req.query.token;
  mongoUtil.getDb().collection(colName).find().toArray(function (err, result) {
    if (err) throw err
    res.send( { members: result  } )
  })
});

router.post('/', jsonParser, function (req, res) {
  const id = uuidv1();
  req.body.id = id;
  mongoUtil.getDb().collection(colName).insertOne(req.body, function (err, res) {
    if (err) throw err;
  });
  res.send(req.body);
});

router.get('/auth', function(req, res) {
  req.body.status = true
  res.send( { authenticated: true } )
})

module.exports = router;
