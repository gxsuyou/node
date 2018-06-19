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

    setadd: function (obj, callback) {
        var cls = "";
        var tag = "";
        var sql = "select * from t_game where id>0 and id<900";
        query(sql, [], function (result) {
            for (var i = 0; i < result.length; i++) {
                //cls = "," + result[i].cls_ids + ","
                tag = "," + result[i].tag_ids + ","
                var up_sql = "UPDATE t_game SET tag_ids = '" + tag + "' WHERE id =?"
                //console.log(cls + "#####" + result[i].id);
                query(up_sql, [result[i].id], function (up_result) {
                    //console.log(up_result)
                })
            }
            return callback(result)
        })
    }
};

module.exports = index;






