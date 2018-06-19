var router=require('express').Router();
var game =require("../DAO/game");


router.get('/detail', function(req, res, next) {
    game.getDetailById(req.query.id,function (result) {
        result.length? res.json({state:1,gameDetail:result[0][0],gameImg:result[1]}):res.json({state:0})
    })
});
router.get('/edit',function (req,res,next) {
    game.editGameById(1,req.query.text,function (result) {
        res.json({result:result})
    });
});
router.get("/carousel",function (req,res,next) {
    game.getCarousel(function (result) {
        result.length? res.json({state:1,carousel:result}):res.json({state:0})
    })
});
router.get("/active",function (req,res,next) {
    game.getActive(function (result) {
        result.length? res.json({state:1,active:result}):res.json({state:0})
    })
});
router.get("/clsActive",function (req,res,next) {
    game.getClsActive(function (result) {
        result.length? res.json({state:1,clsActive:result}):res.json({state:0})
    })
});
router.get("/getGameByMsg",function (req,res,next) {
    req=req.query;
    // console.log(req);
    game.getGameByMsg(req.sys,req.type,req.sort,req.page,function (result) {
        // console.log(result);
        res.json({state:1,game:result})
    })
});
router.get("/hotGame",function (req,res,next) {
    game.getHotGame(function (result) {
        result.length?res.json({state:1,game:result[0]}):res.json({state:0})
    })
});
router.get("/clsIconActive",function (req,res,next) {
    game.getClsIconActive(function (result) {
        result.length?res.json({state:1,game:result}):res.json({state:0})
    })
});
router.get("/getGameCommentByIdPage",function (req,res,next) {
    if(req.query.gameId){
        game.getGameCommentById(req.query.gameId,req.query.page,function (result) {
            result.length?res.json({state:1,recommend:result}):res.json({state:0})
        })
    }
});
router.get("/getGameCommentCountById",function (req,res,next) {
    if(req.query.gameId){
        game.getGameCommentCountById(req.query.gameId,function (result) {
            if(result){
                res.json({state:1,count:result[0].count})
            }else {
                res.json({state:0})
            }
        })
    }
});
router.get("/getGameCommentCountByScore",function (req,res,next) {
    if(req.query.gameId && req.query.score){
        game.getGameCommentCountByScore(req.query.gameId,req.query.score,function (result) {
            if(result){
                res.json({state:1,count:result[0].count})
            }else {
                res.json({state:0})
            }
        })
    }
});
router.get('/game/comment',function (req,res,next) {
    var data=req.query;
    game.gameComment(data.userId,data.gameId,data.score,data.content,data.agree,date.Format('yyyy-MM-dd'),data.parentId,data.address,function (result) {
        if(result.insertId){
            game.getGameCommentScoreById(data.gameId,function (result) {
                if(result.length>0){
                    var len=result.length;
                    var allScore=0;
                    for(var i=0;i<len;i++){
                        allScore+=result[i].score;
                    }
                    // console.log((allScore / len).toFixed(1));
                    game.updateGameScore(data.gameId,(allScore / len).toFixed(1),function (result) {
                        result.affectedRows?res.json({state:1}):res.json({state:0})
                    })
                }
            })
        }
    })
});
router.get("/searchGameByMsg",function (req,res,next) {
    if(req.query.msg){
        var data= req.query;
        game.getGameByLikeMsg(data.sys,data.msg,data.sort,data.page,function (result) {
            result.length?res.json({state:1,game:result}):res.json({state:0})
        })
    }
});
router.get("/likeGameComment",function (req,res,next) {
    console.log(req.query);
    // game.like(req.query.)
});
router.get("/addDownloadNum",function (req,res,next) {
    if(req.query.id){
        game.addDownloadNum(req.query.id,function (result) {
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
    }
});


module.exports = router;