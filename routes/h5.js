var express = require('express');
var router = express.Router();
var PATH=require("../path");
var h5=require('../DAO/h5');
router.get("/getH5",function (req,res,next) {
    h5.getH5(req.query.page,function (result) {
        res.json({state:1,h5:result})
    })
});
router.get("/getH5ByMsg",function (req,res,next) {
    console.log(req.query);
    if(req.query.msg){
        h5.getH5ByMsg(req.query.msg,function (result) {
            res.json({state:1,h5:result})
        })
    }
});
module.exports = router;