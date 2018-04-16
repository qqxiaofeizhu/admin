var jwt = require('jsonwebtoken');
var app = require('../config');
exports.checkToken = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // 解析token
    if (token) {
        jwt.verify(token, app.secret, function (err, decoded) {
            if (err) {
                return res.json({
                    code: 0,
                    type: false,
                    message: 'token信息错误',
                    data: null
                })
            } else {
                req.api_user = decoded;
                next()
            }
        })
    } else {
        return res.status(200).send({
            code: 0,
            type: false,
            message: '没有提供token',
            data: null
        })
    }
}