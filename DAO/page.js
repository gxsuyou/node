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
        var LEFT = "";
        var sysWhere = where.sys > 0 ? " AND sys = " + where.sys : ""
        var sort = where.sortType ? where.sortType : "";
        var sortWhere = "";
        if (sort) {
            if (sort != "null") {
                sortWhere = " AND " + sort + " <> 0 "
            }
        }

        var sql = "SELECT COUNT(*) AS count FROM `" + tables + "` WHERE id > 0" + sysWhere + sortWhere;
        if (sqlTypes == "left") {//关联查询
            sql = "SELECT COUNT(*) AS count FROM `" + tables[0] + "` WHERE id > 0 " + sysWhere + sortWhere;
        }
        query(sql, [], function (result) {
            if (result[0].count > 0) {
                var sql_1 = "SELECT " + fields + " FROM " + tables + " " + where.where + " limit ?,?";
                if (sqlTypes == "left") {
                    var LEFT = "";
                    if (tables[2]) {//第三个表
                        LEFT = "LEFT JOIN  " + tables[2] + " ON " + where.left_on + " \n ";
                    }
                    sql_1 = "SELECT " + fields + " FROM " + tables[0] + " \n " + LEFT +
                        "LEFT JOIN  " + tables[1] + "\n " +
                        "ON " + where.where + " limit ?,?";
                }
                query(sql_1, [(pages - 1) * page, page], function (lists) {
                    var arr = {
                        count: result[0]["count"],
                        lists: lists,
                    }
                    return callback(arr);
                })
            } else {
                var arr = {
                    count: 0,
                    lists: [],
                }
                return callback(arr);
            }
        })

    },

}

module.exports = page;