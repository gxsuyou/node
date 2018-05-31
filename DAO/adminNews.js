var query = require('../config/config');
var news={
    addNews:function (obj,callback) {
        var sql="INSERT INTO t_news (title,img,add_time,detail_addr,game_id) VALUES (?,?,?,?,?)";
        query(sql,[obj.title,obj.img,obj.add_time,obj.detail,obj.game_id],function (result) {
            return callback(result);
        })
    },
    getNewsById:function (id,callback) {
        var sql ="select * from t_news where id=?";
        query(sql,[id],function (result) {
            return callback(result);
        })
    },
    deleteNewsById:function (id,callback) {
        var sql="delete from t_news where id=?";
        query(sql,[id],function (result) {
            return callback(result);
        })
    },
    addHeadGame:function (game_id,img,callback) {
        var sql="insert into t_news_headgame (game_id,img) values (?,?)";
        query(sql,[game_id,img],function (result) {
            return callback(result)
        })
    },
    addSlideGame:function (game_id,callback) {
        var sql="insert into t_news_slidegame (game_id) values (?)";
        query(sql,[game_id],function (result) {
            return callback(result)
        })
    },
    getHeadGame:function (callback) {
        var sql="SELECT t_game.game_name,t_news_headGame.id FROM t_news_headGame \n" +
            "LEFT JOIN t_game\n" +
            "ON t_news_headGame.`game_id`=t_game.`id`";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    getSlideGame:function (callback) {
        var sql="SELECT t_game.game_name,t_news_slideGame.id FROM t_news_slideGame \n" +
            "LEFT JOIN t_game\n" +
            "ON t_news_slideGame.`game_id`=t_game.`id`";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    getHeadGameByGameId:function (id,callbcak) {
        var sql="select * from t_news_headgame where game_id=?";
        query(sql,[id],function (result) {
            return callbcak(result)
        })
    },
    getSlideGameByGameId:function (id,callbcak) {
        var sql="select * from t_news_slidegame where game_id=?";
        query(sql,[id],function (result) {
            return callbcak(result)
        })
    },
    getHeadGameById:function (id,callbcak) {
        var sql="select * from t_news_headgame where id=?";
        query(sql,[id],function (result) {
            return callbcak(result)
        })
    },
    getSlideGameById:function (id,callbcak) {
        var sql="select * from t_news_slidegame where id=?";
        query(sql,[id],function (result) {
            return callbcak(result)
        })
    },
    deleteSlideGameById:function (id,callback) {
        var  sql="delete from t_news_slidegame where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    deleteHeadGameById:function (id,callback) {
        var  sql="delete from t_news_headgame where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    }
};
module.exports=news;