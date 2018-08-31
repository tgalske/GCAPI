const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoUtil = require('./mongoConfig');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const fs = require('fs');

// fetch bootstrap configs
axios.get('https://s3.amazonaws.com/s3-gc-configs/backend-configs.json').then( (response) => {
  app.locals.bootstrapConfigs = response.data;
}).catch( (error) => {
  console.log("Failed to load remote bootstrap configurations. Fetching local bootstrap configurations.");
  fs.readFile('local_configs/backend-configs-0.1.json', 'utf8', function (err, data) {
    app.locals.bootstrapConfigs = data;
  });
});

const indexRouter = require('./routes/index');
const membersRouter = require('./routes/members');
const contentRouter = require('./routes/content');
const quotesRouter = require('./routes/quotes');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

// https://enable-cors.org/server_expressjs.html
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

mongoUtil.connectToServer( function( err ) {
  app.use('/', indexRouter);
  app.use('/members', membersRouter);
  app.use('/content', contentRouter);
  app.use('/quotes', quotesRouter);

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
} );
module.exports = app;
