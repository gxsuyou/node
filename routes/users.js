var express = require('express');
var router = express.Router();
var user =require("../DAO/user");
var https = require('https');
var qs = require('querystring');
var path='F:/node/public/';
var crypto=require('crypto');
var md5=crypto.createHash("md5");
var common = require('../DAO/common');


function isReverse(text){
    return text.split('').reverse().join('');
}
var verify={};
var date=new  Date();
Date.prototype.Format = function(formatStr)
{
    var str = formatStr;
    var Week = ['日','一','二','三','四','五','六'];

    str=str.replace(/yyyy|YYYY/,this.getFullYear());
    str=str.replace(/yy|YY/,(this.getYear() % 100)>9?(this.getYear() % 100).toString():'0' + (this.getYear() % 100));

    str=str.replace(/MM/,this.getMonth()>9?(this.getMonth()+1).toString():'0' + (this.getMonth()+1));
    str=str.replace(/M/g,this.getMonth());

    str=str.replace(/w|W/g,Week[this.getDay()]);

    str=str.replace(/dd|DD/,this.getDate()>9?this.getDate().toString():'0' + this.getDate());
    str=str.replace(/d|D/g,this.getDate());

    str=str.replace(/hh|HH/,this.getHours()>9?this.getHours().toString():'0' + this.getHours());
    str=str.replace(/h|H/g,this.getHours());
    str=str.replace(/mm/,this.getMinutes()>9?this.getMinutes().toString():'0' + this.getMinutes());
    str=str.replace(/m/g,this.getMinutes());

    str=str.replace(/ss|SS/,this.getSeconds()>9?this.getSeconds().toString():'0' + this.getSeconds());
    str=str.replace(/s|S/g,this.getSeconds());

    return str;
};

router.get('/list',function (req,res,next) {
    //user.userList(function (result) {
    //    res.json(result);
    //})
    var p = req.query.p > 0 ? req.query.p : 1;

    var tables = 't_user';
    var where = {where:" order by id desc "};

    common.page(tables, p, where, "", "", function (result) {
        res.json(result);
    })
});
router.get('/getChannel',function (req,res,next) {
    // console.log(1);
    user.getChannel(function (result) {
        // console.log(result);
        result.length? res.json({state:1,channel:result}):res.json({state:0})
   })
});
router.get("/updateChannel",function (req,res,next) {
   user.updateChannel(req.query.channel,req.query.uid,function (result) {
       res.json({user:result})
   })
});


var signArr=
    [{day:1,type:0,value:100},{day:2,type:1,value:10},{day:3,type:0,value:200},{day:4,type:0,value:100},{day:5,type:0,value:100},{day:6,type:0,value:300},{day:7,type:1,value:20},{day:8,type:0,value:100},{day:9,type:0,value:150},{day:10,type:1,value:10},{day:11,type:0,value:100},{day:12,type:0,value:500},{day:13,type:0,value:100},{day:14,type:0,value:150},{day:15,type:0,value:100},{day:16,type:1,value:10},{day:17,type:0,value:100},{day:18,type:2,value:2},{day:19,type:0,value:50},{day:20,type:1,value:10},{day:21,type:0,value:100},{day:22,type:0,value:100},{day:23,type:0,value:100},{day:24,type:1,value:30},{day:25,type:0,value:200},{day:26,type:0,value:100},{day:27,type:0,value:150},{day:28,type:1,value:10},{day:29,type:0,value:100},{day:30,type:2,value:5}];
router.get("/sign",function (req,res,next) {
    if(req.query.id){
       var id= req.query.id;
        user.getSignById(id,function (result) {
            if(result.length){
                var sign=result[0];
                if(sign.new_sign != date.Format('yyyy-MM-dd')){
                    user.updateSign(id,sign.sign+1,date.Format('yyyy-MM-dd'),function (result) {
                        if(result.affectedRows){
                            var index=signArr[(sign.sign)%30];
                            switch (index.type){
                                case 0:
                                    user.selectUserIntegral(id,function (result) {
                                        user.updateUserIntegral(id,result[0].integral+index.value,function (result) {
                                            result.affectedRows?res.json({state:1}):res.json({state:0})
                                        })
                                    });break;
                                case 1:
                                    console.log(id);
                                    user.selectUserCoin(id,function (result) {

                                        user.updateUserCoin(id,result[0].coin+index.value,function (result) {
                                            result.affectedRows?res.json({state:1}):res.json({state:0})
                                        })
                                    });break;
                                case 2:

                                    var startTime=date.Format('yyyy-MM-dd');
                                    var endTime;
                                    var day = new Date(parseInt(startTime.split("-")[0]),parseInt(startTime.split("-")[1])+1,0);
//获取天数：
                                    var daycount = day.getDate();
                                    if(daycount<parseInt(startTime.split("-")[2])){
                                        endTime=startTime.split("-")[0]+"-"+((parseInt(startTime.split("-")[1])+1)>9?(parseInt(startTime.split("-")[1])+1):"0"+(parseInt(startTime.split("-")[1])+1))+"-"+daycount;
                                    }else {
                                        endTime=startTime.split("-")[0]+"-"+((parseInt(startTime.split("-")[1])+1)>9?(parseInt(startTime.split("-")[1])+1):"0"+(parseInt(startTime.split("-")[1])+1))+"-"+parseInt(startTime.split("-")[2])
                                    }
                                    user.addLottery(id,4,1,startTime,endTime,index.value,function (result) {
                                        result.insertId?res.json({state:1}):res.json({state:0})
                                    });
                                    break;
                            }
                        }else {
                            res.json({state:0})
                        }
                    })
                }else {
                    res.json({state:4})
                }
            }

        })
   }
});
router.get("/getLottery",function (req,res,next) {
    if(req.query.id){
        user.getLotteryByUid(req.query.id,function (result) {
            result.length?res.json({state:1,lottery:result}):res.json({state:0})
        })
    }
});
router.get("/getSign",function (req,res,next) {
    user.getSignById(req.query.id,function (result) {
        result.length?res.json({state:1,user:result[0]}):res.json({state:0})
    })
});


router.post('/login', function(req, res, next) {
    var password=req.body.password;
    var md5 = crypto.createHash('md5');
    md5.update(password);
    var sign = md5.digest('hex');
    sign=isReverse(sign);
    user.login(req.body.tel,sign,function (result) {
        res.json({state:result.length==0 ? 0 : 1,user:result[0]})
  })
});
router.get('/game/comment',function (req,res,next) {
    var data=req.query;
    user.getUserCommentLen(data.gameId,data.userId,function (count) {
        if(count[0].count<3){
            user.gameComment(data.userId,data.gameId,data.score,data.content,data.agree,date.Format('yyyy-MM-dd'),data.parentId,data.address,function (result) {
                if(result.insertId){
                    user.getGameCommentScoreById(data.gameId,function (result) {

                        if(result.length>0){
                            var len=result.length;
                            var allScore=0;
                            for(var i=0;i<len;i++){
                                allScore+=result[i].score;
                            }
                            // console.log((allScore / len).toFixed(1));
                            user.updateGameScore(data.gameId,(allScore / len).toFixed(1),function (result) {
                                result.affectedRows?res.json({state:1}):res.json({state:0})
                            })
                        }
                    })
                }
            })
        }else {
            res.json({state:4})
        }
    });

});
router.post('/reg',function (req,res,next) {
    var ver=req.body.verify;
    var tel=req.body.tel;
    var password=req.body.password;
    var md5 = crypto.createHash('md5');
    md5.update(password);
    var sign = md5.digest('hex');
    sign=isReverse(sign);
    if(ver&&tel&&sign){
        if(ver==verify[tel]){
            user.reg(tel,sign,date.Format('yyyy-MM-dd'),function (result) {
                result.insertId?user.updateOnlyidById(result.insertId,function () {}):"";
                res.json({state:result.insertId&&1||result[0].id&&2||0,id:result.insertId||""})
            })
        }else {
            res.json({state:3});
        }
    }else {
        res.json({state:99});
    }
});
router.get('/verify',function (req,result,next) {
    var val= Math.floor(Math.random() * 900000)+100000;
    var apikey = 'f589b7ce8a38a90b9d8e2ce20e26c020';
// 手机号码，多个号码用逗号隔开
    var mobile = req.query.tel;
// 要发送的短信内容
    var text = '【ONE游戏】您的验证码是'+val;
// 查询账户信息https地址
    var get_user_info_uri = '/v2/user/get.json';
// 智能匹配模板发送https地址
    var sms_host = 'sms.yunpian.com';
    send_sms_uri = '/v2/sms/single_send.json';
// 指定模板发送接口https地址
//     query_user_info(get_user_info_uri,apikey);
    send_sms(send_sms_uri,apikey,mobile,text);
    // function query_user_info(uri,apikey){
    //     var post_data = {
    //         'apikey': apikey,
    //     };//这是需要提交的数据
    //     var content = qs.stringify(post_data);
    //     post(uri,content,sms_host);
    // }
    function send_sms(uri,apikey,mobile,text){
        var post_data = {
            'apikey': apikey,
            'mobile':mobile,
            'text':text,
        };//这是需要提交的数据
        var content = qs.stringify(post_data);
        post(uri,content,sms_host);
    }

    function post(uri,content,host,next){

        var options = {
            hostname: host,
            port: 443,
            path: uri,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
        };
        var req = https.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                chunk=JSON.parse(chunk);
                var state;
                switch (chunk.code){
                    case 0:verify[mobile]=val;
                        state=1;
                        var x=mobile;
                        setTimeout(function () {
                            verify[x]=null;
                            // console.log(verify);
                        },600000);break;
                    case 33: state=0;
                            console.log('请求过于频繁');break;
                    default :state=0;
                        console.log(chunk);break;
                }
              result.json({state:state});
            });
        });
        req.write(content);
        return  req.end();
        // return next()
    }
});

router.get("/lottery",function (req,res) {
    var uid=req.query.id;
    user.selectUserIntegral(uid,function (result) {
        // console.log(result);
        if(result.length){
            if(result[0].integral>=500){
                user.updateUserIntegral(uid,(parseInt(result[0].integral)-500),function (result) {
                    // console.log(result);
                    if(result.affectedRows){
                        var arr=[1,2,3,4,5,6,7,8];
                        var num=Math.random();
                        if(num>=0.3){
                            user.selectUserIntegral(uid,function (result) {
                                if(result.length){
                                    user.updateUserIntegral(uid,(result[0].integral+50),function (result) {
                                        result.affectedRows?res.json({state:1,num:6}):res.json({state:0})//50积分
                                    })
                                }
                            })
                        }else if(num>=0.1&&num<0.3){
                            user.selectUserIntegral(uid,function (result) {
                                if(result.length){
                                    user.updateUserIntegral(uid,(result[0].integral+100),function (result) {
                                        result.affectedRows?res.json({state:1,num:8}):res.json({state:0})//100积分
                                    })
                                }
                            })
                        }else if(num>=0.0403&&num<0.1){
                            user.selectUserIntegral(uid,function (result) {
                                if(result.length){
                                    user.updateUserIntegral(uid,(result[0].integral+500),function (result) {
                                        result.affectedRows?res.json({state:1,num:7}):res.json({state:0})//再抽一次
                                    })
                                }
                            })
                        }else if(num>=0.0103&&num<0.0403){
                            user.selectUserIntegral(uid,function (result) {
                                if(result.length){
                                    user.updateUserIntegral(uid,(result[0].integral+500),function (result) {
                                        result.affectedRows?res.json({state:1,num:4}):res.json({state:0})//500积分
                                    })
                                }
                            })
                        }else if(num>=0.0000&&num<0.0103){
                            user.selectUserCoin(uid,function (result) {
                                if(result.length){
                                    user.updateUserCoin(uid,(result[0].coin+5),function (result) {
                                        result.affectedRows?res.json({state:1,num:4}):res.json({state:0})//5币
                                    })
                                }
                            })
                        }else if(num>=0.0002&&num<0.0000){
                            user.updateLottery(uid,1,function (result) {
                                result.affectedRows?res.json({state:1,num:2}):res.json({state:0})
                            })
                        }else if(num>=0.0001&&num<0.0000){
                            user.updateLottery(uid,2,function (result) {
                                result.affectedRows?res.json({state:1,num:5}):res.json({state:0})//腾讯会员
                            })
                        }else if(num>=0&&num<0.0000){
                            user.updateLottery(uid,3,function (result) {
                                result.affectedRows?res.json({state:1,num:1}):res.json({state:0})//爱奇艺会员
                            })
                        }
                    }else {
                        res.json({state:0});
                        return;
                    }
                });
            }else {
                res.json({state:0})
            }
        }
    })
});
router.get("/getIntegral",function (req,res,next) {
    if(req.query.id){
        user.selectUserIntegral(req.query.id,function (result) {
            result.length?res.json({state:1,integral:result[0]}):res.json({state:0})
        })
    }
});
router.get("/serverAddress",function (req,res,next) {
    user.getServerAddress(function (result) {
        result.length?res.json({state:1,address:result}):res.json({state:0})

    })
});
router.get("/getCoin",function (req,res,next) {
    if(req.query.id){
        user.getCoinById(req.query.id,function (result) {
            result.length?res.json({state:1,coin:result[0]}):res.json({state:0})
        })
    }
});
router.get("/updateNickName",function (req,res,next) {
   if(req.query.id && req.query.nickName){
        user.updateNickName(req.query.id,req.query.nickName,function (result) {
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
   }
});
router.get("/updateSex",function (req,res,next) {
    if(req.query.id && req.query.sex){
        user.updateSex(req.query.id,req.query.sex,function (result) {
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
    }
});
router.post("/updateHead",function (req,res,next) {
    console.log("updateHead"+req.body.head);
    console.log(req.body.id);
    if(req.body.id && req.body.head){
        user.updateHead(req.body.head,req.body.id,function (result) {
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
    }
});
router.get("/getUserMsgById",function (req,res,next) {
    if(req.query.id){
        user.getUserMsgById(req.query.id,function (result) {
            result.length?res.json({state:1,user:result[0]}):res.json({state:0})
        })
    }
});
router.get("/addAddress",function (req,res,next) {
    if(req.query.id){
        var data=req.query;
        user.addAddress(data.id,data.name,data.tel,data.area,data.detail,function (result) {
            result.insertId?res.json({state:1}):res.json({state:0})
        })
    }
});
router.get("/editAddress",function (req,res,next) {
    if(req.query.id){
        var data=req.query;
        user.editAddress(data.id,data.name,data.tel,data.area,data.detail,function (result) {
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
    }
});
router.get("/getAddress",function (req,res,next) {
    if(req.query.id){
        user.getAddress(req.query.id,function (result) {
            res.json({state:1,address:result})
        })
    }
});
// router.get("/edit");
module.exports = router;





