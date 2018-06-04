var express = require('express');
var router = express.Router();
var fs = require('fs');
var news = require('../DAO/adminNews');
var common = require('../DAO/common');

//qiniu
var qiniu = require('qiniu');
var config = new qiniu.conf.Config();
var accessKey = 'Uusbv77fI10iNTVF3n7EZWbksckUrKYwUpAype4i';
var secretKey = 'dEDgtx_QEJxfs2GltCUVgDIqyqiR6tKjStQEnBVq';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
// 空间对应的机房
config.zone = qiniu.zone.Zone_z2;
var bucketManager = new qiniu.rs.BucketManager(mac, config);

function deleteByBucketKey(bucket, key, error, callback) {
    bucketManager.delete(bucket, key, function (err, respBody, respInfo) {
        if (err) {
            console.log(err);
            // return error(err)
            //throw err;
        } else {
            console.log(respInfo.statusCode);
            console.log(respBody);
            // return callback(respBody)
        }
    });
};

var qiniuBucket = {
    img: "oneyouxiimg",
    // apk:"oneyouxiapk"
    // img:"oneyouxitestimg",
    // apk:"oneyouxitestapk"
    base64: 'onebase64'
};
//qiniu

router.get("/addNews", function (req, res, next) {
    if (req.query.title && req.query.detail) {
        var date = new Date();
        var data = req.query;
        var newsdata = {
            title: decodeURI(data.title),
            detail: data.detail,
            img: data.img,
            like: 0,
            comment: 0,
            browse: 0,
            add_time: date.Format('yyyy-MM-dd-HH-mm-SS'),
            game_id: data.game_id
        };
        news.addNews(newsdata, function (result) {
            result.insertId ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get("/deleteNewsByMsg", function (req, res, next) {
    //用于上传失败删除
    if (req.query.bucket && req.query.key) {
        deleteByBucketKey(req.query.bucket, req.query.key)
    }
});
router.get("/deleteNewsById", function (req, res, next) {
    //用于删除已有资讯
    if (req.query.id) {
        news.getNewsById(req.query.id, function (result) {
            if (result.length) {
                deleteByBucketKey(qiniuBucket.base64, result[0].detail_addr);
                deleteByBucketKey(qiniuBucket.img, result[0].title);
                news.deleteNewsById(req.query.id, function (result) {
                    result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
                })
            } else {
                res.json({state: 0});
            }
        })
    } else {
        res.json({state: 0});
    }
});
router.get("/addHeadGame", function (req, res, next) {
    if (req.query.game_id && req.query.img) {
        var data = req.query;
        news.getHeadGameByGameId(data.game_id, function (result) {
            !result.length ? news.addHeadGame(data.game_id, data.img, function (result) {
                result.insertId ? res.json({state: 1}) : res.json({state: 0})
            }) : res.json({state: 2})
        })
    } else {
        res.json({state: 0})
    }
});
router.get("/addSlideGame", function (req, res, next) {
    if (req.query.game_id) {
        var id = req.query.game_id;
        news.getSlideGameByGameId(id, function (result) {
            !result.length ? news.addSlideGame(id, function (result) {
                result.insertId ? res.json({state: 1}) : res.json({state: 0})
            }) : res.json({state: 2})
        })
    } else {
        res.json({state: 0})
    }
});
router.get("/getHeadGame", function (req, res) {
    var p = req.query.p > 0 ? req.query.p : 1;

    var tables = ["t_news_headGame", "t_game"];
    var where = " t_news_headGame.`game_id`=t_game.`id` order by t_news_headGame.id desc ";

    var field = "t_game.game_name,t_news_headGame.id";
    common.page(tables, p, where, "left", field, function (result) {
        res.json(result);
    })

    // news.getHeadGame(function (result) {
    //     res.json({state: 1, list: result})
    // })
});
router.get("/getSlideGame", function (req, res) {
    var p = req.query.p > 0 ? req.query.p : 1;

    var tables = ["t_news_slideGame", "t_game"];
    var where = "t_news_slideGame.`game_id`=t_game.`id` order by t_news_slideGame.id desc";

    var field = "t_game.game_name,t_news_slideGame.id";
    common.page(tables, p, where, "left", field, function (result) {
        res.json(result);
    })
    // news.getSlideGame(function (result) {
    //     res.json({state: 1, list: result})
    // })
});
router.get("/deleteSlideGameById", function (req, res) {
    if (req.query.id) {
        news.deleteSlideGameById(req.query.id, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get("/deleteHeadGameById", function (req, res) {
    if (req.query.id) {
        console.log(req.query.id);
        news.getHeadGameById(req.query.id, function (result) {
            console.log(result);
            if (result.length) {
                console.log(2);
                deleteByBucketKey(qiniuBucket.img, result[0].img);
                news.deleteHeadGameById(req.query.id, function (result) {
                    console.log(3);
                    result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
                })
            } else {
                console.log(4);
                res.json({state: 0})
            }
        })
    } else {
        console.log(5);
        res.json({state: 0})
    }
    // req.query.id && news.getHeadGameByGameId(req.query.id,function (result) {
    //     result.length && deleteByBucketKey(qiniuBucket.img,result[0].img),news.deleteHeadGameById(req.query.id,function (result) {
    //         result.affectedRows && res.json({state:1}) || res.json({state:0})
    //     })
    // }) || res.json({state:0})
});
module.exports = router;