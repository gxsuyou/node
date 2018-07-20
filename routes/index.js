var express = require('express');
var router = express.Router();
var index = require("../DAO/index");

/* GET home page. */
router.get('/', function (req, res, next) {
    var test = 1;
    var date = new Date();
    var data = "game/gameId745.ipa";
    res.json({s: parseInt(data.substr(11))})

    //res.header('Content-Type', 'text/html');
    // res.render('index', { title: 'Express' });
});

module.exports = router;
