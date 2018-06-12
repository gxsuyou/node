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
    apk: "oneyouxiapk"
    // img:"oneyouxitestimg",
    // apk: "oneyouxitestapk"
};
router.get('/getUptokenByMsg', function (req, res, next) {
    if (req.query.scope && req.query.key) {
        var token = getUpToken(req.query.scope, req.query.key);//获取token
        res.json({state: 1, upToken: token})
    } else {
        res.json({state: 0})
    }

});

router.get('/deleteGame', function (req, res, next) {
    var id = req.query.id;
    if (id) {
        admin.getGameMsgById(id, function (game) {
            if (game.length) {
                var name = game[0].game_name;
                admin.delectGameByID(req.query.id, function (result) {
                    if (result.affectedRows) {
                        try {
                            fs.exists(path + req.query.name, function (exists) {
                                if (exists) {
                                    rmdirSync(path + req.query.name, function (e) {
                                    });
                                }
                            })
                            // rmdirSync(path+req.query.name,function(e){
                            // });
                            deleteFileByPrefix(qiniuBucket.img, "game/" + name);
                            deleteFileByPrefix(qiniuBucket.apk, "game/" + name)
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
    } else {
        res.json({state: 0})
    }

});

router.get('/game', function (req, res, next) {
    admin.getGameByStart(req.query.start, function (result) {
        res.json({game: result[0], cls: result[1]});
    })
});
router.get('/gameAdmin', function (req, res, next) {
    var p = req.query.p > 0 ? req.query.p : 1;

    // var tables = 't_game';
    var tables = ['t_game', 't_admin'];
    var where = "t_game.admin = t_admin.id order by t_game.id desc,t_game.add_time desc";

    var field = "t_game.*,t_admin.comment";

    common.page(tables, p, where, "left", field, function (result) {
        res.json(result);
    });
    // admin.getGameByStartAdmin(req.query.start,req.query.id,function (result) {
    //     res.json({game:result[0],cls:result[1]});
    // })
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
    var data = "";
    if (req.query) {
        data = req.query;
        common.getGameSearch(data.name, function (result) {
            res.json(result);
        })
    } else {
        common.getGameSearch(data, function (result) {
            res.json(result);
        })
    }
    // if (req.query.type && req.query.msg) {
    //     admin.searchGameByMsg(req.query.type, req.query.msg, function (result) {
    //         res.json({game: result})
    //     })
    // }
});
router.get("/getClsActive", function (req, res, next) {
    admin.getClsActive(function (result) {
        res.json({active: result})
    })
});
router.get('/setClsActive', function (req, res, next) {
    var type = req.query.type,
        sys = req.query.sys;
    // console.log(type, sys);
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

    var tables = 't_activity';
    var where = " order by type ";

    common.page(tables, p, where, "", "", function (result) {
        res.json(result);
    })

    // admin.getActive(function (result) {
    //     res.json({active: result})
    // })
});
router.post('/addActive', function (req, res, next) {
    try {
        var form = formidable.IncomingForm({
            encoding: 'utf-8',//上传编码
            uploadDir: resource + 'upload/',//上传目录，指的是服务器的路径，如果不存在将会报错。
            keepExtensions: true,//保留后缀
            maxFieldsSize: 2000 * 1024//byte//最大可上传大小
        });
        form.parse(req, function (err, fields, files) {
            // console.log(fields);
            var active = {
                name: fields.name,
                gameName: fields.gameName,
                title: fields.title,
                sort: fields.sort,
                active: fields.active,
                type: fields.type,
                sys: fields.sys
            };
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
                    case 'application/octet-stream':
                        extName = 'apk';
                        break
                }
                var fileName = key + '.' + extName;
                fs.exists(resource + 'active/' + fields.name, function (exists) {
                    if (exists) {
                        console.log("文件夹存在")
                    }
                    if (!exists) {
                        console.log("文件夹不存在");
                        try {
                            fs.mkdirSync(resource + 'active/' + fields.name);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                    var newPath = resource + 'active/' + fields.name + '/' + fileName;
                    try {
                        fs.renameSync(file.path, newPath);  //重命名
                    } catch (e) {

                    }
                    uploadQiniu(newPath, qiniuBucket.img, 'active/' + fields.name + '/' + fileName, function (respInfo, respBody) {
                        if (respInfo.statusCode == 200) {
                            active.active_img = respBody.key;
                            // console.log(active);
                            admin.addActive(active, function (result) {
                                // console.log(result);
                                if (result.insertId) {
                                    res.json({state: 1})
                                } else {
                                    res.json({state: 0})
                                }
                            })
                        } else {
                            res.json({state: 0});
                        }
                    })
                });
            }
        })
    } catch (e) {
        console.log(e);
    }
});
router.get("/deleteActive", function (req, res, next) {
    var name = req.query.name;
    // console.log(name);
    if (req.query.name && req.query.id) {
        admin.deleteActive(req.query.id, function (result) {
            if (result.affectedRows) {
                try {
                    deleteFileByPrefix(qiniuBucket.img, name)
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
    // console.log(req.body.name,req.body.pwd);
    // res.json({status:0});
    // return false;
    admin.adminLogin(req.body.name, req.body.pwd, function (result) {
        //  console.log(result);
        result.length > 0 ? res.json({state: 1, user: result}) : res.json({state: 0, user: {}});
    })

});

router.options("/login", function (req, res) {
    console.log("options");
    //res.json({statue:0});
    return;
});

router.get('/add/user', function (req, res, next) {
    // console.log(req.query.type);
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
                        // console.log(respInfo, respBody);
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

router.post('/add/game', function (req, res, next) {

    var form = formidable.IncomingForm({
        encoding: 'utf-8',//上传编码
        uploadDir: resource + 'upload/',//上传目录，指的是服务器的路径，如果不存在将会报错。
        keepExtensions: true,//保留后缀
        maxFieldsSize: 2000 * 1024 * 1024//byte//最大可上传大小
    });
    form.on('progress', function (bytesReceived, bytesExpected) {//在控制台打印文件上传进度
        var progressInfo = {
            value: bytesReceived,
            total: bytesExpected
        };
        // console.log('[progress]: ' + JSON.stringify(progressInfo));
        // res.write(JSON.stringify(progressInfo));
    })
        .on('end', function () {
            console.log('上传成功！');
            // res.end('上传成功！');
            res.json({state: 1});
        })
        .on('error', function (err) {
            console.error('上传失败：', err.message);
            res.json({state: 0});
            next(err);
        });
    var date = new Date();
    form.parse(req, function (err, fields, files) {
        var cls = fields.cls.split(',');
        var clsName = ["", "动作射击", "模拟养成", "棋牌天地", "策略塔防", "动作冒险", "角色扮演", "休闲益智", "体育休闲", "其他游戏", "网上购物", "影音图像", "系统工具", "商业办公", "通讯社交", "生活服务", "运动健康", "资讯阅读"];
        var game = {
            admin: fields.admin,
            type: fields.optionsRadiosinline,
            game_name: fields.game_name,
            game_packagename: fields.keyword,
            game_recommend: fields.game_one,
            game_version: fields.game_version,
            game_company: fields.game_cmp,
            activation: fields.game_active,
            sys: fields.type,
            update_detail: fields.update_msg,
            game_detail: fields.game_msg,
            game_update_date: date.Format('yyyy-MM-dd'),
            add_time: date.Format('yyyy-MM-dd'),
            cls: clsName[(cls[0])]
        };

        admin.hasGame(fields.game_name, function (result) {
            for (var k in result) {
                if (result[k].sys == fields.type) {
                    var dirlist = fs.readdirSync(form.uploadDir);
                    dirlist.forEach(function (fileName) {
                        try {
                            fs.unlinkSync(form.uploadDir + fileName);
                        } catch (e) {
                            console.log(e);
                        }
                    });
                    // res.json({state:4});
                    return;
                }
            }
            admin.addGame(game, function (result) {
                if (result.insertId) {
                    var gameId = result.insertId;
                    for (var k = 0, l = cls.length; k < l; k++) {
                        admin.addCls(gameId, cls[k], function (data) {
                            // console.log(data.insertId);
                        });
                    }
                    fs.exists(resource + "game/" + fields.game_name, function (exists) {
                        if (exists) {
                            console.log("文件夹存在")
                        }
                        if (!exists) {
                            console.log("文件夹不存在");
                            try {
                                fs.mkdirSync(resource + "game/" + fields.game_name);
                                fs.mkdirSync(resource + "game/" + fields.game_name + '/img');
                                fs.mkdirSync(resource + "game/" + fields.game_name + '/img/icon');
                                fs.mkdirSync(resource + "game/" + fields.game_name + '/img/title');
                                fs.mkdirSync(resource + "game/" + fields.game_name + '/img/list');
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
                            if (file.type == 'application/octet-stream') {
                                var fileName = fields.game_name + '.' + "apk";
                            } else {
                                var fileName = key + '.' + extName;
                            }
                            if (key == 'icon') {
                                var newPath = path + fields.game_name + '/img/icon/' + fileName;
                                fs.renameSync(file.path, newPath);  //重命名
                                uploadQiniu(newPath, qiniuBucket.img, 'game/' + fields.game_name + '/img/icon/' + fileName, function (respInfo, respBody) {
                                    if (respInfo.statusCode == 200) {
                                        admin.updateGameIconById(gameId, respBody.key, function () {
                                        })
                                    } else {
                                        console.log("err:" + respBody)
                                    }
                                });
                            } else if (key == 'title_img') {
                                var newPath = path + fields.game_name + '/img/title/' + fileName;
                                fs.renameSync(file.path, newPath);  //重命名
                                uploadQiniu(newPath, qiniuBucket.img, 'game/' + fields.game_name + '/img/title/' + fileName, function (respInfo, respBody) {
                                    if (respInfo.statusCode == 200) {
                                        admin.updateGameTitleImgById(gameId, respBody.key, function () {
                                        })
                                    } else {
                                        console.log("err:" + respBody)
                                    }
                                });

                            } else if (key.indexOf('game_list') != -1) {
                                var newPath = path + fields.game_name + '/img/list/' + fileName;
                                fs.renameSync(file.path, newPath);  //重命名
                                uploadQiniu(newPath, qiniuBucket.img, 'game/' + fields.game_name + '/img/list/' + fileName, function (respInfo, respBody) {
                                    if (respInfo.statusCode == 200) {
                                        admin.addimg(gameId, respBody.key, function () {
                                        })
                                    } else {
                                        console.log("err:" + respBody)
                                    }
                                });
                            }
                        }
                    });
                } else {
                    res.json({state: 0})
                }
            })
        });
    })
});

router.post("/edit/game", function (req, res, next) {
    var form = formidable.IncomingForm({
        encoding: 'utf-8',//上传编码
        uploadDir: resource + 'upload/',//上传目录，指的是服务器的路径，如果不存在将会报错。
        keepExtensions: true,//保留后缀
        maxFieldsSize: 2000 * 1024//byte//最大可上传大小
    });

    form.parse(req, function (err, fields, files) {
        console.log(fields.size.slice(0, fields.size.length - 2));
        var game = {
            name: fields.name,
            activation: fields.activation,
            company: fields.company,
            version: fields.version,
            download_num: fields.download_num,
            sort: fields.sort,
            sort2: fields.sort2,
            size: fields.size.slice(0, fields.size.length - 2),
            id: fields.id,
            cls_ids: fields.cls_ids,
            tag_ids: fields.tag_ids
        };

        admin.editGame(game, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    })
});

/**
 * 游戏名称模糊查询
 */
router.get("/getGameSearch", function (req, res, next) {
    var data = "";
    if (req.query) {
        data = req.query;
        common.getGameSearch(data.name, function (result) {
            res.json(result);
        })
    } else {
        common.getGameSearch(data, function (result) {
            res.json(result);
        })
    }
});

//资讯
router.post("/addNews", function (req, res, next) {
    var form = formidable.IncomingForm({
        encoding: 'utf-8',//上传编码
        uploadDir: resource + 'upload/',//上传目录，指的是服务器的路径，如果不存在将会报错。
        keepExtensions: true,//保留后缀
        maxFieldsSize: 2000 * 1024//byte//最大可上传大小
    });
    var date = new Date();
    form.parse(req, function (err, fields, files) {
        var news = {
            title: fields.title,
            detail: fields.detail,
            like: 0,
            comment: 0,
            browse: 0,
            add_time: date.Format('yyyy-MM-dd-HH-mm-SS'),
            game_id: fields.game_id
        };

        fs.exists(resource + 'news/' + fields.title, function (exists) {
            if (exists) {
                console.log("文件夹存在");
                addNews();
            }
            if (!exists) {

                console.log("文件夹不存在");
                try {
                    fs.mkdirSync(resource + 'news/' + fields.title);
                    fs.mkdirSync(resource + 'news/' + fields.title + '/title');
                    addNews();
                } catch (e) {
                    res.json({state: 0});
                    console.log(e);
                    return
                }

            }

            function addNews() {
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
                    if (key == 'title_img') {
                        var newPath = resource + 'news/' + fields.title + '/title/' + fileName;
                        fs.renameSync(file.path, newPath); //重命名
                        uploadQiniu(newPath, qiniuBucket.img, 'news/' + fields.title + '/title/' + fileName, function (respInfo, respBody) {
                            if (respInfo.statusCode == 200) {
                                news.img = respBody.key;
                                admin.addNews(news, function (result) {
                                    if (result.insertId) {
                                        res.json({state: 1});
                                    } else {
                                        res.json({state: 0});
                                        console.log('文章插入数据库失败！');
                                    }
                                })
                            } else {
                                res.json({state: 0});
                            }
                        })
                    }
                }
            }
        });
    })
});
router.get("/getNewsByPage", function (req, res, next) {
    var p = req.query.p > 0 ? req.query.p : 1;
    var tables = 't_news';
    var where = " ORDER BY up DESC,add_time DESC ";
    common.page(tables, p, where, "", "", function (result) {
        res.json(result);
    })
    // admin.getNewsByPage(req.query.page, function (result) {
    //     result.length ? res.json({state: 1, news: result}) : res.json({state: 0})
    // })
});
router.get('/getNewsById', function (req, res, next) {
    admin.getNewsById(req.query.id, function (result) {
        result.length ? res.json({state: 1, news: result[0]}) : res.json({state: 0})
    })
});
router.get("/deleteNewsById", function (req, res, next) {
    if (req.query.id) {
        admin.getNewsById(req.query.id, function (result) {
            if (result.length) {
                try {
                    fs.exists(resource + 'news/' + result[0].title, function (exists) {
                        if (exists) {
                            rmdirSync(resource + "news/" + result[0].title, function (e) {
                            });
                        }
                    });
                    deleteFileByPrefix(qiniuBucket.img, "news/" + result[0].title)
                } catch (e) {
                    console.log(e);
                }
                admin.deleteNewsById(req.query.id, function (result) {
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
router.post("/editNewsById", function (req, res, next) {
    var data = req.body;
    if (data.id && data.title && data.browse && data.agree && data.comment && data.add_time) {
        admin.editNewsById(data.id, data.title, data.agree, data.browse, data.comment, data.add_time, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    } else {
        res.json({state: 0})
    }
});
router.get("/upNews", function (req, res, next) {
    if (req.query.id) {
        admin.upNews(req.query.id, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
        })
    }
});
router.get("/downNews", function (req, res, next) {
    if (req.query.id) {
        admin.downNews(req.query.id, function (result) {
            result.affectedRows ? res.json({state: 1}) : res.json({state: 0})
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

function getDate(index) {
    var date = new Date(); //当前日期
    var newDate = new Date();
    newDate.setDate(date.getDate() + index);//官方文档上虽然说setDate参数是1-31,其实是可以设置负数的
    // var time = newDate.getFullYear()+"-"+(newDate.getMonth()+1)+"-"+newDate.getDate();
    return newDate;
}

module.exports = router;
