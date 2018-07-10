/**
 * Created by Administrator on 2016/12/15.
 */
var query = require('../config/config');

//收藏、取消收藏
var index = {
    carousel: function (gameId, callback) {
        var sql = "select * from t_game where id=?";
        query(sql, [gameId], function (result) {
            return callback(result)
        })
    },
    hasNewsComment: function (callback) {
        var sql = "SELECT * FROM t_news_comment"
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    upDateTime: function (id, time, callback) {
        var sql = "UPDATE t_news_comment SET add_time=? WHERE id=?";
        query(sql, [time, id], function (result) {
            return callback(result)
        })
    }
};

module.exports = index;






