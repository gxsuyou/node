var router=require('express').Router();
var store =require("../DAO/store");
router.get('/goods',function (req,res,next) {
    if(req.query.page){
        store.getgoods(req.query.page,function (result) {
            // console.log(result);
            result.length?res.json({state:1,goods:result[0]}):res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get("/goodType",function (req,res,next) {
    if(req.query.id){
        store.getGoodTypeById(req.query.id,function (result) {
            result.length?res.json({state:1,type:result}):res.json({state:0})
        })
    }
});
router.get("/goodTypeDetail",function (req,res,next) {
    if(req.query.goodId && req.query.typeId){
        store.getGoodTypeByGoodIdTypeId(req.query.goodId,req.query.typeId,function (result) {
            result.length?res.json({state:1,type:result[0]}):res.json({state:0})
        })
    }
});



router.get("/goodsById",function (req,res,next) {
    if(req.query.id){
        store.getGoodById(req.query.id,function (result) {
            result.length?res.json({state:1,goods:result}):res.json({state:0})
        })
    }else {
        res.json({state:0})
    }
});
router.get("/goodsListByPage",function (req,res,next) {
    if(req.query.page){
        store.getGoodsByPage(req.query.page,function (result) {
            res.json({state:1,goodsList:result})
        })
    }
});
router.get("/goodsImgById",function (req,res,next) {
    if(req.query.id){
        store.getGoodsImgById(req.query.id,function (result) {
            result.length?res.json({state:1,goodsImg:result}):res.json({state:0});
        })
    }
});

module.exports = router;