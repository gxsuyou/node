var express = require('express');
var router = express.Router();
var index = require("../DAO/index");
var fs = require('fs');
var path = require('path');
/* GET home page. */
router.get('/', function (req, res, next) {
    res.redirect("./www/index.html")
    // res.json({s: 1})
    // res.render('index', { title: 'Express' });

});

module.exports = router;
