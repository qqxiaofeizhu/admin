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
    const username = req.api_user.username;
    const data = req.body;
    const id = req.body.id
    data.username = username;
    if (id) {
        MongoDB.findById('notice', {_id: id}, function(err, oneNotice) {
            if (err) throw err;
            if (oneNotice) {
                console.log(data.noticeValue, 111)
                MongoDB.updateData('notice', {_id: id}, {$set: {username: username, title: data.title, noticeValue: data.noticeValue}}, function(err, updateNotice) {
                    if (err) throw err;
                    if (updateNotice) {
                        return res.json ({
                            code: 0,
                            message: '更新公告成功',
                            type: true,
                            data: null
                        })
                    } else {
                        return res.json ({
                            code: 0,
                            message: '更新公告失败',
                            type: false,
                            data: null
                        })           
                    }
                })
            }
        })
    } else {
        delete data.id;
        MongoDB.save('notice', data, function(err, updateNotice) {
            if (err) throw err;
            console.log(updateNotice)
            if (updateNotice) {
                return res.json ({
                    code: 0,
                    message: '添加公告成功',
                    type: true,
                    data: null
                })
            } else {
                return res.json ({
                    code: 0,
                    message: '添加公告失败',
                    type: false,
                    data: null
                })           
            }
        })
    }
}
/**
 * 获取所有的公告
 */
exports.getAllNotice = function(req, res, next) {
    MongoDB.find('notice', {}, function(err, allNotice) {
        if (err) throw err;
        if (allNotice) {
            return res.json ({
                code: 0,
                message: '获取公告成功',
                type: true,
                data: allNotice
            })
        } else {
            return res.json ({
                code: 0,
                message: '获取公告失败',
                type: false,
                data: []
            })           
        }
    })
}

/**
 * 删除公告
 */

exports.deleteNoticeById = function(req, res) {
    const id = req.body.id;
    MongoDB.remove('notice', {_id: id}, function(err, deleteNotice) {
        if (err) throw err;
        if (deleteNotice) {
            return res.json ({
                code: 0,
                message: '删除公告成功',
                type: true,
                data: null
            })            
        } else {
            return res.json ({
                code: 0,
                message: '删除公告失败',
                type: false,
                data: null
            })             
        }
    })
}
/**
 * 获取某一条公告内容
 */

 exports.getNoticeById = function(req, res) {
    const id = req.body.id
    MongoDB.find('notice', {_id: id}, function(err, oneNotice) {
        if (err) throw err;
        if (oneNotice) {
            return res.json ({
                code: 0,
                message: '获取当前公告成功',
                type: true,
                data: oneNotice
            })
        } else {
            return res.json ({
                code: 0,
                message: '获取当前公告失败',
                type: false,
                data: []
            })           
        }
    })
 }

