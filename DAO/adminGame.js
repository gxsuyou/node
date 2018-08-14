var query = require('../config/config');
var fs = require('fs');
var path = require('path');
var game = {
    addGameMsg: function (obj, callback) {
        // var sql="call addGameMsg(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var sql = "insert into t_game " +
            "(game_name,game_url_scheme,game_packagename,game_download_ios,game_recommend,game_version," +
            "game_update_date,game_company,sys,add_time,game_detail,admin,type,cls_ids,strategy_head) " +
            "values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        // var sql = "insert into t_game (game_name,game_url_scheme,game_packagename,game_download_ios,game_recommend,game_version,game_update_date,game_company,sys,add_time,update_detail,game_detail,admin,type,cls_ids) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var arr = [
            obj.gameName, obj.gameUrlScheme, obj.gamePackagename, obj.gameDownloadIos, obj.gameRecommend,
            obj.gameVersion, obj.gameUpdateDate, obj.gameCompany, obj.sys, obj.addTime, obj.gameDetail, obj.admin,
            obj.type, obj.cls_ids, obj.strategy_head,
        ];
        //for (var x in obj) {
        //    arr.push(obj[x])
        //}
        query(sql, arr, function (result) {
            return callback(result)
        })
    },
    addGameMsgIos: function (obj, callback) {
        // var sql="call addGameMsg(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var sql = "UPDATE t_game SET game_title_img=?, icon=? WHERE id=?"
        query(sql, [obj.game_title_img, obj.icon, obj.id], function (result) {

            for (var i in obj.img) {
                var img_sql = "INSERT INTO t_game_img (game_id,img_src) VALUES (?,?)"
                query(img_sql, [obj.id, obj.img[i].img_src], function (result) {

                })
            }
            return callback(result)
        })
    },
    hasAndroid: function (obj, callback) {
        // var sql="call addGameMsg(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var arr = {};
        var img = [];
        var sql = "SELECT * FROM t_game WHERE game_name=? AND sys=2"
        query(sql, [obj.gameName], function (result) {
            if (result.length) {
                var img_sql = "SELECT * FROM t_game_img WHERE game_id=?";
                query(img_sql, [result[0].id], function (img_result) {
                    img = img_result.length ? img_result : [];
                    arr = {
                        state: 1,
                        game_title_img: result[0].game_title_img,
                        icon: result[0].icon,
                        img: img
                    };
                    return callback(arr)
                })
            } else {
                return callback({state: 0})
            }
        })
    },
    editGameMsg: function (obj, callback) {
        var sql = "update t_game set game_name=?,activation=?,game_company=?,game_packagename=?," +
            "game_version=?,game_download_ios=?,game_download_num=?,game_recommend=?,sort=?,game_size=?," +
            "game_detail=?,sort2=?,up_time=?,up_admin=?,strategy_head=? where id =?";
        query(sql, [obj.name, obj.activation, obj.company, obj.gamePackagename, obj.version, obj.gameDownloadIos, obj.download_num, obj.game_recommend, obj.sort, obj.size, obj.game_detail, obj.sort2, obj.up_time, obj.up_admin, obj.strategy_head, obj.id], function (result) {
            return callback(result)
        })
    },

    gameMsgDetail: function (obj, callback) {
        var game_sql = "SELECT * FROM t_game WHERE id = ? ";
        query(game_sql, [obj], function (result) {
            var gameImg_sql = "SELECT * FROM t_game_img WHERE game_id = ?"
            query(gameImg_sql, [result[0].id], function (img_result) {
                result[0].imgList = img_result.length ? img_result : [];
                return callback(result);
            });
        })
    },

    gameMsgInfo: function (obj, callback) {
        var game_sql = "SELECT * FROM t_game WHERE id = ? "
        var ids = "";
        query(game_sql, [obj], function (result) {
            if (result.length > 0) {
                var cls_type = result[0].type == "online" || result[0].type == "alone" ? 1 : 2;

                var cls_sql = "SELECT id,cls_name,cls,pid FROM t_game_cls WHERE type = ? ORDER BY pid ASC";
                query(cls_sql, [cls_type], function (cls_result) {
                    ids = result[0].cls_ids;
                    if (ids.substr(0, 1) == ",") {
                        ids = ids.substr(1);
                        ids = ids.substring(0, ids.length - 1)
                    }
                    var cls_sql2 = "SELECT * FROM t_game_cls WHERE id IN (" + ids + ") ";
                    query(cls_sql2, [], function (cls_list) {
                        for (var i = 0; i < cls_result.length; i++) {
                            if (i >= cls_result.length) continue;
                            if (cls_result[i].pid == 0) continue;
                            cls_result[i].checked = 0;
                            for (var ii = 0; ii < cls_list.length; ii++) {
                                if (ii >= cls_list.length) continue;
                                if (cls_list[ii].id == cls_result[i].id) {
                                    cls_result[i].checked = 1;
                                }
                            }
                        }
                        return callback(cls_result);
                    })
                })
            }
        })
    },
    gameTag: function (obj, callback) {
        var game_sql = "SELECT * FROM t_game WHERE id = ? "
        var ids = "";
        query(game_sql, [obj], function (result) {
            if (result.length > 0) {
                var tag_sql = "SELECT * FROM t_tag ";
                query(tag_sql, [], function (tag_result) {
                    ids = result[0].tag_ids;
                    if (ids.substr(0, 1) == ",") {
                        ids = ids.substr(1)
                        ids = ids.substring(0, ids.length - 1)
                    }
                    var sql = "SELECT id,name FROM t_tag where id IN ( " + ids + " )";
                    query(sql, [], function (tag_list) {
                        for (var i = 0; i < tag_result.length; i++) {
                            tag_result[i].checked = 0;
                            for (var ii = 0; ii < tag_list.length; ii++) {
                                if (tag_list[ii].id == tag_result[i].id) {
                                    tag_result[i].checked = 1;
                                }
                            }
                        }
                        return callback(tag_result);
                    })
                })
            }
        })
    },
    // gameTagSet: function (obj, callback) {
    //     var game_sql = "SELECT * FROM t_game WHERE tag_ids IS NULL AND id > 0 AND id < 100 "
    //     query(game_sql, [], function (result) {
    //         if (result.length > 0) {
    //
    //             for (var i = 0; i < result.length; i++) {
    //                 if (i >= result.length) {
    //                     break;
    //                 }
    //                 console.log(result[i].id);
    //
    //                 var sql = "SELECT game_id,tag_id FROM t_tag_relation where game_id = ?";
    //                 query(sql, [result[i].id], function (results) {
    //                     var ids = "";
    //                     console.log(results);
    //                     if (results.length > 0) {
    //                         for (var a = 0; a < result.length; a++) {
    //                             if (a >= results.length) {
    //                                 continue;
    //                             }
    //                             ids += results[a].tag_id + ",";
    //                         }
    //                         ids = ids.substring(0, ids.length - 1);
    //                         // console.log(ids);
    //                         var setsql = "UPDATE t_game SET tag_ids = ? WHERE id = ?"
    //                         query(setsql, [ids, results[0].game_id], function (results) {
    //
    //                         })
    //                     }
    //
    //
    //                 })
    //             }
    //             return callback(1);
    //             // ids = ids.substring(0, ids.length - 1)
    //             // return callback(ids);
    //
    //
    //         }
    //     })
    // },

    hasGame: function (gameName, sys, callback) {
        var sql = "select * from t_game where game_name=? AND sys=? ";
        query(sql, [gameName, sys], function (result) {
            return callback(result)
        })
    },
    addGameCls: function (gameid, clsid, callback) {
        var sql = "INSERT INTO t_game_cls_relation(game_id,cls_id) values (?,?)";
        query(sql, [gameid, clsid], function (result) {
            return callback(result);
        })
    },
    addGameTag: function (gameid, clsid, callback) {
        var sql = "INSERT INTO t_tag_relation(game_id,tag_id) values (?,?)";
        query(sql, [gameid, clsid], function (result) {
            return callback(result);
        })
    },
    getPListAdd: function (obj, callback) {
        var sql = "select * from t_game where id=?";
        query(sql, [obj], function (result) {
            var name = "gameId" + result[0].id
            var url = "http://ipa.oneyouxi.com.cn/" + result[0].game_download_ios2
            var packagename = result[0].game_packagename
            var version = result[0].game_version;

            var dataPlist = '<?xml version="1.0" encoding="UTF-8"?>';
            dataPlist += '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">'
            dataPlist += '<plist version="1.0"><dict><key>items</key>'
            dataPlist += '<array><dict><key>assets</key>'
            dataPlist += '<array><dict><key>kind</key><string>software-package</string><key>url</key>'
            dataPlist += '<string><![CDATA[' + url + ']]></string></dict></array>'
            dataPlist += '<key>metadata</key>'
            dataPlist += '<dict><key>bundle-identifier</key><string>oneyouxi</string><key>bundle-version</key>'
            dataPlist += '<string><![CDATA[' + version + ']]></string><key>kind</key><string>software</string><key>title</key>'
            dataPlist += '<string><![CDATA[' + packagename + ']]></string></dict></dict></array></dict></plist>'

            fs.readFile(path.join(__dirname, '../www/download/' + name + '.plist'), 'utf8', function (err, data) {
                if (data) {
                    fs.unlink(path.join(__dirname, '../www/download/' + name + '.plist'), function (err) {

                    });
                }
                fs.writeFile(path.join(__dirname, '../www/download/' + name + '.plist'), dataPlist, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                });
            });

            var iosUrl = "itms-services://?action=download-manifest&url=https://admin.oneyouxi.com.cn/www/download/" + name + ".plist";
            var add_sql = 'update t_game set game_download_ios2 = ? where id =?';
            query(add_sql, [iosUrl, obj], function (result) {
                return callback(result)
            })

            return callback(result)
        })
    },
    updateDownloadApp: function (gameId, url, size, sys, callback) {
        var sql = 'update t_game set game_download_andriod = ?,game_size = ? where id =?';
        if (sys == 1) {
            sql = 'update t_game set game_download_ios2 = ?,game_size = ? where id =?';
        }
        query(sql, [url, size, gameId], function (result) {
            return callback(result)
        })
    },
    addGameImg: function (gameId, url, game_name, callback) {
        var sql = "INSERT INTO t_game_img(game_id,img_src,game_name) values (?,?,?)";
        query(sql, [gameId, url, game_name], function (result) {
            return callback(result)
        })
    },
    updateGameIcon: function (id, url, callback) {
        var sql = 'update t_game set icon = ? where id=?';
        query(sql, [url, id], function (result) {
            return callback(result)
        })
    },
    updateGameTitleImg: function (id, url, callback) {
        var sql = 'update t_game set game_title_img = ? where id=?';
        query(sql, [url, id], function (result) {
            return callback(result)
        })
    },
    getHasActive: function (gameId, type, sys, callback) {//验证是否存在并删除
        var sql = 'select * from t_activity where game_id=? and type=? and sys=?';
        query(sql, [gameId, type, sys], function (result) {
            if (result.length) {
                var del_sql = "delete from t_activity where id=?"
                query(del_sql, [result[0].id], function (del_result) {
                    return callback(del_result)
                })
            } else {
                return callback(result)
            }
            // return callback(result)
        })
    },
    deleteActive: function (gameId, type, callback) {
        var sql = 'delete from t_activity where game_id=? and type=?';
        query(sql, [gameId, type], function (result) {
            return callback(result)
        })
    },
    addActive: function (obj, callback) {
        if (obj.type == 5 || obj.type == 6) {
            obj.active = obj.active ? obj.active : 0;
            sql = 'insert into t_activity (name,game_id,type,active,sys) values (?,?,?,?,?)';
            query(sql, [obj.name, obj.game_id, obj.type, obj.active, obj.sys], function (result) {
                return callback(result)
            })
        } else {
            var sql = 'insert into t_activity (name,title,sort,active_img,active,game_id,type,sys) ' +
                'values (?,?,?,?,?,?,?,?)';
            query(sql, [obj.name, obj.title, obj.sort, obj.active_img, obj.active, obj.game_id, obj.type, obj.sys], function (result) {
                return callback(result)
            })
        }

    },
    setActive: function (obj, callback) {
        var sql = "UPDATE t_activity SET name = ?, title = ?, active_img = ?, active = ? WHERE id = ?";
        query(sql, [obj.name, obj.title, obj.active_img, obj.active, obj.id], function (result) {
            return callback(result)
        })

    },
    addSubject: function (img, title, detail, up, sys, callback) {
        var sql = 'insert into t_subject (img,title,detail,active,sys) values (?,?,?,?,?)';
        query(sql, [img, title, detail, up, sys], function (result) {
            return callback(result)
        })
    },
    hasSubjectGame: function (gameId, subjectId, callback) {
        var sql = 'select * from t_subject_relation where game_id=? and subject_id=?';
        query(sql, [gameId, subjectId], function (result) {
            return callback(result);
        })
    },
    addSubjectGame: function (gameId, subjectId, callback) {
        var sql = 'insert into t_subject_relation (game_id,subject_id) values (?,?)';
        query(sql, [gameId, subjectId], function (result) {
            return callback(result);
        })
    },
    deleteSubjectGame: function (id, callbck) {
        var sql = 'delete from t_subject_relation where id = ?';
        query(sql, [id], function (result) {
            return callbck(result);
        })
    },
    getSubjectGame: function (subjectId, callbcak) {
        var sql = 'SELECT t_subject_relation.id as relationId,t_game.game_name,t_game.id AS gameId,t_subject.title,t_subject.id AS subjectId ' +
            'FROM (t_subject_relation LEFT JOIN t_subject ON t_subject_relation.subject_id = t_subject.id ) ' +
            'LEFT JOIN t_game ON t_subject_relation.game_id = t_game.id ' +
            'WHERE t_subject_relation.`subject_id`=?';
        query(sql, [subjectId], function (result) {
            return callbcak(result);
        })
    },
    deleteSubject: function (subjectId, callback) {
        var sql_relation = 'delete from t_subject_relation where subject_id = ?';
        query(sql_relation, [subjectId], function (msg) {
            var sql = 'delete from t_subject where id = ?';
            query(sql, [subjectId], function (result) {
                return callback(result);
            })
        })
    },
    hasSubject: function (subjectId, callback) {
        var sql = 'SELECT * FROM t_subject WHERE id = ?';
        query(sql, [subjectId], function (result) {
            return callback(result);
        })
    },
    setTagAndCls: function (gameId, tagId, clsId, callback) {
        var sql = "update t_game set tag_ids = ?, cls_ids = ? where id = ?"
        query(sql, [tagId, clsId, gameId], function (result) {
            // var sql = 'insert into t_tag_relation (game_id,tag_id) values (?,?)';
            // query(sql, [gameId, tagId], function (result) {
            //     return callback(result)
            // })
            return callback(result);
        })
    },
    deleteTagAndCls: function (gameId, callback) {
        var tag_sql = 'DELETE FROM t_tag_relation WHERE game_id =?';
        query(tag_sql, [gameId], function (tag_result) {
            var cls_sql = 'DELETE FROM t_game_cls_relation WHERE game_id =?';
            query(cls_sql, [gameId], function (cls_result) {
                return callback({tag: tag_result.affectedRows, cls: cls_result.affectedRows});
            })
        })
    },
    getGameName: function (sys, msg, callback) {
        var sql = "select id,game_name from t_game where game_name like  '%" + msg + "%' and sys =?";
        query(sql, [sys], function (result) {
            return callback(result)
        })
    },
    deleteTagById: function (id, callback) {
        var sql = 'delete from t_tag_relation where id =?';
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    getActiveById: function (id, callback) {
        var sql = 'SELECT * FROM t_activity WHERE id = ?';
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    deleteActiveById: function (id, callback) {
        var sql = 'delete from t_activity where id = ?';
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    hasTag: function (name, callbakc) {
        var sql = 'SELECT * FROM t_tag WHERE `name`=?';
        query(sql, [name], function (result) {
            return callbakc(result)
        })
    },
    addTag: function (name, callbakc) {
        var sql = 'insert into t_tag (name) values (?)';
        query(sql, [name], function (result) {
            return callbakc(result)
        })
    },
    editTag: function (tagId, name, callback) {
        var sql = 'update t_tag set name=? where id=?';
        query(sql, [name, tagId], function (result) {
            return callback(result)
        })
    },
    upTag: function (tagId, active, callback) {
        var sql = 'update t_tag set active=? where id=?';
        query(sql, [active, tagId], function (result) {
            return callback(result)
        })
    },

    getHasIosOrAndroid: function (obj, callback) {
        var game_sql = "SELECT * FROM t_game WHERE id=?";

        query(game_sql, [obj], function (game_result) {
            return callback(game_result)
        })
    },
};

module.exports = game;
