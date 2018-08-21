var express = require('express');
var router = express.Router();
var path = require("path");
var fs = require("fs");
var news = require('../DAO/adminNews');
var common = require('../DAO/common');
Date.prototype.Format = function (formatStr) {
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));
    str = str.replace(/MM/, this.getMonth() > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    str = str.replace(/M/g, this.getMonth());
    str = str.replace(/w|W/g, Week[this.getDay()]);
    str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    str = str.replace(/d|D/g, this.getDate());
    str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    str = str.replace(/h|H/g, this.getHours());
    str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    str = str.replace(/m/g, this.getMinutes());
    str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    str = str.replace(/s|S/g, this.getSeconds());
    return str;
};
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

router.get("/getNewsByPage", function (req, res, next) {
    var p = req.query.p > 0 ? req.query.p : 1;
    var tables = ['t_news', 't_user'];
    var where = {
        where: "t_news.add_user = t_user.id " +
        "LEFT JOIN t_admin ON t_news.add_admin = t_admin.id " +
        "ORDER BY t_news.id DESC "
    };

    var field = "t_news.id,t_news.title,t_news.agree,t_news.`comment`,t_news.browse," +
        "t_news.up,FROM_UNIXTIME(t_news.add_time,'%Y-%m-%d %H:%i') as add_time,t_user.nick_name,t_admin.comment AS admin_comment"
    common.page(tables, p, where, "left", field, function (result) {
        res.json(result);
    })
});

router.post("/addNews", function (req, res, next) {
    if (req.body.title && req.body.detail) {
        var date = new Date();
        var data = req.body;
        var gameId = data.game_id > 0 ? data.game_id : 0;
        var newsdata = {
            title: decodeURI(data.title) || "",
            detail: data.detail,
            img: data.img,
            like: 0,
            comment: 0,
            browse: 0,
            add_time: parseInt(date.getTime() / 1000),
            game_id: gameId,
            admin_id: data.admin
        };
        news.hasgame(gameId, function (game) {
            newsdata.game_name = game.length ? game[0].game_name : null;
            news.addNews(newsdata, function (result) {
                result.insertId ? res.json({state: 1}) : res.json({state: 0})
            })
        })
    } else {
        res.json({state: 0})
    }
});

router.get("/upNews", function (req, res, next) {
    if (req.query.id) {
        news.upNews(req.query, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});
router.get("/deleteNewsByMsg", function (req, res, next) {
    //用于上传失败删除
    if (req.query.bucket && req.query.key) {
        deleteByBucketKey(req.query.bucket, req.query.key)
    }
});

router.get("/getNewsByMsg", function (req, res, next) {
    if (req.query.id) {
        news.getNews(req.query.id, function (result) {
            result.length ? res.json(result) : res.json({})
        })
    } else {
        res.json({state: 0})
    }
});
router.post("/setNewsById", function (req, res, next) {
    var date = new Date();
    var data = req.body;
    data.up_time = parseInt(date.getTime() / 1000)
    if (data.id && data.title && data.browse && data.agree && data.comment) {
        news.editNewsById(data.id, data.title, data.detail, data.agree, data.browse, data.comment, data.up_time, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});

router.post("/setNewsFu", function () {
    var data = req.body;
    if (data.id && data.detail) {
        news.setNewsFu(data, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});

router.get("/deleteNewsById", function (req, res, next) {
    //用于删除已有资讯
    if (req.query.id) {
        news.getNewsById(req.query.id, function (n_result) {
            if (n_result.length) {
                // deleteByBucketKey(qiniuBucket.base64, result[0].detail_addr);
                deleteByBucketKey(qiniuBucket.img, "News/newsName=" + n_result[0].title);
                /**删除图片文件*/
                var str = n_result[0].detail;
                var imgReg = /<img.*?(?:>|\/>)/gi;
                var srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
                var arr = str.match(imgReg);
                if (arr) {
                    for (var i = 0; i < arr.length; i++) {
                        var src = arr[i].match(srcReg);
                        //获取图片地址，src[1]
                        var imgUrl = src[1].substr(src[1].indexOf("www"))//获取图片地址，并从www开始截取后面的字符
                        if (fs.existsSync(path.join(__dirname, '../' + imgUrl))) {//查看文件是否存在，是返回true，否返回fales
                            fs.unlinkSync(path.join(__dirname, '../' + imgUrl));//执行删除文件
                        }
                    }
                }

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
            !result.length ? news.addHeadGame(data.game_id, data.img, data.sys, function (result) {
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
    var where = {where: " t_news_headGame.`game_id`=t_game.`id` order by t_news_headGame.id desc "};

    var field = "t_game.game_name,t_game.sys,t_news_headGame.id";
    common.page(tables, p, where, "left", field, function (result) {
        res.json(result);
    })
});
router.get("/getSlideGame", function (req, res) {
    var p = req.query.p > 0 ? req.query.p : 1;

    var tables = ["t_news_slideGame", "t_game"];
    var where = {where: "t_news_slideGame.`game_id`=t_game.`id` order by t_news_slideGame.id desc"};

    var field = "t_game.game_name,t_game.sys,t_news_slideGame.id";
    common.page(tables, p, where, "left", field, function (result) {
        res.json(result);
    })
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
        news.getHeadGameById(req.query.id, function (result) {
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
