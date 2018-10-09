/**
 * Created by Administrator on 2016/12/15.
 */
var query = require('../config/config');
var common = require('../DAO/common');

//收藏、取消收藏
var user = {
    getUserInfo: function (obj, callback) {
        var sqlUser = 'SELECT * FROM t_user WHERE only_id LIKE "%' + obj.user + '%" ';
        query(sqlUser, [], function (userInfo) {
            return callback(userInfo);
        })
    },
    getBinding: function (obj, callback) {
        var sqlUser = "SELECT * FROM t_user WHERE only_id=? OR tel=? OR nick_name=?";
        query(sqlUser, [obj.user, obj.user, obj.user], function (userInfo) {
            if (userInfo.length) {
                var upSql = "UPDATE t_user SET is_inside=1, a_id=?";
                query(upSql, [obj.id], function (result) {
                    return callback(result);
                })
            } else {
                return callback(userInfo);
            }
        })
    },

    getFindUser: function (obj, callback) {
        var sql = "SELECT * FROM t_user WHERE a_id=? AND is_inside=1";
        query(sql, [obj.admin_id], function (isBinding) {
            if (isBinding.length) {
                return callback({state: -1, info: isBinding});
            }

            var sql = "SELECT * FROM t_user WHERE nick_name=? OR tel=?";
            query(sql, [obj.nick_name, obj.tel], function (result) {
                var state = 1;
                if (result.length) {
                    state = -2
                }
                return callback({state: state, info: result});
            })
        })


    },

    getAddUser: function (obj, callback) {
        var date = new Date();
        var nowTime = date.getTime() / 1000
        var month = date.getMonth() + 1
        var day = date.getDate()
        var H = date.getHours()
        var M = date.getMinutes()

        var nick_name = obj.nickName || "ONE_" + month + day + "_" + Math.floor(Math.random() * 99999);
        // var pwd = common.pwdMd5(obj.password);

        var sql = "INSERT INTO t_user (`nick_name`,`password`,`portrait`,`time_logon`,`tel`,`is_inside`,`a_id`) VALUES (?,?,?,?,?,1,?)";
        query(sql, [nick_name, obj.password, obj.portrait, nowTime, obj.tel, obj.a_id], function (result) {
            return callback(result);
        })

    },

    getUpOnlyId: function (obj, callback) {
        var onlyId = (parseInt(obj) + 123456);
        var sql = "UPDATE t_user SET only_id=? where id=?";
        query(sql, [onlyId, obj], function (result) {
            return callback(result)
        })
    }
};
module.exports = user;