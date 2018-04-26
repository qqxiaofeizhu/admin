var app = require('../config');
var MongoDB = require('../public/javascripts/db');
var db = require('../public/conf/db')

/***
 * list首页接口
 */
exports.getBookList = function (req, res, next) {
    const limit = 10;
    const p = req.body.p;
    let skip = (p -1) * limit;
    let data = db['book-list'];
    let result = [];
    for (let key in data) {
        if (data.hasOwnProperty(key) === true) {
            let fileds = {};
            fileds.labeName = data[key]['labeName'];
            fileds.fieldName = key;
            result.push(fileds)
        }
    }
    result.push({fieldName: 'operate', labeName: '操作'});
    MongoDB.where('book-list', {}, {limit: limit, skip: skip}, function(err, resp) {
        if (err) throw err;
        MongoDB.count('book-list', {}, function(err, count) {
            if (err) throw err;
            return res.json({
                code: 0,
                message: '获取数据成功',
                data: {
                    data: resp,
                    header: result,
                    count: count,
                    p: p
                }
            })
        })      
    })
}
/** 
 * 增加图书
*/
exports.addBookList = function(req, res, next) {
    // console.log(req.body)
    // 1.拿到数据先查下数据库是否有这个数据
    const data = req.body;
    MongoDB.findOne('book-list', data, function(err, resp) {
        if (err) throw err;
        MongoDB.save('book-list', data, function(err, resp) {
            if (err) throw err;
            return res.json({
                code: 0,
                message: '录入成功',
                status: true
            })
        })
    })
}
/**
 * 删除图书信息 /bookstore/delate-booklist-by-id
 */

exports.delateBooklistById = function(req, res, next) {
    const id = req.body.id;
    MongoDB.findById('book-list',{_id: id}, function(err, data) {
        if (err) throw err;
        if (data) {
            MongoDB.remove('book-list', {_id: id}, function (err, data) { 
                if (err) throw err;
                console.log(data);
                return res.json({
                    code: 0,
                    status: true,
                    message: '删除成功',
                    data: []
                })
             })
        }
    })
}
/**
 * 查看当前所有的图书录入
 */
exports.getAllBookEntry = function(req, res, next) {
    let data = db['book-list'];
    // 整合data
    // 数据格式
    // fileds: {type}
    let result = [];
    console.log(data);
    for (let key in data) {
        if (data.hasOwnProperty(key) === true) {
            let fileds = {};
            if (data[key]['required'] && data[key]['required']) {
                fileds.required = true;
            } else {
                fileds.required = false;
            }
            fileds.labeName = data[key]['labeName'];
            if (data[key]['type'] === 'String') {
                fileds.fieldValue = '';
            } else if (data[key]['type'] === 'Number') {
                fileds.fieldValue = 0;
            } else if (data[key]['type'] === 'Boolean'){
                fileds.fieldValue = 0;
            }
            fileds.fieldName = key;
            fileds[key] = fileds.fieldValue;
            result.push(fileds)
        }
    }
    return res.json({
        code: 0,
        message: '获取成功',
        status: true,
        data: result
    })
}
/**
 * 编辑选中的图书信息
 */
exports.editorSelectBookName = function(req, res, next) {
    // 首先查下数据库中是否有该id
    const id = req.body._id;
    const data = req.body;
    // console.log(data);
    MongoDB.findById('book-list', {_id: id}, function(err, resp) {
        if (err) throw err;
        if (resp) {
            // 证明已经找到
            MongoDB.update('book-list', {_id: id}, data, function(err, response) {
                if (err) throw err;
                console.log(response)
                if (response) {
                    return res.json({
                        code: 0,
                        status: true,
                        message: '更新成功',
                        data: null
                    })
                } else {
                    return res.json({
                        code: 0,
                        status: false,
                        message: '更新失败',
                        data: null
                    })                    
                }
            })
        }
    })
}

/**
 * 借阅
 */
exports.borrowingById = function(req, res) {
    // 书的id
    // MongoDB.updateData('users', {}, {$set: {bookIds: [], booknames: []}});
    const id = req.body.id;
    // 用户的用户名
    const username = req.api_user.username;
    MongoDB.findById('book-list', {_id: id}, function(err, books) {
        // 找到了这本书
        if (err) throw err;
        if (books) {
            // 如果下面没这个id，将这个id放到数组中去
            MongoDB.findOne('users', {username: username}, function(err, user) {
                if (err) throw err;
                // 找到该用户
                if (user) {
                    if (user.bookIds.length > 10) {
                        return res.json({
                            code: 0,
                            message: '每个人最多可以借10本！',
                            type: false,
                            data: null
                        })                        
                    };
                    for (let [key, item] of user.bookIds.entries()) {
                        if (item.toString() == books._id) {
                            return res.json({
                                code: 0,
                                message: '您已借阅过该书，不能再次借阅！',
                                type: false,
                                data: null
                            })
                        }
                    }
                    MongoDB.updateData('users', {username: username}, {$addToSet: {bookIds: books._id, booknames: books.bookname}}, function(err, updatedUser) {
                        if (err) throw err;
                        // 找到对应值
                        if (updatedUser) {
                            MongoDB.updateData('book-list', {_id: id},  {$set: {bookCount: books.bookCount - 1, isleave: books.isleave + 1}}, function(err, updateBooks){
                                if (err) throw err;
                                if (updateBooks) {
                                    return res.json({
                                        code: 0,
                                        message: '借阅成功',
                                        type: true,
                                        data: null
                                    })
                                } else {
                                    return res.json({
                                        code: 0,
                                        message: '借阅失败',
                                        type: false,
                                        data: null
                                    })                                    
                                }
                            })
                        } else {
                            return res.json({
                                code: 0,
                                message: '借阅失败',
                                type: false,
                                data: null
                            })
                        }
                    })
                }
            })
        }
    })
}

