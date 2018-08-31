let express = require('express');
let router = express.Router();
let mongoUtil = require('../mongoConfig');
const uuidv1 = require('uuid/v1');
let bodyParser = require('body-parser');
let jsonParser = bodyParser.json({type: 'application/json'});

router.get('/', function(req, res, next) {
  let token = req.query.token;
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.MEMBERS_COLLECTION_NAME).find().toArray(function (err, result) {
    if (err) throw err;
    res.send( { members: result  } );
  });
});

router.get('/id/:id', function (req, res) {
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.MEMBERS_COLLECTION_NAME).findOne({id: req.params.id}, function (err, result) {
    if (err) throw err;
    res.send(result)
  })
});

router.post('/', jsonParser, function (req, res) {
  const id = uuidv1();
  req.body.id = id;
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.MEMBERS_COLLECTION_NAME).insertOne(req.body, function (err) {
    if (err) throw err;
  });
  res.send(req.body);
});

module.exports = router;
