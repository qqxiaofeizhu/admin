var jwt = require('jsonwebtoken');
var app = require('../config');
module.exports = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // 解析token
    if (token) {
        jwt.verify(token, app.secret, function (err, decoded) {
            if (err) {
                return res.json({
                    type: false,
                    data: users || [],
                    message: 'token信息错误'
                })
            } else {
                req.api_user = decoded;
                next()
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: '没有提供token'
        })
    }
}