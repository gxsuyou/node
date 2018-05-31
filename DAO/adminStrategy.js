var query = require('../config/config');
var strategy={
    getStrategyByMsg:function (sort,page,callback) {
        var sql = 'select t_strategy.*,t_strategy_img.src,t_user.`nick_name`,t_user.portrait from t_strategy left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id LEFT JOIN t_user ON t_user.id=t_strategy.`user_id` group by t_strategy.id order by '+sort+' desc  limit ?,10';
        query(sql,[(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getStrategyByEssence:function (page,callback) {
        var sql = "select t_strategy.*,t_strategy_img.src from t_strategy left join t_strategy_img on t_strategy_img.strategy_id= t_strategy.id where essence = 1 group by t_strategy.id limit ?,10";
        query(sql,[((page-1)*10)],function (result) {
            return callback(result)
        })
    },
    getStrategyByMsgPage:function (msg,page,callback) {
        var sql ="select count(t_strategy.id) as len from t_strategy left join t_user on t_strategy.user_id = t_user.id where title like '%"+msg+"%'";
        query(sql,[],function (result) {
            var len =result[0].len;
            var sql ="select t_strategy.*,t_user.nick_name from t_strategy left join t_user on t_strategy.user_id = t_user.id where title like '%"+msg+"%' order by add_time limit ?,30";
            query(sql,[(page-1)*30],function (result) {
                result['len']=len;
                return callback(result)
            })
        })

    },
    getStrategyCount:function (callback) {
        var sql ="select count(id) as len from t_strategy";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    essence:function (strategyId,callback) {
        var sql = "update t_strategy set essence=1 where id=?";
        query(sql,[strategyId],function (result) {
            return callback(result)
        })
    },
    unEssence:function (strategyId,callback) {
        var sql = "update t_strategy set essence=0 where id=?";
        query(sql,[strategyId,strategyId],function (result) {
            return callback(result)
        })
    },
    deleteStrategy:function (strategyId,callback) {
        var sql = "delete from  t_strategy where id =? ";
        query(sql,[strategyId],function (result) {
            return callback(result)
        })
    }

};
module.exports=strategy;