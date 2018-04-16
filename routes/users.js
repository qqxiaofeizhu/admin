/* GET users listing. */
var jwt = require('jsonwebtoken'); 
var app = require('../config');
var MongoDB = require('../public/javascripts/db');
var db = require('../public/conf/db')

exports.Login = function(req, res) {
    // 拿到前端给的数据
    const data = req.body;
    // 处理逻辑,从数据库查这个人是否存在
    var username = data.username,
        password = data.password;

    MongoDB.findOne('users',{ username: username}, function(err, users) {
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
          if (users.isAdmin > 0) {
              var payload = {
                username: users.username,
                password: users.password
              }
              // 随机生成一个token
              var token = jwt.sign(payload, app.secret, { expiresIn: 60 * 2400 });
              return res.json({
                type: true,
                data: users,
                message: '响应成功',
                token: token,
                username: users.username
              })
          } else {
            return res.json({
              code: 0,
              data: null,
              message: '您不是管理员，不能登录!',
              type: false
            })              
          }
        }
      }
    });
}
/**
 * 注册
 */
exports.register = function(req, res) {
  const data = req.body;
  MongoDB.findOne('users',{ username: data.username}, function(err, users) { 
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
        MongoDB.save('users', {username: data.username, password: data.password}, function(err, resp) {
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
exports.getAllManagementPersonnel = function(req, res) {
  MongoDB.find('users', {}, function(err, users) {
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
exports.setOrdinaryToSuper = function(req, res) {
  const id = req.body.id;
  const admin = req.body.admin;
  MongoDB.findById('users', {_id: id}, function(err, user) {
    if (err) throw err;
    if (user) {
      let isAdmin = admin ? 100 : 0;
      MongoDB.update('users', {_id: id}, {isAdmin: isAdmin}, function(err, resp) {
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
exports.deleteUsers = function(req, res) {
  const id = req.body.id;
  MongoDB.findById('users',{_id: id}, function(err, data) {
    if(err) throw err;
    if (data) {
      MongoDB.remove('users', {_id: id}, function (err, resp) { 
        if (err) throw err;
        if(resp) {
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
exports.getUserMessage = function(req, res) {
  return res.json({
    code: 0,
    type: true,
    data: req.api_user.username
  })
}