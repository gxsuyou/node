var query = require('../config/config');

//收藏、取消收藏
var news = {
    getNewsListByPage:function (page,callback) {
        // var sql="SELECT a.*,b.game_name,b.icon FROM t_news AS a\n" +
        //     "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` order by a.add_time desc limit 0,20";
        // query(sql,[(page-1)*20],function (result) {
        //     return callback(result)
        // })
        var sql="SELECT a.id,a.title,a.img,a.add_time,a.agree,a.game_id,a.comment,b.game_name,b.icon " +
            "FROM t_news AS a\n" +
            "LEFT JOIN t_game AS b ON a.`game_id`=b.`id` order by a.up desc,a.add_time desc limit ?,10";
        query(sql,[(page-1)*10],function (result) {
            return callback(result)
        })
    },
    getNewsById:function (id,userId,callback) {
        var sql="select a.*,b.icon,b.game_name,c.state from t_news as a\n" +
            "left join t_game as b on  (a.`game_id`=b.`id`)" +
            "left join t_like as c on a.id=c.parent_id and c.like_type=11 and c.like_user_id=? where a.id=?";
        query(sql,[userId,id],function (result) {
            return callback(result);
        })
    },
    minusNewsAgree:function (parentId,callback) {
        var sql="update t_news set agree=agree-1 where id =?";
        query(sql,[parentId],function (result) {
            return callback(result)
        })
    },
    minusNewsCommendAgree:function (parentId,callback) {
        var sql="update t_news_comment set agree=agree-1 where id =?";
        query(sql,[parentId],function (result) {
            return callback(result)
        })
    },
    addNewsBrowse:function (id,callback) {
        var sql="update t_news set browse=browse+1 where id =?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addNewsAgree:function (id,callback) {
        var sql="update t_news set agree=agree+1 where id =?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addNewsComment:function (id,callback) {
        var sql="update t_news set comment=comment+1 where id =?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addNewsCommentAgree:function (id,callback) {
        var sql="update t_news_comment set agree=agree+1 where id =?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addNewsCommentComment:function (id,callback) {
        var sql="update t_news_comment set comment=comment+1 where id =?";
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    newsComment:function (parentId,userId,series,content,type,addTime,callback) {
        var sql="insert into t_news_comment (content,user_id,series,parent_id,type,add_time) values (?,?,?,?,?,?)";
        query(sql,[content,userId,series,parentId,type,addTime],function (result) {
            return callback(result)
        })
    },
    like:function (parentId,userId,type,callback) {
        var sql="select * from t_like where parent_id=? and like_type=? and like_user_id=?";
        query(sql,[parentId,type,userId],function (result) {
            if(result.length){
                var updatesql="update t_like set state=1 where id ="+result[0].id;
                query(updatesql,[],function (result) {
                    return callback(result)
                });
            }else {
                var insertsql="insert into t_like (parent_id,like_type,like_user_id,state) values (?,?,?,?)";
                query(insertsql,[parentId,type,userId,1],function (result) {
                    return callback(result)
                })
            }
        })
    },
    unlike:function (parentId,userId,type,callback) {
        var updatesql="update t_like set state=0 where parent_id=? and like_type=? and like_user_id=?";
        query(updatesql,[parentId,type,userId],function (result) {
            return callback(result)
        });
    },

    getLikeState:function (parentId,userId,type,callback) {
        var sql="select state from t_like where parent_id=? and like_type=? and like_user_id=?";
        query(sql,[parentId,type,userId],function (result) {
            return callback(result)
        })
    },
    getNewsCommentByPage:function (userId,parentId,page,callback) {
        var sql="SELECT t_news_comment.id,t_news_comment.content,t_news_comment.add_time,t_news_comment.agree,t_news_comment.comment,t_user.nick_name,t_user.portrait, t_like.state  \n" +
            "FROM t_news_comment  \n" +
            "LEFT JOIN t_user ON t_news_comment.user_id = t_user.id  \n" +
            "LEFT JOIN t_like ON t_news_comment.id=t_like.parent_id and t_like.like_user_id=? AND t_like.`like_type`=12 WHERE t_news_comment.`parent_id`=? AND \n" +
            "t_news_comment.series=1  LIMIT ?,5";
        query(sql,[userId,parentId,(page-1)*3],function (result) {
            return callback(result)
        })
    },
    getNewsCommentTow:function (parentId,callback) {
        // var sql="select * from t_news_comment where parent_id=? and series=2 limit 0,2";
        var sql="SELECT t_news_comment.content,t_user.nick_name FROM t_news_comment \n" +
            "LEFT JOIN  t_user ON t_news_comment.user_id=t_user.id WHERE t_news_comment.parent_id=? AND t_news_comment.series=2 LIMIT 0,2";
        query(sql,[parentId],function (result) {
            return callback(result)
        })
    },
    getNewsCommentTowByPage:function (parentId,page,callback) {
        var sql="SELECT t_news_comment.content,t_user.nick_name FROM t_news_comment \n" +
            "LEFT JOIN  t_user ON t_news_comment.user_id=t_user.id WHERE t_news_comment.parent_id=? AND t_news_comment.series=2 LIMIT ?,10";
        query(sql,[parentId,(page-1)*10+2],function (result) {
            return callback(result)
        })
    }
};

module.exports = news;
