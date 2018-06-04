var express = require('express');
var router = express.Router();
var fs = require('fs');
var formidable = require('formidable');
var PATH=require("../path");
var path=PATH.game;
var resource=PATH.resource;
var h5=require('../DAO/adminH5');
var qiniu=require('../public/javascripts/public');
var common = require('../DAO/common');

var rmdirSync = (function(){
    function iterator(url,dirs){
        var stat = fs.statSync(url);
        if(stat.isDirectory()){
            dirs.unshift(url);//收集目录
            inner(url,dirs);
        }else if(stat.isFile()){
            fs.unlinkSync(url);//直接删除文件
        }
    }
    function inner(path,dirs){
        var arr = fs.readdirSync(path);
        for(var i = 0, el ; el = arr[i++];){
            iterator(path+"/"+el,dirs);
        }
    }
    return function(dir,cb){
        cb = cb || function(){};
        var dirs = [];

        try{
            iterator(dir,dirs);
            for(var i = 0, el ; el = dirs[i++];){
                fs.rmdirSync(el);//一次性删除所有收集到的目录
            }
            cb()
        }catch(e){//如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
            e.code === "ENOENT" ? cb() : cb(e);
        }
    }
})();

router.post('/addH5',function (req,res,next) {;
    try {
        var form = formidable.IncomingForm({
            encoding : 'utf-8',//上传编码
            uploadDir : resource+'upload/',//上传目录，指的是服务器的路径，如果不存在将会报错。
            keepExtensions : true,//保留后缀
            maxFieldsSize : 2000 * 1024//byte//最大可上传大小
        });
        form.parse(req,function (err,fields,files) {
            // console.log(fields,files);
            // return;
            var data={
                name:fields.name,
                url:fields.url,
                recommend:fields.recommend
            };
            h5.addH5(data,function (result) {
                if(result.insertId){
                    for(var key in files){
                        var file=files[key];
                        var extName='';
                        switch (file.type) {
                            case 'image/jpeg':
                                extName = 'jpeg';
                                break;
                            case 'image/jpg':
                                extName = 'jpg';
                                break;
                            case 'image/png':
                                extName = 'png';
                                break;
                            case 'image/x-png':
                                extName = 'png';
                                break;
                        }
                        var fileName = key+ '.' + extName;
                        if(key=="icon" || key=="title_img"){
                            h5UploadQiniu(file.path,qiniu.qiniuBucket.img,'h5/' +fields.name+'/'+fileName,result.insertId,key);
                        }
                    }
                    res.json({state:1})
                }else {
                    res.json({state:0})
                }
            });
        })
    }catch (e){
        console.log(e);
    }
});
router.get("/getH5",function (req,res,next) {
    var p = req.query.p > 0 ? req.query.p : 1;

    var tables = "t_h5";
    var where = "order by sort desc";

    common.page(tables, p, where, "", "", function (result) {
        console.log(result);
        res.json(result);
    })

    // h5.getH5(1,function (result) {
    //     res.json({state:1,h5:result})
    // })
});
router.get("/deleteH5",function (req,res,next) {
    if(req.query.id){
        h5.deleteH5(req.query.id,function (result) {
            if(result.affectedRows){
                qiniu.deleteFileByPrefix(qiniu.qiniuBucket.img,"h5/"+req.query.name);
                res.json({state:1})
            }else {
                res.json({state:0})
            }
        })
    }
});
router.post("/editH5",function (req,res,next) {
    var data=req.body;
    if(data.id){
        h5.updateH5(data.id,data.name,data.url,data.commend,data.sort,function (result) {
            console.log(result);
            result.affectedRows?res.json({state:1}):res.json({state:0})
        })
    }
});
function h5UploadQiniu(path,bucket,name,id,key) {
    qiniu.uploadQiniu(path,bucket,name,function (respInfo,respBody) {
        if(respInfo.statusCode == 200){
            if(key=="icon"){
                h5.updateIcon(respBody.key,id,function (result) {
                })
            }else if(key=="title_img"){
                h5.updateTitleImg(respBody.key,id,function (result) {
                })
            }
            rmdirSync(path,function(e){
            });
        }else {
            console.log("上传七牛失败");
        }
    });
}
module.exports = router;