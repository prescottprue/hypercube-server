var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');
var jwt = require('express-jwt');
var config = require('./backend/config/default').config;


var routes = require('./backend/config/routes');
var app = express();
var routeBuilder = require('./backend/lib/routeBuilder')(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('config', config);
app.set('env', app.get('config').env);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var allowedPaths = ['/', '/login', '/signup', '/docs'];
// var assets = require('./assets');
// allowedPaths = _.union(allowedPaths, config.vendor, config.app);
console.log('config:', config);
//Protect all routes by requiring Authorization header
app.use(jwt({secret: config.jwtSecret}).unless({path:allowedPaths}));

//Setup routes based on config
routeBuilder(routes);
// app.use('/', routes);
//Log Errors before they are handled
app.use(function (err, req, res, next) {
  console.log(err.message, req.originalUrl);
  if(err){
    res.status(500);
  }
  res.send('Error: ' + err.message);
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
/**
 * Load view helpers
 */
require('./app-locals');