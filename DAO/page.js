var query = require('../config/config');
var page = {

    /**
     * 分页查询
     * @param tables
     * @param pages
     * @param page
     * @param where
     * @param sqlType
     * @param field
     * @param callback
     */
    getPage: function (tables, pages = 1, page = 10, where = "", sqlType = "", field = "", callback) {
        // pages:当前页的查询数量，page:每页显示数量
        // var sql="SELECT a.id,a.title,a.img,a.add_time,a.agree,a.game_id,a.browse,b.game_name,b.icon,b.game_recommend FROM t_news AS a\n" +
        //     "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` order by a.up desc,a.add_time desc limit ?,5";
        var sqlTypes = sqlType;
        var fields = field ? field : "*";
        var sql = "SELECT COUNT(*) AS count FROM `" + tables + "`";
        if (sqlTypes == "left") {//关联查询
            sql = "SELECT COUNT(*) AS count FROM `" + tables[0] + "`";
        }
        query(sql, [], function (result) {

            if (result[0].count > 0) {
                var sql_1 = "SELECT " + fields + " FROM " + tables + " " + where + " limit ?,?";
                if (sqlTypes == "left") {
                    sql_1 = "SELECT " + fields + " FROM " + tables[0] + " \n" +
                        "LEFT JOIN  " + tables[1] + "\n" +
                        "ON " + where + " limit ?,?";
                }
                query(sql_1, [(pages - 1) * page, page], function (lists) {
                    var arr = {
                        count: result[0]["count"],
                        lists: lists,
                    }
                    return callback(arr);
                })
            }
        })

    },

    /**
     * 模糊查询
     * @param tables
     * @param pages
     * @param page
     * @param where
     * @param sqlType
     * @param field
     * @param callback
     */
    getSearchPage: function (tables, pages = 1, page = 15, where = "", sqlType = "", field = "", search = "", callback) {//单表查询
        // pages:当前页的查询数量，page:每页显示数量
        // var sql="SELECT a.id,a.title,a.img,a.add_time,a.agree,a.game_id,a.browse,b.game_name,b.icon,b.game_recommend FROM t_news AS a\n" +
        //     "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` order by a.up desc,a.add_time desc limit ?,5";
        var sqlTypes = sqlType;
        var fields = field ? field : "*";
        var msg = " ";

        var sql = "SELECT COUNT(*) AS count FROM `" + tables + "`";
        if (sqlTypes == "left") {//关联查询
            sql = "SELECT COUNT(*) AS count FROM `" + tables[0] + "`";
        }

        if (search && search.length > 0) {
            for (var i = 0; i < search.length; i++) {
                if (i > search.length) {
                    break;
                }
            }
        }
        query(sql, [], function (result) {

            if (result[0].count > 0) {
                var sql_1 = "SELECT " + fields + " FROM " + tables + " " + where + " limit ?,?";
                if (sqlTypes == "left") {
                    sql_1 = "SELECT " + fields + " FROM " + tables[0] + " \n" +
                        "LEFT JOIN  " + tables[1] + "\n" +
                        "ON " + where + " limit ?,?";
                }
                query(sql_1, [(pages - 1) * page, page], function (lists) {
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