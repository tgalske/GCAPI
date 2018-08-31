const express = require('express');
const router = express.Router();
const mongoUtil = require( '../mongoConfig' );
const uuidv1 = require('uuid/v1');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json({type: 'application/json'});

// get all quotes from newest to oldest
router.get('/', function(req, res) {
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.QUOTES_COLLECTION_NAME).find().sort({ _id: -1 }).toArray((err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// get all quotes and quote IDs from a member where isVisible is true
router.get('/member/:memberId', function (req, res) {
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.QUOTES_COLLECTION_NAME).find({memberId: req.params.memberId, isVisible: true }).sort( { _id: -1 } ).toArray((err, result) => {
    if (err) throw err;
    res.send(result);
  })
});

// get one quote based on its ID
router.get('/id/:id', function (req, res) {
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.QUOTES_COLLECTION_NAME).findOne({id: req.params.id }, ((err, result) => {
    if (err) throw err;
    res.send(result);
  }));
});

// update one quote based on its ID
router.put('/id/:id', function (req, res) {
  if (!req.params.id) {
    res.send({error: req.app.locals.bootstrapConfigs.ERR_MISSING_FIELDS});
    return;
  }
  const query = { id: req.params.id };
  const newQuote = { $set: { quote: req.body.quote } };
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.QUOTES_COLLECTION_NAME).updateOne(query, newQuote, ((err, result) => {
    if (err) throw err;
    res.send(result);
  }));
});

// sets the quote to not visible (fake-deconste)
router.put('/id/hide/:id', function (req, res) {
  if (!req.params.id) {
    res.send({error: req.app.locals.bootstrapConfigs.ERR_MISSING_FIELDS});
    return;
  }
  const query = { id: req.params.id };
  const setNotVisible = { $set: { isVisible: false } };
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.QUOTES_COLLECTION_NAME).updateOne(query, setNotVisible, ((err, result) => {
    if (err) throw err;
    res.send(result);
  }));
});


router.post('/', jsonParser, function (req, res) {
  if (!req.params.id || !req.params.memberId || !req.params.quote) {
    res.send({error: req.app.locals.bootstrapConfigs.ERR_MISSING_FIELDS});
    return;
  }
  mongoUtil.getDb().collection(req.app.locals.bootstrapConfigs.QUOTES_COLLECTION_NAME).insertOne(req.body, function (err) {
    if (err) throw err;
  });
  res.send(req.body);
});

module.exports = router;
