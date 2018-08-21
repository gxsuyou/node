/**
 * Created by Administrator on 2016/12/15.
 */
var query = require('../config/config');
var md5 = require('../DAO/common')

//收藏、取消收藏
var admin = {
    adminLogin: function (username, password, callback) {
        var pwd = md5.pwdMd5(password);
        var sql = "select id,name,comment,nike_name from t_admin where name=? and password=?";
        // console.log(username, pwd);
        query(sql, [username, pwd], function (result) {
            return callback(result);
        })

    },
    deleteGameImg: function (id, callback) {
        var game_sql = "SELECT * FROM t_game WHERE id=?";
        query(game_sql, [id], function (result) {
            var set_sql = "UPDATE t_game SET game_title_img=null,icon=null WHERE id=?"
            query(set_sql, [id], function (result) {

            })

            var sql = 'DELETE FROM  t_game_img WHERE game_id = ?';
            query(sql, [id], function (result) {

            })
            return callback(result)
        })

    },
    deleteGameApp: function (id, callback) {
        var game_sql = "SELECT * FROM t_game WHERE id=?";
        query(game_sql, [id], function (result) {
            var set_sql = "UPDATE t_game SET game_download_ios2=null,game_download_andriod=null WHERE id=?"
            query(set_sql, [id], function (result) {
                return callback(result)
            })
        })

    },
    updateGameSizeById: function (id, size, callback) {
        var sql = "update t_game set game_size=? where id =?";
        query(sql, [size, id], function (result) {
            return callback(result)
        })
    },
    updateGameTitleImgById: function (id, titleImg, callback) {
        var sql = "update t_game set game_title_img=? where id =?";
        query(sql, [titleImg, id], function (result) {
            return callback(result)
        })
    },
    updateGameAndroidById: function (id, Android, callback) {
        var sql = "update t_game set game_download_andriod=? where id =?";
        query(sql, [Android, id], function (result) {
            return callback(result)
        })
    },
    hasGame: function (gameName, callback) {
        var sql = "select * from t_game where game_name=?";
        query(sql, [gameName], function (result) {
            return callback(result)
        })
    },
    addimg: function (gameid, src, callback) {
        var sql = "INSERT INTO t_game_img(game_id,img_src) values (?,?)";
        query(sql, [gameid, src], function (result) {
            return callback(result)
        })
    },
    getGameByStart: function (start, callback) {
        var sql = "call game_Page(?)";
        query(sql, [(start - 1) * 30], function (result) {
            return callback(result)
        })
    },
    searchGameByMsg: function (searchType, msg, callback) {
        var sql = "SELECT * FROM t_game  WHERE   game_name like '%" + msg + "%' LIMIT 0,30";
        query(sql, [searchType], function (result) {
            return callback(result)
        })
    },
    getGameName: function (sys, callback) {
        var sql = "select game_name,id from t_game where sys=?";
        query(sql, [sys], function (result) {
            return callback(result)
        })
    },
    getHotGame: function (callback) {
        var sql = "select * from t_hotgame";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    editHotGame: function (gameId, sys, callback) {
        var sql = "update t_hotgame set game_id=? where sys=?";
        query(sql, [gameId, sys], function (result) {
            return callback(result)
        })
    },
    getGameNameIdByMsg: function (msg, sys, callback) {
        var sql = "select game_name,id from t_game where type=? and sys=?";
        query(sql, [msg, sys], function (result) {
            return callback(result)
        })
    },
    getGameNameIdByMsgIos: function (msg, sys, callback) {
        if (msg != "") {
            var sql = "select game_name,id from t_game where type=? and sys=?";
            query(sql, [msg, sys], function (result) {
                return callback(result)
            })
        } else {
            var sql = "select game_name,id from t_game where type!='application' and sys=?";
            query(sql, [sys], function (result) {
                return callback(result)
            })
        }
    },
    setClsActive: function (type, sys, arr, callback) {
        var sql = "delete from t_cls_active where type =? and sys=?";
        query(sql, [type, sys], function (result) {
            var i = 0;

            function add() {

                var sql = 'insert into t_cls_active (game_id,sort,type,sys) values (?,?,?,?)';
                query(sql, [arr[i], i, type, sys], function (result) {
                    i++;
                    if (i < arr.length) {
                        add()
                    } else {
                        return callback(result)
                    }
                })
            }

            add();
        })
    },
    getClsActive: function (callback) {
        var sql = "select * from t_cls_active";
        query(sql, [], function (result) {
            return callback(result);
        })
    },
    getGameByStartAdmin: function (start, admin, callback) {
        var sql = "call pro_gameByAdmin(?,?)";
        query(sql, [(start - 1) * 30, admin], function (result) {
            return callback(result)
        })
    },
    deleteGame: function (id, callback) {
        var getNews = "SELECT * FROM t_game WHERE id=?"
        query(getNews, [id], function (newsInfo) {//查询当前游戏
            if (newsInfo) {
                var getComment = "SELECT * FROM t_game_comment WHERE game_id=? ";
                query(getComment, [id], function (comments) {//查询与当前游戏的所有评论
                    for (var i in comments) {//删除tip表中tip_id与t_game_comment表中关联的id数据
                        var tip = "DELETE FROM t_tip WHERE tip_id=? AND type=3 OR type IS null";
                        query(tip, [comments[i].id], function (result1) {

                        });

                        var like = "DELETE FROM t_game_comment_like WHERE comment_id=?";
                        query(like, [comments[i].id], function (result1) {//删除关注评论

                        });
                    }
                })

                var sql_com = "DELETE FROM t_game_comment WHERE game_id=? ";
                query(sql_com, [id], function (result2) {//删除游戏评论数据

                });


                var sql = "DELETE FROM t_game_img WHERE game_id=?";
                query(sql, [id], function (result) {//删除游戏截图

                })

                var clsSql = "DELETE FROM t_game_cls_relation where game_id = ?";
                query(clsSql, [id], function (result) {//删除分类关联

                })

                var tagSql = "DELETE FROM t_tag_relation where game_id = ?";
                query(tagSql, [id], function (result) {//删除标签关联

                })

                var sql = "DELETE FROM t_game where id=?";
                query(sql, [id], function (result) {//删除游戏
                    return callback(result);
                })
            }
        })
    },
    getGameMsgById: function (id, callback) {
        var sql = 'select * from t_game where id=?';
        query(sql, [id], function (result) {
            return callback(result);
        })
    },
    addUser: function (name, password, jurisdiction, comment, callback) {
        var sql = "insert into t_admin (name,password,jurisdiction,comment) values (?,?,?,?)";
        query(sql, [name, password, jurisdiction, comment], function (result) {
            return callback(result);
        })
    },
    getAdmin: function (callback) {
        var sql = "select * from t_admin";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    addActive: function (obj, callback) {
        var obj = obj;
        var sqlG = "select id from t_game where game_name=?";
        try {
            query(sqlG, [obj.gameName], function (res) {
                if (res[0].id) {
                    obj.game_id = res[0].id;
                } else {
                    console.log("addactive fales");
                    return false;
                }
                var sql = "insert into t_activity (name,title,sort,active_img,active,game_id,type,sys) " +
                    "values (?,?,?,?,?,?,?,?)";
                query(sql, [obj.name, obj.title, obj.sort, obj.active_img, obj.active, obj.game_id, obj.type, obj.sys], function (result) {
                    return callback(result)
                })
            });
        } catch (e) {
            console.log(e);
        }
    },
    getActive: function (callback) {
        var sql = "select * from t_activity order by type";
        query(sql, [], function (result) {
            return callback(result);
        })
    },
    deleteActive: function (activeId, callback) {
        var sql = "delete from t_activity where id=?";
        query(sql, [activeId], function (result) {
            return callback(result);
        })
    },
    addGoods: function (obj, callback) {
        var sql = "insert into t_good (good_name,good_icon,good_type,coin_type,good_detail,add_time,remark,exp,coin_value,stock,now_stock) values (?,?,?,?,?,?,?,?,?,?,?)";
        query(sql, [obj.good_name, obj.good_icon, obj.good_type, obj.coin_type, obj.good_detail, obj.add_time, obj.remark, obj.explain, obj.coin_value, obj.stock, obj.stock], function (result) {
            return callback(result);
        })
    },
    addGoodsImg: function (goodsId, src, callback) {
        var sql = "INSERT INTO t_good_img(good_id,src) values (?,?)";
        query(sql, [goodsId, src], function (result) {
            return callback(result)
        })
    },
    addGoodsType: function (goodsId, type, cost, stock, callback) {
        var sql = "INSERT INTO t_good_type(good_id,type,cost,stock,now_stock) values (?,?,?,?,?)";
        query(sql, [goodsId, type, cost, stock, stock], function (result) {
            return callback(result);
        })
    },
    addVirtual: function (obj, callback) {
        var sql = "insert into t_good (good_name,good_icon,good_type,coin_type,good_detail,add_time,remark,exp,coin_value,stock,system,now_stock) values (?,?,?,?,?,?,?,?,?,?,?,?)";
        query(sql, [obj.good_name, obj.good_icon, obj.good_type, obj.coin_type, obj.good_detail, obj.add_time, obj.remark, obj.explain, obj.coin_value, obj.stock, obj.system, obj.stock], function (result) {
            return callback(result);
        })
    },
    getGood: function (callback) {
        var sql = "select * from t_good";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    delectGoodById: function (id, callback) {
        var sql = "delete from t_good where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    deleteGoodsImgById: function (id, callback) {
        var sql = "delete from t_good_img where good_id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    getGoodsTypeById: function (id, callback) {
        var sql = "select * from t_good_type where good_id =?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    deleteGoodTypeById: function (id, callback) {
        var sql = "delete from t_good_type where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },

    //资讯
    addNews: function (obj, callback) {
        var sql = "INSERT INTO t_news (title,img,add_time,detail,game_id) VALUES (?,?,?,?,?)";
        query(sql, [obj.title, obj.img, obj.add_time, obj.detail, obj.game_id], function (result) {
            return callback(result);
        })
    },
    getNewsByPage: function (page, callback) {
        var sql = "SELECT id,title,add_user,comment,browse,agree,add_time,game_id,up " +
            "FROM `t_news` ORDER BY up DESC,add_time DESC limit ?,2000";
        query(sql, [(page - 1) * 20, page * 20], function (result) {
            return callback(result);
        })
    },
    getNewsById: function (id, callback) {
        var sql = "select * from t_news where id=?";
        query(sql, [id], function (result) {
            return callback(result);
        })
    },
    deleteNewsById: function (id, callback) {
        var sql = "delete from t_news where id=?";
        query(sql, [id], function (result) {
            return callback(result);
        })
    },
    //渠道
    getQudao: function (callback) {
        var sql = "select * from t_admin where jurisdiction=3";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    addQudao: function (add_num, current, income, qudao_id, date, active_num, callback) {
        var sql = "insert into t_qudaoshow(add_num,current,income,qudao_id,add_date,active_num) values (?,?,?,?,?,?)";
        query(sql, [add_num, current, income, qudao_id, date, active_num], function (result) {
            return callback(result)
        })
    },
    getQudaoshow: function (startTime, endTime, qudao_id, callback) {
        var sql = "select * from t_qudaoshow where qudao_id=? and add_date>=? and add_date<=?";
        query(sql, [qudao_id, startTime, endTime], function (result) {
            return callback(result)
        })
    },
    getQudaoClick: function (startTime, endTime, type, callback) {
        var sql = "select * from t_qudaosta where qudao_id=? and add_date>=? and add_date<=?";
        query(sql, [type, startTime, endTime], function (result) {
            return callback(result)
        })
    },

    //用户
    getUserCount: function (callback) {
        var sql = "select count(id) as co from t_user";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    getActiveUserCount: function (date, callback) {
        var sql = "select count(id) as co from t_user where new_sign>?";
        query(sql, [date], function (result) {
            return callback(result)
        })
    },
    getRegUserByDate: function (startTime, endTime, callback) {
        var sql = "select count(id) as co from t_user where time_logon>? and time_logon<?";
        query(sql, [startTime, endTime], function (result) {
            return callback(result)
        })
    },
    hasAdminPwd: function (obj, callback) {
        var pwd = md5.pwdMd5(obj.oldPwd);
        var sql = "SELECT id,name,comment,login_ip,nike_name FROM t_admin WHERE id = ? AND password = ?"
        query(sql, [obj.id, pwd], function (result) {
            return callback(result)
        })
    },
    setAdminPwd: function (obj, callback) {
        var pwd = md5.pwdMd5(obj.pwd);
        var sql = "UPDATE t_admin SET password = ?,nike_name = ? WHERE id = ?"
        query(sql, [pwd, obj.nike_name, obj.id], function (result) {
            return callback(result)
        })
    },
    getHasIosOrAndroid: function (obj, callback) {
        var game_sql = "SELECT * FROM t_game WHERE id=?";
        query(game_sql, [obj], function (game_result) {
            return callback(game_result)
        })
    },
    getFeedBackDetail: function (obj, callback) {
        var sql = "SELECT t_feedback.*,t_user.nick_name " +
            "FROM t_feedback " +
            "LEFT JOIN t_user ON t_user.id = t_feedback.user_id WHERE t_feedback.id = ?"
        query(sql, [obj], function (result) {
            var sql2 = "SELECT * FROM t_feedback_img WHERE feedback_id = ?"
            query(sql2, [obj], function (result_img) {
                return callback({result: result[0], img: result_img})
            })
        })
    },
    delFeedBack: function (obj, callback) {
        var img_del = "DELETE FROM t_feedback_img WHERE feedback_id = ?"
        query(img_del, [obj], function (results) {
            var sql = "DELETE FROM t_feedback WHERE id = ?"
            query(sql, [obj], function (result) {
                return callback(result)
            })
        })
    },
    getYesterDayCount: function (obj, callback) {
        var reg_sql = "SELECT count(*) FROM t_user WHERE time_logon BETWEEN " + obj.start + " AND " + obj.end;
        query(reg_sql, [], function (results) {
            // var log_sql =
        })
    }
};


module.exports = admin;
