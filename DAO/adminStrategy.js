var query = require('../config/config');
var common = require('../DAO/common');
var strategy = {
    getStrategyByMsg: function (sort, page, callback) {
        var sql = 'SELECT t_strategy.*,t_strategy_img.src,t_user.`nick_name`,t_user.portrait ' +
            'FROM t_strategy ' +
            'LEFT JOIN t_strategy_img ON t_strategy_img.strategy_id= t_strategy.id ' +
            'LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` ' +
            'GROUP BY t_strategy.id ORDER BY ' + sort + ' DESC  LIMIT ?,10';
        query(sql, [(page - 1) * 10], function (result) {
            return callback(result)
        })
    },
    getStrategyByEssence: function (page, callback) {
        var sql = "select t_strategy.*,t_strategy_img.src " +
            "from t_strategy " +
            "left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id " +
            "where essence = 1 group by t_strategy.id limit ?,10";
        query(sql, [((page - 1) * 10)], function (result) {
            return callback(result)
        })
    },
    getStrategyByMsgPage: function (msg, page, callback) {
        var sql = "select count(t_strategy.id) as len " +
            "from t_strategy " +
            "left join t_user on t_strategy.user_id = t_user.id " +
            "where title like '%" + msg + "%'";
        query(sql, [], function (result) {
            var len = result[0].len;
            var sql = "select t_strategy.*,t_user.nick_name " +
                "from t_strategy " +
                "left join t_user on t_strategy.user_id = t_user.id " +
                "where title like '%" + msg + "%' order by add_time limit ?,30";
            query(sql, [(page - 1) * 30], function (result) {
                result['len'] = len;
                return callback(result)
            })
        })

    },
    getStrategyCount: function (callback) {
        var sql = "select count(id) as len from t_strategy";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    essence: function (strategyId, callback) {
        var date = new Date();
        var nowTime = date.getTime() / 1000;

        var sql = "update t_strategy set essence=1 where id=?";
        query(sql, [strategyId], function (result) {

            var findSql = "SELECT * FROM t_strategy WHERE id=?"
            query(findSql, [strategyId], function (find) {
                if (find[0].admin < 1 && find[0].essence_coin < 1) {

                    var logMemo = "发布文章被列为精华，获得500金币";
                    addCoinLog(find[0].user_id, 500, nowTime, "文章标题：" + find[0].title, logMemo, "ESSENCE")
                }
            })
            return callback(result)
        })
    },
    unEssence: function (strategyId, callback) {
        var sql = "update t_strategy set essence=0 where id=?";
        query(sql, [strategyId, strategyId], function (result) {
            return callback(result)
        })
    },
    hasUserAndGame: function (obj, callback) {
        var admin_sql = "select id from t_admin where id = ?";
        query(admin_sql, [obj.admin], function (admin_result) {
            if (admin_result.length) {
                var userSql = "SELECT id FROM t_user WHERE a_id=? AND is_inside=1"
                query(userSql, [obj.admin], function (userInfo) {
                    if (userInfo.length) {
                        return callback(userInfo)
                    } else {
                        return callback(admin_result)
                    }
                })
            } else {
                return callback(admin_result)
            }
        })

    },
    addStratgy: function (obj, callback) {
        var sql = "INSERT INTO t_strategy (user_id,title,detail,game_name,add_time,admin,top_img_src) " +
            "VALUES (?,?,?,?,?,?,?)"
        var arr = [obj.uid, obj.title, obj.detail, obj.game_name, obj.add_time, obj.adminstatus, obj.img_src];
        query(sql, arr, function (result) {
            return callback(result);
            //if (result.insertId) {
            //    var sql = "INSERT INTO t_strategy_img (src,strategy_id) VALUES (?,?)";
            //    query(sql, [obj.img_src, result.insertId], function (img_result) {
            //        return callback(img_result)
            //    })
            //}
        })
    },
    addStratgyApp: function (obj, callback) {
        var sql = "INSERT INTO t_strategy (user_id,title,detail,game_name,add_time,admin,top_img_src) " +
            "VALUES (?,?,?,?,?,?,?)"
        var arr = [obj.user_id, obj.title, obj.detail, obj.game_name, obj.add_time, obj.admin, obj.img_src];
        query(sql, arr, function (result) {
            return callback(result);
            //if (result.insertId) {
            //    var sql = "INSERT INTO t_strategy_img (src,strategy_id) VALUES (?,?)";
            //    query(sql, [obj.img_src, result.insertId], function (img_result) {
            //        return callback(img_result)
            //    })
            //}
        })
    },
    getStratgyMsg: function (obj, callback) {
        var sql = 'select * from t_strategy where id=?'
        query(sql, [obj.id], function (result) {
            return callback(result);
        })
    },
    setStratgy: function (obj, callback) {
        var sql = "UPDATE t_strategy SET title=?,detail=? WHERE id=?"
        query(sql, [obj.title, obj.detail, obj.id], function (result) {
            return callback(result);
        })
    },

    addStrategyImg: function (obj, callback) {
        var sql = "INSERT INTO t_strategy_img (src,strategy_id,sort_id) VALUES (?,?,?)";
        query(sql, [obj.img_src, obj.StrategyId, obj.sort_id], function (result) {
            return callback(result)
        })
    },
    deleteStrategy: function (strategyId, callback) {
        var hasStrategy = "SELECT * FROM t_strategy WHERE id=?"
        query(hasStrategy, [strategyId], function (strategy) {//查询当前的攻略
            if (strategy) {
                var getComment = "SELECT * FROM t_strategy_comment WHERE targetid=? ";
                query(getComment, [strategyId], function (comments) {//查询与当前攻略的所有评论
                    for (var i in comments) {//删除tip表中tip_id与t_strategy_comment表中关联的id数据
                        var tip = "delete from t_tip where tip_id=? AND type=2";
                        query(tip, [comments[i].id], function (result1) {

                        });

                        var like = "DELETE FROM t_strategy_like WHERE comment_id=?";
                        query(like, [comments[i].id], function (result1) {//删除关注评论

                        });
                    }
                })

                var sql_com = "delete from t_strategy_comment where targetid=? ";
                query(sql_com, [strategyId], function (result2) {//删除攻略评论数据

                });

                var sql = "delete from t_strategy where id=?";
                query(sql, [strategyId], function (result3) {//删除攻略
                    return callback(result3);
                });
            }
        })
    },

    hasAdmin: function (obj, callback) {
        var admin_sql = "SELECT id,comment FROM t_admin WHERE id = ?";
        query(admin_sql, [obj], function (result) {
            return callback(result)
        })
    }

};

function addCoinLog(userId, coin, nowTime, target, memo, b_types = "UNKNOWN", types = 1, state = 1) {
    var log = {
        uid: userId,
        target: target,
        coin: coin,
        types: types,
        b_types: b_types
    }
    common.getAddCoinLog(log, parseInt(nowTime), memo, state, function () {

    })
    return true
}

module.exports = strategy;