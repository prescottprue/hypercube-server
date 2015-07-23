var express = require('express'),
path = require('path'),
favicon = require('serve-favicon'),
logger = require('morgan'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
_ = require('underscore'),
jwt = require('express-jwt'),
config = require('./backend/config/default').config,
cors = require('cors');
systemUtils = require('./lib/systemUtils');


var app = express();

var routes = require('./backend/config/routes');
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
//Set cors configuration
app.use(cors());

//Protect all routes except allowedPaths by requiring Authorization header
var allowedPaths = ['/', '/login', '/signup', '/docs'];
app.use(jwt({secret: config.jwtSecret}).unless({path:allowedPaths}));
//Handle unauthorized errors
app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({message:'Invalid token', code:'UNAUTHORIZED'});
  }
});


//Setup routes based on config
routeBuilder(routes);

//------------ Error handlers -----------//

//Log Errors before they are handled
app.use(function (err, req, res, next) {
  console.log(err.message, req.originalUrl);
  if(err){
    res.status(500);
  }
  res.send('Error: ' + err.message);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'local') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

/**
 * Get port from environment and store in Express.
 */

var port = systemUtils.normalizePort(process.env.PORT || '3000');
console.log('localhost port:', port);
app.set('port', port);

var server = systemUtils.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);


module.exports = app;
/**
 * Load view helpers
 */
require('./app-locals');

