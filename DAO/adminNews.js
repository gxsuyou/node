var query = require('../config/config');
var news = {
    getNews: function (obj, callback) {
        var sql = "SELECT *,FROM_UNIXTIME(add_time,'%Y-%m-%d %H:%i') as add_time FROM t_news WHERE id = ?";
        query(sql, [obj], function (result) {
            return callback(result);
        })
    },
    hasgame: function (obj, callback) {
        var sql = "SELECT * FROM t_game WHERE id = ?";
        query(sql, [obj], function (result) {
            return callback(result);
        })
    },
    addNews: function (obj, callback) {
        var sql = "INSERT INTO t_news (title,img,add_time,detail,game_id,game_name,add_admin) " +
            "VALUES (?,?,?,?,?,?,?)";
        query(sql, [obj.title, obj.img, obj.add_time, obj.detail, obj.game_id, obj.game_name, obj.admin_id], function (result) {
            return callback(result);
        })
    },
    upNews: function (obj, callback) {
        var news_sql = "SELECT * FROM t_news WHERE id = ?"
        query(news_sql, [obj.id], function (news_result) {
            if (news_result[0].up == 0 && news_result[0].up != obj.up) {//置顶
                var sql = "update t_news set up=1 where id=?";
                query(sql, [obj.id], function (result) {
                    return callback(result)
                })
            } else if (news_result[0].up == 1 && news_result[0].up != obj.up) {//取消置顶
                var sql = "update t_news set up=0 where id=?";
                query(sql, [obj.id], function (result) {
                    return callback(result)
                })
            }
        })


    },
    editNewsById: function (id, title, detail, agree, browse, comment, up_time, callback) {
        var sql = "update t_news set title=?,detail=?,agree=?,browse=?,comment=?,up_time=? where id=?";
        query(sql, [title, detail, agree, browse, comment, up_time, id], function (result) {
            return callback(result)
        })
    },
    setNewsFu: function (obj, callback) {
        var sql = "UPDATE t_news SET detail = ? WHERE id =?";
        query(sql, [obj.detail, obj.id], function (result) {
            return callback(result)
        })
    },
    getNewsById: function (id, callback) {
        var sql = "select * from t_news where id=?";
        query(sql, [id], function (result) {
            return callback(result);
        })
    },
    deleteNewsById: function (id, callback) {
        var getNews = "SELECT * FROM t_news WHERE id=?"
        query(getNews, [id], function (newsInfo) {//查询当前资讯
            if (newsInfo) {
                var getComment = "SELECT * FROM t_news_comment WHERE targetid=? ";
                query(getComment, [id], function (comments) {//查询与当前资讯的所有评论
                    for (var i in comments) {//删除tip表中tip_id与t_news_comment表中关联的id数据
                        var tip = "DELETE FROM t_tip WHERE tip_id=? AND type=1";
                        query(tip, [comments[i].id], function (result1) {

                        });
                    }
                })

                var sql_com = "DELETE FROM t_strategy_comment WHERE newsid=? ";
                query(sql_com, [id], function (result2) {//删除资讯评论数据

                });


                var sql = "DELETE FROM t_news WHERE id=?";
                query(sql, [id], function (result) {//删除资讯
                    return callback(result);
                })
            }
        })

    },
    addHeadGame: function (game_id, img, sys, callback) {
        var sql = "insert into t_news_headgame (game_id,img,sys) values (?,?,?)";
        query(sql, [game_id, img, sys], function (result) {
            return callback(result)
        })
    },
    addSlideGame: function (game_id, callback) {
        var sql = "insert into t_news_slidegame (game_id) values (?)";
        query(sql, [game_id], function (result) {
            return callback(result)
        })
    },
    getHeadGameByGameId: function (id, callbcak) {
        var sql = "select * from t_news_headgame where game_id=?";
        query(sql, [id], function (result) {
            return callbcak(result)
        })
    },
    getSlideGameByGameId: function (id, callbcak) {
        var sql = "select * from t_news_slidegame where game_id=?";
        query(sql, [id], function (result) {
            return callbcak(result)
        })
    },
    getHeadGameById: function (id, callbcak) {
        var sql = "select * from t_news_headgame where id=?";
        query(sql, [id], function (result) {
            return callbcak(result)
        })
    },
    deleteSlideGameById: function (id, callback) {
        var sql = "delete from t_news_slidegame where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    deleteHeadGameById: function (id, callback) {
        var sql = "delete from t_news_headgame where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    }
};
module.exports = news;