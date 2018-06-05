var express = require('express');
var router = express.Router();
var index =require("../DAO/index");

/* GET home page. */
router.get('/', function(req, res, next) {
    console.log(1);
    res.json({s:1})
    // index.carousel(1,function (result) {
    //     res.json(result)
    // });

  //res.header('Content-Type', 'text/html');
  // res.render('index', { title: 'Express' });
});

module.exports = router;
