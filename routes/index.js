var express = require('express');
var router = express.Router();
var index = require("../DAO/index");

/* GET home page. */
router.get('/', function (req, res, next) {
    var test = 1;
    var date = new Date();
    //console.log(text.html());
    index.hasNewsComment(function (result) {
        var newTime = "";
        for (var i = 0; i < result.length; i++) {
            if (i >= result.length) break;
            var timeymd = result[i].add_time.substring(0, 10);
            var timehis = result[i].add_time.substring(11, 19);

            var timehis_a = timehis.split("-")
            var newHis = ""
            for (var ta in timehis_a) {
                // if (ta >= timehis_a.length) continue;
                newHis += timehis_a[ta] + ":";
                // console.log(newHis);
                //
            }
            newTime = timeymd + " " + newHis;
            newTime = newTime.substring(0, newTime.length - 1);

            index.upDateTime(result[i].id, newTime, function (up_result) {

            })
        }
        res.json({s: 1})
    })

    // index.carousel(1,function (result) {
    //     res.json(result)
    // });

    //res.header('Content-Type', 'text/html');
    // res.render('index', { title: 'Express' });
});

module.exports = router;
