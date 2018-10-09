var express = require('express');
var router = express.Router();
var user = require("../DAO/user");
var https = require('https');
var qs = require('querystring');
var path = 'F:/node/public/';
var crypto = require('crypto');
var md5 = crypto.createHash("md5");
var common = require('../DAO/common');


function isReverse(text) {
    return text.split('').reverse().join('');
}

var verify = {};
var date = new Date();
Date.prototype.Format = function (formatStr) {
    var str = formatStr;
    var Week = ['日', '一', '二', '三', '四', '五', '六'];

    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(/yy|YY/, (this.getYear() % 100) > 9 ? (this.getYear() % 100).toString() : '0' + (this.getYear() % 100));

    str = str.replace(/MM/, this.getMonth() > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    str = str.replace(/M/g, this.getMonth());

    str = str.replace(/w|W/g, Week[this.getDay()]);

    str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    str = str.replace(/d|D/g, this.getDate());

    str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    str = str.replace(/h|H/g, this.getHours());
    str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    str = str.replace(/m/g, this.getMinutes());

    str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    str = str.replace(/s|S/g, this.getSeconds());

    return str;
};
router.get("/getUserFind", function (req, res, next) {
    var data = req.query;
    if (data.user) {
        user.getUserInfo(data, function (result) {
            res.json(result);
        })
    }
});

/**
 * 绑定前台帐号
 */
router.get("/getUserBinding", function (req, res, next) {
    var data = req.query;
    if (data.user && data.id) {
        user.getBinding(data, function (result) {
            result.insertId ? res.json({state: 1}) : res.json({state: 0});
        })
    }
});

/**
 * 添加前台帐号
 */
router.post("/addUsers", function (req, res, next) {
    var data = req.body;
    if (data.admin_id && data.tel) {
        user.getFindUser(data, function (userInfo) {
            if (userInfo.state == -1) {
                res.json({state: 0, info: "当前帐号已与前台帐号绑定，不能重复操作"});
                return false;
            }

            if (userInfo.state == -2) {
                console.log(userInfo)
                res.json({state: 0, info: "该手机或昵称已注册，不能重复注册"});
                return false;
            }

            var md5 = crypto.createHash('md5');
            md5.update(data.password);
            var sign = md5.digest('hex');
            sign = isReverse(sign);

            var newArr = {
                nickName: data.nick_name,
                password: sign,
                portrait: "../../Public/image/morentouxiang.png",
                tel: data.tel,
                a_id: data.admin_id,
            }
            user.getAddUser(newArr, function (result) {
                result.insertId ? user.getUpOnlyId(result.insertId, function () {
                }) : "";

                result.insertId ? res.json({state: 1}) : res.json({state: 0});
            })
        })
    }
})


module.exports = router;





