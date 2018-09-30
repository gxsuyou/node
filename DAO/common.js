var query = require('../config/config');
var crypto = require('crypto');

var page = require("../DAO/page")
var uuid = require('node-uuid');


var common = {
    /**
     * md5加密
     * @param pwd
     * @returns {PromiseLike<ArrayBuffer>}
     */
    pwdMd5: function (pwd) {
        var md5 = crypto.createHash('md5');
        //var result =
        var pwd = md5.update(pwd).digest('hex')
        return pwd;
        //return callback(result)
    },

    getUuid: function (obj) {
        // var newUuid = uuid.v1()
        var newUuid = uuid.v4()
        return newUuid;
    },

    /**
     * 分页page
     * @param tables 表名
     * @param p 当前页
     * @param where 条件
     * @param sqlType left关联
     * @param field 查找的字段
     * @param callback
     */
    page: function (tables, p, where = "", sqlType = "", field = "", callback) {
        var pageCount = 0;
        var sizeCount = 0;
        var p_num = 10;
        var lastPage = "";
        var firstPage = "";
        var arr = {};
        // var p = 1;
        var nextPage = 2;
        var prevPage = 1;
        var max_page = 10;
        var min_page = 1;
        // var pa = parseFloat(req.query.pa);

        if (p > 0) {
            nextPage = p + 1;
            prevPage = p - 1;
            if (p <= 1) {
                prevPage = 1;
                firstPage = 1
            }
        } else {
            firstPage = 1
        }

        if (p > 10) {
            min_page = p;
            max_page = p + 9;
        }
        page.getPage(tables, p, p_num, where, sqlType, field, function (result) {
            sizeCount = result.count;
            if (sizeCount > 0) {
                pageCount = sizeCount % p_num == 0 ? sizeCount / p_num : sizeCount / p_num + 1;
                pageCount = parseInt(pageCount);
                if (pageCount < p) {
                    p = pageCount;
                    prevPage = pageCount - 1;
                }
                if (result.lists.length < p_num) {
                    lastPage = 1;
                }
                if (pageCount < max_page) {//TODO：暂定
                    max_page = pageCount;
                }
                arr = {
                    result: result.lists,
                    nowPage: parseInt(p),
                    firstPage: firstPage,
                    lastPage: lastPage,
                    nextPage: nextPage,
                    prevPage: prevPage,
                    totalPage: pageCount,
                    // page_num: page_num,
                    min_page: min_page,
                    max_page: max_page
                };
                // res.json(arr);
                return callback(arr);
            } else {
                arr = {
                    result: [],
                };
                return callback(arr);
            }
        });
    },

    postMsgcheck: function (post, callback) {
        var info = ""
        var msg = {state: 1};
        for (var i in post) {
            if (post[i] == null) {
                info = "提交参数不能为空";
                msg = {state: 0, info: info}
                break;
            }
        }
        return callback(msg);
    },

    getGameSearch: function (obj, callback) {
        var sysSql = obj.sys > 0 ? " AND a.sys=" + obj.sys : "";
        var sql = 'SELECT a.*,FROM_UNIXTIME(a.add_time,"%Y-%m-%d") as add_time,b.comment ' +
            'FROM t_game AS a ' +
            'LEFT JOIN t_admin AS b ON a.admin = b.id WHERE a.id > 0 ' + sysSql + ' LIMIT 0,30';
        if (obj.name) {
            sql = 'SELECT a.*,FROM_UNIXTIME(a.add_time,"%Y-%m-%d") as add_time,b.comment ' +
                'FROM t_game AS a LEFT JOIN t_admin AS b ON a.admin = b.id  ' +
                'WHERE a.game_name LIKE "%' + obj.name + '%" ' + sysSql + ' LIMIT 0,30';
        } else if (obj.msg) {
            sql = 'SELECT a.*,FROM_UNIXTIME(a.add_time,"%Y-%m-%d") as add_time,b.comment ' +
                'FROM t_game AS a LEFT JOIN t_admin AS b ON a.admin = b.id  ' +
                'WHERE a.game_name LIKE "%' + obj.msg + '%" ' + sysSql + ' LIMIT 0,30';
        }
        query(sql, [], function (result) {
            if (result) {
                return callback(result);
            } else {
                return callback([]);
            }
        })
    },
    getActiveSearch: function (obj, callback) {
        var sql = 'SELECT * FROM t_activity LIMIT 0,30';
        if (obj) {
            sql = 'SELECT * FROM t_activity WHERE name LIKE "%' + obj + '%" LIMIT 0,30';
        }
        query(sql, [], function (result) {
            if (result) {
                return callback(result);
            } else {
                return callback([]);
            }
        })
    },

    hasDownLoadDay: function (obj, callback) {
        var sql = "SELECT * FROM t_all_activity_log WHERE start_time>=? AND end_time<=? AND type=1 AND sys=?";
        query(sql, [obj.start, obj.end, obj.sys], function (result) {
            return callback(result);
        })
    },
    getDownLoadDay: function (obj, callback) {
        var sql = "INSERT INTO t_all_activity_log (`start_time`,`end_time`,`type`,`sys`,`num`) VALUES (?,?,?,?,?)";
        query(sql, [obj.start, obj.end, obj.type, obj.sys, obj.num], function (result) {
            return callback(result);
        })
    },
    getDownLoadDayUp: function (obj, callback) {
        var sql = "UPDATE t_all_activity_log SET num=? WHERE id=?";
        query(sql, [obj.num, obj.id], function (result) {
            return callback(result);
        })
    },
    hasUserLog: function (obj, callback) {
        var sql = "SELECT * FROM t_all_activity_log WHERE user_id=? AND start_time BETWEEN" + obj.start + " AND " + obj.end + " AND type=2"
        query(sql, [obj.uid], function (result) {
            return callback(result);
        })
    },
    getUserLogAdd: function (obj, callback) {
        var sql = "INSERT INTO t_all_activity_log (`user_id`,`start_time`,`type`) VALUES (?,?,2)";
        query(sql, [obj.uid, obj.addTime], function (result) {
            return callback(result);
        })
    },

    /**
     *
     * @param obj {uid,coin,balance,types,b_types}
     * @param uid 用户id
     * @param coin 活动金额
     * @param balance 结算后余额
     * @param types 1：增加，2：扣减
     * @param b_types 结算类型，SIGNIN 签到，REC 推荐，ESSENCE 精华，BROWSE 浏览，AGREE 点赞，TICKET 抵用券使用，WITHDRAW 提现，UNKNOWN 其他
     * @param add_time 添加时间
     * @param memo 备注说明
     * @param state 状态 1 已结算，0 未结算
     * @param callback
     */
    getAddCoinLog: function (obj, add_time, memo, state, callback) {
        var userSql = "SELECT * FROM t_user WHERE id = ?";
        query(userSql, [obj.uid], function (userInfo) {
            if (userInfo.length) {
                var newCoin = Number(userInfo[0].coin) + Number(obj.coin);
                if (obj.types == 2) {
                    newCoin = Number(userInfo[0].coin) - Number(obj.coin);
                }
                var upUser = "UPDATE t_user SET coin=? WHERE id=?";
                query(upUser, [newCoin, obj.uid], function () {

                })

                var addLog = "INSERT INTO t_coin_log (`uid`,`coin`,`balance`,`types`,`b_types`,`add_time`,`memo`,`state`) VALUES (?,?,?,?,?,?,?,?)"
                var arr = [obj.uid, obj.coin, newCoin, obj.types, obj.b_types, add_time, memo, state]
                query(addLog, arr, function (result) {
                    return result;
                })
            }
        })

    }
}

module.exports = common;
