/**
 * Created by Administrator on 2016/12/15.
 */
var query = require('../config/config');
var md5 = require('../DAO/common')

//收藏、取消收藏
var admin = {
    adminLogin: function (username, password, callback) {
        var pwd = md5.pwdMd5(password);
        var sql = "select id,name,comment from t_admin where name=? and password=?";
        // console.log(username, pwd);
        query(sql, [username, pwd], function (result) {
            console.log(66766 + result);
            // return false;
            return callback(result);
        })

    },
    addGame: function (obj, callback) {
        var sql = "INSERT INTO t_game (game_name,game_packagename,game_recommend,game_download_num,game_version,game_update_date,game_company,game_install_num,activation,sys,add_time,update_detail,game_detail,type,admin,cls,grade) values (?,?,?,0,?,?,?,0,?,?,?,?,?,?,?,?,7.8)";
        query(sql, [obj.game_name, obj.game_packagename, obj.game_recommend, obj.game_version, obj.game_update_date, obj.game_company, obj.activation, obj.sys, obj.add_time, obj.update_detail, obj.game_detail, obj.type, obj.admin, obj.cls], function (result) {
            return callback(result);
        })
    },
    editGame: function (obj, callback) {
        var sql = "update t_game set game_name=?,activation=?,game_company=?,game_version=?,game_download_num=?,sort=?,game_size=?,sort2=? where id =?";
        query(sql, [obj.name, obj.activation, obj.company, obj.version, obj.download_num, obj.sort, obj.size, obj.sort2, obj.id], function (result) {
            return callback(result)
        })
    },
    updateGameIconById: function (id, icon, callback) {
        var sql = "update t_game set icon=? where id =?";
        query(sql, [icon, id], function (result) {
            return callback(result)
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
    addCls: function (gameid, clsid, callback) {
        var sql = "INSERT INTO t_game_cls_relation(game_id,cls_id) values (?,?)";
        query(sql, [gameid, clsid], function (result) {
            return callback(result);
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
    delectGameByID: function (id, callback) {
        var clsSql = "DELETE FROM t_game_cls_relation where game_id = ?";
        query(clsSql, [id], function (result) {

            var tagSql = "DELETE FROM t_tag_relation where game_id = ?";
            query(tagSql, [id], function (result) {

                var sql = "DELETE FROM t_game where id=?";
                query(sql, [id], function (result) {
                    return callback(result);
                })
            })
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
                var sql = "insert into t_activity (name,title,sort,active_img,active,game_id,type,sys) values (?,?,?,?,?,?,?,?)";
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
        var sql = "SELECT id,title,add_user,comment,browse,agree,add_time,game_id,up FROM `t_news` ORDER BY up DESC,add_time DESC limit ?,2000";
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
    editNewsById: function (id, title, agree, browse, comment, add_time, callback) {
        var sql = "update t_news set title=?,agree=?,browse=?,comment=?,add_time=? where id=?";
        query(sql, [title, agree, browse, comment, add_time, id], function (result) {
            return callback(result)
        })
    },
    upNews: function (id, callback) {
        var sql = "update t_news set up=1 where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    downNews: function (id, callback) {
        var sql = "update t_news set up=0 where id=?";
        query(sql, [id], function (result) {
            return callback(result)
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
    }
};


module.exports = admin;
