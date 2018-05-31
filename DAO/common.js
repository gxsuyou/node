var query = require('../config/config');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');

var common = {
    pwdMd5: function (pwd, callback) {
        console.log(pwd);
        var result = md5.update(pwd).digest('hex');
        return callback(result)
    }
}

module.exports = common;