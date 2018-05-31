var query = require('../config/config');
var h5={
    getH5:function (page,callback) {
        var sql="select * from t_h5 order by sort desc limit ?,5";
        query(sql,[(page-1)*5],function (result) {
            return callback(result)
        })
    },
    getH5ByMsg:function (msg,callback) {
        var sql="select * from t_h5 where name like '%"+msg+"%'  ORDER BY sort DESC limit 0,10";
        query(sql,[],function (result) {
            return callback(result)
        })
    }
};
module.exports=h5;