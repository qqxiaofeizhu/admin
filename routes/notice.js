var app = require('../config');
var MongoDB = require('../public/javascripts/db');
var db = require('../public/conf/db')

/**
 * 添加公告
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.addNotice = function(req, res, next) {
    const data = req.body;
}