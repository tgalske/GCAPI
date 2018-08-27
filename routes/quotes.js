let express = require('express');
let router = express.Router();
let mongoUtil = require( '../mongoConfig' );
const uuidv1 = require('uuid/v1');
let bodyParser = require('body-parser');
let jsonParser = bodyParser.json({type: 'application/json'});
let colName = 'quotes' // collection name

router.get('/', function(req, res, next) {
  let token = req.query.token;
  mongoUtil.getDb().collection(colName).find().toArray(function (err, result) {
    if (err) throw err;
    res.send( { result  } );
  });
});

router.get('/:memberId', function (req, res) {
  mongoUtil.getDb().collection(colName).find({memberId: req.params.memberId }).project({quote: 1, _id: 0}).sort( { _id: -1 } ).toArray(function (err, result) {
    if (err) throw err;
    var quotes = [];
    for (var i = 0; i < result.length; i++) {
      quotes[i] = result[i].quote;
    }
    result = {
      memberId: req.params.memberId,
      quotes: quotes
    };
    res.send(result)
  })
});

// router.get('/:memberId/:id', function (req, res) {
//   mongoUtil.getDb().collection(colName).findOne({memberId: req.params.memberId}, function (err, result) {
//     if (err) throw err;
//     res.send(result)
//   })
// });

router.post('/', jsonParser, function (req, res) {
  mongoUtil.getDb().collection(colName).insertOne(req.body, function (err) {
    if (err) throw err;
  });
  res.send(req.body);
});

module.exports = router;
