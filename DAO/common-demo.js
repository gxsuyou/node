var query = require('../config/config');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');
var page = require("../DAO/page")


var common = {
    /**
     * md5加密
     * @param pwd
     * @param callback
     * @returns {*}
     */
    pwdMd5: function (pwd) {
        //var result =
        return md5.update(pwd).digest('hex');
        //return callback(result)
    },

    /**
     * 分页page，查询单个表
     * @param p
     * @param tables
     * @param where
     * @param callback
     */
    page: function (p, tables, where, callback) {
        var pageCount = 0;
        var sizeCount = 0;
        var p_num = 15;
        var lastPage = "";
        var firstPage = "";
        var arr = {};
        // var p = 1;
        var nextPage = 2;
        var prevPage = 1;
        var max_page = 10;
        var min_page = 1;
        // var pa = parseFloat(req.query.pa);

        if (p > 0) {
            nextPage = p + 1;
            prevPage = p - 1;
            if (p <= 1) {
                prevPage = 1;
                firstPage = 1
            }
        } else {
            firstPage = 1
        }

        if (p > 10) {
            min_page = p;
            max_page = p + 9;
        }
        page.getPage(p, p_num, tables, where, function (result) {
            sizeCount = result.count;
            if (sizeCount > 0) {
                pageCount = sizeCount % p_num == 0 ? sizeCount / p_num : sizeCount / p_num + 1;
                pageCount = parseInt(pageCount);
                if (pageCount < p) {
                    p = pageCount;
                    prevPage = pageCount - 1;
                }
                if (result.lists.length < p_num) {
                    lastPage = 1;
                }
                arr = {
                    result: result.lists,
                    nowPage: p,
                    firstPage: firstPage,
                    lastPage: lastPage,
                    nextPage: nextPage,
                    prevPage: prevPage,
                    totalPage: pageCount,
                    // page_num: page_num,
                    min_page: min_page,
                    max_page: max_page
                };
                // res.json(arr);
                return callback(arr);
            }
        });
    }
}

module.exports = common;