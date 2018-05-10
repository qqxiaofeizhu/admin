var app = require('../config');
var MongoDB = require('../public/javascripts/db');
var db = require('../public/conf/db')

/***
 * list首页接口
 */
exports.getBookList = function (req, res, next) {
    const limit = 10;
    const p = req.body.p;
    let skip = (p - 1) * limit;
    let data = db['book-list'];
    const bookCategory = req.body.bookCategory; // 筛选条件之一
    const searchBookname = req.body.searchBookname;
    let conditions = {
        bookCategory: bookCategory,
        bookname: { $regex: new RegExp(searchBookname) }
    }
    if (bookCategory == '' && searchBookname == '') {
        conditions = {}
    };
    if (bookCategory == '') {
        delete conditions.bookCategory;
    }
    if (searchBookname == '') {
        delete conditions.bookname;
    }
    let result = [];
    for (let key in data) {
        if (data.hasOwnProperty(key) === true) {
            let fileds = {};
            fileds.labeName = data[key]['labeName'];
            fileds.fieldName = key;
            result.push(fileds)
        }
    }
    result.push({ fieldName: 'operate', labeName: '操作' });
    console.log(conditions);
    MongoDB.where('book-list', conditions, { limit: limit, skip: skip }, function (err, resp) {
        if (err) throw err;
        MongoDB.count('book-list', conditions, function (err, count) {
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
exports.addBookList = function (req, res, next) {
    // console.log(req.body)
    // 1.拿到数据先查下数据库是否有这个数据
    const data = req.body;
    MongoDB.findOne('book-list', data, function (err, resp) {
        if (err) throw err;
        MongoDB.save('book-list', data, function (err, resp) {
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

exports.delateBooklistById = function (req, res, next) {
    /**
     * 删除操作
     * 如果包含条件，把条件也附加上
     */
    const limit = 10;
    const id = req.body.id;
    const p = req.body.p;
    const bookCategory = req.body.bookCategory; // 筛选条件之一
    const searchBookname = req.body.searchBookname;
    let conditions = {
        bookCategory: bookCategory,
        bookname: { $regex: new RegExp(searchBookname) }
    }
    if (bookCategory == '' && searchBookname == '') {
        conditions = {}
    };
    if (bookCategory == '') {
        delete conditions.bookCategory;
    }
    if (searchBookname == '') {
        delete conditions.bookname;
    }
    MongoDB.findById('book-list', { _id: id }, function (err, data) {
        if (err) throw err;
        if (data) {
            MongoDB.remove('book-list', { _id: id }, function (err, data) {
                if (err) throw err;
                console.log(conditions)
                MongoDB.count('book-list', conditions, function (err, count) {
                    // 如果删除的一样,表明已经删除完了,删除后为0
                    console.log(count)
                    if (count == 0) {
                        return res.json({
                            code: 0,
                            status: true,
                            message: '删除成功',
                            data: [],
                            p: 1
                        })                        
                    } else {
                        if ((count % limit) == 0) {
                            return res.json({
                                code: 0,
                                status: true,
                                message: '删除成功',
                                data: [],
                                p: p - 1
                            })
                        } else {
                            return res.json({
                                code: 0,
                                status: true,
                                message: '删除成功',
                                data: [],
                                p: p
                            })
                        }
                    }
                })
            })
        }
    })
}
/**
 * 查看当前所有的图书录入
 */
exports.getAllBookEntry = function (req, res, next) {
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
            } else if (data[key]['type'] === 'Boolean') {
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
exports.editorSelectBookName = function (req, res, next) {
    // 首先查下数据库中是否有该id
    const id = req.body._id;
    const data = req.body;
    // console.log(data);
    MongoDB.findById('book-list', { _id: id }, function (err, resp) {
        if (err) throw err;
        if (resp) {
            // 证明已经找到
            MongoDB.update('book-list', { _id: id }, data, function (err, response) {
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
exports.borrowingById = function (req, res) {
    // 书的id
    // MongoDB.updateData('users', {}, {$set: {bookIds: [], booknames: []}});
    const id = req.body.id;
    // 用户的用户名
    const username = req.api_user.username;
    MongoDB.findById('book-list', { _id: id }, function (err, books) {
        // 找到了这本书
        if (err) throw err;
        if (books) {
            // 如果下面没这个id，将这个id放到数组中去
            MongoDB.findOne('users', { username: username }, function (err, user) {
                if (err) throw err;
                // 找到该用户
                if (user) {
                    if (user.bookIds.length > 9) {
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
                    MongoDB.updateData('users', { username: username }, { $addToSet: { bookIds: books._id, booknames: books.bookname } }, function (err, updatedUser) {
                        if (err) throw err;
                        // 找到对应值
                        if (updatedUser) {
                            MongoDB.updateData('book-list', { _id: id }, { $set: { bookCount: books.bookCount - 1, isleave: books.isleave + 1 } }, function (err, updateBooks) {
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

/**
 * chart图
 */
exports.bookCount = function (req, res) {

    MongoDB.find('book-list', {}, function (err, data) {
        // 所有的图书
        let result = {
            A: 0,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
            F: 0,
            G: 0,
            H: 0,
            I: 0,
            J: 0,
            K: 0,
            N: 0,
            O: 0,
            P: 0,
            Q: 0,
            R: 0,
            S: 0,
            T: 0,
            U: 0,
            V: 0,
            X: 0,
            Z: 0,
        };
        let resultTenSort = {
            A: 0,
            B: 0,
            C: 0,
            D: 0,
            E: 0,
            F: 0,
            H: 0,
            I: 0,
            G: 0,
            J: 0,
            K: 0,
            N: 0,
            O: 0,
            P: 0,
            Q: 0,
            R: 0,
            S: 0,
            T: 0,
            U: 0,
            V: 0,
            X: 0,
            Z: 0,
        };
        for (let item of data) {
            if (item.bookCategory.slice(0, 1) == 'A') {
                result.A = result.A + item.bookCount + item.isleave;
                resultTenSort.A = resultTenSort.A + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'B') {
                result.B = result.B + item.bookCount + item.isleave;
                resultTenSort.B = resultTenSort.B + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'C') {
                result.C = result.C + item.bookCount + item.isleave;
                resultTenSort.C = resultTenSort.C + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'D') {
                result.D = result.D + item.bookCount + item.isleave;
                resultTenSort.D = resultTenSort.D + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'E') {
                result.E = result.E + item.bookCount + item.isleave;
                resultTenSort.E = resultTenSort.E + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'F') {
                result.F = result.F + item.bookCount + item.isleave;
                resultTenSort.F = resultTenSort.F + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'G') {
                result.G = result.G + item.bookCount + item.isleave;
                resultTenSort.G = resultTenSort.G + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'H') {
                result.H = result.H + item.bookCount + item.isleave;
                resultTenSort.H = resultTenSort.H + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'I') {
                result.I = result.I + item.bookCount + item.isleave;
                resultTenSort.I = resultTenSort.I + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'J') {
                result.J = result.J + item.bookCount + item.isleave;
                resultTenSort.J = resultTenSort.J + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'K') {
                result.K = result.K + item.bookCount + item.isleave;
                resultTenSort.K = resultTenSort.K + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'N') {
                result.N = result.N + item.bookCount + item.isleave;
                resultTenSort.N = resultTenSort.N + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'O') {
                result.O = result.O + item.bookCount + item.isleave;
                resultTenSort.O = resultTenSort.O + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'P') {
                result.P = result.P + item.bookCount + item.isleave;
                resultTenSort.P = resultTenSort.P + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'Q') {
                result.Q = result.Q + item.bookCount + item.isleave;
                resultTenSort.Q = resultTenSort.Q + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'R') {
                result.R = result.R + item.bookCount + item.isleave;
                resultTenSort.R = resultTenSort.R + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'S') {
                result.S = result.S + item.bookCount + item.isleave;
                resultTenSort.S = resultTenSort.S + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'T') {
                result.T = result.T + item.bookCount + item.isleave;
                resultTenSort.T = resultTenSort.T + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'U') {
                result.U = result.U + item.bookCount + item.isleave;
                resultTenSort.U = resultTenSort.U + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'V') {
                result.V = result.V + item.bookCount + item.isleave;
                resultTenSort.V = resultTenSort.V + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'X') {
                result.X = result.X + item.bookCount + item.isleave;
                resultTenSort.X = resultTenSort.X + item.isleave;
            }
            if (item.bookCategory.slice(0, 1) == 'Z') {
                result.Z = result.Z + item.bookCount + item.isleave;
                resultTenSort.Z = resultTenSort.Z + item.isleave;
            }
        }
        return res.json({
            code: 0,
            type: true,
            data: {
                result: result,
                resultTenSort: resultTenSort
            }
        })
    })
}

exports.addBookData = function (req, res) {
   let data = JSON.parse(req.body.booKData);
   let bookCategory = req.body.bookCategory;
   let bookPosition = req.body.bookPosition
   let result = data.result.data;
    result.filter(function (resp) {
        let repData = {
            bookname: resp.bibName,
            bookAutor: resp.author,
            autorCountry: '',
            bookPrice: resp.price,
            bookPress: resp.pubName,
            bookUrl: '',
            isleave: 0,
            bookInstroduce: resp.bookSummary,
            bookCount: 20,
            bookCategory: bookCategory,
            bookPosition: bookPosition,
            EbooksUrl: ''
        };
        MongoDB.findOne('book-list', {bookName: repData.bookName}, function (err, resp) {
            if (err) throw err;
            MongoDB.save('book-list', repData, function (err, resp) {
                if (err) throw err;
                return res.json({
                    code: 0,
                    message: '录入成功',
                    status: true
                })
            })
        })
    })
}