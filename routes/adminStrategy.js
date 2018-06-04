var express = require('express');
var router = express.Router();
var strategy=require('../DAO/adminStrategy');
var common = require('../DAO/common');
router.get('/getStrategyByMsg',function (req,res) {
    var data = req.query;
    if(data.sort && data.page){
        if(data.sort=='essence'){
            strategy.getStrategyByEssence(data.page,function (result) {
                res.json({state:1,strategy:result})
            })
        }else {
            strategy.getStrategyByMsg(data.sort,data.page,function (result) {
                res.json({state:1,strategy:result})
            })
        }
    }else {
        res.json({state:0})
    }
});
router.get('/getStrategyByMsgPage',function (req,res) {
    var p = req.query.p > 0 ? req.query.p : 1;
    var msg = req.query.msg;

    var tables = ["t_strategy", "t_user"];
    var where = "t_strategy.user_id = t_user.id where title like '%"+msg+"%' order by t_strategy.add_time";

    var field = "t_strategy.*,t_user.nick_name";
    common.page(tables, p, where, "left", field, function (result) {
        res.json(result);
    })

    // var data = req.query;
    // if(data.page && data.page>0){
    //     console.log(1);
    //     strategy.getStrategyByMsgPage(data.msg,data.page,function (result) {
    //         res.json({state:1,len:result.len,strategy:result})
    //     })
    // }else {
    //     res.json({state:0})
    // }
});
router.get('/getStrategyCount',function (req,res) {
    strategy.getStrategyCount(function (result) {
        res.json({state:1,len:result[0].len})
    })
});
router.get('/essence',function (req,res) {
    var data =req.query;
    if(data.essence && data.strategyId){
        if(data.essence==1){
            strategy.unEssence(data.strategyId,function (result) {
                result.affectedRows ? res.json({state:1}) :  res.json({state:0})
            })
        }else {
            strategy.essence(data.strategyId,function (result) {
                result.affectedRows ? res.json({state:1}) :  res.json({state:0})
            })
        }
    }else {
        res.json({state:0})
    }
});
router.get('/deleteStrategy',function (req,res) {
    var data =req.query;
    if(data.strategyId){
        strategy.deleteStrategy(data.strategyId,function (result) {
            result.affectedRows ? res.json({state:1}) :  res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
module.exports = router;