var jwt = require('jsonwebtoken'); 
var app = require('../config');
var MongoDB = require('../public/javascripts/db');
var db = require('../public/conf/db')

exports.getBookstore = function(req, res) {
  res.json({
    a: 123,
    b: 234
  })
}
exports.Login = function(req, res) {
    // 拿到前端给的数据
    const data = req.body;
    // 处理逻辑,从数据库查这个人是否存在
    var username = data.username,
        password = data.password;
    MongoDB.findOne('users',{ username: username,  password : password }, function(err, users) {
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
        console.log(!Object.is(users.username, username))
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
          var token = jwt.sign(payload, app.secret, { expiresIn: 60 * 2400 });
          return res.json({
            type: true,
            data: users,
            message: '响应成功',
            token: token
          })
        }
      }
    });
}
