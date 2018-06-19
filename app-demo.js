var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var timeout = require('connect-timeout');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');

var index = require('./routes/index');
var users = require('./routes/users');
var game  = require('./routes/game');
var admin = require('./routes/admin');
var store = require('./routes/store');
var news = require('./routes/news');
var h5 = require('./routes/h5');
var page = require('./routes/page');
var adminNews = require('./routes/adminNews');
var adminH5 = require('./routes/adminH5');
var adminGame=require('./routes/adminGame');
var adminStrategy=require("./routes/adminStrategy");
var app = express();
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
// view engine setup
// app.set('views', path.join(__dirname, 'botSup/html/'));
// app.set('view engine', 'html');
// app.engine('.html', require('ejs').__express);
// app.set('view engine', 'html');
// app.engine('.html',require('html').__express);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'resource')));
// app.use(express.bodyParser());

app.use('/', index);
app.use("/game",game);
app.use('/users',users);
app.use('/page',page);
app.use('/admin',admin);
app.use('/store',store);
app.use("/news",news);
app.use("/h5",h5);
app.use('/adminH5',adminH5);
app.use('/adminNews',adminNews);
app.use('/adminGame',adminGame);
app.use("/adminStrategy",adminStrategy);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  // res.render('error');
});
// global.PUBLIC_PATH = __dirname + '/public/';
// console.log(PUBLIC_PATH);
app.use(timeout('5s'));
//....一些中间件
app.use(haltOnTimedout);
function haltOnTimedout (req, res, next) {
    if (!req.timedout) next()
}

app.listen(9800,()=>{
    console.log("9800");
});

module.exports = app;
