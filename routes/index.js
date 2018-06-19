var express = require('express');
var router = express.Router();
var index = require("../DAO/index");

/* GET home page. */
router.get('/', function (req, res, next) {
    console.log(1);
    var ids = ",35,33,32,30,29,28,36,31,";
    ids = ids.substr(1)
    ids = ids.substring(0, ids.length - 1)
    index.setadd("", function (result) {
        res.json({s: result})
    })

    // index.carousel(1,function (result) {
    //     res.json(result)
    // });

    //res.header('Content-Type', 'text/html');
    // res.render('index', { title: 'Express' });
});

module.exports = router;
