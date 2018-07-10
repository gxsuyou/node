var express = require('express');
var router = express.Router();
var index = require("../DAO/index");

/* GET home page. */
router.get('/', function (req, res, next) {
    var test = 1;
    var date = new Date();
    // index.carousel(1,function (result) {
    res.json({s: 1})
    // });

    //res.header('Content-Type', 'text/html');
    // res.render('index', { title: 'Express' });
});

module.exports = router;
