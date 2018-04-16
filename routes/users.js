/* GET users listing. */
var jwt = require('jsonwebtoken');
var app = require('../config');
var MongoDB = require('../public/javascripts/db');
var db = require('../public/conf/db')

exports.Login = function (req, res) {
  // 拿到前端给的数据
  const data = req.body;
  // 处理逻辑,从数据库查这个人是否存在
  var username = data.username,
    password = data.password;

  MongoDB.findOne('users', {
    username: username
  }, function (err, users) {
    if (err) throw err;
    // 检查用户名是否存在
    if (!users) {
      return res.json({
        type: false,
        data: users || [],
        message: '请检查用户名是否存在！'
      })
    } else {
      // 检查用户密码是否一致
      if (!Object.is(users.username, username)) {
        return res.json({
          type: false,
          data: users || [],
          message: '用户名不存在！'
        })
      }
      if (!Object.is(users.password, password)) {
        return res.json({
          type: false,
          data: users || [],
          message: '密码不正确！'
        })
      }
      if (Object.is(users.username, username) && Object.is(users.password, password)) {
        var payload = {
          username: users.username,
          password: users.password
        }
        // 随机生成一个token
        var token = jwt.sign(payload, app.secret, {
          expiresIn: 60 * 2400
        });
        return res.json({
          type: true,
          data: users,
          message: '响应成功',
          token: token,
          username: users.username
        })
      }
    }
  });
}
/**
 * 注册
 */
exports.register = function (req, res) {
  const data = req.body;
  MongoDB.findOne('users', {
    username: data.username
  }, function (err, users) {
    if (err) throw err;
    // 如果找到的话
    if (users) {
      return res.json({
        code: 0,
        type: false,
        message: '该账号已存在!'
      })
    } else {
      // 密码一致
      if (Object.is(data.password, data.repassword)) {
        // 存入数据库
        delete data.repassword;
        console.log('1')
        console.log(data)
        MongoDB.save('users', {
          username: data.username,
          password: data.password
        }, function (err, resp) {
          if (err) throw err;
          if (resp) {
            return res.json({
              code: 0,
              type: true,
              message: '注册成功!'
            })
          } else {
            return res.json({
              code: 0,
              type: false,
              message: '注册失败!'
            })
          }
        })
      } else {
        return res.json({
          code: 0,
          type: false,
          message: '两次密码输入不一致!'
        })
      }
    }
  })
}

/**
 * 查询所有的管理人员
 */
exports.getAllManagementPersonnel = function (req, res) {
  MongoDB.find('users', {}, function (err, users) {
    if (err) throw err;
    if (users) {
      return res.json({
        type: true,
        data: users,
        message: '响应成功',
        code: 0
      })
    } else {
      return res.json({
        type: true,
        data: [],
        message: '响应成功',
        code: 0
      })
    }
  })
}
/**
 * 升级为超级管理员
 */
exports.setOrdinaryToSuper = function (req, res) {
  const id = req.body.id;
  const admin = req.body.admin;
  MongoDB.findById('users', {
    _id: id
  }, function (err, user) {
    if (err) throw err;
    if (user) {
      let isAdmin = admin ? 100 : 0;
      MongoDB.update('users', {
        _id: id
      }, {
        isAdmin: isAdmin
      }, function (err, resp) {
        if (resp) {
          return res.json({
            type: true,
            data: null,
            message: '更新成功！',
            code: 0
          })
        } else {
          return res.json({
            type: false,
            data: null,
            message: '更新失败，请联系运维人员！',
            code: 0
          })
        }
      })
    } else {
      return res.json({
        type: false,
        data: null,
        message: '更新失败，请检查该用户是否存在！',
        code: 0
      })
    }
  })
}
/**
 * 删除管理员
 */
exports.deleteUsers = function (req, res) {
  const id = req.body.id;
  MongoDB.findById('users', {
    _id: id
  }, function (err, data) {
    if (err) throw err;
    if (data) {
      MongoDB.remove('users', {
        _id: id
      }, function (err, resp) {
        if (err) throw err;
        if (resp) {
          return res.json({
            type: true,
            data: null,
            message: '删除成功',
            code: 0
          })
        } else {
          return res.json({
            type: false,
            data: null,
            message: '删除用户失败！',
            code: 0
          })
        }
      })
    } else {
      return res.json({
        type: false,
        data: null,
        message: '删除用户失败，请检查该用户是否存在！',
        code: 0
      })
    }
  })
}

/**
 * 得到当前用户信息
 */
exports.getUserMessage = function (req, res) {
  console.log(req.api_user)
  MongoDB.findOne('users', {
    username: req.api_user.username
  }, function (err, user) {
    if (err) throw err;
    if (user) {
      return res.json({
        code: 0,
        type: true,
        data: {
          username: user.username,
          admin: user.isAdmin,
        }
      })
    } else {
      return res.json({
        code: 0,
        type: false,
        data: {
          username: '',
          admin: '',
        },
        message: '获取用户信息失败！'
      })
    }
  })
}

/**
 * 查询该用户下面借阅的所有书籍
 */

exports.getUserAllBorrowBooks = function (req, res) {
  const id = req.body.id;
  MongoDB.findById('users', {
    _id: id
  }, function (err, borrowBooks) {
    if (err) throw err;
    if (borrowBooks) {
      let bookdata = [];
      for (let [index, item] of borrowBooks.bookIds.entries()) {
        let bookitem = {};
        bookitem.id = item || '';
        bookditem.bookname = borrowBooks.booknames[index] || '';
        bookdata.push(bookitem);
      }
      return res.json({
        code: 0,
        data: bookdata,
        message: '获取借阅数据成功！',
        type: true
      })
    } else {
      return res.json({
        code: 0,
        data: [],
        message: '获取借阅数据失败！',
        type: false
      })
    }
  })
}

/**
 * 还书
 */
exports.ReturnTheBook = function (req, res) {
  // 还书的id
  const usernameId = req.body.id
  const bookId = req.body.bookId;
  MongoDB.findById('users', {
    _id: usernameId
  }, function (err, user) {
    if (err) throw err;
    // 拿到找到的用户
    if (user) {
      if (user.includes(bookId)) {
        // 查询到的数据包含传入的书籍id
        MongoDB.findById('book-list', {
          _id: bookId
        }, function (err, theBook) {
          if (err) throw err;
          if (theBook) {
            MongoDB.update('users', {
              _id: user._id
            }, {
              $pull: {
                bookIds: theBook._id,
                booknames: theBook.bookname
              }
            });
            MongoDB.updateData('book-list', {
              _id: bookId
            }, {
              $set: {
                bookCount: theBook.bookCount + 1
              }
            }, function (err, updateBook) {
              if (err) throw err;
              if (updateBook) {
                return res.json({
                  code: 0,
                  data: null,
                  message: '还书成功！',
                  type: true
                })
              } else {
                return res.json({
                  code: 0,
                  data: null,
                  message: '还书失败！',
                  type: false
                })
              }
            })
          }
        })
      } else {
        return res.json({
          code: 0,
          data: null,
          message: '没找到该图书信息！请联系管理员',
          type: false
        })
      }
    }
  })
}