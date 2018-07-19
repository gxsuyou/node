var qiniu = require('qiniu');
var config = new qiniu.conf.Config();
var formUploader = new qiniu.form_up.FormUploader(config);
var putExtra = new qiniu.form_up.PutExtra();
var accessKey = 'Uusbv77fI10iNTVF3n7EZWbksckUrKYwUpAype4i';
var secretKey = 'dEDgtx_QEJxfs2GltCUVgDIqyqiR6tKjStQEnBVq';
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
// 空间对应的机房
config.zone = qiniu.zone.Zone_z2;
var bucketManager = new qiniu.rs.BucketManager(mac, config);
var qiniu2={
    qiniuBucket:{
        img:"oneyouxiimg",
        apk:"oneyouxiapk"
        // img:"oneyouxitestimg",
        //  apk:"oneyouxitestapk"
    },
    uploadQiniu:function uploadQiniu(path,scope,key,callback) {
        var options = {
            scope: scope+":"+key,
            returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken=putPolicy.uploadToken(mac);
        var localFile = path;
        // 文件上传
        try{
            formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr, respBody, respInfo) {
                if (respErr) {
                    // throw respErr;
                    console.log(err)
                }
                if (respInfo.statusCode == 200) {
                    // console.log(respInfo.statusCode,respBody);
                    callback(respInfo,respBody)
                } else {
                    // res.json({state:0});
                    callback(respInfo,respBody);
                    // console.log(respInfo.statusCode);
                    // console.log(respBody);
                }
            });
        }catch (e){
            console.log(e);
        }
    },
    resumeUploaderqiniu:function resumeUploaderqiniu(path,scope,key,callback) {
        var options = {
            scope: scope+":"+key,
            returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken=putPolicy.uploadToken(mac);
        var localFile = path;
        var resumeUploader = new qiniu.resume_up.ResumeUploader(config);
        var putExtra = new qiniu.resume_up.PutExtra();
// 文件上传
        resumeUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr, respBody, respInfo) {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode == 200) {
                // console.log(respInfo.statusCode,respBody);
                callback(respInfo,respBody)
            } else {
                // res.json({state:0});
                callback(respInfo,respBody);
                // console.log(respInfo.statusCode);
                // console.log(respBody);
            }
        });
    },
    deleteFileByPrefix:function deleteFileByPrefix(bucket,prefix) {
// @param options 列举操作的可选参数
//                prefix    列举的文件前缀
//                marker    上一次列举返回的位置标记，作为本次列举的起点信息
//                limit     每次返回的最大列举文件数量
//                delimiter 指定目录分隔符
        var bucket=bucket;
        var options = {
            limit: 20,
            prefix: prefix
        };
        bucketManager.listPrefix(bucket, options, function(err, respBody, respInfo) {
            if (err) {
                console.log(err);
                throw err;
            }
            if (respInfo.statusCode == 200) {
                //如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
                //指定options里面的marker为这个值
                // var nextMarker = respBody.marker;
                var commonPrefixes = respBody.commonPrefixes;
                var items = respBody.items;
                var deleteOperations =[];
                items.forEach(function(item) {
                    deleteOperations.push(qiniu.rs.deleteOp(bucket, item.key));

                    console.log(item.key);
                    // console.log(item.putTime);
                    // console.log(item.hash);
                    // console.log(item.fsize);
                    // console.log(item.mimeType);
                    // console.log(item.endUser);
                    // console.log(item.type);
                });
                // console.log(deleteOperations);
                //每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
                bucketManager.batch(deleteOperations, function(err, respBody, respInfo) {
                    if (err) {
                        console.log(err);
                        //throw err;
                    } else {
                        // 200 is success, 298 is part success
                        if (parseInt(respInfo.statusCode / 100) == 2) {
                            respBody.forEach(function(item) {
                                if (item.code == 200) {
                                    console.log(item.code + "\tsuccess");
                                } else {
                                    console.log(item.code + "\t" + item.data.error);
                                }
                            });
                        } else {
                            console.log(respInfo.deleteusCode);
                            console.log(respBody);
                        }
                    }
                });
            } else {
                console.log(respInfo.statusCode);
                console.log(respBody);
            }
        });
    }
};



module.exports = qiniu2;