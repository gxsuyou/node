var query = require('../config/config');
var game={
    addGameMsg:function (obj,callback) {
        // var sql="call addGameMsg(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var sql = "insert into t_game (game_name,game_url_scheme,game_packagename,game_download_ios,game_recommend,game_version,game_update_date,game_company,sys,add_time,update_detail,game_detail,admin,type) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        var arr=[];
        for(var x in obj){
            arr.push(obj[x])
        }
        // console.log(arr);
        query(sql,arr,function (result) {
            console.log(result);
            return callback(result)
        })
    },
    hasGame:function (gameName,callback) {
        var sql="select id from t_game where game_name=?";
        query(sql,[gameName],function (result) {
            return callback(result)
        })
    },
    addCls:function (gameid,clsid,callback) {
        var sql = "INSERT INTO t_game_cls_relation(game_id,cls_id) values (?,?)";
        query(sql,[gameid,clsid],function (result) {
            return callback(result);
        })
    },
    updateDownloadAndroid:function (gameId,url,size,callback) {
        var sql = 'update t_game set game_download_andriod = ? where id =?';
        query(sql,[url,gameId],function (result) {
            if(result.affectedRows){
                var sql='update t_game set game_size = ? where id=?';
                query(sql,[size,gameId],function (result) {
                    return callback(result)
                })
            }else {
                return callback(result)
            }
        })
    },
    addGameImg:function (gameId,url,callback) {
        var sql = "INSERT INTO t_game_img(game_id,img_src) values (?,?)";
        query(sql,[gameId,url],function (result) {
            return callback(result)
        })
    },
    updateGameIcon:function (gameId,url,callback) {
        var sql = 'update t_game set icon = ? where id =?';
        query(sql,[url,gameId],function (result) {
            return callback(result)
        })
    },
    updateGameTitleImg:function (gameId,url,callback) {
        var sql = 'update t_game set game_title_img = ? where id =?';
        query(sql,[url,gameId],function (result) {
            return callback(result)
        })
    },
    deleteGameImg:function (gameId,callback) {
        var sql = 'delete FROM  t_game_img where game_id = ?';
        query(sql,[gameId],function (result) {
            return callback(result)
        })
    },
    hasActive:function (gameId,type,callback) {
        var sql = 'select * from t_activity where game_id=? and type=?';
        query(sql,[gameId,type],function (result) {
            return callback(result)
        })
    },
    deleteActive:function (gameId,type,callback) {
        var sql ='delete from t_activity where game_id=? and type=?';
        query(sql,[gameId,type],function (result) {
            return callback(result)
        })
    },
    addActive:function (obj,callback) {
        var sql = 'insert into t_activity (name,title,sort,active_img,active,game_id,type,sys) values (?,?,?,?,?,?,?,?)';
        query(sql,[obj.name,obj.title,obj.sort,obj.active_img,obj.active,obj.game_id,obj.type,obj.sys],function (result) {
            return callback(result)
        })
    },
    addSubject:function (img,title,detail,up,sys,callback) {
        var sql = 'insert into t_subject (img,title,detail,active,sys) values (?,?,?,?,?)';
        query(sql,[img,title,detail,up,sys],function (result) {
            return callback(result)
        })
    },
    getSubject:function (callback) {
        var sql='select * from t_subject';
        query(sql,[],function (result) {
            return callback(result)
        })
    },
    hasSubjectGame:function (gameId,subjectId,callback) {
        var sql='select * from t_subject_relation where game_id=? and subject_id=?';
        query(sql,[gameId,subjectId],function (result) {
            return callback(result)
        })
    },
    addSubjectGame:function (gameId,subjectId,callback) {
        var sql='insert into t_subject_relation (game_id,subject_id) values (?,?)';
        query(sql,[gameId,subjectId],function (result) {
            return callback(result)
        })
    },
    deleteSubjectGame:function (id,callbck) {
        var sql = 'delete from t_subject_relation where id = ?';
        query(sql,[id],function (result) {
            return callbck(result)
        })
    },
    getSubjectGame:function (subjectId,callbcak) {
        var sql = 'SELECT t_subject_relation.id as relationId,t_game.game_name,t_game.id AS gameId,t_subject.title,t_subject.id AS subjectId FROM (t_subject_relation LEFT JOIN t_subject ON t_subject_relation.subject_id = t_subject.id ) LEFT JOIN t_game ON t_subject_relation.game_id = t_game.id WHERE t_subject_relation.`subject_id`=?';
        query(sql,[subjectId],function (result) {
            return callbcak(result)
        })
    },
    deleteSubject:function (subjectId,callback) {
        var sql = 'delete from t_subject where id = ?';
        query(sql,[subjectId],function (result) {
            callback(result)
        })
    },
    getTag:function (callback) {
        var sql = 'select * from t_tag';
        query(sql,[],function (resule) {
            return callback(resule)
        })
    },
    getTagByGame:function (gameId,callback) {
        var sql = 'select t_tag.*,t_tag_relation.id as tagRelationId from t_tag_relation left join t_tag on t_tag_relation.tag_id = t_tag.id where t_tag_relation.game_id = ?';
        query(sql,[gameId],function (result) {
            return callback(result)
        })
    },
    addTagByGame:function (gameId,tagId,callback) {
        var sql = 'insert into t_tag_relation (game_id,tag_id) values (?,?)';
        query(sql,[gameId,tagId],function (result) {
            return callback(result)
        })
    },
    getGameName:function (sys,msg,callback) {
        var sql ="select id,game_name from t_game where game_name like  '%"+msg+"%' and sys =?";
        query(sql,[sys],function (result) {
            return callback(result)
        })
    },
    deleteTagById:function (id,callback) {
        var sql = 'delete from t_tag_relation where id =?';
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    deleteActiveById:function (id,callback) {
        var sql = 'delete from t_activity where id = ?';
        query(sql,[id],function (result) {
            return callback(result)
        })
    },
    addTag:function (name,callbakc) {
        var sql = 'insert into t_tag (name) values (?)';
        query(sql,[name],function (result) {
            return callbakc(result)
        })
    },
    editTag:function (tagId,name,callback) {
        var sql = 'update t_tag set name=? where id=?';
        query(sql,[name,tagId],function (result) {
            return callback(result)
        })
    },
    upTag:function (tagId,active,callback) {
        var sql ='update t_tag set active=? where id=?';
        query(sql,[active,tagId],function (result) {
            return callback(result)
        })
    }
};

module.exports=game;