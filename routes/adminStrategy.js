var express = require('express');
var router = express.Router();
var strategy = require('../DAO/adminStrategy');
var common = require('../DAO/common');

// var gm = require('gm');
// var imageMagick = gm.subClass({imageMagick: true});
var path = require("path");
var fs = require("fs");

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
router.get('/getStrategyByMsg', function (req, res) {
    var data = req.query;
    if (data.sort && data.page) {
        if (data.sort == 'essence') {
            strategy.getStrategyByEssence(data.page, function (result) {
                res.json({state: 1, strategy: result})
            })
        } else {
            strategy.getStrategyByMsg(data.sort, data.page, function (result) {
                res.json({state: 1, strategy: result})
            })
        }
    } else {
        res.json({state: 0})
    }
});
router.get('/getStrategyByMsgPage', function (req, res) {
    var p = req.query.p > 0 ? req.query.p : 1;
    var msg = req.query.msg;
    var tables = ["t_strategy", "t_user"];
    var where = {
        where: "t_strategy.user_id = t_user.id " +
        "LEFT JOIN t_admin ON t_strategy.user_id = t_admin.id AND t_strategy.admin = 1 " +
        "WHERE title LIKE '%" + msg + "%' ORDER BY t_strategy.id DESC"
    };

    var field = "t_strategy.*,t_user.nick_name,t_admin.comment AS admin_comment";
    common.page(tables, p, where, "left", field, function (result) {
        res.json(result);
    })
});
router.post('/addStrategy', function (req, res, next) {
    var data = req.body
    var date = new Date();
    if (data.title) {
        strategy.hasUserAndGame(data, function (result) {
            if (result.admin) {
                data.game_name = data.game_name || null
                data.add_time = parseInt(date.getTime() / 1000);
                data.adminstatus = 1;
                data.img_src = "http://img.oneyouxi.com.cn/" + data.img_src;
                strategy.addStratgy(data, function (add_result) {
                    add_result.insertId ? res.json({state: 1, id: add_result.insertId}) : res.json({state: 0})
                })
            } else {
                res.json({state: 0})
            }
        })
    }
});
router.post('/addStrategyGetApp', function (req, res, next) {
    var data = req.body
    var date = new Date();
    if (data.title) {
        //strategy.hasUserAndGame(data, function (result) {
        //    if (result.game_id && result.admin) {
        data.add_time = parseInt(date.getTime() / 1000);
        data.admin = 0;
        strategy.addStratgyApp(data, function (add_result) {
            add_result.insertId ? res.json({state: 1, id: add_result.insertId}) : res.json({state: 0})
        })
        //    }
        //})
    }
});

router.get("/setStrategy", function (req, res, next) {
    var data = req.query;
    if (data.id) {
        strategy.getStratgyMsg(data, function (result) {
            result.length ? res.json({state: 1, result: result[0]}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.post("/setStrategy", function (req, res, next) {
    var data = req.body;
    if (data.id && data.title) {
        //strategy.hasUserAndGame(data, function (result) {
        //    if (result.length) {
        strategy.setStratgy(data, function (add_result) {
            add_result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
        //} else {
        //    res.json({state: 0})
        //}
        //})
    }
});

router.get('/getStrategyCount', function (req, res) {
    strategy.getStrategyCount(function (result) {
        res.json({state: 1, len: result[0].len})
    })
});
router.get('/essence', function (req, res) {
    var data = req.query;
    if (data.essence && data.strategyId) {
        if (data.essence == 1) {
            strategy.unEssence(data.strategyId, function (result) {
                result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
            })
        } else {
            strategy.essence(data.strategyId, function (result) {
                result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
            })
        }
    } else {
        res.json({state: 0})
    }
});
router.get('/deleteStrategy', function (req, res) {
    var data = req.query;
    if (data.strategyId) {
        data.id = data.strategyId
        strategy.getStratgyMsg(data, function (s_result) {
            /**删除图片文件*/
            if (s_result) {
                deleteByBucketKey(qiniuBucket.img, "startegy/startegyId" + s_result[0].id);
                var str = s_result[0].detail;
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
            }

            strategy.deleteStrategy(data.strategyId, function (result) {
                result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
            })
        })

    } else {
        res.json({state: 0})
    }
});

// router.options("/upload",function(req,res){
//   res.json({
//     error:0,
//     data:[
//       "https://github-atom-io-herokuapp-com.global.ssl.fastly.net/assets/index-octonaut-4e00f2f8624e8075ff8aa84b51e3a446.svg"
//     ]});
// })

router.post("/img", function (req, res) {
    const data = [];
    req.files.forEach(function (item) {
        var newName = "www/upload/" + req.query.title + "_" + Math.floor(Math.random() * 10000) + "_" + item.originalname;
        data.push(req.query.url + newName);

        fs.rename(item.path, newName, function (err) {
            if (err) {

            } else {

            }
        })
    });
    res.json({errno: 0, data: data});
    return false;
});


module.exports = router;
