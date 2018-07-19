var express = require('express');
var router = express.Router();
var index = require("../DAO/index");
var fs =require('fs');
/* GET home page. */
router.get('/', function (req, res, next) {
     res.redirect('./www/index.html');
});

module.exports = router;
