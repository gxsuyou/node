var express = require('express');
var path = require('path');
var fs=require("fs");
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var timeout = require('connect-timeout');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');
var multer =require('multer');
var index = require('./routes/index');
var users = require('./routes/users');
var game = require('./routes/game');
var admins = require('./routes/admins');
var store = require('./routes/store');
var news = require('./routes/news');
var h5 = require('./routes/h5');
var page = require('./routes/page');
var adminNews = require('./routes/adminNews');
var adminH5 = require('./routes/adminH5');
var adminGame = require('./routes/adminGame');
var adminStrategy = require("./routes/adminStrategy");
var app = express();
<<<<<<< HEAD
app.use('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers","X-Requested-With,content-type");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    //res.header("Content-Type", "application/json;charset=utf-8");
    //res.header("Content-Type", "text/html");
=======

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    //res.header("Content-Type", "text/html");
    next();
});
app.use(function getIp(req, res, next) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0];
    }
    console.log(ip);
    //return ip;
>>>>>>> 529fa27c8b6d2e537d3b372a9c1be3b91c1f097d
    next();
});
app.use(function(req,res,next){
   if(req.url.indexOf("www/upload")!==-1){
     fs.readFile("./"+req.url,function(err,data){
        if(err){
        }else{
          res.write(data);
          res.end();
        }
     });

   }else{
     next();
   }

});
//http://192.168.0.104:8878/upload/Stragey_IMG_15042018_091317_0.png


// view engine setup
// app.set('views', path.join(__dirname, '/views'));
// app.set('view engine', 'html');
// app.engine('.html', require('ejs').__express);
// app.set('view engine', 'html');
// app.engine('.html',require('html').__express);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
var objMulter=multer({dest:"./www/upload/"});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(objMulter.any());
//app.use(static('./upload'));
// app.use(express.bodyParser());

app.use('/', index);
app.use("/game", game);
app.use('/users', users);
app.use('/page', page);
app.use('/admin', admins);
app.use('/store', store);
app.use("/news", news);
app.use("/h5", h5);
app.use('/adminH5', adminH5);
app.use('/adminNews', adminNews);
app.use('/adminGame', adminGame);
app.use("/adminStrategy", adminStrategy);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
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
function haltOnTimedout(req, res, next) {
    if (!req.timedout) next()
}

// app.listen(8080,()=>{
//console.log(req.connection.remoteAddress);
// });

module.exports = app;
