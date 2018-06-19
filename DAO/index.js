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
};

module.exports = index;






