var query=require('../config/config');
var game ={
    getDetailById:function (gameId,callback) {
        // console.log(gameId);
        query("call pro_getGameDetailById(?)",[gameId],callback);

    },
    editGameById:function (gameId,text,callback) {
        var sql="UPDATE t_game SET game_detail=? where id=?";
        query(sql,[text,gameId],function (result) {
            return callback(result)
        })
    },
    getCarousel:function (callback) {
        var sql="select * from t_activity where type=1 and active=1";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    getActive:function (callback) {
        var sql="select * from t_activity where type=2 and active=1";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    getClsActive:function (callback) {
        var sql="select * from t_activity where type=3 and active=1";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    getGameByMsg:function (sys,type,sort,page,callback) {
        if(type){
            var sql="select * from t_game where sys=? and type=? ORDER BY "+sort+" DESC   limit ?,20";
            query(sql,[sys,type,(page-1)*20],function (result) {
                return callback(result)
            })
        }else {
            var sql="select * from t_game where sys=?  ORDER BY "+sort+" DESC limit ?,20";
            query(sql,[sys,(page-1)*20],function (result) {
                return callback(result)
            })
        }
    },
    getGameByLikeMsg:function (sys,msg,sort,page,callback) {
        var sql="select id,game_name,icon,cls,grade from t_game where sys=? and game_name like '%"+msg+"%'  ORDER BY "+sort+" DESC limit ?,20";
        query(sql,[sys,(page-1)*20],function (result) {
            return callback(result)
        })
    },
    getHotGame:function (callback) {
        var sql="select * from t_hotgame";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    getClsIconActive:function (callback) {
        var sql="SELECT t_game.*,t_cls_active.sort FROM t_cls_active \n" +
            "LEFT JOIN t_game ON t_cls_active.game_id=t_game.id ORDER BY type";
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    getGameCommentById:function (game_id,page,callback) {
        var sql ="SELECT t_game_recommend.`content`,t_game_recommend.`add_time`,t_game_recommend.`address`,t_game_recommend.`score`,t_user.`nick_name`,t_user.`portrait` FROM t_game_recommend \n" +
            "LEFT JOIN t_user\n" +
            "ON t_game_recommend.`user_id`=t_user.id WHERE t_game_recommend.`game_id`=? ORDER BY t_game_recommend.`add_time` DESC LIMIT ?,20";
        query(sql,[game_id,(page-1)*20],function (result) {
            return callback(result)
        })
    },
    getGameCommentCountById:function (game_id,callback) {
        var  sql="select count(*) as count from t_game_recommend where game_id=?";
        query(sql,[game_id],function (result) {
            return callback(result)
        })
    },
    getGameCommentCountByScore:function (game_id,score,callback) {
        var  sql="select count(*) as count from t_game_recommend where game_id=? and score=?";
        query(sql,[game_id,score],function (result) {
            return callback(result)
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
    updateGameScore:function (game_id,score,callback) {
        var sql="UPDATE t_game SET grade=? where id=?";
        query(sql,[score,game_id],function (result) {
            return callback(result)
        })
    },
    like:function (likeId,userId,type,callback) {
        var sql ="insert into t_like (like_id,like_type,like_user_id) values (?,?,?)";
        query(sql,[likeId,type,userId],function (result) {
            return callback(result)
        })
    },
    addDownloadNum:function (gameId,callback) {
        var sql="update t_game set game_download_num=game_download_num+1 where id =?";
        query(sql,[gameId],function (result) {
            return callback(result)
        })
    }

};
module.exports=game;
