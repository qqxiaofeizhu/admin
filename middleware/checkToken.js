var jwt = require('jsonwebtoken');
var app = require('../config');
exports.checkToken = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // 解析token
    if (token) {
        jwt.verify(token, app.secret, function (err, decoded) {
            if (err) throw err;
            if (decoded) {
                req.api_user = decoded;
                next()
            } else {
                return res.json({
                    code: 0,
                    type: false,
                    message: '登录验证失败，请重试！',
                    data: null
                })
            }
        })
    } else {
        return res.status(200).send({
            code: 0,
            type: false,
            message: '请先登录',
            data: null
        })
    }
}