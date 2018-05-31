/**
 * Created by Administrator on 2016/12/15.
 */
var query = require('../config/config');

//收藏、取消收藏
var user = {
    login:function (user_tel,password,callback) {
        var sql = "select id,nick_name,portrait,coin,integral,achievement_point,time_logon,tel,pay from t_user where tel=? and password=?";
        query(sql,[user_tel,password],function (result) {
            if(result.length>0){
                return callback(result)
            }else {
                var sql = "select id,nick_name,portrait,coin,integral,achievement_point,time_logon,tel pay from t_user where nick_name=? and password=?";
                query(sql,[user_tel,password],function (res) {
                    return callback(res)
                })
            }
        })
    },
    gameComment:function (userId,gameId,score,content,agree,addTime,parentId,address,callback) {
        var sql="INSERT INTO t_game_recommend (user_id,game_id,score,content,agree,add_time,parent_id,address) values (?,?,?,?,?,?,?,?)";
        query(sql,[userId,gameId,score,content,agree,addTime,parentId,address],function (result) {
            return callback(result)
        })
    },
    getGameCommentScoreById:function (game_id,callback) {
        var  sql="select score from t_game_recommend where game_id=?";
        query(sql,[game_id],function (result) {
            return callback(result)
        })
    },
    getUserCommentLen:function (game_id,user_id,callback) {
        var  sql="select count(*) as count from t_game_recommend where game_id=? and user_id=?";
        query(sql,[game_id,user_id],function (result) {
            return callback(result)
        })
    },
    updateGameScore:function (game_id,score,callback) {
        var sql="UPDATE t_game SET grade=? where id=?";
        query(sql,[score,game_id],function (result) {
            return callback(result)
        })
    },
    reg:function (tel,password,timeLogon,callback) {
        var sqlUser="select * from t_user where tel =?";
        var sql ="INSERT INTO t_user (nick_name,password,portrait,coin,integral,achievement_point,sign,time_unlock,time_logon,tel) values (?,?,0,0,500,0,0,0,?,?)";
        query(sqlUser,[tel],function (result) {
            if(result.length<=0){
                query(sql,[tel,password,timeLogon,tel],function (res) {
                    return callback(res);
                })
            }else {
                return callback(result)
            }
        })
    },
    updateOnlyidById:function (id,callback) {
        var onlyId=(parseInt(id)+123456);
        var sql="UPDATE t_user SET only_id=? where id=?";
        query(sql,[onlyId,id],function (result) {
            return callback(result)
        })
    },
    userList:function (callback) {
        var sql='select nick_name,coin,integral,achievement_point,time_logon,tel,new_online,channel,sign,new_sign from t_user';
        query(sql,[],function (result) {
            return callback(result);
        })
    },
    getChannel:function (callback) {
        var sql="select * from t_channel";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    updateChannel:function (channel,uid,callback) {
        var sql="UPDATE t_user SET channel=? where id=?";
        query(sql,[channel,uid],function (result) {
                var sql = "select id,nick_name,portrait,coin,integral,achievement_point,sign,time_unlock,time_logon,tel,pay from t_user where id=?";
                query(sql,[uid],function (res) {
                    return callback(res)
                })

        })
    },
    selectUserIntegral:function (id,callback) {
        var sql="select integral from t_user where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    updateUserIntegral:function (id,integral,callback) {
        var sql="update t_user set integral=? where id=?";
        query(sql,[integral,id],function (result) {
            return callback(result)
        })
    },
    selectUserCoin:function (id,callback) {
        var sql="select coin from t_user where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    updateUserCoin:function (id,integral,callback) {
        var sql="update t_user set Coin=? where id=?";
        query(sql,[integral,id],function (result) {
            return callback(result)
        })
    },
    addLottery:function (uid,gty,num,start,end,value,callback) {
        var sql="insert into t_lottery (user_id,gift_type,num,start_time,end_time,value) values (?,?,?,?,?,?)";
        query(sql,[uid,gty,num,start,end,value],function (result) {
            return callback(result);
        })
    },
    updateLottery:function (uid,gty,callback) {
        var sql="select * from t_lottery where user_id =? and gift_type=? LIMIT 1;";
        query(sql,[uid,gty],function (result) {
            if(result.length){
                console.log(result);
                var num=result[0].num+1;
                var sql= "update t_lottery set num=? where user_id =? and gift_type=?";
                query(sql,[num,uid,gty],function (result) {
                    return callback(result)
                })
            }else {
                var sql="insert into t_lottery (user_id,gift_type,num) values (?,?,1)";
                query(sql,[uid,gty],function (result) {
                    return callback(result)
                })
            }
        })
    },
    getLotteryByUid:function (uid,callback) {
        var sql="select * from t_lottery where user_id=?";
        query(sql,[uid],function (result) {
            return callback(result)
        })
    },

    getServerAddress:function (callback) {
        var sql="select * from t_server";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    getCoinById:function (id,callback) {
        var sql="select coin from t_user where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    getSignById:function (id,callback) {
        var  sql = "select sign,new_sign from t_user where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    updateSign:function (id,sign,newSign,callbcak) {
        var sql ="update t_user set sign=?,new_sign=? where id=?";
        query(sql,[sign,newSign,id],function (result) {
            return callbcak(result)
        })
    },
    updateNickName:function (id,nickName,callback) {
        var sql="update t_user set nick_name=? where id=?";
        query(sql,[nickName,id],function (result) {
            return callback(result)
        })
    },
    updateHead:function (head,id,callback) {
        var sql="update t_user set portrait=? where id=?";
        query(sql,[head,id],function (result) {
            return callback(result)
        })
    },
    updateSex:function (id,sex,callback) {
        var sql="update t_user set sex=? where id=?";
        query(sql,[sex,id],function (result) {
            return callback(result)
        })
    },
    getUserMsgById:function (id,callback) {
        var sql="select id,nick_name,portrait,coin,integral,tel,sign,new_sign,channel,sex,pay,only_id  from t_user where id=?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addAddress:function (uid,name,tel,area,detail,callback) {
        var sql="insert into t_address (user_id,user_name,tel,area,detail_address) values (?,?,?,?,?)";
        query(sql,[uid,name,tel,area,detail],function (result) {
            return callback(result);
        })
    },
    editAddress:function (uid,name,tel,area,detail,callback) {
        var sql="update t_address set user_name=?,tel=?,area=?,detail_address=? where id=?";
        query(sql,[name,tel,area,detail,uid],function (result) {
            return callback(result)
        })
    },
    getAddress:function (uid,callback) {
        var sql="select * from t_address where user_id=?";
        query(sql,[uid],function (result) {
            return callback(result)
        })
    }
};
module.exports = user;