var query = require('../config/config');
var h5 = {
    addH5: function (obj, callback) {
        var sql = "insert into t_h5 (name,url,commend,icon,title_img) values (?,?,?,?,?)";
        query(sql, [obj.name, obj.url, obj.recommend, obj.icon, obj.title_img], function (result) {
            return callback(result);
        })
    },
    updateIcon: function (icon, id, callback) {
        var sql = "update t_h5 set icon=? where id=?";
        query(sql, [icon, id], function (result) {
            return callback(result)
        })
    },
    updateTitleImg: function (titleImg, id, callback) {
        var sql = "update t_h5 set title_img=? where id=?";
        query(sql, [titleImg, id], function (result) {
            return callback(result)
        })
    },
    deleteH5: function (id, callback) {
        var sql = "delete from t_h5 where id=?";
        query(sql, [id], function (result) {
            return callback(result)
        })
    },
    getH5: function (page, callback) {
        var sql = "select * from t_h5 order by sort desc";
        query(sql, [], function (result) {
            return callback(result)
        })
    },
    updateH5: function (id, name, url, commend, sort, callback) {
        var sql = "update t_h5 set name=?,url=?,commend=?,sort=? where id=?";
        query(sql, [name, url, commend, sort, id], function (result) {
            return callback(result)
        })
    }
};
module.exports = h5;