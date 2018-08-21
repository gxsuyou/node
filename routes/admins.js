var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var formidable = require('formidable');
var PATH = require("../path");
var path = PATH.game;
var resource = PATH.resource;
var admin = require('../DAO/admin');
var common = require('../DAO/common');
var page = require('../DAO/page');

//qiniu
var qiniu = require('qiniu');
var config = new qiniu.conf.Config();
var formUploader = new qiniu.form_up.FormUploader(config);
var putExtra = new qiniu.form_up.PutExtra();
var accessKey = 'Uusbv77fI10iNTVF3n7EZWbksckUrKYwUpAype4i';
var secretKey = 'dEDgtx_QEJxfs2GltCUVgDIqyqiR6tKjStQEnBVq';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
// 空间对应的机房
config.zone = qiniu.zone.Zone_z2;
var bucketManager = new qiniu.rs.BucketManager(mac, config);


function uploadQiniu(path, scope, key, callback) {
    var options = {
        scope: scope + ":" + key,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    var localFile = path;
    // var key=key;
// 文件上传
    try {
        formUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
            if (respErr) {
                // throw respErr;
                console.log(respErr)
            }
            if (respInfo.statusCode == 200) {
                callback(respInfo, respBody)
            } else {
                callback(respInfo, respBody);
            }
        });
    } catch (e) {
        console.log(e);
    }
}


function getUpToken(scope, key) {
    var options = {
        scope: scope + ":" + key,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
}

function resumeUploaderqiniu(path, scope, key, callback) {
    var options = {
        scope: scope + ":" + key,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
    };
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    var localFile = path;
    var resumeUploader = new qiniu.resume_up.ResumeUploader(config);
    var putExtra = new qiniu.resume_up.PutExtra();
// 文件上传
    resumeUploader.putFile(uploadToken, key, localFile, putExtra, function (respErr, respBody, respInfo) {
        if (respErr) {
            throw respErr;
        }
        if (respInfo.statusCode == 200) {
            // console.log(respInfo.statusCode,respBody);
            callback(respInfo, respBody)
        } else {
            // res.json({state:0});
            callback(respInfo, respBody);
            // console.log(respInfo.statusCode);
            // console.log(respBody);
        }
    });
};

function deleteFileByPrefix(bucket, prefix) {
// @param options 列举操作的可选参数
//                prefix    列举的文件前缀
//                marker    上一次列举返回的位置标记，作为本次列举的起点信息
//                limit     每次返回的最大列举文件数量
//                delimiter 指定目录分隔符
    var bucket = bucket;
    var options = {
        limit: 20,
        prefix: prefix
    };
    bucketManager.listPrefix(bucket, options, function (err, respBody, respInfo) {
        if (err) {
            console.log(err);
            throw err;
        }
        if (respInfo.statusCode == 200) {
            //如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
            //指定options里面的marker为这个值
            // var nextMarker = respBody.marker;
            var commonPrefixes = respBody.commonPrefixes;
            var items = respBody.items;
            var deleteOperations = [];
            items.forEach(function (item) {
                deleteOperations.push(qiniu.rs.deleteOp(bucket, item.key));

                console.log(item.key);
                // console.log(item.putTime);
                // console.log(item.hash);
                // console.log(item.fsize);
                // console.log(item.mimeType);
                // console.log(item.endUser);
                // console.log(item.type);
            });
            // console.log(deleteOperations);
            //每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
            bucketManager.batch(deleteOperations, function (err, respBody, respInfo) {
                if (err) {
                    console.log(err);
                    //throw err;
                } else {
                    // 200 is success, 298 is part success
                    if (parseInt(respInfo.statusCode / 100) == 2) {
                        respBody.forEach(function (item) {
                            if (item.code == 200) {
                                console.log(item.code + "\tsuccess");
                            } else {
                                console.log(item.code + "\t" + item.data.error);
                            }
                        });
                    } else {
                        console.log(respInfo.deleteusCode);
                        console.log(respBody);
                    }
                }
            });
        } else {
            console.log(respInfo.statusCode);
            console.log(respBody);
        }
    });
}

function upbase64(scope, url, data, key, callback) {
    var options = {
        scope: scope + ":" + key,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
    };
    var url = url + key;
    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    request({
        url: url,
        method: "POST",
        headers: {
            "content-type": "application/octet-stream",
            "Authorization": "UpToken " + uploadToken
        },
        body: JSON.stringify(data)
    }, function (error, response, body) {
        if (!error && response.statusCode && !body.error == 200) {
            return callback(body)
        } else {
            console.log(body);
        }
    });
}

//qiniu

var rmdirSync = (function () {
    function iterator(url, dirs) {
        var stat = fs.statSync(url);
        if (stat.isDirectory()) {
            dirs.unshift(url);//收集目录
            inner(url, dirs);
        } else if (stat.isFile()) {
            fs.unlinkSync(url);//直接删除文件
        }
    }

    function inner(path, dirs) {
        var arr = fs.readdirSync(path);
        for (var i = 0, el; el = arr[i++];) {
            iterator(path + "/" + el, dirs);
        }
    }

    return function (dir, cb) {
        cb = cb || function () {
        };
        var dirs = [];

        try {
            iterator(dir, dirs);
            for (var i = 0, el; el = dirs[i++];) {
                fs.rmdirSync(el);//一次性删除所有收集到的目录
            }
            cb()
        } catch (e) {//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            e.code === "ENOENT" ? cb() : cb(e);
        }
    }
})();


var date = new Date();
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

var qiniuBucket = {
    img: "oneyouxiimg",
    apk: "oneyouxiapk",
    ipa: "oneyouxiipa"
// img:"oneyouxitestimg",
// apk: "oneyouxitestapk"
};
/**
 * 删除图片
 */
router.get('/deleteGameImg', function (req, res) {
    var data = req.query;
    if (data.id) {
        deleteFileByPrefix(qiniuBucket.img, "game/gameId" + data.id);
        admin.getHasIosOrAndroid(data.id, function (result1) {
            admin.deleteGameImg(result1[0].id, function (result2) {
                res.json({state: 1});
            })
        })
    } else {
        res.json({state: 0})
    }
});
/**
 * apk、ipa包删除
 */
router.get('/deleteGameApp', function (req, res) {
    var data = req.query;
    data.sys = data.sys > 0 ? data.sys : 2;
    if (data.key) {
        var qiniu = qiniuBucket.apk
        if (data.sys == 1) {
            qiniu = qiniuBucket.ipa
        }
        var id = parseInt(data.key.substr(11));
        deleteFileByPrefix(qiniu, "game/gameId" + id);

        admin.deleteGameApp(id, function (result) {
            res.json({state: 1})
        })
    } else {
        res.json({state: 0})
    }
});
router.get('/getUptokenByMsg', function (req, res, next) {
    if (req.query.scope && req.query.key) {
        var token = getUpToken(req.query.scope, req.query.key);//获取token
        res.json({state: 1, upToken: token})
        return false;
    } else {
        res.json({state: 0})
    }

});
/**
 * 删除游戏
 */
router.get('/deleteGame', function (req, res, next) {
    var id = req.query.id;
    if (id) {
        admin.getGameMsgById(id, function (game) {
            if (game.length) {
                admin.deleteGame(id, function (result) {//删除分类
                    if (result.affectedRows) {
                        // try {
                        //     fs.exists(path + req.query.name, function (exists) {
                        //         if (exists) {
                        //             rmdirSync(path + req.query.name, function (e) {
                        //             });
                        //         }
                        //     })
                        //     rmdirSync(path + req.query.name, function (e) {
                        //     });
                        //     deleteFileByPrefix(qiniuBucket.img, "game/" + name);
                        //     deleteFileByPrefix(qiniuBucket.apk, "game/" + name)
                        // } catch (e) {
                        //     console.log(e);
                        // }
                        res.json({state: 1})
                    } else {
                        res.json({state: 0});
                    }
                })
            } else {
                res.json({state: 0});
            }

        });
    } else {
        res.json({state: 0})
    }

});

router.get('/game', function (req, res, next) {
    admin.getGameByStart(req.query.start, function (result) {
        res.json({game: result[0], cls: result[1]});
    })
});

router.get('/gameName', function (req, res, next) {
    if (req.query.sys) {
        admin.getGameName(req.query.sys, function (result) {
            res.json({name: result})
        })
    }
});
router.get("/hotGame", function (req, res, next) {
    admin.getHotGame(function (result) {
        result.length ? res.json({state: 1, game: result}) : res.json({state: 0})
    })
});
router.get("/editHotGame", function (req, res, next) {
    if (req.query.id) {
        admin.editHotGame(req.query.id, req.query.sys, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get("/gameByType", function (req, res, next) {
    if (req.query.sys == 1) {
        admin.getGameNameIdByMsgIos(req.query.msg, req.query.sys, function (result) {
            res.json({game: result})
        })
    } else if (req.query.sys == 2) {
        admin.getGameNameIdByMsg(req.query.msg, req.query.sys, function (result) {
            res.json({game: result})
        })
    }

});
router.get("/searchGameByMsg", function (req, res, next) {
    var data = req.query;
    common.getGameSearch(data, function (result) {
        res.json(result);
    })
});
router.get("/getClsActive", function (req, res, next) {
    admin.getClsActive(function (result) {
        res.json({active: result})
    })
});
router.get('/setClsActive', function (req, res, next) {
    var type = req.query.type,
        sys = req.query.sys;
    if (JSON.parse(req.query.arr).length = 4) {
        admin.setClsActive(type, sys, JSON.parse(req.query.arr), function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }

});
router.get('/active', function (req, res, next) {
    var p = req.query.p > 0 ? req.query.p : 1;
    var sys = req.query.sys > 0 ? req.query.sys : 2;
    var tables = 't_activity';
    var where = {
        where: " WHERE sys=" + sys + " order by id desc ",
        sys: sys
    };

    common.page(tables, p, where, "", "", function (result) {
        res.json(result);
    })

});
router.get('/getAdmin', function (req, res, next) {
    admin.getAdmin(function (result) {
        res.json({admin: result})

    })
});
router.get('/gameMsg', function (req, res, next) {
    admin.getGameMsgById(req.query.id, function (result) {
        res.json({game: result[0]})
    })
});


router.post('/login', function (req, res, next) {
    admin.adminLogin(req.body.name, req.body.pwd, function (result) {
        result.length > 0 ? res.json({state: 1, user: result}) : res.json({state: 0, user: {}});
    })

});

router.get('/add/user', function (req, res, next) {
    admin.addUser(req.query.name, req.query.password, req.query.type, req.query.comment, function (result) {
        result.affectedRows ? res.json({state: 1}) : res.json({state: 0});
    })
});
router.post('/add/good', function (req, res, next) {
    var form = formidable.IncomingForm({
        encoding: 'utf-8',//上传编码
        uploadDir: resource + 'upload/',//上传目录，指的是服务器的路径，如果不存在将会报错。
        keepExtensions: true,//保留后缀
        maxFieldsSize: 2000 * 1024//byte//最大可上传大小
    });
    var date = new Date();
    form.parse(req, function (err, fields, files) {
        var good = {
            good_name: fields.name,
            good_type: 2,
            coin_type: fields.coin_type,
            good_detail: fields.good_detail,
            add_time: date.Format('yyyy-MM-dd'),
            remark: fields.remark,
            explain: fields.explain,
            coin_value: fields.cost,
            stock: fields.stock,
        };

        var good_img = [];
        fs.exists(resource + 'goods/' + fields.name, function (exists) {
            if (exists) {
                console.log("文件夹存在")
            }
            if (!exists) {
                console.log("文件夹不存在");
                try {
                    fs.mkdirSync(resource + 'goods/' + fields.name);
                    fs.mkdirSync(resource + 'goods/' + fields.name + '/img');
                    fs.mkdirSync(resource + 'goods/' + fields.name + '/img/icon');
                    fs.mkdirSync(resource + 'goods/' + fields.name + '/img/list');
                } catch (e) {
                    console.log(e);
                }
            }
            for (var key in files) {
                var file = files[key];
                var extName = '';
                switch (file.type) {
                    case 'image/jpeg':
                        extName = 'jpeg';
                        break;
                    case 'image/jpg':
                        extName = 'jpg';
                        break;
                    case 'image/png':
                        extName = 'png';
                        break;
                    case 'image/x-png':
                        extName = 'png';
                        break;
                }
                var fileName = key + '.' + extName;
                if (key == 'icon') {
                    var newPath = resource + 'goods/' + fields.name + '/img/icon/' + fileName;
                    fs.renameSync(file.path, newPath); //重命名
                    uploadQiniu(newPath, qiniuBucket.img, 'goods/' + fields.name + '/img/icon/' + fileName, function (respInfo, respBody) {
                        // console.log(respInfo, respBody);
                    });
                    good.good_icon = 'goods/' + fields.name + '/img/icon/' + fileName;
                } else if (key.indexOf('good_img') != -1) {
                    var newPath = resource + 'goods/' + fields.name + '/img/list/' + fileName;
                    fs.renameSync(file.path, newPath);  //重命名
                    uploadQiniu(newPath, qiniuBucket.img, 'goods/' + fields.name + '/img/list/' + fileName, function (respInfo, respBody) {
                    });
                    good_img.push('goods/' + fields.name + '/img/list/' + fileName)
                }
            }
            admin.addGoods(good, function (result) {
                if (result.insertId) {
                    for (var i = 0, j = good_img.length; i < j; i++) {
                        admin.addGoodsImg(result.insertId, good_img[i], function (data) {
                            // console.log(data.insertId);
                        });
                    }
                    ;
                    res.json({state: 1});
                } else {
                    res.json({state: 0});
                    console.log('商品信息插入数据库失败！');
                }
            })
        });
    })
});
router.post('/add/virtual', function (req, res, next) {
    var form = formidable.IncomingForm({
        encoding: 'utf-8',//上传编码
        uploadDir: resource + 'upload/',//上传目录，指的是服务器的路径，如果不存在将会报错。
        keepExtensions: true,//保留后缀
        maxFieldsSize: 2000 * 1024//byte//最大可上传大小
    });
    var date = new Date();
    form.parse(req, function (err, fields, files) {
        var good = {
            good_name: fields.name,
            good_type: 1,
            coin_type: fields.coin_type,
            good_detail: fields.good_detail,
            add_time: date.Format('yyyy-MM-dd'),
            remark: fields.remark,
            explain: fields.explain,
            coin_value: fields.cost,
            stock: fields.stock,
            system: fields.sys
        };
        fs.exists(resource + 'goods/' + fields.name, function (exists) {
            if (exists) {
                console.log("文件夹存在")
            }
            if (!exists) {
                console.log("文件夹不存在");
                try {
                    fs.mkdirSync(resource + 'goods/' + fields.name);
                    fs.mkdirSync(resource + 'goods/' + fields.name + '/img');
                    fs.mkdirSync(resource + 'goods/' + fields.name + '/img/icon');
                    fs.mkdirSync(resource + 'goods/' + fields.name + '/img/list');
                } catch (e) {
                    console.log(e);
                }
            }
            for (var key in files) {
                var file = files[key];
                var extName = '';
                switch (file.type) {
                    case 'image/jpeg':
                        extName = 'jpeg';
                        break;
                    case 'image/jpg':
                        extName = 'jpg';
                        break;
                    case 'image/png':
                        extName = 'png';
                        break;
                    case 'image/x-png':
                        extName = 'png';
                        break;
                }
                var fileName = key + '.' + extName;
                if (key == 'icon') {
                    var newPath = resource + 'goods/' + fields.name + '/img/icon/' + fileName;
                    fs.renameSync(file.path, newPath); //重命名
                    uploadQiniu(newPath, qiniuBucket.img, 'goods/' + fields.name + '/img/icon/' + fileName, function (respInfo, respBody) {
                        if (respInfo.statusCode == 200) {
                            good.good_icon = respBody.key;
                            admin.addVirtual(good, function (result) {
                                if (result.insertId) {
                                    res.json({state: 1});
                                } else {
                                    res.json({state: 0});
                                    console.log('商品信息插入数据库失败！');
                                }
                            })
                        } else {
                            res.json({state: 0});
                        }
                    })
                }
            }

        });
    })
});
router.get("/goods", function (req, res, next) {
    admin.getGood(function (result) {
        res.json({good: result})
    })
});
router.get("/deleteGoods", function (req, res, next) {
    var name = req.query.name;

    if (name && req.query.id) {
        admin.delectGoodById(req.query.id, function (result) {
            if (result.affectedRows) {
                admin.deleteGoodsImgById(req.query.id, function () {

                });
                try {
                    fs.exists(resource + 'goods/' + name, function (exists) {
                        if (exists) {
                            rmdirSync(resource + "goods/" + name, function (e) {
                            });
                        }
                    });
                    deleteFileByPrefix(qiniuBucket.img, "goods/" + name)
                } catch (e) {
                    console.log(e);
                }
                res.json({state: 1})
            } else {
                res.json({state: 0});
            }
        })
    } else {
        res.json({state: 0});
    }
});
router.get("/getGoodsType", function (req, res, next) {
    admin.getGoodsTypeById(req.query.id, function (result) {
        res.json({type: result})
    })
});
router.get("/deleteGoodsType", function (req, res, next) {
    admin.deleteGoodTypeById(req.query.id, function (result) {
        if (result.affectedRows) {
            res.json({state: 1})
        } else {
            res.json({state: 0});
        }
    })
});

/**
 * 游戏名称模糊查询
 */
router.get("/getGameSearch", function (req, res, next) {
    var data = req.query;
    data.sys = data.sys > 0 ? data.sys : 2;
    if (req.query) {
        common.getGameSearch(data, function (result) {
            res.json(result);
        })
    } else {
        common.getGameSearch(data, function (result) {
            res.json(result);
        })
    }
});

//渠道
router.get("/getQudao", function (req, res, next) {
    admin.getQudao(function (result) {
        result.length ? res.json({state: 1, qudao: result}) : res.json({state: 0})
    })
});
router.get("/addQudao", function (req, res, next) {
    var data = req.query;
    if (data.add_num && data.current && data.income && data.qudao_id && data.date && data.active_num) {
        admin.addQudao(data.add_num, data.current, data.income, data.qudao_id, data.date, data.active_num, function (result) {
            result.insertId ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get("/getQudaoshow", function (req, res, next) {
    var data = req.query;
    if (data.qudao_id && data.startTime && data.endTime) {
        admin.getQudaoshow(data.startTime, data.endTime, data.qudao_id, function (result) {
            res.json({state: 1, data: result})
        })
    } else {
        req.end()
    }
});
router.get("/getQudaoClick", function (req, res, next) {
    var data = req.query;
    if (data.type && data.startTime && data.endTime) {
        admin.getQudaoClick(data.startTime, data.endTime, data.type, function (result) {
            res.json({state: 1, data: result})
        })
    } else {
        req.end()
    }
});

//用户
router.get("/getUserCount", function (req, res, next) {
    admin.getUserCount(function (result) {
        res.json({state: 1, co: result[0]})
    })
});
router.get("/getActiveUserCount", function (req, res, next) {
    admin.getActiveUserCount(getDate(-7).Format("yyyy-MM-dd"), function (result) {
        res.json({state: 1, co: result[0]})
    });
});
router.get("/getRegUserByDate", function (req, res, next) {
    admin.getRegUserByDate(req.query.startTime, req.query.endTime, function (result) {
        res.json({state: 1, co: result[0]})
    })
});

router.get("/adminInfo", function (req, res, next) {
    var data = req.query;
    if (data.id) {
        admin.hasAdminPwd(data, function (oldAdmin) {
            if (oldAdmin.length) {
                res.json(oldAdmin)
            } else {
                res.json({state: 0})
            }
        })
    } else {
        res.json({state: 0})
    }
});

router.post("/setPassword", function (req, res, next) {
    var data = req.body;
    if (data.id && data.pwd && data.oldPwd) {
        admin.hasAdminPwd(data, function (oldAdmin) {
            if (oldAdmin.length) {
                admin.setAdminPwd(data, function (result) {
                    result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
                })
            } else {
                res.json({state: 0})
            }
        })
    } else {
        res.json({state: 0})
    }
})

router.get("/getFeedBack", function (req, res, next) {
    var p = req.query.p > 0 ? req.query.p : 1;
    var tables = [
        't_feedback',
        't_user',
        // 't_feedback_img'
    ];
    var where = {
        // left_on: "t_feedback.id = t_feedback_img.feedback_id ",
        where: "t_feedback.user_id = t_user.id ORDER BY t_feedback.id DESC",
    };

    var field = "t_feedback.*,t_user.nick_name";

    common.page(tables, p, where, "left", field, function (result) {
        res.json(result);
    });
})

router.get("/getFeedBackDetail", function (req, res, next) {
    var data = req.query;
    if (data.id) {
        admin.getFeedBackDetail(data.id, function (result) {
            res.json(result);
        })
    }
});
router.get("/delFeedBack", function (req, res, next) {
    var data = req.query;
    if (data.id) {
        deleteFileByPrefix(qiniuBucket.img, "feedback/feedbackId" + data.id + "/")

        admin.delFeedBack(data.id, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});

router.get("/delFeedBacks", function (req, res, next) {
    var data = req.query;
    var ids = data.ids;
    for (var i in ids) {
        deleteFileByPrefix(qiniuBucket.img, "feedback/feedbackId" + ids[i] + "/")
        admin.delFeedBack(ids[i], function (results) {
            // result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }

    var p = req.query.p > 0 ? req.query.p : 1;
    var tables = [
        't_feedback',
        't_user',
        // 't_feedback_img'
    ];
    var where = {
        // left_on: "t_feedback.id = t_feedback_img.feedback_id ",
        where: "t_feedback.user_id = t_user.id ORDER BY t_feedback.id DESC",
    };

    var field = "t_feedback.*,t_user.nick_name";

    common.page(tables, p, where, "left", field, function (result) {
        res.json(result);
    });

});


router.get("/userCount", function (req, res, next) {
    // 今天
    var today = new Date();
//     today.setHours(0);
//     today.setMinutes(0);
//     today.setSeconds(0);
//     today.setMilliseconds(0);
//     var today = today.getTime() / 1000;
//     var oneday = 60 * 60 * 24;
// // 昨天
//     var yesterday = {
//         start: today - oneday,
//         end: today - 1,
//     }
//     admin.getYesterDayCount(yesterday, function (result) {
//
//     })
    res.json(today.getTime())
// 上周一
//     var lastMonday = new Date(today - oneday * (today.getDay() + 6));
//     alert(lastMonday);
// 上个月1号
//     var lastMonthFirst = new Date(today - oneday * today.getDate());
//     lastMonthFirst = new Date(lastMonthFirst - oneday * (lastMonthFirst.getDate() - 1));
//     alert(lastMonthFirst);
})

function getDate(index) {
    var date = new Date(); //当前日期
    var newDate = new Date();
    newDate.setDate(date.getDate() + index);//官方文档上虽然说setDate参数是1-31,其实是可以设置负数的
    // var time = newDate.getFullYear()+"-"+(newDate.getMonth()+1)+"-"+newDate.getDate();
    return newDate;
}

module.exports = router;
