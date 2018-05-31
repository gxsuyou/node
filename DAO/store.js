var query=require('../config/config');
var store ={
    getgoods:function (page,callback) {
        query("call pro_getGood(?)",[(page-1)*1],function (result) {
            return callback(result)
        });
    },
    getGoodTypeById:function (id,callback) {
        var sql="select * from t_good_type where good_id =? and cost>0";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    getGoodById:function (id,callback) {
        var sql="select * from t_good where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    getGoodTypeByGoodIdTypeId:function (goodId,typeId,callback) {
        var sql="select * from t_good_type where good_id =? and id=? and cost>0";
        query(sql,[goodId,typeId],function (result) {
            return callback(result)
        })
    },
    //1.28
    getGoodsByPage:function (page,callback) {
        var sql ="select id,good_name,good_icon,good_type,coin_type,coin_value,stock from t_good order by add_time limit ?,20";
        query(sql,[(page-1)*20],function (result) {
            return callback(result)
        })
    },
    getGoodsImgById:function (id,callback) {
        var sql ="select * from t_good_img where good_id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    }
};
module.exports=store;