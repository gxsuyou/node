var express = require('express');
var router = express.Router();
var strategy=require('../DAO/adminStrategy');
var common = require('../DAO/common');
var path =require("path");
var fs =require("fs");
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

// router.options("/upload",function(req,res){
//   res.json({
//     error:0,
//     data:[
//       "https://github-atom-io-herokuapp-com.global.ssl.fastly.net/assets/index-octonaut-4e00f2f8624e8075ff8aa84b51e3a446.svg"
//     ]});
// })

router.post("/img",function(req,res){
//  console.log(req.files);
  // var str ="";
  // req.on("data",function(){
  //   str+=data;
  // });
  // req.on('end',function(){
  //   console.log(str);
  // })
  // return false;
  const data=[];
  req.files.forEach(function(item){
    var newName="www/upload/"+req.query.title+"_"+item.originalname;
    data.push(req.query.url+newName);
    fs.rename(item.path,newName,function(err){
      if(err){

      }else{


      }
    });
  });
 res.json({errno:0,data:data});
  // function rename(){
  //   return
  //
  // }
  return false;
  //console.log(req.query.url);
  fs.rename(req.files[0].path,newName,function(err){
    if(err){
      res.json({
        errno:1,
        data:[]
      });
     }
    else{
       res.json({
         errno:0,
         data:[
           req.query.url+newName
         ]
       });
    }

  })
  // res.json({
  //   errno:0,
  //   data:[
  //     "https://github-atom-io-herokuapp-com.global.ssl.fastly.net/assets/index-octonaut-4e00f2f8624e8075ff8aa84b51e3a446.svg"
  //   ]});
})
module.exports = router;
