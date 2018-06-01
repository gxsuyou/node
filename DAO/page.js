var query = require('../config/config');
var page = {

    getPage: function (pages, page, tables, where, callback) {//单表查询
        // pages:当前页的查询数量，page:每页显示数量
        // var sql="SELECT a.id,a.title,a.img,a.add_time,a.agree,a.game_id,a.browse,b.game_name,b.icon,b.game_recommend FROM t_news AS a\n" +
        //     "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` order by a.up desc,a.add_time desc limit ?,5";
        var sql = "SELECT COUNT(*) AS count FROM `" + tables + "`";
        query(sql, [], function (result) {

            if (result[0].count > 0) {
                var sql = "SELECT * FROM " + tables + where + " limit ?,?";
                query(sql, [(pages - 1) * page, page], function (lists) {
                    var arr = {
                        count: result[0]["count"],
                        lists: lists,
                    }
                    return callback(arr);
                })
            }
        })

    }
}

module.exports = page;